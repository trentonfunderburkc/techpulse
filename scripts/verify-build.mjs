import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const idxPath = path.join(dist, 'search-index.json');
const newsDir = path.join(dist, 'news');

if (!fs.existsSync(dist)) {
  console.error('verify-build: нет каталога dist — выполните npm run build');
  process.exit(1);
}
if (!fs.existsSync(idxPath)) {
  console.error('verify-build: нет dist/search-index.json');
  process.exit(1);
}
if (!fs.existsSync(newsDir)) {
  console.error('verify-build: нет dist/news/');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
} catch {
  console.error('verify-build: dist/search-index.json не является JSON');
  process.exit(1);
}

if (!Array.isArray(data) || data.length === 0) {
  console.error('verify-build: индекс пуст или не массив');
  process.exit(1);
}

const dirs = fs
  .readdirSync(newsDir)
  .filter((name) => fs.statSync(path.join(newsDir, name)).isDirectory());

if (data.length !== dirs.length) {
  console.error(
    `verify-build: расхождение — search-index: ${data.length}, папок в dist/news: ${dirs.length}`,
  );
  process.exit(1);
}

const need = ['slug', 'title', 'excerpt', 'category', 'date', 'author'];
const bad = data.find((row) => need.some((k) => row[k] === undefined || row[k] === ''));
if (bad) {
  console.error('verify-build: в индексе есть запись с пустым обязательным полем', bad.slug);
  process.exit(1);
}

console.log(`verify-build: OK — ${data.length} материалов, sitemap и страницы согласованы с индексом.`);
