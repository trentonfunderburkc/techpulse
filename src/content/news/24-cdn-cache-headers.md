---
title: 'CDN и заголовки кэширования: как не отдать пользователям чужой ответ'
subtitle: 'Cache-Control, surrogate keys и инвалидация после деплоя'
author: 'Артём Лебедев'
author_slug: 'artem-lebedev'
date: '2026-03-22'
category: 'infrastructure'
tags: ['CDN', 'кэш', 'HTTP', 'производительность']
source_name: 'Mozilla Developer Network'
source_url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control'
source_published_at: '2026-02-01'
excerpt: 'Практика для статики и API: где ставить s-maxage, когда нужен stale-while-revalidate и как чистить edge без паники.'
image: '24-cdn-cache-headers.webp'
image_alt: 'CDN и заголовки кэширования: как не отдать пользователям чужой ответ'
featured: false
popular: false
verified: true
---

## Слои

Браузер, CDN и origin — три независимых кэша. Политика должна быть согласована; иначе «жёсткое» обновление на одном уровне оставляет старое на другом.

## Статика

Имена файлов с хэшем позволяют `immutable` на год. HTML и JSON часто требуют короткого TTL и явной инвалидации при релизе.

## Инвалидация

Surrogate-Keys или теги упрощают точечную очистку. Массовый purge «всего сайта» — последнее средство при инциденте.

## Итог

Измеряйте hit ratio на edge и долю origin-запросов. Экономия на трафике вторична по сравнению с латентностью для пользователя.

