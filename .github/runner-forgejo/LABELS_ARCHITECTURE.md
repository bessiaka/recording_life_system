# 🏗️ Архитектура Forgejo Runner и Labels

## ❗ ВАЖНО: Разница между Runner и Job Containers

### 🔍 Как работает Forgejo Actions

```
┌─────────────────────────────────────────────────────────────┐
│ FORGEJO RUNNER CONTAINER (постоянный)                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Образ: .github/runner-forgejo/Dockerfile (Alpine)          │
│ Назначение: Оркестратор, слушает Forgejo server            │
│ Содержит: act_runner binary                                │
│ Запущен: ВСЕГДА (docker compose up -d)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
            Получает job из Forgejo server
            job содержит: runs-on: alpine
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ JOB CONTAINER (временный, создается на каждый job)          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Образ: Определяется через FORGEJO_RUNNER_LABELS            │
│ Например: alpine:docker://forgejo-runner-optimized:debian  │
│ Назначение: Выполнение steps в workflow                    │
│ Содержит: Node.js + Python + Docker CLI                    │
│ Запущен: ВРЕМЕННО (только на время выполнения job)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
              Выполняет steps workflow:
              - actions/checkout@v4 (требует Node.js!)
              - npm install
              - docker compose up -d
                          ↓
              После завершения - удаляется
```

---

## 🎯 Ключевое понимание

### 1. Runner Container ≠ Job Container

| Аспект | Runner Container | Job Container |
|--------|-----------------|---------------|
| **Образ** | `.github/runner-forgejo/Dockerfile` | Из `FORGEJO_RUNNER_LABELS` |
| **Lifetime** | Постоянный (пока не остановите) | Временный (на время job) |
| **Назначение** | Оркестрация, получение jobs | Выполнение steps |
| **Node.js нужен?** | ❌ НЕТ | ✅ ДА (для actions/*) |
| **Python нужен?** | ❌ НЕТ | ✅ ДА (если тесты на Python) |
| **Docker CLI нужен?** | ❌ НЕТ | ✅ ДА (если деплой через docker) |

### 2. Проблема с текущей конфигурацией

**Было:**
```yaml
FORGEJO_RUNNER_LABELS=alpine:docker://alpine:latest
```

**Что происходило:**
1. Workflow: `runs-on: alpine`
2. Runner создает контейнер из `alpine:latest`
3. `alpine:latest` = голый Alpine Linux (без Node.js)
4. Step: `uses: actions/checkout@v4` → **FAIL** (нужен Node.js)

**Стало:**
```yaml
FORGEJO_RUNNER_LABELS=alpine:docker://forgejo-runner-optimized:debian
```

**Что происходит теперь:**
1. Workflow: `runs-on: alpine`
2. Runner создает контейнер из `forgejo-runner-optimized:debian`
3. `forgejo-runner-optimized:debian` = Debian + Node.js 20 + Python 3.11 + Docker CLI
4. Step: `uses: actions/checkout@v4` → **SUCCESS** ✅

---

## 📦 Какие образы нужно собрать

### Dockerfile.runner и Dockerfile.runner-alpine

Эти Dockerfile'ы создают образы для **JOB CONTAINERS**, а не для runner!

**Использование:**
```bash
# Собрать образ для job containers
cd .github/runner-forgejo
./build-runner-image.sh debian

# Образ создается локально: forgejo-runner-optimized:debian
# Этот образ будет использоваться runner'ом для запуска jobs
```

**Runner Container остается как есть** (Alpine с act_runner)!

---

## 🚀 Правильная последовательность действий

### Шаг 1: Собрать образ для лейблов (на Server)

```bash
cd ~/WORKSPACE/recording_life_system/.github/runner-forgejo

# Собрать оптимизированный образ для jobs
./build-runner-image.sh debian
```

**Вывод:**
```
✅ Образ успешно собран!
📊 forgejo-runner-optimized  debian  402MB
```

Этот образ **остается ЛОКАЛЬНО** на Server и будет использоваться runner'ом.

### Шаг 2: Runner автоматически использует новую конфигурацию

```bash
# Перезапустить runner с новыми labels
docker compose down
docker compose up -d

# Проверить логи
docker compose logs -f
```

**Вы увидите:**
```
level=info msg="Runner registered successfully"
level=info msg="Labels: alpine:docker://forgejo-runner-optimized:debian,debian:docker://forgejo-runner-optimized:debian"
```

### Шаг 3: Проверить workflow

```bash
# На Desktop: push коммита
git push origin claude/setup-github-actions-cicd-F5yxE
```

**Что произойдет:**
1. Forgejo получит push event
2. Запустит workflow `test-deploy.yml`
3. Runner увидит `runs-on: alpine`
4. Runner создаст **новый контейнер** из `forgejo-runner-optimized:debian`
5. В этом контейнере выполнится `actions/checkout@v4` → **SUCCESS** ✅

---

## 🔍 Проверка: Как увидеть job containers

### Во время выполнения workflow:

```bash
# На Server
docker ps

# Вы увидите ДВА контейнера:
CONTAINER ID   IMAGE                                      COMMAND
abc123def456   forgejo-runner-optimized:debian            "/bin/bash -c 'cd /w…"   # ← JOB CONTAINER (временный)
xyz789abc012   runner-forgejo-forgejo-runner              "/entrypoint.sh"         # ← RUNNER CONTAINER (постоянный)
```

**После завершения job:**
```bash
docker ps

# Останется ТОЛЬКО runner container:
CONTAINER ID   IMAGE                                      COMMAND
xyz789abc012   runner-forgejo-forgejo-runner              "/entrypoint.sh"         # ← RUNNER CONTAINER
```

Job container **автоматически удаляется** после завершения!

---

## 📊 Сравнение: До и После

### До (с alpine:latest):

```yaml
# Workflow
jobs:
  test:
    runs-on: alpine  # ← Label
    steps:
      - uses: actions/checkout@v4  # ❌ FAIL: Node.js not found
```

**Процесс:**
1. Runner ищет label `alpine` в `FORGEJO_RUNNER_LABELS`
2. Находит: `alpine:docker://alpine:latest`
3. Создает контейнер из `alpine:latest` (голый Alpine)
4. `actions/checkout@v4` требует Node.js → **FAIL**

### После (с forgejo-runner-optimized:debian):

```yaml
# Workflow
jobs:
  test:
    runs-on: alpine  # ← Label (имя осталось то же!)
    steps:
      - uses: actions/checkout@v4  # ✅ SUCCESS
```

**Процесс:**
1. Runner ищет label `alpine` в `FORGEJO_RUNNER_LABELS`
2. Находит: `alpine:docker://forgejo-runner-optimized:debian`
3. Создает контейнер из `forgejo-runner-optimized:debian` (с Node.js!)
4. `actions/checkout@v4` находит Node.js → **SUCCESS** ✅

---

## 💡 Частые вопросы

### Q: Нужно ли пересобирать runner container?

**A:** ❌ **НЕТ!** Runner container остается как есть (Alpine с act_runner).

### Q: Где хранится forgejo-runner-optimized:debian?

**A:** 📦 **Локально на Server** в Docker image cache. Runner может его использовать.

### Q: Нужно ли заливать образ в registry?

**A:** ❌ **НЕТ**, если runner и jobs работают на одном Server. Образ доступен локально.

### Q: Можно ли иметь несколько labels с разными образами?

**A:** ✅ **ДА!**
```bash
FORGEJO_RUNNER_LABELS=
  alpine:docker://forgejo-runner-optimized:alpine,
  debian:docker://forgejo-runner-optimized:debian,
  node:docker://node:20-slim,
  python:docker://python:3.11-slim
```

Workflow может выбрать:
```yaml
jobs:
  job1:
    runs-on: alpine    # Использует forgejo-runner-optimized:alpine
  job2:
    runs-on: debian    # Использует forgejo-runner-optimized:debian
  job3:
    runs-on: node      # Использует node:20-slim
```

### Q: Как обновить образ для labels?

**A:**
```bash
# 1. Пересобрать образ
./build-runner-image.sh debian

# 2. Перезапустить runner
docker compose restart
```

Runner автоматически будет использовать новый образ при следующем job.

---

## 🎯 Итоговая схема

```
1. Desktop → git push → Forgejo Server
                              ↓
2. Forgejo Server → webhook → Runner Container (Alpine + act_runner)
                              ↓
3. Runner Container → docker run forgejo-runner-optimized:debian → Job Container
                              ↓
4. Job Container → выполняет workflow steps
                   ✅ actions/checkout@v4 (Node.js есть!)
                   ✅ npm install (Node.js есть!)
                   ✅ docker compose up (Docker CLI есть!)
                              ↓
5. Job Container → завершает работу → автоматически удаляется
                              ↓
6. Runner Container → продолжает работать, ждет новых jobs
```

---

## ✅ Checklist правильной настройки

- [ ] Собрал образ `forgejo-runner-optimized:debian` на Server
- [ ] Обновил `FORGEJO_RUNNER_LABELS` в docker-compose.yml
- [ ] Перезапустил runner: `docker compose down && docker compose up -d`
- [ ] Проверил логи: `docker compose logs -f` → "Runner registered successfully"
- [ ] Запушил коммит → workflow запустился
- [ ] Во время выполнения: `docker ps` показывает 2 контейнера (runner + job)
- [ ] `actions/checkout@v4` выполнился успешно ✅
- [ ] После завершения: job container автоматически удалился

---

## 🔗 Связанные документы

- [RUNNER_IMAGES.md](./RUNNER_IMAGES.md) - Сравнение образов для labels
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Общая архитектура CI/CD
- [build-runner-image.sh](./build-runner-image.sh) - Скрипт сборки образов
