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
- `jose` + JWT cookies (next-auth удалён, ручная авторизация через jose)
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
- Для CI/config файлов: `echo "..." | git hash-object -w --stdin` + git plumbing (update-index, write-tree, commit-tree)
- Если index.lock мешает: `GIT_INDEX_FILE=/tmp/temp-index git read-tree HEAD` вместо удаления lock
- Локальный git может быть в "грязном" состоянии после git plumbing — `git diff HEAD..origin/main --name-only` покажет расхождение

### CI/CD уроки
- `wrangler-action@v3` несовместим с Node.js 24 → использовать `npx wrangler deploy` с env vars
- `npx prisma generate` в CI НЕ нужен → удалён; neon() работает без WASM
- Paid план Cloudflare Workers ($5/мес, 10 МиБ лимит) — уже активирован
- esbuild минификация в CI (minify-whitespace + minify-syntax, БЕЗ identifiers) снижает bundle size
- `.wasm-base64.mjs` файлы удаляем перед деплоем — не нужны при neon() HTTP adapter

### CF CDN и статические файлы (производительность)
- `run_worker_first = false` (default в wrangler.toml) → CF CDN отдаёт `/_next/static/**` напрямую, Worker НЕ задействован
- CF PoP для российских пользователей: как правило Amsterdam (AMS) или Frankfurt (FRA)
- Cold miss на AMS PoP: первый посетитель ждёт ~20 сек (нормально для CF Static Assets)
- После cache warm-up: CF CDN кэширует ответы → последующие запросы < 100 мс
- **Cache Rule уже создана** (Rule ID `44aa8cfa27144e32836ae2a09d8f92fe`):
  - Expression: `starts_with(http.request.uri.path, "/_next/static/") or http.request.uri.path eq "/logo-original.png"`
  - Edge TTL: 1 год (31536000 с)
  - API endpoint: `POST /api/v4/zones/{ZONE_ID}/rulesets/phases/http_request_cache_settings/entrypoint`
- **Частая ошибка**: использовать Account ID вместо Zone ID → 403 от CF API

### Middleware и авторизация (jose)
- `src/middleware.ts` matcher исключает `/_next/static/**` и `/_next/image/**` — middleware НЕ запускается для статики
- `/logo-original.png` — НЕ исключён из matcher, middleware запускается → try/catch в session.ts возвращает null → OK
- `session.ts` использует `jose` (`jwtVerify`) — никогда не зависает (try/catch на любую ошибку)
- `const key = new TextEncoder().encode(process.env.SESSION_SECRET)` — на уровне модуля; при отсутствии SESSION_SECRET key = пустой Uint8Array → jwtVerify кинет ошибку → null

### Что делать ПОСЛЕ успешного деплоя
1. ✅ Деплой работает (Paid план, esbuild минификация)
2. ✅ CF Pages ladogaboat1 — custom domains (ladogaboat.ru, www) отключены
3. ✅ CF Cache Rule для статики — создана (Rule ID `44aa8cfa27144e32836ae2a09d8f92fe`)
4. ⏳ Подключить YooKassa live credentials (договор подписан):
   - YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY → в CF Workers Secrets
5. ⏳ Перенести env vars из plain text в CF Secrets (через CF dashboard)
6. ⏳ Удалить git-push-fix.bat из корня проекта (staged для удаления, но файл остаётся)
7. ⏳ Отключить/удалить autopush.ps1 — корраптит файлы null-bytes

### Порядок диагностики ошибок деплоя
1. GitHub Actions → последний run → job "deploy" → шаг "Deploy"
2. "exceeded size limit" → bundle слишком большой → Paid план уже активирован
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
