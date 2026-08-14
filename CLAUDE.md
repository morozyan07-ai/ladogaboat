@AGENTS.md

# Контекст проекта ladogaboat.ru

## Хостинг
- **Cloudflare Workers** — выбран из-за PoP в Москве и Санкт-Петербурге
- **Vercel НЕ использовать** — серверы только в США, неприемлемо для российских пользователей
- Домен: ladogaboat.ru через Cloudflare DNS
- Zone ID: `e210e97d79d6405602910d3928fd5dd2` (для CF API — НЕ Account ID!)
- Account ID: `cb0da6978910195d761a524cd7aec8fc`

## Стек
- Next.js 15 + React 19 + TypeScript
- `neon()` SQL + `@neondatabase/serverless` (Prisma удалён из runtime deps, июль 2026)
- `jose` + JWT cookies (next-auth удалён, ручная авторизация)
- Cloudflare Workers через @opennextjs/cloudflare
- База данных: Neon PostgreSQL
- Платежи: ЮKassa (договор подписан, нужно подключить live credentials)

## Важные особенности разработки
- **Windows FUSE filesystem**: Edit/Write инструменты добавляют null-bytes в файлы → коррапт
- Для записи в git-tracked файлы использовать ТОЛЬКО `git hash-object --stdin` + git plumbing
- `autopush.ps1` на Windows тоже корраптит файлы — нужно отключить/удалить

## Уроки и антипаттерны (выученные на ошибках)

### Файлы и git
- НИКОГДА не использовать Edit/Write инструменты для файлов в git — Windows FUSE добавляет null-bytes
- Для CI/config файлов: `cat << 'EOF' | git hash-object -w --stdin` + git plumbing (update-index, write-tree, commit-tree)
- Если index.lock мешает: `GIT_INDEX_FILE=/tmp/temp-index git read-tree HEAD` вместо удаления lock
- `main.lock` в .git/refs/heads/ — стейл лок от упавшего git process; удалить из PowerShell: `del .git\refs\heads\main.lock`
- Пушить из sandbox нельзя (нет credentials); коммит создать через plumbing, push: `git push origin HASH:main` с Windows

### CI/CD уроки
- `wrangler-action@v3` несовместим с Node.js 24 → использовать `npx wrangler deploy` с env vars
- `npx prisma generate` в CI НЕ нужен → удалён; neon() работает без WASM
- Paid план Cloudflare Workers ($5/мес, 10 МиБ лимит) — уже активирован
- esbuild минификация в CI (minify-whitespace + minify-syntax, БЕЗ identifiers) снижает bundle size
- `.wasm-base64.mjs` файлы удаляем перед деплоем — не нужны при neon() HTTP adapter

### CF CDN и статические файлы — архитектура

**run_worker_first = false (default)**
- CF CDN обслуживает `/_next/static/**` из Workers Static Assets store напрямую
- Worker НЕ задействован для статики
- Zone Cache Rules и Response Header Transform Rules НЕ применяются к этим ответам
- `purge_everything` НЕ очищает Workers Static Assets cache (отдельный CDN layer)
- `cf-cache-status: HIT` после purge — Workers Static Assets HIT, не Zone cache HIT

**run_worker_first = true (установлено в wrangler.toml)**
- ВСЕ запросы проходят через Worker (включая статику)
- Worker вызывает `env.ASSETS.fetch()` для статических файлов
- Zone Cache Rules и Response Header Transform Rules применяются к Worker ответам ✅
- Правильный Cache-Control header доходит до браузера

**CF Response Header Transform Rules (созданы):**
- `/_next/static/**` → `Cache-Control: public, max-age=31536000, immutable` (content-hash в имени → immutable)
- `/logo-original.png`, `/favicon.ico` → `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
- API: `PUT /api/v4/zones/{ZONE_ID}/rulesets/phases/http_response_headers_transform/entrypoint`

**CF Zone Cache Rule (создана):**
- Expression: `starts_with(http.request.uri.path, "/_next/static/") or http.request.uri.path eq "/logo-original.png" or http.request.uri.path eq "/favicon.ico"`
- Edge TTL: 1 год; Browser TTL override: 1 год (но применяется только при run_worker_first=true)
- Rule ID: `b63dddf480bf4696b6bd757089ec114b`

**Cold miss latency:**
- Первый посетитель на данный CF PoP: ~20-30 секунд (Workers Static Assets cold fetch)
- После warm-up: CF edge cache → < 200 мс
- После browser cache: 0 мс (если max-age=31536000 доходит правильно)

### Middleware и авторизация (jose)
- `src/middleware.ts` matcher исключает `/_next/static/**` и `/_next/image/**`
- `/logo-original.png` — НЕ исключён из matcher → middleware запускается → try/catch → null → OK
- `session.ts` использует `jose` (`jwtVerify`) — никогда не зависает (try/catch на любую ошибку)

### Что делать ПОСЛЕ успешного деплоя
1. ✅ Деплой работает (Paid план, esbuild минификация)
2. ✅ CF Pages ladogaboat1 — custom domains (ladogaboat.ru, www) отключены
3. ✅ CF Cache Rule для статики создана
4. ✅ CF Response Header Transform Rules созданы
5. ✅ wrangler.toml: `run_worker_first = true` (в коммите, после push активируется)
6. ⏳ Подключить YooKassa live credentials (договор подписан):
   - YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY → в CF Workers Secrets
7. ⏳ Перенести env vars из plain text в CF Secrets
8. ⏳ Удалить git-push-fix.bat из корня проекта
9. ⏳ Отключить/удалить autopush.ps1 — корраптит файлы null-bytes

### Порядок диагностики ошибок деплоя
1. GitHub Actions → последний run → job "deploy" → шаг "Deploy"
2. "exceeded size limit" → Paid план уже активирован, должно пройти
3. TypeScript ошибки → файлы корраптированы → восстанавливать из git history
4. YAML parse error → deploy.yml корраптирован → пересоздать через git hash-object

## Правило: всегда проверять зависимости при проблемах с bundle size

```bash
# 1. Какие deps реально используются в src/?
for dep in $(cat package.json | grep -o '"[^"]*":' | tr -d '":'); do
  count=$(grep -r "from '${dep}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
  echo "$count: $dep"
done

# 2. Что в dependencies вместо devDependencies?
# CLI-инструменты (prisma, dotenv) → devDependencies
# Типы (@types/*) → devDependencies

# 3. Удалённые как неиспользуемые (июль 2026):
# next-auth — авторизация сделана вручную через jose + JWT cookies
# @auth/prisma-adapter — был для next-auth
# react-hook-form — формы через useState
# @hookform/resolvers — был для react-hook-form
# date-fns — нигде не использовалась
# prisma (runtime) → удалён; используем neon() SQL напрямую
# Перенесены в devDeps: prisma CLI, dotenv, @types/leaflet
```

### cookies() из next/headers в CF Workers SSR — КРИТИЧНО

- `cookies()` из `next/headers` **блокирует V8 event loop целиком** в CF Workers — не просто pending Promise
- `setTimeout` НИКОГДА не сработает пока блокировка активна → `Promise.race` с таймаутом бесполезен
- **Решение**: убрать ВСЕ серверные вызовы `cookies()` из SSR-пути (homepage, layout)
- Middleware читает `req.cookies` (синхронно, до SSR) → ставит **non-httpOnly** cookie `user-role` после JWT-верификации
- `HeaderClient` читает `document.cookie` в `useEffect` → ноль SSR-вызовов `cookies()`
- httpOnly cookie `session` (JWT) остаётся безопасной — только middleware и API-роуты её читают

### cookies() из next/headers в CF Workers SSR — КРИТИЧНО

- `cookies()` из `next/headers` **блокирует V8 event loop целиком** в CF Workers — не просто pending Promise
- `setTimeout` НИКОГДА не сработает пока блокировка активна → `Promise.race` с таймаутом бесполезен
- **Решение**: убрать ВСЕ серверные вызовы `cookies()` из SSR-пути (homepage, layout)
- Middleware читает `req.cookies` (синхронно, до SSR) → ставит **non-httpOnly** cookie `user-role` после JWT-верификации
- `HeaderClient` читает `document.cookie` в `useEffect` → ноль SSR-вызовов `cookies()`
- httpOnly cookie `session` (JWT) остаётся безопасной — только middleware и API-роуты её читают
