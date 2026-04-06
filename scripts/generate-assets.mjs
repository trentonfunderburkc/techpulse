import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = path.join(root, 'public', 'fonts');

fs.mkdirSync(fontsDir, { recursive: true });

/**
 * Обложки новостей — см. node scripts/fetch-stock-covers.mjs (Lorem Picsum, см. README).
 */
console.log('Подсказка: обложки — node scripts/fetch-stock-covers.mjs');

const fontUrl = 'https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.woff2';
const fontPath = path.join(fontsDir, 'inter-var.woff2');
try {
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(fontPath, buf);
  console.log('Wrote', path.relative(root, fontPath));
} catch (e) {
  console.warn('Шрифт Inter не скачан автоматически, используйте локальный inter-var.woff2 в public/fonts:', e.message);
}
