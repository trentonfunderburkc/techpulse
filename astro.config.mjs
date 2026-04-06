import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const rawSite = process.env.PUBLIC_SITE_URL || 'https://techmedia.space';
const site = rawSite.replace(/\/+$/, '');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
