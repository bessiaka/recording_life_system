FROM python:3.12-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY app/ ./app/

# Создание директории для БД
RUN mkdir -p /data && chmod 777 /data

ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=sqlite:////data/tasks.db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
