# Архитектура выполнения Forgejo Runner

Этот документ объясняет **ГДЕ** и **КАК** выполняются процессы в Forgejo Actions.

## 🏗️ Общая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                        ХОСТ МАШИНА                              │
│                     (192.168.1.72)                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Runner Container (forgejo-runner-alpine)                 │ │
│  │  - Оркестрирует выполнение workflow                       │ │
│  │  - Получает задачи от Forgejo                             │ │
│  │  - Создает job контейнеры                                 │ │
│  │  - RAM: ~50-80 MB (idle)                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          │ через /var/run/docker.sock           │
│                          ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Docker Daemon (на хосте)                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│         ┌────────────────┼────────────────┐                    │
│         ↓                ↓                ↓                    │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐            │
│  │ Job        │   │ Job        │   │ Job        │            │
│  │ Container  │   │ Container  │   │ Container  │            │
│  │ (alpine)   │   │ (ubuntu)   │   │ (node)     │            │
│  │            │   │            │   │            │            │
│  │ Здесь      │   │ Здесь      │   │ Здесь      │            │
│  │ выполняются│   │ выполняются│   │ выполняются│            │
│  │ шаги       │   │ шаги       │   │ шаги       │            │
│  │ workflow   │   │ workflow   │   │ workflow   │            │
│  └────────────┘   └────────────┘   └────────────┘            │
│         │                │                │                    │
│         │ docker compose │                │                    │
│         ↓                ↓                ↓                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Production Containers (todo-backend-prod, todo-frontend) │ │
│  │  - Запускаются ТОЖЕ на хосте                             │ │
│  │  - Через docker compose команды из workflow               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📍 Где что выполняется?

### 1. Runner Container
- **Где**: В Docker контейнере `forgejo-runner-alpine`
- **Что делает**:
  - Получает задачи от Forgejo instance (http://95.165.70.94:1080/)
  - Парсит workflow файл
  - Оркестрирует создание job контейнеров
  - Мониторит выполнение
- **НЕ выполняет**: Шаги workflow

### 2. Job Containers (alpine, ubuntu, node и т.д.)
- **Где**: На хосте машине (не внутри runner контейнера!)
- **Как создаются**: Runner через монтированный `/var/run/docker.sock` просит Docker daemon на хосте создать контейнер
- **Что делают**: Выполняют шаги из workflow

**Пример workflow:**
```yaml
jobs:
  deploy:
    runs-on: alpine  # <- Создается alpine контейнер на ХОСТЕ
    steps:
      - name: Checkout
        run: git clone ...  # <- Выполняется ВНУТРИ alpine контейнера

      - name: Build
        run: docker compose build  # <- Запускается на ХОСТЕ (через docker socket)
```

### 3. Production Containers (продакшн приложения)
- **Где**: На хосте машине
- **Как создаются**: Через `docker compose` команды из job контейнера
- **Пример**:
```yaml
- name: Start containers
  run: |
    docker compose -f docker-compose.prod.yml up -d
```

Эта команда:
1. Выполняется в job контейнере (alpine)
2. Через `/var/run/docker.sock` обращается к Docker daemon на хосте
3. Docker daemon создает контейнеры `todo-backend-prod` и `todo-frontend-prod` **на хосте**

## 🔍 Docker-in-Docker через Socket Mounting

### Традиционный Docker-in-Docker (НЕ используется)
```
┌─────────────────────────┐
│  Outer Container        │
│  ┌───────────────────┐  │
│  │ Inner Docker      │  │  ← Полноценный Docker daemon внутри
│  │ Daemon + Clients  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```
**Проблемы**: Тяжело, медленно, проблемы с сетью

### Socket Mounting (Используется нами)
```
┌─────────────────────────┐
│  Container              │
│  - docker client        │  ← Только клиент
│  - /var/run/docker.sock │ → Обращается к хостовому daemon
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  Host Docker Daemon     │  ← Единый daemon на хосте
└─────────────────────────┘
```
**Преимущества**: Легко, быстро, все контейнеры создаются на хосте

## 🎯 Пошаговое выполнение Workflow

Давайте разберем **пошагово**, что происходит при выполнении workflow:

### Шаг 0: Инициализация (при запуске runner)
```bash
docker compose up -d
```
1. Docker daemon на хосте создает контейнер `forgejo-runner-alpine`
2. Runner регистрируется в Forgejo (http://95.165.70.94:1080/)
3. Runner начинает опрашивать Forgejo на наличие новых задач (каждые 2s)

### Шаг 1: Получение задачи
1. Вы делаете push в репозиторий
2. Forgejo создает workflow job
3. Runner получает job через API

### Шаг 2: Создание job контейнера
```yaml
jobs:
  deploy:
    runs-on: alpine
```

Runner:
1. Читает `runs-on: alpine`
2. Находит метку `alpine:docker://alpine:latest` в своей конфигурации
3. Через `/var/run/docker.sock` просит Docker daemon создать контейнер:
```bash
docker run -it --rm \
  --network bridge \
  -v /var/run/docker.sock:/var/run/docker.sock \  # <- Ключевой момент!
  alpine:latest
```

**ВАЖНО**: Job контейнер создается **на хосте**, не внутри runner!

### Шаг 3: Выполнение шагов workflow

Каждый шаг выполняется **внутри job контейнера**:

```yaml
steps:
  - name: Install dependencies
    run: apk add --no-cache docker-compose curl
```

Что происходит:
1. Команда `apk add...` выполняется **внутри alpine job контейнера**
2. Устанавливаются пакеты в этот контейнер

```yaml
  - name: Build Docker images
    run: docker compose -f docker-compose.prod.yml build
```

Что происходит:
1. Команда `docker compose build` выполняется **внутри alpine job контейнера**
2. Но `docker` клиент обращается через `/var/run/docker.sock` к **хостовому** Docker daemon
3. Образы собираются **на хосте**, не в job контейнере!

```yaml
  - name: Start containers
    run: docker compose -f docker-compose.prod.yml up -d
```

Что происходит:
1. Команда выполняется **внутри alpine job контейнера**
2. Docker daemon **на хосте** создает контейнеры `todo-backend-prod` и `todo-frontend-prod`
3. Эти контейнеры запускаются **на хосте** и доступны по портам 3000 и 8000

### Шаг 4: Завершение
1. Workflow завершается
2. Runner удаляет job контейнер (alpine)
3. Production контейнеры **остаются работать** на хосте

## 🌐 Сетевая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│  Host Machine (192.168.1.72)                                │
│                                                             │
│  Runner Container                                           │
│  ├─ runner-network (bridge)                                 │
│                                                             │
│  Job Container (alpine)                                     │
│  ├─ bridge (default)                                        │
│  └─ /var/run/docker.sock → Host Docker                     │
│                                                             │
│  Production Containers                                      │
│  ├─ todo-network (bridge)                                   │
│  ├─ Backend: 192.168.1.72:8000                              │
│  └─ Frontend: 192.168.1.72:3000                             │
│                                                             │
│  All accessible from LAN (192.168.1.x)                      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Где лежат файлы проекта?

### Вариант 1: Клонирование в job контейнере (рекомендуется)
```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v3  # Клонирует в job контейнер
```

Файлы находятся: **Внутри job контейнера** → Удаляются после завершения

### Вариант 2: Персистентное хранилище
```yaml
# docker-compose.yml для runner
volumes:
  - ./workspace:/workspace  # Монтируем директорию с хоста
```

```yaml
# В workflow
steps:
  - name: Clone to persistent storage
    run: git clone https://... /workspace/project
```

Файлы находятся: **На хосте** в `~/forgejo-runner/workspace/` → Сохраняются между запусками

## 🚀 Реальный пример выполнения

Давайте проследим выполнение вашего deploy workflow:

### Исходный workflow (.forgejo/workflows/deploy.yml)
```yaml
name: Deploy to Production (Forgejo)

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: alpine

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Install dependencies
        run: apk add --no-cache docker-compose curl

      - name: Build Docker images
        run: docker compose -f docker-compose.prod.yml build

      - name: Start containers
        run: docker compose -f docker-compose.prod.yml up -d
```

### Выполнение:

**1. Push в main**
```
You → Forgejo (http://95.165.70.94:1080/) → Runner получает задачу
```

**2. Runner создает job контейнер**
```bash
# На хосте (192.168.1.72):
docker run -it --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  alpine:latest
```

**3. Внутри alpine job контейнера:**

```bash
# Шаг 1: Checkout
git clone https://... /workspace

# Шаг 2: Install dependencies
apk add --no-cache docker-compose curl
# Устанавливается внутри alpine контейнера

# Шаг 3: Build
cd /workspace
docker compose -f docker-compose.prod.yml build
# docker клиент → /var/run/docker.sock → хостовый Docker daemon
# Образы собираются НА ХОСТЕ

# Шаг 4: Start
docker compose -f docker-compose.prod.yml up -d
# Контейнеры запускаются НА ХОСТЕ
# Доступны на 192.168.1.72:3000 и 192.168.1.72:8000
```

**4. Проверка на хосте:**
```bash
# На хосте машине:
docker ps

# Вы увидите:
# - forgejo-runner-alpine (runner)
# - todo-backend-prod (продакшн)
# - todo-frontend-prod (продакшн)
```

## 🔐 Безопасность Socket Mounting

### Риски
Монтирование `/var/run/docker.sock` дает **полный контроль** над хостовым Docker:
- Job может создавать/удалять любые контейнеры
- Job может читать все volume на хосте
- Job может менять сетевые настройки

### Почему это приемлемо для self-hosted runner?
1. **Контроль**: Вы контролируете и Forgejo, и runner, и код
2. **Изоляция**: Runner в вашей локальной сети, не публичный
3. **Необходимость**: Для Docker-based deployments это единственный практичный способ

### Что НЕ делать с публичными runners
❌ НЕ давайте `/var/run/docker.sock` публичным/untrusted runners
❌ НЕ запускайте untrusted код в workflow с socket доступом

## 📊 Потребление ресурсов

```
Runner Container:
  RAM: ~50-80 MB (idle)
  CPU: 0-5% (idle)
  Disk: ~85 MB (образ)

Job Container (alpine):
  RAM: ~20-50 MB (зависит от команд)
  CPU: 0-100% (зависит от задачи)
  Disk: ~5 MB (базовый alpine)

Production Containers:
  Backend: ~100-200 MB RAM
  Frontend: ~50-100 MB RAM

Total на хосте во время deploy:
  RAM: ~300-500 MB
  После завершения: ~150-300 MB (только production)
```

## 🎓 Резюме

### Где выполняются процессы?

| Компонент | Где запущен | Кто управляет |
|-----------|-------------|---------------|
| Runner | В контейнере на хосте | docker compose |
| Job Container | На хосте | Runner через socket |
| Production | На хосте | Job через socket |

### Ключевые моменты:

1. **Runner** - оркестратор, не выполняет код workflow
2. **Job Container** - выполняет шаги workflow, создается на хосте
3. **Socket Mounting** - все Docker команды идут на хостовый daemon
4. **Production** - запускается на хосте и остается работать после job

### Почему это эффективно?

- ✅ Легковесный runner (~85 MB)
- ✅ Job контейнеры ephemeral (удаляются после использования)
- ✅ Production контейнеры изолированы и persistent
- ✅ Единый Docker daemon - нет накладных расходов
- ✅ Простая отладка (все на хосте, видно через `docker ps`)

---

Если остались вопросы по архитектуре - пишите!
