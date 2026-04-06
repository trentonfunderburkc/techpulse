---
title: 'PostgreSQL: VACUUM, bloat и autovacuum без мистики'
subtitle: 'Когда таблица «распухает», что смотреть в метриках и логах'
author: 'Артём Лебедев'
author_slug: 'artem-lebedev'
date: '2026-02-07'
category: 'guides'
tags: ['PostgreSQL', 'БД', 'эксплуатация', 'производительность']
source_name: 'PostgreSQL'
source_url: 'https://www.postgresql.org/docs/current/routine-vacuuming.html'
source_published_at: '2026-02-01'
excerpt: 'Настройка autovacuum под write-heavy нагрузку и осторожность с долгими транзакциями.'
image: '39-postgres-vacuum-bloat.webp'
image_alt: 'PostgreSQL: VACUUM, bloat и autovacuum без мистики'
featured: false
popular: false
verified: true
---

## MVCC

Удалённые строки остаются до vacuum. Долгие транзакции блокирует очистку и раздувают таблицы.

## Autovacuum

Пороги по умолчанию не всегда подходят OLTP с частыми update. Тюнинг cost delay/limit балансирует I/O и свежесть статистики.

## Мониторинг

Следите за возрастом самой старой транзакции и dead tuples. Реагируйте на рост до роста latency запросов.

## Итог

Регулярный VACUUM — часть дизайна Postgres, не «опциональное обслуживание».

