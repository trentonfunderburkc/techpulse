/**
 * Обложки из Wikimedia Commons: поиск по англ. запросу из slug + тегов + рубрики,
 * затем стабильный выбор снимка по хэшу имени файла (разные статьи → разные фото).
 *
 * Run: node scripts/fetch-stock-covers.mjs
 *
 * Лицензии файлов на Commons различаются — при публикации проверьте страницу файла
 * и при необходимости укажите авторство (часто CC BY-SA).
 */
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const newsDir = path.join(root, 'src', 'content', 'news');
const outDir = path.join(root, 'src', 'assets', 'news');

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'TechPulseCoverFetcher/1.0 (+https://techmedia.space/)';

/** Короткая англ. приписка к запросу по рубрике */
const CATEGORY_HINT = {
  news: 'technology journalism',
  analytics: 'data analytics visualization',
  reviews: 'consumer electronics product',
  guides: 'computer software tutorial',
  ai: 'artificial intelligence computing',
  mobile: 'mobile smartphone technology',
  'smart-home': 'smart home automation',
  infrastructure: 'data center server networking',
};

/** Русские и «человеческие» теги → фраза для поиска на Commons */
const TAG_SEARCH = {
  безопасность: 'cybersecurity',
  фишинг: 'phishing computer security',
  обучение: 'security awareness',
  'док-станции': 'USB docking station laptop',
  мониторинг: 'application performance monitoring',
  сеть: 'computer network',
  wifi: 'Wi-Fi wireless',
  'wi-fi': 'Wi-Fi wireless',
  'wi‑fi': 'Wi-Fi wireless',
  клавиатура: 'computer keyboard',
  бэкап: 'data backup',
  бэкапы: 'data backup storage',
  'умный дом': 'smart home',
  протокол: 'network protocol',
  энергия: 'energy efficiency technology',
  регулятор: 'government regulation',
  комплаенс: 'regulatory compliance',
  'open source': 'open source software',
  ядро: 'Linux kernel source code',
  обзор: 'technology review',
  спутник: 'satellite phone emergency',
  api: 'web API REST',
  kubernetes: 'Kubernetes cluster',
  контейнер: 'software container Docker',
  пасскей: 'passkey authentication',
  cdn: 'content delivery network',
  батарея: 'laptop battery',
  sbom: 'software supply chain security',
  llm: 'large language model',
  slo: 'service level objective monitoring',
  ipv6: 'IPv6 networking',
  nas: 'network attached storage',
  закон: 'legal code books',
  метрики: 'metrics monitoring dashboard',
  робот: 'robot vacuum cleaner home',
  wasm: 'WebAssembly',
  webassembly: 'WebAssembly',
  gitops: 'GitOps continuous deployment',
  шифрование: 'full disk encryption',
  видео: 'digital video',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL database',
  голос: 'voice assistant speaker',
  носимые: 'wearable fitness tracker',
  сим: 'SIM card mobile security',
  зеленый: 'green sustainable computing',
  роутер: 'broadband router',
  код: 'programming source code',
  здоровье: 'health wearable data',
  инцидент: 'incident management IT',
  инциденты: 'IT incident response',
  облако: 'cloud computing',
  usb: 'USB Type-C cable',
  thunderbolt: 'Thunderbolt interface',
  soc: 'security operations center',
  iot: 'Internet of Things',
  matter: 'Matter smart home standard',
  thread: 'Thread wireless protocol',
  oled: 'OLED television screen',
  hdr: 'HDR display',
  prometheus: 'Prometheus time series',
  fido2: 'FIDO2 security key',
  passkeys: 'passkeys login',
  oauth: 'OAuth authentication',
  ransomware: 'ransomware cybercrime',
  streaming: 'video streaming platform',
  codec: 'video codec compression',
  av1: 'AV1 video encoding',
  hevc: 'HEVC video codec',
  приватность: 'data privacy protection',
  процессы: 'software development workflow',
  надёжность: 'site reliability engineering',
  разработка: 'software engineering',
  культура: 'team collaboration workplace',
  телефония: 'mobile telephony',
  аккаунты: 'online account security',
  монитор: 'LCD computer monitor',
  цвет: 'color accuracy display',
  дизайн: 'user interface design',
  ресурсы: 'Kubernetes resource limits',
  планирование: 'capacity planning servers',
  эксплуатация: 'IT systems administration',
  бд: 'relational database administration',
  производительность: 'software performance tuning',
  стриминг: 'live video streaming',
  кодирование: 'video transcoding',
  edge: 'edge computing data center',
  платформы: 'online platform regulation',
  регуляция: 'digital services regulation',
  raid: 'RAID disk array',
  хранение: 'enterprise data storage',
  переключатели: 'mechanical keyboard Cherry MX',
  эргономика: 'office ergonomics typing',
  маршрутизация: 'IP network routing',
  релизы: 'software release deployment',
  промпт: 'LLM prompt safety',
  pii: 'personal identifiable information',
  поставки: 'software supply chain',
  кэш: 'HTTP web cache',
  ноутбук: 'laptop computer',
  железо: 'computer hardware components',
  идентичность: 'digital identity management',
  дисплеи: 'computer display panel',
  калибровка: 'monitor color calibration',
  стандарты: 'technical interoperability standards',
  olap: 'OLAP analytical database',
  сегментация: 'network microsegmentation zero trust',
  мессенджеры: 'encrypted messaging application',
  e2e: 'end-to-end encrypted chat',
  'удалённые команды': 'remote work video conference',
  токены: 'natural language processing tokens',
  'качество ответов': 'generative AI assistant',
  ии: 'artificial intelligence',
  риски: 'AI governance risk',
  mlops: 'MLOps machine learning operations',
  qpu: 'quantum processor chip',
  кванты: 'quantum computing laboratory',
  криптография: 'cryptography mathematics',
  исследования: 'scientific laboratory research',
  смартфоны: 'smartphone handset',
  складные: 'foldable smartphone',
  камера: 'smartphone camera sensor',
  ремонт: 'electronics repair workshop',
  регуляторика: 'EU DMA digital regulation',
  конкуренция: 'competition law antitrust',
  'домашняя сеть': 'home Wi-Fi mesh network',
  'дата-центры': 'data center facility',
  охлаждение: 'server room cooling',
  гибрид: 'hybrid cloud computing',
  инфраструктура: 'enterprise IT infrastructure',
  данные: 'personal data analytics',
  wearables: 'wearable health sensor',
  '2fa': 'two-factor authentication smartphone',
  mfa: 'multi-factor authentication',
  битлокер: 'BitLocker Windows encryption',
  luks: 'Linux LUKS disk encryption',
  docker: 'Docker container',
  containers: 'Linux containers Kubernetes',
  периферия: 'computer peripherals desk',
  смартфон: 'smartphone',
  связь: 'mobile cellular network',
  лимиты: 'API rate limiting',
  устойчивость: 'carbon footprint data center',
  облака: 'public cloud servers',
  npu: 'neural processing unit chip',
  пк: 'desktop personal computer',
  инференс: 'neural network inference',
  onnx: 'ONNX machine learning',
  npv: 'network performance',
  rag: 'retrieval augmented generation',
  mesh: 'Wi-Fi mesh access point',
  dsa: 'Digital Services Act EU',
  eu: 'European Union institutions',
  git: 'Git version control',
  rust: 'Rust programming language',
  linux: 'Linux operating system',
  http: 'HTTP protocol',
  opentelemetry: 'OpenTelemetry observability',
  clickhouse: 'ClickHouse analytics',
  bigquery: 'Google BigQuery cloud',
  sre: 'site reliability engineering',
  'argo cd': 'Argo CD GitOps',
  'ci/cd': 'CI CD pipeline',
  'zero trust': 'Zero Trust network security',
  iam: 'identity access management',
  devsecops: 'DevSecOps security',
  'open telemetry': 'OpenTelemetry',
  беспроводная: 'wireless communication tower',
  квантовые: 'quantum physics chip',
  стоимость: 'cloud cost optimization',
  обслуживание: 'appliance maintenance home',
  firmware: 'router firmware upgrade',
  'usb-c': 'USB-C connector cable',
  usb4: 'USB4 cable',
  'арго cd': 'Argo CD Kubernetes',
};

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'mini',
  'new',
  'old',
  'year',
  'hub',
  'act',
  'tips',
  'care',
  'deep',
  'home',
  'tech',
  'news',
  'data',
  'work',
  'native',
  'hygiene',
  'primer',
  'awareness',
  'defense',
  'strategy',
  'networking',
  'coding',
  'review',
  'guide',
]);

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

function normTag(t) {
  return t
    .toLowerCase()
    .trim()
    .replace(/\u2011/g, '-')
    .replace(/[‑–—]/g, '-');
}

function tagToSearchPhrase(t) {
  const n = normTag(t);
  if (TAG_SEARCH[n]) return TAG_SEARCH[n];
  if (/^[a-zA-Z0-9][a-zA-Z0-9+\-./\s]{1,80}$/.test(t.trim())) return t.trim();
  return null;
}

/** Рубрика для подбора фона: правки по slug, если в MD стоит неверная category. */
function coverCategory(basename, fmCategory) {
  const stem = basename.replace(/\.md$/i, '').replace(/^\d+-/, '').toLowerCase();
  const byStem = {
    'quantum-chips': 'ai',
    'rust-kernel': 'infrastructure',
    'wifi7-mesh': 'smart-home',
    'ai-risk-framework': 'ai',
    'sbom-minimum': 'infrastructure',
    'llm-guardrails': 'ai',
    'slo-error-budget': 'infrastructure',
    'robot-vacuum-care': 'smart-home',
    'gitops-argocd': 'infrastructure',
    'streaming-codecs-2026': 'reviews',
    'postgres-vacuum-bloat': 'infrastructure',
    'voice-assistant-privacy': 'smart-home',
    'k8s-resources-limits': 'infrastructure',
    'monitor-calibration-work': 'reviews',
    'green-software-principles': 'analytics',
    'async-code-review': 'guides',
    'wearable-health-data': 'mobile',
    'incident-response-runbook': 'infrastructure',
    'hybrid-cloud-networking': 'infrastructure',
    'nas-backup-strategy': 'guides',
    'fde-windows-linux': 'guides',
    'container-supply-chain': 'infrastructure',
    'wasm-native-2026': 'guides',
    'ipv6-dual-stack': 'infrastructure',
    'metrics-cardinality-cost': 'infrastructure',
    'api-observability': 'infrastructure',
    'cdn-cache-headers': 'infrastructure',
  };
  if (byStem[stem]) return byStem[stem];
  if (stem.includes('keyboard')) return 'reviews';
  if (stem.includes('gadget-review') || stem.includes('oled') || stem.includes('usb4')) return 'reviews';
  return fmCategory;
}

function buildSearchQueries(basename, fm) {
  const cat = coverCategory(basename, fm.category);
  const hint = CATEGORY_HINT[cat] || 'information technology';

  const phrases = [];
  for (const w of slugWords(basename)) {
    const lw = w.toLowerCase();
    if (STOPWORDS.has(lw) || lw.length < 3) continue;
    phrases.push(w);
  }
  for (const t of fm.tags || []) {
    const p = tagToSearchPhrase(t);
    if (p) phrases.push(p);
  }
  phrases.push(hint);

  const primary = [...new Set(phrases)].join(' ').replace(/\s+/g, ' ').trim().slice(0, 220);

  const shortSlug = slugWords(basename)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()) && w.length >= 4)
    .slice(0, 2)
    .join(' ');
  const fallbacks = [
    shortSlug ? `${shortSlug} ${hint}`.slice(0, 220) : null,
    shortSlug ? `${shortSlug} technology photograph`.slice(0, 220) : null,
    shortSlug ? shortSlug : null,
    hint,
    'server room data center',
    'computer technology',
  ].filter(Boolean);

  const seen = new Set();
  const out = [];
  for (const q of [primary, ...fallbacks]) {
    if (!q || seen.has(q)) continue;
    seen.add(q);
    out.push(q);
  }
  return out;
}

function hashPick(key, n) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

async function commonsImageCandidates(gsrsearch) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch,
    gsrnamespace: '6',
    gsrlimit: '28',
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1600',
  });
  const res = await fetch(`${COMMONS_API}?${params}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  const json = await res.json();
  const pages = json.query?.pages;
  if (!pages) return [];

  const out = [];
  for (const p of Object.values(pages)) {
    const ii = p.imageinfo?.[0];
    if (!ii?.url) continue;
    const mime = ii.mime || '';
    if (!mime.startsWith('image/') || mime.includes('svg')) continue;
    if ((ii.size ?? 0) < 4000) continue;
    const url = ii.thumburl || ii.url;
    out.push({ url, title: p.title || '' });
  }
  return out;
}

async function fetchBinary(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': UA },
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

    const slugKey = file.replace(/\.md$/i, '');
    const queries = buildSearchQueries(file, fm);
    let buf;
    let usedQuery = '';

    outer: for (const q of queries) {
      try {
        const candidates = await commonsImageCandidates(q);
        if (!candidates.length) continue;
        const idx = hashPick(slugKey, candidates.length);
        for (let step = 0; step < Math.min(candidates.length, 8); step++) {
          const c = candidates[(idx + step) % candidates.length];
          try {
            buf = await fetchBinary(c.url);
            if (buf.length > 5000) {
              usedQuery = q;
              break outer;
            }
          } catch {
            /* try next */
          }
        }
      } catch (e) {
        console.warn('Commons query failed:', q.slice(0, 60), e.message);
      }
      await new Promise((r) => setTimeout(r, 350));
    }

    if (!buf) {
      console.error('No image for', fm.image, 'queries:', queries[0]?.slice(0, 80));
      process.exitCode = 1;
      continue;
    }

    const dest = path.join(outDir, fm.image);
    await sharp(buf)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile(dest);

    console.log('Wrote', fm.image, '←', usedQuery.slice(0, 72) + (usedQuery.length > 72 ? '…' : ''));
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log('\nГотово: Wikimedia Commons → WebP. Проверьте лицензии на страницах файлов при коммерческом использовании.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
