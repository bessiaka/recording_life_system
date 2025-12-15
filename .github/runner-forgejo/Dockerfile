FROM alpine:latest

# Установка минимально необходимых пакетов
RUN apk add --no-cache \
    bash \
    git \
    wget \
    curl \
    ca-certificates \
    docker-cli \
    docker-compose \
    && update-ca-certificates

# Установка Node.js и npm (если нужны для workflow)
# Раскомментируйте если workflow требуют Node.js
# RUN apk add --no-cache nodejs-current npm

# Установка Python (если нужен для workflow)
# Раскомментируйте если workflow требуют Python
# RUN apk add --no-cache python3 py3-pip

ENV PATH="/usr/local/bin:/usr/bin:${PATH}"

WORKDIR /data

# Скачиваем Forgejo Runner
# Версия по умолчанию: v6.3.1 (проверьте актуальную на https://code.forgejo.org/forgejo/runner/releases)
ARG RUNNER_VERSION=6.3.1
RUN wget -q "https://code.forgejo.org/forgejo/runner/releases/download/v${RUNNER_VERSION}/forgejo-runner-${RUNNER_VERSION}-linux-amd64" \
    && mv "forgejo-runner-${RUNNER_VERSION}-linux-amd64" /usr/local/bin/forgejo-runner \
    && chmod +x /usr/local/bin/forgejo-runner

# Проверка установки
RUN forgejo-runner --version

# Создаем пользователя для runner (опционально, для повышения безопасности)
# RUN addgroup -g 1000 runner && adduser -D -u 1000 -G runner runner
# USER runner

# Копируем entrypoint скрипт
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Создаем директории для данных
RUN mkdir -p /data/.runner /data/.cache && chmod 777 /data/.runner /data/.cache

ENTRYPOINT ["/entrypoint.sh"]
