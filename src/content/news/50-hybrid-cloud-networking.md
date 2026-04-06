---
title: 'Гибридное облако: связность, шифрование и стоимость исходящего трафика'
subtitle: 'VPN, прямые подключения и проектирование под burst'
author: 'Кирилл Орлов'
author_slug: 'kirill-orlov'
date: '2026-01-23'
category: 'infrastructure'
tags: ['облако', 'сеть', 'гибрид', 'инфраструктура']
source_name: 'Amazon Web Services'
source_url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/introduction.html'
source_published_at: '2026-02-01'
excerpt: 'Как не удвоить счёт за egress и где нужен private link вместо публичного API.'
image: '50-hybrid-cloud-networking.webp'
image_alt: 'Гибридное облако: связность, шифрование и стоимость исходящего трафика'
featured: false
popular: false
verified: true
---

## Топология

VPC/VNet peerings и транзитные шлюзы упрощают маршруты, но усложняют отладку. Документируйте CIDR заранее, избегайте пересечений.

## Шифрование

TLS поверх интернета дешевле dedicated line, но чувствительно к latency. Для стабильных потоков оцените Direct Connect/ExpressRoute.

## Egress

Репликация логов и бэкапов между облаками бьёт по счёту. Сжимайте, фильтруйте, ставьте кэш ближе к потребителю.

## Итог

Гибрид — компромисс стоимости и контроля. Планируйте сетевую матрицу до миграции нагрузок.

