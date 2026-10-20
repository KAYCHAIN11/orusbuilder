import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const output = path.join(root, 'docs', 'assets', 'generated-apps');
const projects = [
  ['acervo-vivo-fullstack', 'Acervo Vivo', 'fullstack'],
  ['atelier-terra-landing', 'Atelier Terra', 'landing'],
  ['festival-vivo-fullstack', 'Festival Vivo', 'fullstack'],
  ['maison-aurea', 'Maison Aurea', 'landing'],
  ['rota-clara-fullstack', 'Rota Clara', 'fullstack'],
  ['serena-clinica', 'Serena Clínica', 'fullstack'],
  ['talento-vivo-fullstack', 'Talento Vivo', 'fullstack'],
  ['viva-skincare', 'Viva Skincare', 'landing'],
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
    const safeTarget = relative.startsWith('..') || path.isAbsolute(relative) ? path.join(dist, 'index.html') : target;
    let file = safeTarget;
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
    const dist = path.join(root, 'examples', 'generated', slug, 'frontend', 'dist');
    const { server, port } = await serve(dist);
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.route(/http:\/\/(?:localhost|127\.0\.0\.1):3001\/.*/, route => route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ success: true, data: [], items: [], total: 0 }),
    }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    try {
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);
      const file = `${slug}.png`;
      await page.screenshot({ path: path.join(output, file), fullPage: false });
      manifest.push({ slug, name, type, file, url: page.url(), errors: [...new Set(errors)] });
    } finally {
      await page.close();
      await new Promise(resolve => server.close(resolve));
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
