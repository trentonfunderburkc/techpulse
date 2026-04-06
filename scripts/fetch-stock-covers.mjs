/**
 * Тематические обложки без API-ключей: Lorem Flickr подбирает фото по тегам
 * (источник — Flickr; см. https://loremflickr.com/ ).
 *
 * Читает frontmatter каждой новости, строит набор англ. тегов из рубрики,
 * латинских тегов и slug, затем качает 1200×630 → WebP.
 *
 * Run: node scripts/fetch-stock-covers.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const newsDir = path.join(root, 'src', 'content', 'news');
const outDir = path.join(root, 'src', 'assets', 'news');

/** Базовые теги Flickr по рубрике (латиница, через запятую = OR) */
const CATEGORY_TAGS = {
  news: 'technology,computer,news',
  analytics: 'data,analytics,business',
  reviews: 'gadget,electronics,technology',
  guides: 'laptop,office,software',
  ai: 'artificial,intelligence,robot,technology',
  mobile: 'smartphone,mobile,technology',
  'smart-home': 'smarthome,technology,house',
  infrastructure: 'server,datacenter,network,technology',
};

/** Частые русские теги → англ. слово для поиска картинок */
const RU_TAG_MAP = {
  безопасность: 'security',
  фишинг: 'phishing',
  обучение: 'teamwork',
  'док-станции': 'workspace',
  мониторинг: 'monitoring',
  сеть: 'network',
  wifi: 'wifi',
  клавиатура: 'keyboard',
  бэкап: 'database',
  'умный дом': 'smarthome',
  протокол: 'technology',
  энергия: 'energy',
  регулятор: 'government',
  комплаенс: 'office',
  'open source': 'opensource',
  ядро: 'circuit',
  обзор: 'gadget',
  спутник: 'satellite',
  'api': 'coding',
  kubernetes: 'kubernetes',
  контейнер: 'shipping',
  пасскей: 'security',
  cdn: 'internet',
  батарея: 'laptop',
  sbom: 'software',
  llm: 'artificial',
  slo: 'dashboard',
  ipv6: 'network',
  nas: 'harddrive',
  закон: 'library',
  метрики: 'graph',
  робот: 'robot',
  wasm: 'code',
  gitops: 'terminal',
  шифрование: 'lock',
  видео: 'video',
  postgres: 'database',
  голос: 'microphone',
  носимые: 'smartwatch',
  сим: 'mobile',
  зеленый: 'nature',
  роутер: 'router',
  код: 'programming',
  здоровье: 'health',
  инцидент: 'teamwork',
  облако: 'cloud',
  usb: 'usb',
  thunderbolt: 'cable',
  'soc': 'security',
  npv: 'chip',
  onnx: 'chip',
  sre: 'server',
  olap: 'database',
  iot: 'iot',
  matter: 'smarthome',
  thread: 'technology',
  oled: 'monitor',
  hdr: 'television',
  prometheus: 'server',
  fido2: 'security',
  passkeys: 'security',
  oauth: 'security',
  ransomware: 'security',
  oom: 'server',
  sim: 'phone',
  wearable: 'fitness',
  streaming: 'cinema',
  codec: 'video',
  av1: 'video',
  hevc: 'video',
};

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const block = m[1];
  const category = block.match(/^category:\s*['"]?([^'"\r\n]+)['"]?\s*$/m)?.[1]?.trim();
  const image = block.match(/^image:\s*['"]?([^'"\r\n]+)['"]?\s*$/m)?.[1]?.trim();
  const tags = [];
  const tm = block.match(/^tags:\s*\[([^\]]*)\]\s*$/m);
  if (tm) {
    for (const part of tm[1].split(',')) {
      const t = part.trim().replace(/^['"]|['"]$/g, '');
      if (t) tags.push(t);
    }
  }
  return { category, image, tags };
}

function slugWords(basename) {
  const s = basename.replace(/\.md$/i, '').replace(/^\d+-/, '');
  return s
    .split('-')
    .map((w) => w.replace(/\d{4}/g, '').trim())
    .filter((w) => /^[a-zA-Z]{2,}$/.test(w));
}

function tagToFlickrKeyword(t) {
  const lower = t.toLowerCase().trim();
  if (RU_TAG_MAP[lower]) return RU_TAG_MAP[lower];
  if (/^[a-zA-Z0-9][a-zA-Z0-9+\-.#]*$/.test(t)) return lower.replace(/\+/g, '').replace(/#/g, '');
  return null;
}

function buildTagList({ category, tags, basename }) {
  const set = new Set();
  const catStr = CATEGORY_TAGS[category] || 'technology,digital';
  for (const x of catStr.split(',')) {
    const w = x.trim();
    if (w.length > 1) set.add(w);
  }
  for (const t of tags || []) {
    const k = tagToFlickrKeyword(t);
    if (k && k.length > 1) set.add(k);
  }
  for (const w of slugWords(basename)) {
    if (w.length > 2) set.add(w.toLowerCase());
  }
  const list = [...set].slice(0, 6);
  return list.length ? list : ['technology', 'computer'];
}

function lockFromSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  return Math.abs(h % 9000) + 1;
}

function flickrUrl(tagList, lock) {
  const pathTags = tagList.map((t) => encodeURIComponent(t)).join(',');
  return `https://loremflickr.com/1200/630/${pathTags}?lock=${lock}`;
}

async function fetchImage(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'TechMedia-cover-fetch/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md')).sort();

  for (const file of files) {
    const content = fs.readFileSync(path.join(newsDir, file), 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm?.image) {
      console.warn('Skip (no image):', file);
      continue;
    }
    const tagList = buildTagList({ category: fm.category, tags: fm.tags, basename: file });
    const lock = lockFromSlug(file.replace(/\.md$/i, ''));
    const url = flickrUrl(tagList, lock);
    const dest = path.join(outDir, fm.image);

    let buf;
    try {
      buf = await fetchImage(url);
    } catch (e) {
      console.warn(`Fallback technology for ${fm.image}:`, e.message);
      buf = await fetchImage(flickrUrl(['technology', 'computer'], lock));
    }

    await sharp(buf)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile(dest);

    console.log('Wrote', fm.image, '←', tagList.slice(0, 4).join(', '), '…');
    await new Promise((r) => setTimeout(r, 450));
  }

  console.log('\nГотово. Источник изображений: Lorem Flickr → Flickr (проверьте лицензии при коммерческом использовании).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
