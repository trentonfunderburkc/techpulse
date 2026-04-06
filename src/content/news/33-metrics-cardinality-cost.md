---
title: 'Кардинальность метрик: когда labels убивают бюджет и производительность'
subtitle: 'Сегментация в Prometheus-мире и дисциплина в командах'
author: 'Марина Соколова'
author_slug: 'marina-sokolova'
date: '2026-02-13'
category: 'infrastructure'
tags: ['Prometheus', 'метрики', 'SRE', 'стоимость']
source_name: 'Prometheus'
source_url: 'https://prometheus.io/docs/practices/naming/'
source_published_at: '2026-02-01'
excerpt: 'Практические лимиты на число временных рядов, агрегация на записи и отказ от user_id в лейблах.'
image: '33-metrics-cardinality-cost.webp'
image_alt: 'Кардинальность метрик: когда labels убивают бюджет и производительность'
featured: false
popular: false
verified: true
---

## Взрыв рядов

Каждая уникальная комбинация лейблов — новый ряд. `user_id` в метрике запросов превращает хранилище в помойку за часы.

## Агрегация

Срезайте высокую кардинальность на ingestion через recording rules или отдельный конвейер. Сырые события — в логах/трейсах с сэмплингом.

## Культура

Code review для метрик так же важен, как для кода. Линтеры и лимиты в CI спасают ночные инциденты.

## Итог

Метрики — для срезов по сервису и окружению, не для персональных идентификаторов.

