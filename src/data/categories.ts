export type CategoryDef = { slug: string; title: string; description: string };

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'news',
    title: 'Новости',
    description: 'Оперативные заметки о релизах, регуляторах и рынке устройств.',
  },
  {
    slug: 'analytics',
    title: 'Аналитика',
    description: 'Разборы трендов, экономики платформ и долгосрочных сдвигов.',
  },
  {
    slug: 'reviews',
    title: 'Обзоры',
    description: 'Практические тесты железа и ПО в реальных сценариях.',
  },
  {
    slug: 'guides',
    title: 'Гайды',
    description: 'Пошаговые инструкции: сеть, безопасность, автоматизация.',
  },
  {
    slug: 'ai',
    title: 'ИИ и чипы',
    description: 'Ускорители, модели, инференс и инженерные компромиссы.',
  },
  {
    slug: 'mobile',
    title: 'Мобильные',
    description: 'Смартфоны, wearables, связь и мобильные сервисы.',
  },
  {
    slug: 'smart-home',
    title: 'Умный дом',
    description: 'Протоколы, хабы, сценарии и эксплуатация IoT.',
  },
  {
    slug: 'infrastructure',
    title: 'Инфраструктура',
    description: 'Дата-центры, сети, хранение и надёжность сервисов.',
  },
];

export const CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
