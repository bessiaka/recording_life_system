#!/bin/bash
# Скрипт для применения всех миграций базы данных

echo "🔧 Применение миграций базы данных"

# Переходим в корень репозитория
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Путь к БД
DB_PATH="$REPO_ROOT/data/tasks.db"

if [ ! -f "$DB_PATH" ]; then
    echo "❌ База данных не найдена по пути: $DB_PATH"
    echo "ℹ️  Миграция не требуется - база будет создана с новой схемой"
    exit 0
fi

echo "📦 Найдена база данных: $DB_PATH"
echo "📦 Создаём резервную копию..."
cp "$DB_PATH" "${DB_PATH}.backup_$(date +%Y%m%d_%H%M%S)"

# Применяем миграции последовательно
MIGRATIONS=(
    "001_add_scheduled_time.sql"
    "002_add_recurrence_fields.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    MIGRATION_PATH="$SCRIPT_DIR/migrations/$migration"

    if [ -f "$MIGRATION_PATH" ]; then
        echo "🔧 Применяем $migration..."
        sqlite3 "$DB_PATH" < "$MIGRATION_PATH" 2>&1

        if [ $? -eq 0 ]; then
            echo "  ✅ $migration применена"
        else
            echo "  ⚠️  $migration пропущена (возможно, уже применена)"
        fi
    fi
done

echo ""
echo "✅ Все миграции обработаны!"
echo ""
echo "Для проверки выполните:"
echo "  sqlite3 $DB_PATH \"PRAGMA table_info(tasks);\""
