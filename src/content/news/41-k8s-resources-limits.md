---
title: 'Requests и limits в Kubernetes: почему «без лимитов» ломает соседей'
subtitle: 'QoS-классы, eviction и практика для stateless и баз данных'
author: 'Светлана Воронова'
author_slug: 'svetlana-voronova'
date: '2026-01-05'
category: 'reviews'
tags: ['Kubernetes', 'ресурсы', 'планирование', 'эксплуатация']
source_name: 'Kubernetes'
source_url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/'
source_published_at: '2026-02-01'
excerpt: 'Как задать requests честно и не удивляться OOMKilled в пике.'
image: '41-k8s-resources-limits.webp'
image_alt: 'Requests и limits в Kubernetes: почему «без лимитов» ломает соседей'
featured: false
popular: false
verified: true
---

## Планировщик

Requests влияют на размещение пода; limits — на cgroup cap. Несогласованность даёт переподписку узла и троттлинг CPU.

## QoS

Guaranteed vs Burstable vs BestEffort определяют порядок eviction. Критичные сервисы стремятся к Guaranteed там, где это возможно.

## Stateful

Базы и очереди часто чувствительны к IO и памяти. Тестируйте лимиты под нагрузкой, а не копируйте из примера Helm.

## Итог

Ресурсы — контракт с планировщиком. Ревьюйте их при изменении версий приложения.

