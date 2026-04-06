# TechPulse

Независимое технологическое издание на **Astro (SSG)** и **Tailwind CSS**: лента и рубрики на главной, материалы из Markdown, профили авторов, поиск по клиентскому индексу, страницы редакции и правовые разделы. Изображения оптимизируются через `astro:assets` (sharp), шрифты локальные. Яндекс.Метрика подключается только при включении в `.env`.

## Требования

- Node.js **18.17+** или **20+**
- npm **9+**

## Запуск в разработке

```bash
npm install
node scripts/generate-assets.mjs
npm run dev
```

Сервер: **`http://127.0.0.1:4321`**.

### Windows: автозапуск

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
.\scripts\start-now.ps1
```

## Переменные окружения

Скопируйте `.env.example` в `.env`.

| Переменная | Назначение |
|------------|------------|
| `PUBLIC_SITE_URL` | Канонический домен для `link rel="canonical"`, Open Graph, JSON-LD и `sitemap.xml` (по умолчанию в коде: `https://techmedia.space`) |
| `PUBLIC_ENABLE_METRIKA` | `true` — подключать счётчик Метрики |
| `PUBLIC_YANDEX_METRIKA_ID` | Числовой ID счётчика |

## Продакшен-сборка

```bash
npm run build
npm run preview
```

В `dist/`: HTML, `robots.txt`, `sitemap.xml`, `search-index.json`, ассеты.

Перед деплоем на **свой домен** задайте `PUBLIC_SITE_URL=https://ваш-домен.ru` и пересоберите проект.

## Чеклист перед деплоем

1. **`PUBLIC_SITE_URL`** — совпадает с фактическим доменом (canonical, Open Graph, `sitemap.xml`, JSON-LD).
2. **Почта** — при необходимости замените адреса `@techmedia.space` на реально работающие ящики (DNS/почта для домена).
3. **Юридические тексты** — при необходимости согласуйте формулировки с юристом под вашу юрисдикцию.
4. **Метрика** — задайте реальный ID счётчика и включите `PUBLIC_ENABLE_METRIKA=true`, если нужна аналитика.
5. **Контент** — проверьте `source_url` у материалов и актуальность дат в frontmatter.

## Контент

### Новость (`src/content/news/*.md`)

Обязательные поля frontmatter: `title`, `author`, `author_slug`, `date`, `category`, `source_name`, `source_url`, `excerpt`, `image`. Опционально: `subtitle`, `updated_at`, `tags`, `source_published_at`, `image_alt`, `featured`, `popular`, `verified`.

Имя файла задаёт URL: `my-post.md` → `/news/my-post/`.

Обложка — файл WebP в `src/assets/news/` (добавьте имя в `scripts/generate-assets.mjs` при необходимости).

### Автор (`src/content/authors/*.md`)

Поля: `name`, `role`, `bio`, `topics`, опционально `email`. Slug = имя файла (`marina-sokolova.md` → `/authors/marina-sokolova/`).

### Рубрики

Список в `src/data/categories.ts`. Страница рубрики: `/category/<slug>/`.

## Поиск

Страница `/search/` загружает `/search-index.json` (генерируется при сборке).

## Яндекс.Метрика

Цели на странице материала: `read_finish`, `click_source`, `comment_sent` (кнопка «Сообщить об ошибке» → `mailto`), `time_spent`.

## Структура (основное)

- `src/pages/` — маршруты (главная, новости, рубрики, авторы, архив, поиск, юридические страницы)
- `src/layouts/Layout.astro` — SEO meta, OG, базовый JSON-LD
- `src/components/` — шапка, подвал, карточка, аналитика и т.д.
- `src/content/` — коллекции `news` и `authors`
