# Настройка Self-Hosted GitHub Actions Runner

Это руководство описывает процесс настройки self-hosted GitHub Actions runner на сервере Ubuntu 20.04 для автоматического развертывания проекта recording_life_system.

## 📋 Требования

- Ubuntu 20.04 (сервер 192.168.1.72)
- Docker и Docker Compose установлены
- Доступ к GitHub репозиторию с правами администратора
- Минимум 2 GB RAM и 10 GB свободного места на диске

## 🐳 Вариант 1: Runner в Docker контейнере (Рекомендуется)

Этот вариант позволяет изолировать runner в контейнере и легко управлять им.

### Шаг 1: Подготовка файлов на сервере

Создайте директорию для runner на сервере:

```bash
ssh user@192.168.1.72
mkdir -p ~/github-runner
cd ~/github-runner
```

### Шаг 2: Создание Dockerfile

Создайте файл `Dockerfile`:

```dockerfile
FROM ubuntu:20.04

# Отключаем интерактивные запросы
ARG DEBIAN_FRONTEND=noninteractive

# Обновляем систему и устанавливаем необходимые пакеты
RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    sudo \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Docker (для запуска контейнеров из workflow)
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose && \
    rm -rf /var/lib/apt/lists/*

# Создаем пользователя для runner
RUN useradd -m -s /bin/bash runner && \
    usermod -aG sudo runner && \
    usermod -aG docker runner && \
    echo "runner ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Скачиваем и устанавливаем GitHub Actions Runner
WORKDIR /home/runner
RUN RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/v//') && \
    curl -o actions-runner-linux-x64.tar.gz -L "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" && \
    tar xzf actions-runner-linux-x64.tar.gz && \
    rm actions-runner-linux-x64.tar.gz && \
    chown -R runner:runner /home/runner

# Устанавливаем зависимости runner
RUN ./bin/installdependencies.sh

USER runner

# Копируем entrypoint скрипт
COPY entrypoint.sh /home/runner/entrypoint.sh

ENTRYPOINT ["/home/runner/entrypoint.sh"]
```

### Шаг 3: Создание entrypoint.sh

Создайте файл `entrypoint.sh`:

```bash
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

# Запускаем runner
./run.sh
```

Сделайте скрипт исполняемым:

```bash
chmod +x entrypoint.sh
```

### Шаг 4: Создание docker-compose.yml

Создайте файл `docker-compose.yml`:

```yaml
version: '3.8'

services:
  github-runner:
    build: .
    container_name: github-actions-runner
    restart: unless-stopped
    privileged: true  # Необходимо для Docker-in-Docker
    environment:
      - GITHUB_REPOSITORY=ваш-username/recording_life_system
      - RUNNER_TOKEN=${RUNNER_TOKEN}
      - RUNNER_NAME=production-server
      - RUNNER_LABELS=self-hosted,Linux,X64,docker,production
    volumes:
      # Монтируем Docker socket для запуска контейнеров
      - /var/run/docker.sock:/var/run/docker.sock
      # Персистентное хранилище для runner данных
      - ./runner-data:/home/runner/_work
    networks:
      - runner-network

networks:
  runner-network:
    driver: bridge
```

### Шаг 5: Получение токена регистрации

1. Перейдите в ваш GitHub репозиторий
2. Settings → Actions → Runners
3. Нажмите "New self-hosted runner"
4. Скопируйте токен из команды `./config.sh`

### Шаг 6: Запуск runner

Создайте файл `.env` с токеном:

```bash
echo "RUNNER_TOKEN=ваш_токен_здесь" > .env
```

**ВАЖНО:** Обновите `GITHUB_REPOSITORY` в `docker-compose.yml` на ваш репозиторий!

Запустите runner:

```bash
docker-compose up -d --build
```

### Шаг 7: Проверка работы

Проверьте логи:

```bash
docker-compose logs -f
```

Проверьте статус на GitHub:
- Settings → Actions → Runners
- Ваш runner должен появиться со статусом "Idle"

### Управление runner

```bash
# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Обновление (при изменении конфигурации)
docker-compose down
docker-compose up -d --build
```

---

## 💻 Вариант 2: Runner напрямую на сервере

Если вы предпочитаете запускать runner напрямую без Docker.

### Шаг 1: Подготовка сервера

```bash
ssh user@192.168.1.72
mkdir -p ~/actions-runner && cd ~/actions-runner
```

### Шаг 2: Скачивание runner

```bash
# Получаем последнюю версию
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/v//')

# Скачиваем
curl -o actions-runner-linux-x64.tar.gz -L \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

# Распаковываем
tar xzf actions-runner-linux-x64.tar.gz
```

### Шаг 3: Конфигурация runner

```bash
# Получите токен из GitHub (Settings → Actions → Runners → New runner)
./config.sh \
  --url https://github.com/ваш-username/recording_life_system \
  --token ваш_токен \
  --name production-server \
  --labels self-hosted,Linux,X64,production \
  --work _work \
  --unattended
```

### Шаг 4: Установка как сервис

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

### Шаг 5: Проверка статуса

```bash
sudo ./svc.sh status
```

### Управление сервисом

```bash
# Статус
sudo ./svc.sh status

# Остановка
sudo ./svc.sh stop

# Запуск
sudo ./svc.sh start

# Перезапуск
sudo ./svc.sh restart

# Просмотр логов
journalctl -u actions.runner.* -f
```

---

## 🔒 Безопасность

### Рекомендации:

1. **Ограничьте доступ к runner**: Используйте только для доверенного репозитория
2. **Регулярно обновляйте**: Проверяйте обновления runner и Docker
3. **Мониторинг**: Настройте мониторинг логов runner
4. **Изоляция сети**: Рассмотрите использование отдельной сети для runner
5. **Secrets**: Никогда не логируйте секреты, используйте GitHub Secrets

### GitHub Secrets

Добавьте необходимые секреты в репозитории:

Settings → Secrets and variables → Actions → New repository secret

Возможные секреты для будущего использования:
- `DOCKER_HUB_USERNAME` - для Docker Hub
- `DOCKER_HUB_TOKEN` - токен Docker Hub
- `TELEGRAM_BOT_TOKEN` - для уведомлений
- и другие по необходимости

---

## 🧪 Тестирование

После настройки runner можно протестировать workflow:

1. Создайте новую ветку:
```bash
git checkout -b test-ci-cd
```

2. Сделайте любое изменение и запушьте:
```bash
echo "# Test" >> test.txt
git add test.txt
git commit -m "test: CI/CD workflow"
git push origin test-ci-cd
```

3. Создайте Pull Request в main
4. После одобрения и merge, workflow должен автоматически запуститься
5. Проверьте: Actions → Deploy to Production

---

## 📊 Мониторинг

### Просмотр логов deployment

```bash
# На сервере
cd ~/recording_life_system
docker-compose -f docker-compose.prod.yml logs -f
```

### Проверка статуса сервисов

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Проверка здоровья приложения

```bash
# Backend health check
curl http://192.168.1.72:8000/health

# Frontend
curl http://192.168.1.72:3000
```

---

## 🐛 Troubleshooting

### Runner не запускается

```bash
# Проверьте логи
docker-compose logs github-runner

# Проверьте конфигурацию
docker-compose config
```

### Workflow не запускается

1. Проверьте статус runner на GitHub
2. Убедитесь что runner с меткой `self-hosted` активен
3. Проверьте права доступа к репозиторию

### Docker ошибки в workflow

1. Убедитесь что Docker socket монтирован: `/var/run/docker.sock`
2. Проверьте права пользователя runner на Docker

### Deployment не работает

1. Проверьте доступность портов 3000 и 8000
2. Проверьте наличие директории `./data`
3. Проверьте логи контейнеров

---

## 📚 Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Docker-in-Docker](https://www.docker.com/blog/docker-can-now-run-within-docker/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

## 🔄 Обновление runner

### Для Docker варианта:

```bash
cd ~/github-runner
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Для сервисного варианта:

```bash
cd ~/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall

# Скачайте новую версию (см. Шаг 2 варианта 2)
# Затем переконфигурируйте и переустановите сервис
```

---

Если возникнут вопросы, создайте Issue в репозитории.
