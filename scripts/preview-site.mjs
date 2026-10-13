// Serve the production demos with the local, assigned resource artwork.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { projectRoot, ownedPaths, resourceFile } from './resource-store.mjs';

const site = path.join(projectRoot, 'dist/site');
await stat(path.join(site, 'examples/react/index.html')).catch(() => {
  throw Error('Build the preview first: npm run build:examples && npm run build:site');
});
const port = Number(process.env.ORNAMENTS_PREVIEW_PORT || 8767);
const owners = ownedPaths();
const compress = promisify(gzip);
const compressed = new Map();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.md': 'text/plain' };

createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    // The production build uses the GitHub Pages prefix; direct local links
    // and local asset hosting use the root. Both resolve to the same files.
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      .replace(/^\/medieval-ornaments(?=\/|$)/, '');
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    if (relative.includes('\\') || relative.includes('\0') || relative.split('/').includes('..')) {
      res.writeHead(400).end();
      return;
    }
    let target = owners.has(relative) ? resourceFile(relative) : path.join(site, relative);
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    let content = await readFile(target);
    if (path.extname(target) === '.html') {
      // These links are hidden in the offline ZIP, but the local preview
      // includes the built React app and may use external documentation.
      content = Buffer.from(content.toString('utf8').replace(/\sdata-online-only(?:="[^"]*")?/g, '').replace(/<html\b([^>]*)>/i,
        (_, attributes) => `<html${attributes.replace(/\sdata-assets-base=(?:"[^"]*"|'[^']*')/g, '')} data-assets-base="/">`));
    }
    // Production bundles have content hashes: browsers can safely reuse them
    // between pages. HTML and mutable resource paths always remain fresh.
    const bundled = /^examples\/assets\/[^/]+-[\w-]+\.(?:js|css)$/.test(relative);
    if (bundled) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (bundled && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      if (!compressed.has(target)) {
        const packed = await compress(content);
        if (compressed.size > 100) compressed.clear();
        compressed.set(target, packed);
      }
      content = compressed.get(target);
      res.setHeader('Content-Encoding', 'gzip');
    }
    if (bundled) res.setHeader('Vary', 'Accept-Encoding');
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'Content-Length': content.length, 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    const status = error instanceof URIError ? 400 : ['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 500;
    if (status === 500) console.error(error);
    res.writeHead(status).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Local artwork preview: http://127.0.0.1:${port}/examples/index.html`);
  console.log(`React demo: http://127.0.0.1:${port}/examples/react/`);
});
