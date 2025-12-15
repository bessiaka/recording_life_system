#!/bin/bash

set -e

# Проверяем наличие необходимых переменных окружения
if [ -z "$GITHUB_REPOSITORY" ] || [ -z "$RUNNER_TOKEN" ]; then
    echo "Ошибка: Необходимо указать GITHUB_REPOSITORY и RUNNER_TOKEN"
    exit 1
fi

# Имя runner (по умолчанию используем hostname)
RUNNER_NAME=${RUNNER_NAME:-"docker-runner-$(hostname)"}

# Метки для runner
RUNNER_LABELS=${RUNNER_LABELS:-"self-hosted,Linux,X64,docker"}

# URL репозитория
REPO_URL="https://github.com/${GITHUB_REPOSITORY}"

echo "🔧 Конфигурация GitHub Actions Runner..."
echo "📦 Репозиторий: $REPO_URL"
echo "🏷️  Имя runner: $RUNNER_NAME"
echo "🏷️  Метки: $RUNNER_LABELS"

# Удаляем старую конфигурацию если есть
if [ -f ".runner" ]; then
    echo "🗑️  Удаление старой конфигурации..."
    ./config.sh remove --token "$RUNNER_TOKEN" || true
fi

# Конфигурируем runner
./config.sh \
    --url "$REPO_URL" \
    --token "$RUNNER_TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$RUNNER_LABELS" \
    --work "_work" \
    --unattended \
    --replace

echo "✅ Runner сконфигурирован"
echo "🚀 Запуск runner..."

# Cleanup функция для graceful shutdown
cleanup() {
    echo "🛑 Остановка runner..."
    ./config.sh remove --token "$RUNNER_TOKEN"
}

trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

# Запускаем runner
./run.sh & wait $!
