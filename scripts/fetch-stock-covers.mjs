/**
 * Скачивает реальные фото-обложки (Lorem Picsum — бесплатно для проектов,
 * снимки от авторов Unsplash: https://picsum.photos/ ) в WebP 1200×630.
 *
 * Run: node scripts/fetch-stock-covers.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'assets', 'news');

const FILES = [
  '01-ai-processor.webp',
  '02-smart-home.webp',
  '03-gadget-review.webp',
  '04-quantum-chips.webp',
  '05-datacenter-cooling.webp',
  '06-wifi7-mesh.webp',
  '07-eu-dma-tech.webp',
  '08-rust-kernel.webp',
  '09-keyboard-review.webp',
  '10-backup-321.webp',
  '11-satellite-sos.webp',
  '12-api-observability.webp',
  '13-phishing-awareness.webp',
  '14-usb4-cables.webp',
  '15-ai-risk-framework.webp',
  '16-context-window-myth.webp',
  '17-secure-messaging.webp',
  '18-zero-trust-primer.webp',
  '19-columnar-analytics.webp',
  '20-matter-thread-home.webp',
  '21-oled-hdr-care.webp',
  '22-container-supply-chain.webp',
  '23-passkeys-workplace.webp',
  '24-cdn-cache-headers.webp',
  '25-laptop-battery-care.webp',
  '26-sbom-minimum.webp',
  '27-llm-guardrails.webp',
  '28-slo-error-budget.webp',
  '29-ipv6-dual-stack.webp',
  '30-keyboard-switches-deep.webp',
  '31-nas-backup-strategy.webp',
  '32-digital-services-act.webp',
  '33-metrics-cardinality-cost.webp',
  '34-robot-vacuum-care.webp',
  '35-wasm-native-2026.webp',
  '36-gitops-argocd.webp',
  '37-fde-windows-linux.webp',
  '38-streaming-codecs-2026.webp',
  '39-postgres-vacuum-bloat.webp',
  '40-voice-assistant-privacy.webp',
  '41-k8s-resources-limits.webp',
  '42-monitor-calibration-work.webp',
  '43-sim-swap-defense.webp',
  '44-green-software-principles.webp',
  '45-api-rate-limiting.webp',
  '46-router-firmware-hygiene.webp',
  '47-async-code-review.webp',
  '48-wearable-health-data.webp',
  '49-incident-response-runbook.webp',
  '50-hybrid-cloud-networking.webp',
];

function picsumUrl(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/630`;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'TechPulse-cover-fetch/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < FILES.length; i++) {
  const file = FILES[i];
  const seed = `techmedia-${file.replace('.webp', '')}`;
  const dest = path.join(outDir, file);
  const buf = await fetchBuffer(picsumUrl(seed));
  await sharp(buf)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .webp({ quality: 82 })
    .toFile(dest);
  console.log('Wrote', path.relative(root, dest));
  if (i < FILES.length - 1) await new Promise((r) => setTimeout(r, 200));
}

console.log('\nГотово. Фото: https://picsum.photos/ (бесплатное использование).');
