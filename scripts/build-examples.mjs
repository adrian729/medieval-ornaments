// Production build of the four public example pages for GitHub Pages: one
// bundle per page, artwork always from the pinned CDN. The source pages stay
// native ES modules, so the offline ZIP and a local checkout run unbundled.
import { build } from 'vite';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const examples = root + 'examples/';
const base = (process.env.ORNAMENTS_SITE_BASE || '/medieval-ornaments/').replace(/\/$/, '') + '/examples/';
await build({
  configFile: false, root: examples, base, logLevel: 'warn',
  plugins: [{ name: 'drop-import-map', transformIndexHtml: html => html.replace(/<script type="importmap">[\s\S]*?<\/script>\n?/, '') }],
  build: {
    outDir: root + 'dist/examples', emptyOutDir: true,
    rollupOptions: {
      input: ['demo.html', 'index.html', 'vanilla/index.html', 'react/index.html'].map(page => examples + page),
      // The React entries' 'use client' directive is irrelevant inside this client-only bundle.
      onwarn(warning, warn) { if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning); }
    }
  }
});
