/**
 * Тематические обложки без стоков:
 *  — по умолчанию: процедурный арт (градиент + «орбиты» + зерно), детерминированно от slug и рубрики;
 *  — опционально: DALL·E 3 (платно), если задан OPENAI_API_KEY и флаг --openai.
 *
 *   node scripts/generate-covers.mjs
 *   node scripts/generate-covers.mjs --openai
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

/** Базовый оттенок (H 0–360) и насыщенность для рубрики */
const CATEGORY_HUE = {
  news: { h: 212, s: 62 },
  analytics: { h: 268, s: 58 },
  reviews: { h: 328, s: 55 },
  guides: { h: 168, s: 52 },
  ai: { h: 283, s: 64 },
  mobile: { h: 198, s: 60 },
  'smart-home': { h: 38, s: 70 },
  infrastructure: { h: 218, s: 54 },
};

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

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function toHex([r, g, b]) {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function proceduralSvg({ slugKey, category }) {
  const base = CATEGORY_HUE[category] || { h: 220, s: 58 };
  const h0 = hash32(slugKey);
  const rnd = mulberry32(h0);
  const dh1 = (h0 % 28) - 14;
  const dh2 = ((h0 >>> 8) % 36) + 18;
  const l1 = 24 + (h0 % 12);
  const l2 = 46 + ((h0 >>> 4) % 14);
  const c1 = toHex(hslToRgb((base.h + dh1 + 360) % 360, base.s, l1));
  const c2 = toHex(hslToRgb((base.h + dh2 + 360) % 360, Math.max(35, base.s - 12), l2));
  const c3 = toHex(hslToRgb((base.h + dh1 + dh2 / 2 + 360) % 360, Math.min(78, base.s + 8), 58));

  const angle = 38 + (h0 % 52);
  const x2 = 100 * Math.cos((angle * Math.PI) / 180);
  const y2 = 100 * Math.sin((angle * Math.PI) / 180);
  const grainSeed = h0 % 500;

  const orbs = [];
  for (let i = 0; i < 5; i++) {
    const cx = 180 + rnd() * 840;
    const cy = 80 + rnd() * 470;
    const r = 120 + rnd() * 220;
    const op = 0.12 + rnd() * 0.2;
    orbs.push(
      `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * (0.55 + rnd() * 0.25)).toFixed(0)}" fill="${i % 2 === 0 ? c3 : c1}" opacity="${op.toFixed(3)}" filter="url(#b)"/>`
    );
  }

  const bandY = 120 + rnd() * 280;
  const bandH = 80 + rnd() * 100;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c1}"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="25%" r="55%">
      <stop offset="0%" stop-color="${c3}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
    </radialGradient>
    <filter id="b" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="48"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${grainSeed}" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.035 0"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  ${orbs.join('\n  ')}
  <rect x="0" y="${bandY.toFixed(0)}" width="1200" height="${bandH.toFixed(0)}" fill="${c2}" opacity="0.08"/>
  <rect width="1200" height="630" filter="url(#grain)" opacity="1"/>
</svg>`;
}

async function rasterizeProcedural(slugKey, category) {
  const svg = proceduralSvg({ slugKey, category });
  return sharp(Buffer.from(svg, 'utf8')).resize(1200, 630).webp({ quality: 86 }).toBuffer();
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

  console.log(useOpenAI ? 'Режим: OpenAI DALL·E 3 (платно за запрос)' : 'Режим: процедурные обложки (бесплатно, локально)');

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
    if (useOpenAI) {
      const prompt = buildOpenAIPrompt(fm.title, fm.category);
      buf = await openaiImageBuffer(prompt);
      buf = await sharp(buf)
        .resize(1200, 630, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toBuffer();
      await new Promise((r) => setTimeout(r, 6500));
    } else {
      buf = await rasterizeProcedural(slugKey, fm.category);
    }

    fs.writeFileSync(dest, buf);
    console.log('Wrote', fm.image, useOpenAI ? '← OpenAI' : '← procedural');
  }

  console.log('\nГотово.');
  if (useOpenAI) {
    console.log('Проверьте соответствие контента политике OpenAI и бюджет аккаунта.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
