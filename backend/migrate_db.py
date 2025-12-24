#!/usr/bin/env python3
"""
Скрипт миграции базы данных к новой схеме v1

Этот скрипт:
1. Создает backup текущей БД (если существует)
2. Удаляет старую БД
3. Создает новую БД с обновленной схемой Task v1 + Execution v1
"""
import os
import shutil
from datetime import datetime

# Путь к БД (из docker volume)
DB_PATH = "/data/tasks.db"
BACKUP_DIR = "/data/backups"


def create_backup():
    """Создать backup текущей БД"""
    if not os.path.exists(DB_PATH):
        print(f"⚠️  БД не найдена по пути {DB_PATH}, пропускаем backup")
        return None

    # Создаем директорию для backups если не существует
    os.makedirs(BACKUP_DIR, exist_ok=True)

    # Генерируем имя backup файла с timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"tasks_backup_{timestamp}.db")

    # Копируем БД
    shutil.copy2(DB_PATH, backup_path)
    print(f"✅ Backup создан: {backup_path}")
    return backup_path


def delete_old_db():
    """Удалить старую БД"""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"🗑️  Старая БД удалена: {DB_PATH}")
    else:
        print(f"⚠️  Старая БД не найдена: {DB_PATH}")


def create_new_db():
    """Создать новую БД с обновленной схемой"""
    # Импортируем модели и engine
    from app.database.session import Base, engine
    from app.models import Task, Execution

    # Создаем все таблицы
    Base.metadata.create_all(bind=engine)
    print(f"✅ Новая БД создана с таблицами: {list(Base.metadata.tables.keys())}")


def main():
    """Основная функция миграции"""
    print("=" * 60)
    print("🔄 МИГРАЦИЯ БД К СХЕМЕ v1 (Task + Execution)")
    print("=" * 60)

    # Шаг 1: Backup
    print("\n[1/3] Создание backup...")
    backup_path = create_backup()

    # Шаг 2: Удаление старой БД
    print("\n[2/3] Удаление старой БД...")
    delete_old_db()

    # Шаг 3: Создание новой БД
    print("\n[3/3] Создание новой БД...")
    create_new_db()

    print("\n" + "=" * 60)
    print("✅ МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
    print("=" * 60)
    if backup_path:
        print(f"📦 Backup сохранен: {backup_path}")
    print("\n🚀 Новая схема готова к использованию!")
    print("   - Task v1: Intent (намерение)")
    print("   - Execution v1: Fact (фиксация)")


if __name__ == "__main__":
    main()
