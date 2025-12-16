#!/bin/bash
# ============================================
# Скрипт проверки занятости портов
# ============================================
# Использование: ./scripts/check-ports.sh .env.development

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка аргументов
if [ -z "$1" ]; then
    echo -e "${RED}Ошибка: Не указан .env файл${NC}"
    echo "Использование: $0 <env-file>"
    echo "Пример: $0 .env.development"
    exit 1
fi

ENV_FILE="$1"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Ошибка: Файл $ENV_FILE не найден${NC}"
    exit 1
fi

# Загрузка переменных окружения
echo -e "${YELLOW}📋 Загрузка конфигурации из $ENV_FILE...${NC}"
source "$ENV_FILE"

# Проверка портов
echo -e "\n${YELLOW}🔍 Проверка портов...${NC}\n"

check_port() {
    local port=$1
    local service_name=$2

    # Проверка, занят ли порт
    if sudo lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}❌ Порт $port ($service_name) ЗАНЯТ:${NC}"
        sudo lsof -Pi :$port -sTCP:LISTEN
        return 1
    else
        echo -e "${GREEN}✅ Порт $port ($service_name) свободен${NC}"
        return 0
    fi
}

# Проверка портов
PORTS_OK=true

check_port "${BACKEND_PORT}" "Backend" || PORTS_OK=false
check_port "${FRONTEND_PORT}" "Frontend" || PORTS_OK=false

# Итоговый вывод
echo ""
if [ "$PORTS_OK" = true ]; then
    echo -e "${GREEN}✅ Все порты свободны. Можно запускать проект!${NC}"
    exit 0
else
    echo -e "${RED}❌ Некоторые порты заняты. Освободите их перед запуском.${NC}"
    echo ""
    echo -e "${YELLOW}Для освобождения портов выполните:${NC}"
    echo "  sudo kill -9 <PID>"
    echo ""
    echo -e "${YELLOW}Или измените порты в $ENV_FILE${NC}"
    exit 1
fi
