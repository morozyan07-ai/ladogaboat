# Настройка Yandex Cloud для деплоя ladogaboat.ru

Каталог `default` (b1ga2n8n2d26mvvbp32v) уже создан — используем его.

## 1. Container Registry (реестр образов)

1. В левом меню консоли: **Container Registry** (или поиск сервисов → "Container Registry")
2. **Создать реестр** → имя `ladogaboat` → Создать
3. Скопируй **ID реестра** (вид `crXXXXXXXXXXXXXXXXXXX`) — понадобится как `YC_REGISTRY_ID`

## 2. Сервисный аккаунт для GitHub Actions (сборка и деплой)

1. **Identity and Access Management (IAM)** → **Сервисные аккаунты** → **Создать сервисный аккаунт**
2. Имя: `github-deployer`
3. Роли (добавить все три):
   - `container-registry.images.pusher` — загружать образы
   - `serverless-containers.editor` — обновлять контейнер
   - `iam.serviceAccounts.user` — использовать сервисные аккаунты
4. Создать → открыть аккаунт → вкладка **Ключи API/Авторизованные ключи** → **Создать новый ключ** → **Авторизованный ключ**
5. Скачается JSON-файл — это `YC_SA_JSON_CREDENTIALS` (весь файл целиком, вставишь в GitHub Secret)

## 3. Отдельный сервисный аккаунт для самого контейнера (runtime)

Нужен отдельный аккаунт, от имени которого будет работать сам сайт (не тот, что пушит образы).

1. **IAM** → **Создать сервисный аккаунт** → имя `ladogaboat-runtime`
2. Роль: `serverless.containers.invoker` (минимально необходимая для работы контейнера)
3. Скопируй **ID аккаунта** (вид `ajeXXXXXXXXXXXXXXXXX`) — это `YC_CONTAINER_SA_ID`

## 4. Создать Serverless Container

1. **Serverless Containers** → **Создать контейнер**
2. Имя: `ladogaboat`
3. Пока без образа (первый деплой сделает GitHub Actions) — можно указать любой публичный placeholder, например `cr.yandex/yc/hello-world`, чтобы контейнер создался
4. Сохрани **ID контейнера** (вид `bbaXXXXXXXXXXXXXXXXX`) — это `YC_CONTAINER_ID`

## 5. Данные для GitHub Secrets

Собери эти значения и добавь в репозиторий: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Откуда взять |
|---|---|
| `YC_SA_JSON_CREDENTIALS` | Содержимое JSON-файла из шага 2 (целиком) |
| `YC_CLOUD_ID` | Консоль Yandex Cloud, шапка страницы (у тебя `cloud-sirocco-969`, но нужен ID вида `b1g...` — виден при клике на название облака вверху слева) |
| `YC_FOLDER_ID` | `b1ga2n8n2d26mvvbp32v` (виден на скриншоте, это `default`) |
| `YC_REGISTRY_ID` | ID реестра из шага 1 |
| `YC_CONTAINER_ID` | ID контейнера из шага 4 |
| `YC_CONTAINER_SA_ID` | ID сервисного аккаунта из шага 3 |
| `DATABASE_URL` | Твоя текущая строка подключения к Neon (уже есть в GitHub Secrets для CF-деплоя — можно переиспользовать) |
| `SESSION_SECRET` | Секрет для JWT-подписи (если его ещё нет отдельно — сгенерировать: `openssl rand -base64 32`) |
| `YOOKASSA_SHOP_ID` | Когда получишь от ЮKassa |
| `YOOKASSA_SECRET_KEY` | Когда получишь от ЮKassa |

## 6. Сделать контейнер публично доступным

По умолчанию Serverless Container требует авторизации для вызова. Чтобы сайт открывался всем посетителям:

1. Открой контейнер → вкладка **Настройки функции доступа** (или через `yc serverless container allow-unauthenticated-invoke --id <container-id>`)
2. Включи «Разрешить вызов без авторизации»

## 7. Домен ladogaboat.ru

После первого успешного деплоя у контейнера появится URL вида `https://bbaXXXXXXXXXXXXXXXXX.containers.yandexcloud.net`.

Дальше два варианта:
- **Простой**: через Yandex Cloud **API Gateway** — создаёшь шлюз, привязываешь свой домен, настраиваешь маршрут на контейнер
- Об этом договоримся отдельно, когда дойдём до этого шага — сначала нужно, чтобы сам контейнер заработал

## Что делать дальше

1. Пройди шаги 1–6 в консоли
2. Пришли мне значения ID (реестр, контейнер, сервисные аккаунты, folder-id, cloud-id) — JSON-ключ и секреты **не присылай мне в чат**, добавь их сам напрямую в GitHub Secrets
3. Я запущу первый деплой через GitHub Actions и проверим что сайт поднялся
