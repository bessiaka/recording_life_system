"""
Скрипт миграции базы данных для добавления новых полей в таблицу tasks.

Этот скрипт добавляет новые колонки к существующей таблице tasks.
Запустить: python migrate_database.py
"""
import sqlite3
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Путь к базе данных
DB_PATH = os.getenv("DATABASE_PATH", "/data/tasks.db")


def migrate_database():
    """Выполняет миграцию базы данных"""

    if not os.path.exists(DB_PATH):
        logger.warning(f"⚠️  База данных не найдена по пути {DB_PATH}. Она будет создана автоматически при запуске.")
        return

    logger.info(f"🔄 Начинаем миграцию базы данных: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Получаем список существующих колонок
        cursor.execute("PRAGMA table_info(tasks)")
        existing_columns = {row[1] for row in cursor.fetchall()}
        logger.info(f"📋 Существующие колонки: {existing_columns}")

        # Список новых колонок для добавления
        new_columns = [
            # 1.1. Идентификация и описание
            ("key", "VARCHAR(50)"),
            ("type", "VARCHAR(50) DEFAULT 'Task'"),

            # 1.2. Статус и жизненный цикл
            ("status", "VARCHAR(50) DEFAULT 'Backlog'"),
            ("resolution", "VARCHAR(50)"),
            ("completed_at", "DATETIME"),

            # 1.3. Ответственность и владение
            ("assignee", "VARCHAR(100)"),
            ("reporter", "VARCHAR(100)"),
            ("watchers", "JSON"),

            # 1.4. Приоритет и срочность (priority уже есть, но изменим тип)
            ("severity", "VARCHAR(50)"),
            ("due_date", "DATE"),
            ("sla", "VARCHAR(100)"),

            # 1.5. Планирование и оценка
            ("estimate", "VARCHAR(50)"),
            ("original_estimate", "VARCHAR(50)"),
            ("remaining_estimate", "VARCHAR(50)"),
            ("time_spent", "VARCHAR(50)"),
            ("start_date", "DATE"),

            # 1.6. Связи и структура
            ("project_id", "INTEGER"),
            ("parent_id", "INTEGER"),
            ("subtasks", "JSON"),
            ("dependencies", "JSON"),
            ("links", "JSON"),

            # 1.7. Классификация и группировка
            ("labels", "JSON"),
            ("components", "JSON"),
            ("epic_id", "INTEGER"),
            ("sprint_id", "INTEGER"),
            ("milestone", "VARCHAR(100)"),

            # 2. Контекст выполнения
            ("location", "VARCHAR(50)"),
            ("tools_required", "JSON"),
            ("environment", "VARCHAR(50)"),
            ("connectivity", "VARCHAR(50)"),
            ("execution_mode", "VARCHAR(50)"),

            # 3. Рутинность и повторяемость
            ("is_repeatable", "BOOLEAN DEFAULT 0"),
            ("recurrence_rule", "VARCHAR(100)"),
            ("routine_type", "VARCHAR(50)"),
            ("maintenance_level", "VARCHAR(50)"),
            ("skip_penalty", "TEXT"),
        ]

        # Добавляем только те колонки, которых еще нет
        added_count = 0
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE tasks ADD COLUMN {col_name} {col_type}")
                    logger.info(f"✅ Добавлена колонка: {col_name} {col_type}")
                    added_count += 1
                except sqlite3.OperationalError as e:
                    logger.error(f"❌ Ошибка при добавлении колонки {col_name}: {e}")

        # Теперь нужно обновить существующее поле priority с INTEGER на VARCHAR
        # SQLite не поддерживает изменение типа колонки напрямую, поэтому:
        # 1. Создаем новую колонку priority_new
        # 2. Копируем данные с преобразованием
        # 3. Удаляем старую и переименовываем новую

        if "priority" in existing_columns:
            logger.info("🔄 Конвертируем priority из INTEGER в VARCHAR...")

            # Проверяем, не была ли уже выполнена эта миграция
            cursor.execute("SELECT typeof(priority) FROM tasks LIMIT 1")
            result = cursor.fetchone()

            if result and result[0] in ['integer', 'INTEGER']:
                # Создаем временную колонку
                cursor.execute("ALTER TABLE tasks ADD COLUMN priority_new VARCHAR(50) DEFAULT 'Medium'")

                # Конвертируем старые числовые значения в новые текстовые
                # Старая логика: 1-2 = Critical, 3-4 = High, 5-6 = Medium, 7-8 = Low, 9+ = Lowest
                cursor.execute("""
                    UPDATE tasks SET priority_new = CASE
                        WHEN priority <= 2 THEN 'Critical'
                        WHEN priority <= 4 THEN 'High'
                        WHEN priority <= 6 THEN 'Medium'
                        WHEN priority <= 8 THEN 'Low'
                        ELSE 'Lowest'
                    END
                """)

                logger.info("✅ Конвертация priority завершена")
                logger.info("⚠️  ВНИМАНИЕ: Требуется пересоздание таблицы для удаления старой колонки priority")
                logger.info("⚠️  Рекомендуется остановить приложение и выполнить полную миграцию")
            else:
                logger.info("✅ Колонка priority уже имеет правильный тип")

        # Генерируем ключи для существующих задач
        logger.info("🔑 Генерируем ключи для существующих задач...")
        cursor.execute("UPDATE tasks SET key = 'TASK-' || id WHERE key IS NULL")
        logger.info("✅ Ключи сгенерированы")

        # Обновляем статус для существующих задач
        logger.info("📊 Обновляем статус для существующих задач...")
        cursor.execute("UPDATE tasks SET status = 'Backlog' WHERE status IS NULL")
        logger.info("✅ Статусы обновлены")

        conn.commit()
        logger.info(f"✅ Миграция завершена успешно! Добавлено колонок: {added_count}")

    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Ошибка миграции: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate_database()
