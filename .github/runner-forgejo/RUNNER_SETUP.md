# Настройка Forgejo Actions Runner (Alpine)

Легковесный runner на базе Alpine Linux для Forgejo Actions с минимальным потреблением ресурсов.

## 🎯 Преимущества этой реализации

- **Минимальный размер**: ~85-120 MB (vs ~700 MB для GitHub runner)
- **Низкое потребление RAM**: 256 MB минимум (vs 512 MB для GitHub runner)
- **Быстрый запуск**: Alpine загружается за секунды
- **Экономия ресурсов**: Идеально для запуска нескольких runners на одном сервере

## 📋 Требования

- Docker и Docker Compose установлены
- Forgejo instance (self-hosted или публичный)
- Минимум 256 MB RAM и 1 GB свободного места на диске

## 🚀 Быстрый старт

### Шаг 1: Копирование файлов на сервер

```bash
# Скопируйте файлы на ваш сервер
scp -r .github/runner-forgejo/* user@192.168.1.72:~/forgejo-runner/

# Подключитесь к серверу
ssh user@192.168.1.72
cd ~/forgejo-runner
```

### Шаг 2: Получение токена регистрации

**В Forgejo instance:**

1. Откройте ваш Forgejo
2. Перейдите в **Settings** (или Admin panel для instance-wide runner)
3. Перейдите в **Actions** → **Runners**
4. Нажмите **"Create new Runner"**
5. Скопируйте токен регистрации

### Шаг 3: Конфигурация

```bash
# Создайте .env файл из примера
cp .env.example .env

# Отредактируйте .env
nano .env
```

Обязательно укажите:
```bash
FORGEJO_INSTANCE_URL=https://your-forgejo-instance.com
FORGEJO_RUNNER_TOKEN=your_token_here
```

Опционально настройте:
```bash
# Имя runner
FORGEJO_RUNNER_NAME=alpine-runner-prod

# Доступные образы для workflow
FORGEJO_RUNNER_LABELS=alpine:docker://alpine:latest,ubuntu:docker://ubuntu:22.04,node:docker://node:20-alpine

# Производительность
RUNNER_CAPACITY=1          # Сколько задач одновременно
RUNNER_TIMEOUT=3600        # Таймаут задачи (1 час)
CACHE_MAX_SIZE=5000        # Размер кэша (5 GB)
```

### Шаг 4: Запуск runner

```bash
# Запустите runner
docker-compose up -d --build

# Проверьте логи
docker-compose logs -f

# Вы должны увидеть:
# ✅ Runner зарегистрирован успешно
# 🎯 Запуск runner в режиме daemon...
```

### Шаг 5: Проверка работы

**В Forgejo:**
- Settings → Actions → Runners
- Ваш runner должен появиться со статусом **Online**

**На сервере:**
```bash
# Проверка статуса контейнера
docker-compose ps

# Проверка использования ресурсов
docker stats forgejo-runner-alpine
```

## 📊 Потребление ресурсов

### Idle (ожидание задач):
- **RAM**: ~50-80 MB
- **CPU**: ~0-1%
- **Disk**: ~85 MB (образ) + данные

### При выполнении задачи:
- **RAM**: 100-500 MB (зависит от workflow)
- **CPU**: 10-100% (зависит от задачи)
- **Disk**: +кэш и артефакты

### Ограничения в docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'      # Максимум 1 CPU core
      memory: 1G       # Максимум 1 GB RAM
    reservations:
      cpus: '0.25'     # Минимум 0.25 CPU
      memory: 256M     # Минимум 256 MB RAM
```

Настройте под свои нужды!

## 🔧 Конфигурация

### Метки (Labels)

Метки определяют какие Docker образы доступны для workflow:

```bash
# Формат: label:docker://image
FORGEJO_RUNNER_LABELS=alpine:docker://alpine:latest,ubuntu:docker://ubuntu:22.04
```

**Использование в workflow:**

```yaml
# .forgejo/workflows/deploy.yml
name: Deploy

on: [push]

jobs:
  build:
    runs-on: alpine  # Использует alpine:latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Build
        run: |
          apk add --no-cache docker-compose
          docker-compose build
```

### Множественные runners

Можно запустить несколько runners для параллелизма:

```bash
# Первый runner
cd ~/forgejo-runner-1
docker-compose up -d

# Второй runner
cd ~/forgejo-runner-2
# Измените порты если нужно
docker-compose up -d
```

### Capacity (параллелизм)

```bash
# Количество задач одновременно на одном runner
RUNNER_CAPACITY=2  # Будет выполнять 2 задачи параллельно
```

**Рекомендации:**
- 1 для маломощных серверов
- 2-4 для средних серверов
- 4+ для мощных серверов

## 🛠️ Управление runner

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Последние 100 строк
docker-compose logs --tail=100

# С временными метками
docker-compose logs -f --timestamps
```

### Перезапуск

```bash
docker-compose restart
```

### Остановка

```bash
docker-compose down
```

### Обновление

```bash
# Остановите runner
docker-compose down

# Обновите версию в docker-compose.yml (args.RUNNER_VERSION)
nano docker-compose.yml

# Пересоберите образ
docker-compose build --no-cache

# Запустите
docker-compose up -d
```

### Удаление и переустановка

```bash
# Полное удаление
docker-compose down -v
rm -rf runner-data/ cache/

# Новая установка
docker-compose up -d --build
```

## 🎨 Пример Forgejo Workflow

Создайте `.forgejo/workflows/deploy.yml` в репозитории:

```yaml
name: Deploy to Production

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
        run: |
          apk add --no-cache docker-compose curl

      - name: Build Docker images
        run: |
          docker-compose -f docker-compose.prod.yml build

      - name: Deploy
        run: |
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d

      - name: Health check
        run: |
          sleep 10
          curl -f http://localhost:8000/health || exit 1

      - name: Clean up
        run: |
          docker image prune -f
```

## 🔒 Безопасность

### Рекомендации:

1. **Ограничьте scope токена**: Создавайте токены только для конкретного репозитория
2. **Используйте secrets**: Храните чувствительные данные в Forgejo Secrets
3. **Обновляйте**: Регулярно обновляйте Forgejo Runner
4. **Мониторинг**: Следите за логами runner
5. **Изоляция**: Runner изолирован в Docker контейнере

### Forgejo Secrets

В репозитории:
Settings → Secrets → Add secret

Использование в workflow:
```yaml
steps:
  - name: Deploy
    env:
      SSH_KEY: ${{ secrets.SSH_KEY }}
      API_TOKEN: ${{ secrets.API_TOKEN }}
    run: |
      echo "$SSH_KEY" > /tmp/key
      deploy.sh
```

## 🐛 Troubleshooting

### Runner не регистрируется

```bash
# Проверьте логи
docker-compose logs

# Проверьте токен
cat .env | grep TOKEN

# Проверьте доступность Forgejo
curl -I https://your-forgejo-instance.com
```

### Workflow не запускается

1. Проверьте что runner **Online** в Forgejo
2. Убедитесь что метка (runs-on) совпадает с FORGEJO_RUNNER_LABELS
3. Проверьте синтаксис workflow файла
4. Проверьте логи runner

### Docker ошибки

```bash
# Проверьте доступ к Docker socket
ls -la /var/run/docker.sock

# Проверьте права
docker ps

# Перезапустите Docker
sudo systemctl restart docker
docker-compose restart
```

### Не хватает памяти

```bash
# Увеличьте лимиты в docker-compose.yml
limits:
  memory: 2G  # Вместо 1G

# Или уменьшите capacity
RUNNER_CAPACITY=1
```

## 📊 Сравнение с GitHub Runner

| Характеристика | Forgejo (Alpine) | GitHub (Ubuntu) |
|----------------|------------------|-----------------|
| Размер образа | ~85-120 MB | ~700-1500 MB |
| RAM (idle) | ~50-80 MB | ~150-300 MB |
| RAM (limit) | 256 MB min | 512 MB min |
| Время старта | ~5-10 сек | ~20-30 сек |
| Совместимость | Alpine packages | Широкая |
| Use case | Personal/Small teams | Enterprise |

## 🔄 Миграция с GitHub на Forgejo

1. Скопируйте `.github/workflows/` в `.forgejo/workflows/`
2. Замените `runs-on: ubuntu-latest` на `runs-on: alpine` или `runs-on: ubuntu`
3. Проверьте что все actions доступны (actions/checkout@v3 и т.д.)
4. Адаптируйте команды под Alpine (apt → apk)

## 📚 Дополнительные ресурсы

- [Forgejo Actions Documentation](https://forgejo.org/docs/latest/user/actions/)
- [Forgejo Runner Releases](https://code.forgejo.org/forgejo/runner/releases)
- [Alpine Linux Packages](https://pkgs.alpinelinux.org/)
- [Docker-in-Docker Best Practices](https://jpetazzo.github.io/2015/09/03/do-not-use-docker-in-docker-for-ci/)

---

## 💡 Советы по оптимизации

### 1. Используйте Alpine образы в workflow

```yaml
runs-on: alpine
steps:
  - run: apk add --no-cache python3  # Быстрее чем apt
```

### 2. Кэшируйте зависимости

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache
    key: ${{ runner.os }}-deps-${{ hashFiles('**/requirements.txt') }}
```

### 3. Настройте лимиты ресурсов

Если runner тормозит другие сервисы, ограничьте ресурсы в docker-compose.yml

### 4. Множественные runners

Запустите 2-3 легковесных runner вместо одного тяжелого для параллелизма

---

Если возникли вопросы, создайте Issue в репозитории.
