/**
 * Обложки по умолчанию: **фиксированный пул из 11 качественных фото** с Wikimedia Commons
 * (реальные JPEG, ~1400px по длинной стороне), статьям назначаются по хэшу slug — без поиска и «рандом-кота».
 *
 *   node scripts/generate-covers.mjs
 *   node scripts/generate-covers.mjs --openai   + OPENAI_API_KEY (DALL·E 3, платно)
 */
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const newsDir = path.join(root, 'src', 'content', 'news');
const outDir = path.join(root, 'src', 'assets', 'news');

const useOpenAI = process.argv.includes('--openai');
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'TechPulseCoverFetcher/1.0 (+https://techmedia.space/)';

/**
 * Проверенные файлы на Commons (JPEG/PNG, нормальное разрешение).
 * Лицензии разные — для коммерции смотрите страницу файла и укажите авторство при необходимости.
 */
const COMMONS_POOL = [
  'File:BalticServers data center.jpg',
  'File:Wikimedia Foundation Servers-8055 35.jpg',
  'File:Mechanical Keyboard.jpg',
  'File:Commercial Mobile Technology (140214-F-CE345-001).jpg',
  'File:HP Pavilion Computer laptop keyboard closeup.jpg',
  'File:Optical fiber cable-01ASD.jpg',
  'File:Network router ZyXel USG20.jpg',
  'File:Programming code.jpg',
  'File:Screen-python-code-matplotlib-physics-simulation.jpg',
  'File:Internet map 1024.jpg',
  'File:Ecobee4.jpg',
];

const CATEGORY_EN = {
  news: 'technology news, editorial',
  analytics: 'data analytics, charts, business intelligence',
  reviews: 'consumer electronics, gadgets, hands-on review',
  guides: 'software, tutorials, practical how-to',
  ai: 'artificial intelligence, neural networks, computing',
  mobile: 'smartphones, mobile apps, connectivity',
  'smart-home': 'smart home, IoT, connected devices',
  infrastructure: 'servers, cloud, networks, DevOps',
};

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const block = m[1];
  const title = block.match(/^title:\s*['"]([^'"]*)['"]\s*$/m)?.[1]?.trim();
  const category = block.match(/^category:\s*['"]?([^'"\r\n]+)['"]?\s*$/m)?.[1]?.trim();
  const image = block.match(/^image:\s*['"]?([^'"\r\n]+)['"]?\s*$/m)?.[1]?.trim();
  return { title, category, image };
}

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

async function resolvePoolDownloadUrls() {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'imageinfo',
    titles: COMMONS_POOL.join('|'),
    iiprop: 'url|mime',
    iiurlwidth: '1600',
  });
  const res = await fetch(`${COMMONS_API}?${params}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  const json = await res.json();
  const map = new Map();
  for (const page of Object.values(json.query?.pages || {})) {
    const ii = page.imageinfo?.[0];
    if (!ii?.mime?.startsWith('image/') || ii.mime.includes('svg')) continue;
    const url = ii.thumburl || ii.url;
    if (url && page.title) map.set(page.title, url);
  }
  if (map.size !== COMMONS_POOL.length) {
    const missing = COMMONS_POOL.filter((t) => !map.has(t));
    throw new Error(`Commons pool: не удалось разрешить URL для: ${missing.join('; ')}`);
  }
  return map;
}

async function fetchImageBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function poolLabel(title) {
  return title.replace(/^File:/, '').replace(/\.(jpe?g|png)$/i, '').slice(0, 42);
}

function buildOpenAIPrompt(title, category) {
  const theme = CATEGORY_EN[category] || 'technology, computing';
  return [
    'Wide editorial hero image for a serious technology news website, 16:9 feel, no text, no letters, no logos, no watermarks, no people faces.',
    `Visual theme: ${theme}.`,
    `Article context (mood only, do not render as text): ${title || 'tech story'}.`,
    'Style: clean abstract shapes, soft gradients, depth, subtle glow, premium tech magazine aesthetic, cohesive single composition.',
  ].join(' ');
}

async function openaiImageBuffer(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt.slice(0, 3900),
      n: 1,
      size: '1792x1024',
      response_format: 'b64_json',
      quality: 'standard',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI: empty image response');
  return Buffer.from(b64, 'base64');
}

async function main() {
  if (useOpenAI && !OPENAI_KEY) {
    console.error('Задайте OPENAI_API_KEY в окружении для режима --openai');
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md')).sort();

  let urlByTitle = null;
  if (!useOpenAI) {
    console.log(`Режим: пул из ${COMMONS_POOL.length} фото (Wikimedia Commons) → WebP 1200×630`);
    urlByTitle = await resolvePoolDownloadUrls();
  } else {
    console.log('Режим: OpenAI DALL·E 3 (платно за запрос)');
  }

  /** Равномерно распределяем снимки по статьям (порядок имён файлов), стабильно при фиксированном списке. */
  const poolIndexBySlug = new Map();
  files.forEach((file, i) => {
    const slugKey = file.replace(/\.md$/i, '');
    poolIndexBySlug.set(slugKey, i % COMMONS_POOL.length);
  });

  for (const file of files) {
    const content = fs.readFileSync(path.join(newsDir, file), 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm?.image) {
      console.warn('Skip (no image):', file);
      continue;
    }
    const slugKey = file.replace(/\.md$/i, '');
    const dest = path.join(outDir, fm.image);

    let buf;
    let note = '';
    if (useOpenAI) {
      const prompt = buildOpenAIPrompt(fm.title, fm.category);
      buf = await openaiImageBuffer(prompt);
      buf = await sharp(buf)
        .resize(1200, 630, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toBuffer();
      note = '← OpenAI';
      await new Promise((r) => setTimeout(r, 6500));
    } else {
      const idx = poolIndexBySlug.get(slugKey) ?? hash32(slugKey) % COMMONS_POOL.length;
      const title = COMMONS_POOL[idx];
      const url = urlByTitle.get(title);
      const raw = await fetchImageBuffer(url);
      buf = await sharp(raw)
        .resize(1200, 630, { fit: 'cover', position: 'attention' })
        .webp({ quality: 86 })
        .toBuffer();
      note = `← pool #${idx + 1} ${poolLabel(title)}`;
      await new Promise((r) => setTimeout(r, 250));
    }

    fs.writeFileSync(dest, buf);
    console.log('Wrote', fm.image, note);
  }

  console.log('\nГотово.');
  if (!useOpenAI) {
    console.log('Источник: Wikimedia Commons — проверьте лицензии файлов при коммерческом использовании.');
  } else {
    console.log('Проверьте соответствие контента политике OpenAI и бюджет аккаунта.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
