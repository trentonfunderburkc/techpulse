/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_ENABLE_METRIKA: string;
  readonly PUBLIC_YANDEX_METRIKA_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
