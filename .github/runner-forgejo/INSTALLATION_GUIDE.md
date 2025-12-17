# 🚀 Пошаговая инструкция по развертыванию Forgejo Runner на Server

## 📦 Что будет развернуто

1. **Образы для labels** (job containers):
   - `forgejo-runner-optimized:debian` - для label `alpine` и `debian` (~458 MB)
   - `forgejo-runner-optimized:alpine` - для label `alpine-light` (~200 MB)

2. **Runner container** (постоянный):
   - Запускается через `docker-compose.yml`
   - Регистрируется на Forgejo через registration token
   - Использует образы для labels при выполнении jobs

---

## 🎯 Шаг 1: Подготовка на Server

### 1.1. Подключение к Server

```bash
ssh bessiaka@192.168.1.72
```

### 1.2. Переход в директорию проекта

```bash
cd /home/bessiaka/WORKSPACE/recording_life_system
```

### 1.3. Получение последних изменений

```bash
git pull origin claude/setup-github-actions-cicd-F5yxE
```

### 1.4. Остановка старого runner

```bash
# Проверить запущенные контейнеры
docker ps | grep forgejo-runner

# Остановить старый runner
docker stop forgejo-runner-alpine
docker rm forgejo-runner-alpine
```

**Результат:** Старый runner остановлен и удален.

---

## 🏗️ Шаг 2: Сборка образов для labels

### 2.1. Переход в директорию runner

```bash
cd .github/runner-forgejo
```

### 2.2. Сборка Debian образа (рекомендуется для основного использования)

```bash
./build-runner-image.sh debian
```

**Ожидаемый вывод:**
```
✅ Образ успешно собран!
📊 Информация об образе:
REPOSITORY                 TAG       SIZE      CREATED AT
forgejo-runner-optimized   debian    458MB     2025-12-17 07:08:20 +0300 MSK

🧪 Тестирование образа...
✅ Node.js: v20.19.6
✅ NPM: 10.8.2
✅ Python: Python 3.11.2
✅ Git: git version 2.39.5
✅ Docker: Docker version 29.1.3
✅ Docker Compose: Docker Compose version v5.0.0
✅ Act Runner: act_runner version v0.2.11
```

**Результат:** Образ `forgejo-runner-optimized:debian` создан локально (458 MB).

### 2.3. (Опционально) Сборка Alpine образа для легковесных задач

```bash
./build-runner-image.sh alpine
```

**Результат:** Образ `forgejo-runner-optimized:alpine` создан локально (~200 MB).

### 2.4. Проверка созданных образов

```bash
docker images | grep forgejo-runner-optimized
```

**Ожидаемый вывод:**
```
forgejo-runner-optimized   debian    458MB     2 minutes ago
forgejo-runner-optimized   alpine    201MB     1 minute ago
```

---

## ⚙️ Шаг 3: Конфигурация runner

### 3.1. Создание .env файла с переменными окружения

```bash
cd /home/bessiaka/WORKSPACE/recording_life_system/.github/runner-forgejo

# Создать .env файл из примера
cp .env.example .env

# Отредактировать .env файл
nano .env
```

### 3.2. Заполнение .env файла

Скопируйте и вставьте в `.env`:

```bash
# ===================================
# Forgejo Instance Configuration
# ===================================
# URL вашего Forgejo сервера
FORGEJO_INSTANCE_URL=http://95.165.70.94:1080

# Registration token (получите в Forgejo: Settings → Actions → Runners → Create new Runner)
FORGEJO_RUNNER_TOKEN=ваш_токен_здесь

# ===================================
# Runner Configuration
# ===================================
# Имя runner (будет отображаться в Forgejo)
FORGEJO_RUNNER_NAME=server-runner-production

# ===================================
# Runner Labels (job containers)
# ===================================
# ВАЖНО: Эти образы должны быть собраны заранее!
FORGEJO_RUNNER_LABELS=alpine:docker://forgejo-runner-optimized:debian,debian:docker://forgejo-runner-optimized:debian,ubuntu-latest:docker://forgejo-runner-optimized:debian

# Если собрали оба образа, можно добавить Alpine для легковесных задач:
# FORGEJO_RUNNER_LABELS=alpine:docker://forgejo-runner-optimized:debian,alpine-light:docker://forgejo-runner-optimized:alpine,debian:docker://forgejo-runner-optimized:debian,ubuntu-latest:docker://forgejo-runner-optimized:debian

# ===================================
# Runner Resources
# ===================================
# Количество параллельных задач
RUNNER_CAPACITY=1

# Таймаут для задач в секундах (1 час)
RUNNER_TIMEOUT=3600s

# Интервал проверки новых задач (2 секунды)
RUNNER_FETCH_INTERVAL=2s

# ===================================
# Cache Configuration
# ===================================
CACHE_ENABLED=true
CACHE_MAX_SIZE=5000

# ===================================
# Container Configuration
# ===================================
CONTAINER_NETWORK=bridge
CONTAINER_PRIVILEGED=true
```

**Сохраните файл:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 📝 Шаг 4: Получение Registration Token из Forgejo

### 4.1. Откройте Forgejo в браузере

```
http://95.165.70.94:1080
```

### 4.2. Перейдите в настройки Actions

1. Откройте ваш репозиторий
2. Settings → Actions → Runners
3. Нажмите **"Create new Runner"**
4. Скопируйте **Registration Token**

### 4.3. Вставьте токен в .env файл

```bash
nano .env

# Найдите строку:
FORGEJO_RUNNER_TOKEN=ваш_токен_здесь

# Замените на реальный токен:
FORGEJO_RUNNER_TOKEN=скопированный_токен
```

**Сохраните файл.**

---

## 🚀 Шаг 5: Запуск runner

### 5.1. Удалить warning о version (опционально)

```bash
# Удалить первую строку "version: '3.8'" из docker-compose.yml
sed -i '1d' docker-compose.yml
```

### 5.2. Запуск runner через docker compose

```bash
cd /home/bessiaka/WORKSPACE/recording_life_system/.github/runner-forgejo

# Запустить runner
docker compose up -d
```

**Ожидаемый вывод:**
```
[+] Running 2/2
 ✔ Network runner-forgejo_runner-network  Created
 ✔ Container forgejo-runner-optimized     Started
```

### 5.3. Проверка логов runner

```bash
docker compose logs -f
```

**Ожидаемый вывод (без ошибок):**
```
forgejo-runner-optimized  | 🚀 Запуск Forgejo Runner...
forgejo-runner-optimized  | 📦 Forgejo Instance: http://95.165.70.94:1080/
forgejo-runner-optimized  | 🏷️  Имя runner: server-runner-production
forgejo-runner-optimized  | 🏷️  Метки: alpine:docker://forgejo-runner-optimized:debian,debian:docker://forgejo-runner-optimized:debian,ubuntu-latest:docker://forgejo-runner-optimized:debian
forgejo-runner-optimized  | 🔧 Регистрация нового runner...
forgejo-runner-optimized  | level=info msg="Runner registered successfully."
forgejo-runner-optimized  | ✅ Runner зарегистрирован успешно
forgejo-runner-optimized  | 🎯 Запуск runner в режиме daemon...
forgejo-runner-optimized  | time="2025-12-17T04:14:40Z" level=info msg="Starting runner daemon"
forgejo-runner-optimized  | time="2025-12-17T04:14:40Z" level=info msg="runner: server-runner-production, with version: v0.2.11, with labels: [alpine debian ubuntu-latest], declare successfully"
```

**Выход из логов:** `Ctrl+C`

---

## ✅ Шаг 6: Проверка работоспособности

### 6.1. Проверка runner в Forgejo Web UI

1. Откройте: http://95.165.70.94:1080
2. Перейдите: Settings → Actions → Runners
3. Найдите: **"server-runner-production"** со статусом **"Idle"** (зеленый)

### 6.2. Проверка контейнера на Server

```bash
# Проверить статус runner container
docker ps | grep forgejo-runner

# Проверить, какие образы доступны
docker images | grep forgejo-runner-optimized
```

**Ожидаемый вывод:**
```
CONTAINER ID   IMAGE                                  STATUS
abc123def456   forgejo-runner-optimized:debian        Up 2 minutes (healthy)

REPOSITORY                 TAG       SIZE
forgejo-runner-optimized   debian    458MB
forgejo-runner-optimized   alpine    201MB
```

---

## 🧪 Шаг 7: Тестирование workflow

### 7.1. На Desktop: Push коммита

```bash
cd ~/WORKSPACE/WORKSPACE_LOCAL_GITLAB/todo-voice-app

# Push любого изменения в ветку
git push origin claude/setup-github-actions-cicd-F5yxE
```

### 7.2. На Server: Наблюдение за выполнением

```bash
# В одном терминале - логи runner
cd /home/bessiaka/WORKSPACE/recording_life_system/.github/runner-forgejo
docker compose logs -f

# В другом терминале - список контейнеров
watch -n 1 'docker ps'
```

### 7.3. Что должно произойти

**Во время выполнения workflow:**
- Runner container (постоянный)
- Job container `forgejo-runner-optimized:debian` (временный) ← ЗДЕСЬ выполняется workflow

**После завершения workflow:**
- Runner container (остается)
- Job container (автоматически удаляется)

### 7.4. Проверка в Forgejo Web UI

1. Откройте репозиторий
2. Перейдите: Actions → Runs
3. Найдите запущенный workflow
4. Проверьте логи каждого step

**Ожидаемый результат:**
```
✅ actions/checkout@v4 - SUCCESS (Node.js найден!)
✅ Test - Print environment info - SUCCESS
✅ Test - Check .env.production exists - SUCCESS
✅ Workflow completed successfully
```

---

## 📊 Итоговая архитектура

```
┌─────────────────────────────────────────────────────┐
│ Server (192.168.1.72)                               │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │ Runner Container (постоянный)             │     │
│  │ - Образ: Alpine + act_runner              │     │
│  │ - Слушает: Forgejo server                 │     │
│  │ - Labels: alpine, debian, ubuntu-latest   │     │
│  └───────────────────────────────────────────┘     │
│                     ↓                               │
│         Получает job с runs-on: alpine             │
│                     ↓                               │
│  ┌───────────────────────────────────────────┐     │
│  │ Job Container (временный)                 │     │
│  │ - Образ: forgejo-runner-optimized:debian │     │
│  │ - Содержит: Node.js + Python + Docker    │     │
│  │ - Выполняет: workflow steps               │     │
│  │ - После завершения: удаляется             │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  Локальные образы (Docker cache):                  │
│  - forgejo-runner-optimized:debian (458MB)          │
│  - forgejo-runner-optimized:alpine (201MB)          │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Управление runner

### Остановить runner

```bash
cd /home/bessiaka/WORKSPACE/recording_life_system/.github/runner-forgejo
docker compose down
```

### Запустить runner

```bash
docker compose up -d
```

### Перезапустить runner

```bash
docker compose restart
```

### Просмотр логов

```bash
docker compose logs -f
```

### Обновление labels

```bash
# Отредактировать .env
nano .env

# Изменить FORGEJO_RUNNER_LABELS
# Сохранить и перезапустить
docker compose restart
```

---

## 📝 Частые проблемы и решения

### Проблема: "forgejo-runner: command not found"

**Причина:** В entrypoint.sh используется неправильная команда.

**Решение:** Убедитесь, что используется `act_runner`, а не `forgejo-runner`.

### Проблема: "port already allocated"

**Причина:** Старый runner все еще запущен.

**Решение:**
```bash
docker stop forgejo-runner-alpine
docker rm forgejo-runner-alpine
docker compose up -d
```

### Проблема: "actions/checkout@v4 failed: Node.js not found"

**Причина:** Используются старые labels без Node.js.

**Решение:** Проверьте, что FORGEJO_RUNNER_LABELS указывает на `forgejo-runner-optimized:debian`.

---

## ✅ Чек-лист готовности

- [ ] Образ `forgejo-runner-optimized:debian` собран
- [ ] (Опционально) Образ `forgejo-runner-optimized:alpine` собран
- [ ] `.env` файл создан и заполнен
- [ ] Registration token получен из Forgejo
- [ ] Runner запущен через `docker compose up -d`
- [ ] Runner зарегистрирован (виден в Forgejo UI)
- [ ] Workflow протестирован (push коммита)
- [ ] `actions/checkout@v4` работает успешно

---

## 🎯 Итог

После выполнения всех шагов у вас будет:
1. ✅ Runner запущен на Server и зарегистрирован на Forgejo
2. ✅ Образы для labels собраны локально
3. ✅ Workflow автоматически запускаются при push
4. ✅ Job containers создаются с Node.js + Python + Docker
5. ✅ GitHub Actions совместимые actions работают корректно

**Готово к production использованию!** 🚀
