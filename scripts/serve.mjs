import './build.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8' };
const routes = new Map([['/', 'index.html'], ['/index.html', 'index.html'], ['/privacidade', 'privacidade.html'], ['/privacidade.html', 'privacidade.html'], ['/favicon.svg', 'favicon.svg'], ['/styles.css', 'styles.css'], ['/robots.txt', 'robots.txt']]);
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== '/' && url.pathname.endsWith('/')) { res.writeHead(308, { Location: url.pathname.slice(0, -1) + url.search }); res.end(); return; }
  const file = routes.get(url.pathname) || '404.html';
  try {
    const data = await readFile(path.join(root, file));
    res.writeHead(routes.has(url.pathname) ? 200 : 404, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Não foi possível carregar a página.');
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
