#!/bin/bash

# Deploy script для recording_life_system
# Использует docker-compose.prod.yml для развертывания на продакшн

set -e

echo "🚀 Начинаем развертывание recording_life_system..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка наличия docker и docker-compose
if ! command -v docker &> /dev/null; then
    log_error "Docker не установлен!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose не установлен!"
    exit 1
fi

# Создание директории для данных
log_info "Создание директории для данных..."
mkdir -p ./data
chmod 755 ./data

# Остановка старых контейнеров
log_info "Остановка старых контейнеров..."
docker-compose -f docker-compose.prod.yml down || log_warning "Контейнеры не были запущены"

# Сборка образов
log_info "Сборка Docker образов..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Запуск контейнеров
log_info "Запуск контейнеров..."
docker-compose -f docker-compose.prod.yml up -d

# Ожидание готовности сервисов
log_info "Ожидание готовности backend..."
timeout 60 sh -c 'until curl -f http://localhost:8000/health 2>/dev/null; do sleep 2; echo -n "."; done' && echo "" || log_warning "Backend не ответил в течение 60 секунд"

log_info "Ожидание готовности frontend..."
timeout 60 sh -c 'until curl -f http://localhost:3000 2>/dev/null; do sleep 2; echo -n "."; done' && echo "" || log_warning "Frontend не ответил в течение 60 секунд"

# Проверка статуса контейнеров
log_info "Проверка статуса контейнеров..."
docker-compose -f docker-compose.prod.yml ps

# Очистка старых образов
log_info "Очистка старых Docker образов..."
docker image prune -f --filter "until=24h" || log_warning "Не удалось очистить старые образы"

echo ""
log_info "✅ Развертывание завершено успешно!"
log_info "🌐 Frontend доступен на: http://192.168.1.72:3000"
log_info "🔌 Backend API доступен на: http://192.168.1.72:8000"
log_info "📚 API документация: http://192.168.1.72:8000/docs"
echo ""
log_info "Для просмотра логов используйте:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
