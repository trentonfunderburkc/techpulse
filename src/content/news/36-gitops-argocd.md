---
title: 'GitOps с Argo CD: дрейф, секреты и много кластеров'
subtitle: 'Когда автосинхронизация спасает, а когда ломает прод'
author: 'Светлана Воронова'
author_slug: 'svetlana-voronova'
date: '2026-02-10'
category: 'mobile'
tags: ['GitOps', 'Kubernetes', 'Argo CD', 'CI/CD']
source_name: 'Argo'
source_url: 'https://argo-cd.readthedocs.io/'
source_published_at: '2026-02-01'
excerpt: 'Политики sync, работа с Helm/Kustomize и защита от ручных kubectl patch в критичных неймспейсах.'
image: '36-gitops-argocd.webp'
image_alt: 'GitOps с Argo CD: дрейф, секреты и много кластеров'
featured: false
popular: false
verified: true
---

## Источник истины

Репозиторий описывает желаемое состояние; агент в кластере применяет diff. Ручные правки без коммита создают дрейф и сюрпризы при sync.

## Секреты

Не кладите plaintext секреты в git. Используйте Sealed Secrets, внешние хранилища или менеджеры секретов с интеграцией.

## Масштаб

Несколько кластеров — несколько инстансов или проектов с RBAC. Унифицируйте версии манифестов, иначе «одинаковый» сервис ведёт себя по-разному.

## Итог

GitOps дисциплинирует выкаты. Начните с одного некритичного сервиса и автосинхронизации по расписанию.

