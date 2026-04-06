import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src', 'assets', 'news');
const fontsDir = path.join(root, 'public', 'fonts');

fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(fontsDir, { recursive: true });

const covers = [
  { file: '01-ai-processor.webp', bg: '#0f172a', label: 'AI' },
  { file: '02-smart-home.webp', bg: '#14532d', label: 'HOME' },
  { file: '03-gadget-review.webp', bg: '#4c1d95', label: 'TECH' },
  { file: '04-quantum-chips.webp', bg: '#7c2d12', label: 'Q' },
  { file: '05-datacenter-cooling.webp', bg: '#0c4a6e', label: 'DC' },
  { file: '06-wifi7-mesh.webp', bg: '#155e75', label: 'Wi‑Fi' },
  { file: '07-eu-dma-tech.webp', bg: '#3f3f46', label: 'EU' },
  { file: '08-rust-kernel.webp', bg: '#7f1d1d', label: 'RUST' },
  { file: '09-keyboard-review.webp', bg: '#312e81', label: 'KB' },
  { file: '10-backup-321.webp', bg: '#14532d', label: '3-2-1' },
  { file: '11-satellite-sos.webp', bg: '#1e3a8a', label: 'SOS' },
  { file: '12-api-observability.webp', bg: '#713f12', label: 'API' },
  { file: '13-phishing-awareness.webp', bg: '#7c2d12', label: 'SEC' },
  { file: '14-usb4-cables.webp', bg: '#0f766e', label: 'USB' },
  { file: '15-ai-risk-framework.webp', bg: '#1e1b4b', label: 'NIST' },
  { file: '16-context-window-myth.webp', bg: '#334155', label: 'CTX' },
  { file: '17-secure-messaging.webp', bg: '#115e59', label: 'MSG' },
  { file: '18-zero-trust-primer.webp', bg: '#164e63', label: 'ZT' },
  { file: '19-columnar-analytics.webp', bg: '#422006', label: 'OLAP' },
  { file: '20-matter-thread-home.webp', bg: '#365314', label: 'MAT' },
  { file: '21-oled-hdr-care.webp', bg: '#581c87', label: 'HDR' },
  { file: '22-container-supply-chain.webp', bg: '#1c1917', label: 'CTR' },
  { file: '23-passkeys-workplace.webp', bg: '#0e7490', label: 'KEY' },
  { file: '24-cdn-cache-headers.webp', bg: '#134e4a', label: 'CDN' },
  { file: '25-laptop-battery-care.webp', bg: '#166534', label: 'BAT' },
  { file: '26-sbom-minimum.webp', bg: '#422006', label: 'SBOM' },
  { file: '27-llm-guardrails.webp', bg: '#312e81', label: 'LLM' },
  { file: '28-slo-error-budget.webp', bg: '#713f12', label: 'SLO' },
  { file: '29-ipv6-dual-stack.webp', bg: '#1e3a8a', label: 'IP6' },
  { file: '30-keyboard-switches-deep.webp', bg: '#44403c', label: 'SW' },
  { file: '31-nas-backup-strategy.webp', bg: '#0c4a6e', label: 'NAS' },
  { file: '32-digital-services-act.webp', bg: '#1e293b', label: 'DSA' },
  { file: '33-metrics-cardinality-cost.webp', bg: '#7c2d12', label: 'MET' },
  { file: '34-robot-vacuum-care.webp', bg: '#57534e', label: 'VAC' },
  { file: '35-wasm-native-2026.webp', bg: '#5b21b6', label: 'WASM' },
  { file: '36-gitops-argocd.webp', bg: '#0f172a', label: 'GIT' },
  { file: '37-fde-windows-linux.webp', bg: '#1e293b', label: 'FDE' },
  { file: '38-streaming-codecs-2026.webp', bg: '#831843', label: 'AV1' },
  { file: '39-postgres-vacuum-bloat.webp', bg: '#0c4a6e', label: 'PG' },
  { file: '40-voice-assistant-privacy.webp', bg: '#14532d', label: 'MIC' },
  { file: '41-k8s-resources-limits.webp', bg: '#3730a3', label: 'K8S' },
  { file: '42-monitor-calibration-work.webp', bg: '#4c1d95', label: 'ICC' },
  { file: '43-sim-swap-defense.webp', bg: '#9f1239', label: 'SIM' },
  { file: '44-green-software-principles.webp', bg: '#166534', label: 'GRN' },
  { file: '45-api-rate-limiting.webp', bg: '#78350f', label: '429' },
  { file: '46-router-firmware-hygiene.webp', bg: '#0f766e', label: 'WAN' },
  { file: '47-async-code-review.webp', bg: '#292524', label: 'PR' },
  { file: '48-wearable-health-data.webp', bg: '#0369a1', label: 'HR' },
  { file: '49-incident-response-runbook.webp', bg: '#7f1d1d', label: 'IR' },
  { file: '50-hybrid-cloud-networking.webp', bg: '#1d4ed8', label: 'CLD' },
];

for (const item of covers) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="${item.bg}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="120" font-weight="700" fill="#ffffff" opacity="0.9">
        ${item.label}
      </text>
    </svg>`;
  const buffer = Buffer.from(svg);
  await sharp(buffer).webp({ quality: 82 }).toFile(path.join(dir, item.file));
  console.log('Wrote', path.join('src/assets/news', item.file));
}

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
