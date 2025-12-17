#!/bin/bash
# ============================================
# Сборка оптимизированного образа для Forgejo Runner
# ============================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Получение директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Выбор варианта образа
VARIANT="${1:-debian}"
IMAGE_NAME="forgejo-runner-optimized"

case "$VARIANT" in
    debian)
        DOCKERFILE="Dockerfile.runner"
        TAG="$IMAGE_NAME:debian"
        echo -e "${BLUE}📦 Сборка Debian-based образа (рекомендуется)${NC}"
        ;;
    alpine)
        DOCKERFILE="Dockerfile.runner-alpine"
        TAG="$IMAGE_NAME:alpine"
        echo -e "${BLUE}📦 Сборка Alpine-based образа (легковесный)${NC}"
        ;;
    *)
        echo -e "${RED}❌ Ошибка: Неизвестный вариант '$VARIANT'${NC}"
        echo "Использование: $0 [debian|alpine]"
        exit 1
        ;;
esac

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Forgejo Runner Image Builder${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Dockerfile:${NC} $DOCKERFILE"
echo -e "${BLUE}Image Tag:${NC}  $TAG"
echo ""

# Переход в директорию с Dockerfile
cd "$SCRIPT_DIR"

# Сборка образа
echo -e "${YELLOW}🔨 Начало сборки...${NC}"
docker build \
    -f "$DOCKERFILE" \
    -t "$TAG" \
    --progress=plain \
    .

# Проверка размера образа
echo ""
echo -e "${GREEN}✅ Образ успешно собран!${NC}"
echo ""
echo -e "${YELLOW}📊 Информация об образе:${NC}"
docker images "$TAG" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Тестирование образа
echo ""
echo -e "${YELLOW}🧪 Тестирование образа...${NC}"
docker run --rm "$TAG" bash -c "
    echo '✅ Node.js:' \$(node --version)
    echo '✅ NPM:' \$(npm --version)
    echo '✅ Python:' \$(python --version)
    echo '✅ Git:' \$(git --version)
    echo '✅ Docker:' \$(docker --version)
    echo '✅ Docker Compose:' \$(docker compose version)
"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Сборка завершена успешно!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📝 Следующие шаги:${NC}"
echo "1. Обновите docker-compose.yml в .github/runner-forgejo/"
echo "   Замените 'image: ghcr.io/...' на 'image: $TAG'"
echo ""
echo "2. Перезапустите runner:"
echo "   cd .github/runner-forgejo"
echo "   docker compose down"
echo "   docker compose up -d"
echo ""
echo -e "${BLUE}💾 Для сохранения образа в registry:${NC}"
echo "   docker tag $TAG your-registry.com/$TAG"
echo "   docker push your-registry.com/$TAG"
echo ""
