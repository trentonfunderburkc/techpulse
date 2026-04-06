---
title: 'Полное шифрование диска: TPM, пароль восстановления и облачные ключи'
subtitle: 'BitLocker, LUKS и что делать при смене материнской платы'
author: 'Алексей Новиков'
author_slug: 'alexey-novikov'
date: '2026-02-09'
category: 'infrastructure'
tags: ['шифрование', 'BitLocker', 'LUKS', 'безопасность']
source_name: 'Microsoft Learn'
source_url: 'https://learn.microsoft.com/en-us/windows/security/information-protection/bitlocker/bitlocker-overview'
source_published_at: '2026-02-01'
excerpt: 'Минимальные меры: включить FDE, сохранить recovery key не только в облаке вендора.'
image: '37-fde-windows-linux.webp'
image_alt: 'Полное шифрование диска: TPM, пароль восстановления и облачные ключи'
featured: false
popular: false
verified: true
---

## TPM

Связка TPM+PIN сильнее, чем автоматическая разблокировка при загрузке. Компрометация ОС не должна автоматически давать ключи тома.

## Ключи восстановления

Храните офлайн-копию в сейфе. Потеря облачного аккаунта без офлайн-ключа превращает ноутбук в кирпич.

## Linux

LUKS с отдельным `/boot` незашифрованным — обычная схема. Документируйте параметры dracut/initramfs для поддержки.

## Итог

FDE — базовый гигиенический минимум для мобильных устройств. Проверяйте статус шифрования в инвентаризации.

