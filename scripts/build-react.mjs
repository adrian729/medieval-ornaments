import { build } from 'vite';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base=process.env.ORNAMENTS_SITE_BASE || '/medieval-ornaments/';
await build({configFile:false,root:root+'examples/react',base:base.replace(/\/$/,'')+'/examples/react/',build:{outDir:root+'dist/react',emptyOutDir:true},logLevel:'warn'});
