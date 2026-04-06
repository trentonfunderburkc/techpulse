---
title: 'Rate limiting для публичных API: токены, скользящие окна и UX клиентов'
subtitle: '429, заголовки Retry-After и защита от DDoS на уровне приложения'
author: 'Кирилл Орлов'
author_slug: 'kirill-orlov'
date: '2026-01-28'
category: 'mobile'
tags: ['API', 'лимиты', 'безопасность', 'SRE']
source_name: 'IETF HTTP'
source_url: 'https://www.rfc-editor.org/rfc/rfc6585.html'
source_published_at: '2026-02-01'
excerpt: 'Как спроектировать квоты по ключам и IP без ложных срабатываний на мобильных NAT.'
image: '45-api-rate-limiting.webp'
image_alt: 'Rate limiting для публичных API: токены, скользящие окна и UX клиентов'
featured: false
popular: false
verified: true
---

## Алгоритмы

Фиксированное окно прост, но даёт пики на границе. Скользящее или token bucket сглаживает нагрузку.

## Идентификация

API keys привязывают лимит к клиенту; IP-only ломается за NAT. Комбинируйте сигналы осторожно.

## Ответы

Ясные заголовки лимита и retry-after снижают шторм повторов. Документируйте политику в openapi.

## Итог

Лимиты защищают и клиентов, и инфраструктуру. Тестируйте под нагрузкой до продакшена.

