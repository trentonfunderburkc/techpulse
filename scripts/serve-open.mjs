import { spawn, execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = process.env.PREVIEW_HOST || '127.0.0.1';
const PORT = process.env.PREVIEW_PORT || '4321';

function openBrowser(u) {
  if (process.platform === 'win32') {
    execFile('cmd', ['/c', 'start', '', u], { windowsHide: true });
  } else if (process.platform === 'darwin') {
    execFile('open', [u], {});
  } else {
    execFile('xdg-open', [u], {});
  }
}

let opened = false;
let buffer = '';

function tryOpenFromOutput(chunk, stream) {
  buffer += chunk.toString();
  if (stream === 'out') process.stdout.write(chunk);
  else process.stderr.write(chunk);
  if (opened) return;

  for (const line of buffer.split(/\r?\n/)) {
    if (!/local/i.test(line) || !/https?:\/\//i.test(line)) continue;
    const m = line.match(/(https?:\/\/[^\s]+)/i);
    if (!m) continue;
    let u = m[1].replace(/\/+$/, '') + '/';
    opened = true;
    console.log(`\n→ Открываю в браузере: ${u}`);
    console.log('Остановить сервер: Ctrl+C в этом окне.\n');
    openBrowser(u);
    return;
  }
}

const preview = spawn(
  'npx',
  ['astro', 'preview', '--host', HOST, '--port', PORT],
  { cwd: root, stdio: ['inherit', 'pipe', 'pipe'], shell: true },
);

preview.stdout.on('data', (c) => tryOpenFromOutput(c, 'out'));
preview.stderr.on('data', (c) => tryOpenFromOutput(c, 'err'));

preview.on('error', (err) => {
  console.error('Не удалось запустить astro preview:', err.message);
  console.error('Попробуйте: npm install');
  process.exit(1);
});

preview.on('exit', (code) => {
  process.exit(code ?? 0);
});

setTimeout(() => {
  if (!opened) {
    const m = buffer.match(/https?:\/\/(?:127\.0\.0\.1|localhost):\d+\/?/gi);
    if (m?.length) {
      let u = m[m.length - 1].replace(/\/+$/, '') + '/';
      opened = true;
      console.log(`\n→ Открываю в браузере: ${u}`);
      openBrowser(u);
    } else {
      console.error(
        '\nНе удалось определить URL preview. Смотрите строку Local выше или выполните: npm run preview',
      );
    }
  }
}, 12000);
