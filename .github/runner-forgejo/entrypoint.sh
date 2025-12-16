#!/bin/bash

set -e

echo "🚀 Запуск Forgejo Runner..."

# Проверяем наличие необходимых переменных окружения
if [ -z "$FORGEJO_INSTANCE_URL" ]; then
    echo "❌ Ошибка: Необходимо указать FORGEJO_INSTANCE_URL"
    echo "Пример: FORGEJO_INSTANCE_URL=https://your-forgejo-instance.com"
    exit 1
fi

if [ -z "$FORGEJO_RUNNER_TOKEN" ]; then
    echo "❌ Ошибка: Необходимо указать FORGEJO_RUNNER_TOKEN"
    echo "Получите токен в Forgejo: Settings → Actions → Runners → Create new Runner"
    exit 1
fi

# Имя runner (по умолчанию используем hostname)
RUNNER_NAME=${FORGEJO_RUNNER_NAME:-"alpine-runner-$(hostname)"}

# Метки для runner
RUNNER_LABELS=${FORGEJO_RUNNER_LABELS:-"alpine:docker://alpine:latest,ubuntu-latest:docker://ubuntu:latest"}

echo "📦 Forgejo Instance: $FORGEJO_INSTANCE_URL"
echo "🏷️  Имя runner: $RUNNER_NAME"
echo "🏷️  Метки: $RUNNER_LABELS"

cd /data

# Проверяем существует ли конфигурация
if [ -f ".runner" ]; then
    echo "✅ Конфигурация найдена, используем существующую"
else
    echo "🔧 Регистрация нового runner..."

    # Регистрация runner
    forgejo-runner register \
        --no-interactive \
        --instance "$FORGEJO_INSTANCE_URL" \
        --token "$FORGEJO_RUNNER_TOKEN" \
        --name "$RUNNER_NAME" \
        --labels "$RUNNER_LABELS"

    echo "✅ Runner зарегистрирован успешно"
fi

# Создаем конфигурационный файл если не существует
if [ ! -f "config.yaml" ]; then
    echo "📝 Создание конфигурационного файла..."
    cat > config.yaml <<EOF
log:
  level: info

runner:
  # Количество параллельных задач
  capacity: ${RUNNER_CAPACITY:-1}

  # Таймаут для задач (формат: "3600s", "1h", "30m")
  timeout: ${RUNNER_TIMEOUT:-3600s}

  # Интервал обновления (формат: "2s", "5s")
  fetch_interval: ${RUNNER_FETCH_INTERVAL:-2s}

  # Таймаут для fetch (формат: "5s", "10s")
  fetch_timeout: ${RUNNER_FETCH_TIMEOUT:-5s}

cache:
  enabled: ${CACHE_ENABLED:-true}
  dir: "/data/.cache"

  # Максимальный размер кэша (в мегабайтах)
  max_size: ${CACHE_MAX_SIZE:-5000}

container:
  # Сеть для контейнеров
  network: ${CONTAINER_NETWORK:-bridge}

  # Включить privileged mode (для Docker-in-Docker)
  privileged: ${CONTAINER_PRIVILEGED:-true}

  # Дополнительные volume монтирования
  # volumes:
  #   - /path/on/host:/path/in/container
EOF
    echo "✅ Конфигурационный файл создан"
fi

echo "🎯 Запуск runner в режиме daemon..."

# Cleanup функция для graceful shutdown
cleanup() {
    echo "🛑 Получен сигнал остановки, завершение работы..."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Запускаем runner
exec forgejo-runner daemon --config config.yaml
