#!/bin/bash
# ============================================
# Безопасный запуск Docker Compose проекта
# ============================================
# Использование: ./scripts/start.sh development|production

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Получение директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Проверка аргументов
ENVIRONMENT="${1:-development}"

case "$ENVIRONMENT" in
    development|dev)
        ENV_FILE=".env.development"
        ;;
    production|prod)
        ENV_FILE=".env.production"
        ;;
    *)
        echo -e "${RED}Ошибка: Неизвестное окружение '$ENVIRONMENT'${NC}"
        echo "Использование: $0 [development|production]"
        exit 1
        ;;
esac

ENV_PATH="$PROJECT_DIR/$ENV_FILE"

if [ ! -f "$ENV_PATH" ]; then
    echo -e "${RED}Ошибка: Файл $ENV_FILE не найден${NC}"
    echo "Создайте его на основе .env.example:"
    echo "  cp .env.example $ENV_FILE"
    exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Recording Life System - Запуск        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}🌍 Окружение: $ENVIRONMENT${NC}"
echo -e "${YELLOW}📄 Конфиг: $ENV_FILE${NC}"
echo ""

# Переход в директорию проекта
cd "$PROJECT_DIR"

# Шаг 1: Проверка портов
echo -e "${YELLOW}🔍 Шаг 1: Проверка портов...${NC}"
if ! "$SCRIPT_DIR/check-ports.sh" "$ENV_PATH"; then
    echo ""
    echo -e "${RED}⚠️  Обнаружены занятые порты. Остановить их? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        source "$ENV_PATH"
        echo -e "${YELLOW}Останавливаем процессы на портах $BACKEND_PORT и $FRONTEND_PORT...${NC}"

        # Убиваем процессы на портах
        for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
            PID=$(sudo lsof -ti:$port) || true
            if [ -n "$PID" ]; then
                echo "  Убиваем процесс $PID на порту $port..."
                sudo kill -9 $PID || true
            fi
        done

        echo -e "${GREEN}✅ Порты освобождены${NC}"
    else
        echo -e "${RED}❌ Запуск отменен${NC}"
        exit 1
    fi
fi

# Шаг 2: Очистка старых контейнеров
echo -e "\n${YELLOW}🧹 Шаг 2: Очистка старых контейнеров...${NC}"
docker compose --env-file="$ENV_PATH" down 2>/dev/null || true

# Удаление зомби контейнеров (если есть)
source "$ENV_PATH"
ZOMBIE_CONTAINERS=$(docker ps -a --filter "name=${COMPOSE_PROJECT_NAME}" --format "{{.ID}}" 2>/dev/null || true)
if [ -n "$ZOMBIE_CONTAINERS" ]; then
    echo -e "${YELLOW}  Найдены зомби контейнеры, удаляем...${NC}"
    echo "$ZOMBIE_CONTAINERS" | xargs -r docker rm -f || true
fi

# Шаг 3: Сборка и запуск
echo -e "\n${YELLOW}🚀 Шаг 3: Сборка и запуск контейнеров...${NC}"
docker compose --env-file="$ENV_PATH" up -d --build

# Шаг 4: Проверка статуса
echo -e "\n${YELLOW}📊 Шаг 4: Проверка статуса...${NC}"
sleep 3
docker compose --env-file="$ENV_PATH" ps

# Шаг 5: Вывод URL
echo ""
source "$ENV_PATH"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Проект успешно запущен!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 Frontend:${NC}  http://${HOST_IP}:${FRONTEND_PORT}"
echo -e "${BLUE}🔧 Backend:${NC}   http://${HOST_IP}:${BACKEND_PORT}"
echo -e "${BLUE}🔌 WebSocket:${NC} ws://${HOST_IP}:${BACKEND_PORT}/ws"
echo ""
echo -e "${YELLOW}📝 Для просмотра логов:${NC}"
echo "  docker compose --env-file=$ENV_FILE logs -f"
echo ""
echo -e "${YELLOW}🛑 Для остановки:${NC}"
echo "  docker compose --env-file=$ENV_FILE down"
echo ""
