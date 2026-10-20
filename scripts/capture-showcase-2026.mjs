import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const source = path.join(root, 'examples', 'showcase-2026');
const output = path.join(root, 'docs', 'assets', 'showcase-2026');
const projects = [
  ['nocturne-atelier', 'Nocturne Atelier', 'landing'],
  ['northstar-control', 'Northstar Control', 'fullstack'],
  ['lumen-academy', 'Lumen Academy', 'fullstack'],
  ['amparo-care', 'Amparo Care', 'fullstack'],
  ['frameflow-studio', 'FrameFlow Studio', 'fullstack'],
  ['atlas-treasury', 'Atlas Treasury', 'fullstack'],
];
const viewports = [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

async function serve(dist) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/')) {
      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ success: true, data: [], items: [], total: 0 }));
      return;
    }

    const requested = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    const target = path.resolve(dist, requested);
    const relative = path.relative(dist, target);
    let file = relative.startsWith('..') || path.isAbsolute(relative) ? path.join(dist, 'index.html') : target;
    try {
      const stat = await fs.stat(file);
      if (stat.isDirectory()) file = path.join(file, 'index.html');
    } catch {
      file = path.join(dist, 'index.html');
    }

    response.setHeader('content-type', contentType(file));
    response.end(await fs.readFile(file));
  });

  const port = await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
  return { server, port };
}

await fs.mkdir(output, { recursive: true });
const executablePath = process.env.ORUS_BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ headless: true, executablePath });
const manifest = [];

try {
  for (const [slug, name, type] of projects) {
    const dist = path.join(source, slug, 'frontend', 'dist');
    const prompt = await fs.readFile(path.join(source, slug, 'PROMPT.md'), 'utf8');
    const { server, port } = await serve(dist);

    try {
      const captures = [];
      const errors = [];
      for (const [device, viewport] of viewports) {
        const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
        await page.route(/http:\/\/(?:localhost|127\.0\.0\.1):3001\/.*/, route => route.fulfill({
          status: 200,
          contentType: 'application/json; charset=utf-8',
          body: JSON.stringify({ success: true, data: [], items: [], total: 0 }),
        }));
        page.on('pageerror', error => errors.push(`${device}: ${error.message}`));
        page.on('console', message => {
          if (message.type() === 'error') errors.push(`${device}: ${message.text()}`);
        });

        try {
          await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(800);
          const file = `${slug}-${device}.png`;
          await page.screenshot({ path: path.join(output, file), fullPage: false });
          captures.push({ device, file, url: page.url(), viewport });
        } finally {
          await page.close();
        }
      }
      manifest.push({ slug, name, type, prompt: prompt.trim(), captures, errors: [...new Set(errors)] });
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
