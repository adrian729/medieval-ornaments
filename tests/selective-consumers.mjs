import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile, symlink } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

export async function selectiveConsumers({ folder, app, root, exec, bin, records }) {
  const pages = [];
  const names = ['red-berry-vine', 'gold-scroll-with-blue-bellflowers'];
  for (const framework of ['vanilla', 'react']) for (const mode of ['package', 'local']) {
    const label = `selective-${framework}-${mode}`, directory = path.join(folder, label);
    await mkdir(directory);
    await symlink(path.join(app, 'node_modules'), path.join(directory, 'node_modules'), 'dir');
    const assetsBase = mode === 'local' ? `/${label}/public/ornaments/` : '/local/ornaments/';
    if (mode === 'local') {
      await exec(process.execPath, [bin, 'add', ...names, '--framework', framework, '--offline', '--assets-base', assetsBase], { cwd: directory });
      const installed = JSON.parse(await readFile(path.join(directory, 'src/ornaments/installation.json')));
      assert.deepEqual(Object.keys(installed.designs).sort(), [...names].sort());
      const own = await import(pathToFileURL(path.join(directory, `src/ornaments/red-berry-vine${framework === 'react' ? '.unstyled' : ''}.js`)));
      if (framework === 'react') assert.ok(renderToString(h(own.OrnamentDivider, { loading: 'lazy' })).includes('--ornament-image:none'));
      else assert.ok(own.resolveOrnament('frame').asset.url.startsWith(assetsBase));
      const declaration = framework === 'react' ? `import {OrnamentDivider} from './src/ornaments/red-berry-vine.js';const x=<OrnamentDivider size={33}/>;\n// @ts-expect-error Only copied SVG is available.\nconst y=<OrnamentDivider format="png"/>;` : `import {createDivider} from './src/ornaments/red-berry-vine.js';createDivider(document.createElement('div'));\n// @ts-expect-error Only copied SVG is available.\ncreateDivider(document.createElement('div'),{format:'png'});`;
      await writeFile(path.join(directory, 'types.tsx'), declaration);
      await exec(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--noUncheckedSideEffectImports', '--module', 'nodenext', '--target', 'es2022', '--jsx', 'react-jsx', 'types.tsx'], { cwd: directory });
    }
    const source = name => mode === 'local' ? `./src/ornaments/${name}.js` : `@ranx729/medieval-ornaments/${framework === 'react' ? 'react' : 'designs'}/${name}`;
    let code;
    if (framework === 'react') code = `import {createElement as h} from 'react';import {createRoot} from 'react-dom/client';import {OrnamentFrame,OrnamentDivider} from '${source(names[0])}';import {OrnamentImage} from '${source(names[1])}';createRoot(document.getElementById('root')).render(h(OrnamentFrame,{id:'frame',size:33,assetsBase:'${assetsBase}'},h('input',{id:'note',defaultValue:'Keep me'}),h(OrnamentDivider,{id:'divider',length:420,orientation:'horizontal',assetsBase:'${assetsBase}'}),h(OrnamentImage,{id:'whole',size:80,assetsBase:'${assetsBase}'})));`;
    else code = `import {createFrame,createDivider} from '${source(names[0])}';import {createOrnamentImage} from '${source(names[1])}';import '${mode === 'local' ? './src/ornaments/ornaments.css' : '@ranx729/medieval-ornaments/styles.css'}';window.frame=createFrame(document.getElementById('frame'),{size:33,assetsBase:'${assetsBase}'});window.divider=createDivider(document.getElementById('divider'),{length:420,orientation:'horizontal',assetsBase:'${assetsBase}'});createOrnamentImage(document.getElementById('whole'),{size:80,assetsBase:'${assetsBase}'});`;
    await writeFile(path.join(directory, 'main.js'), code);
    await writeFile(path.join(directory, 'index.html'), `<!doctype html><meta charset="utf-8"><div id="root"><article id="frame"><input id="note" value="Keep me"><div id="divider"></div><img id="whole"></article></div><script type="module" src="/main.js"></script>`);
    const built = await build({ root: directory, configFile: false, base: `/${label}/dist/`, logLevel: 'error' });
    const chunks = (Array.isArray(built) ? built : [built]).flatMap(result => result.output).filter(file => file.type === 'chunk');
    const modules = chunks.flatMap(chunk => Object.keys(chunk.modules));
    const designModules = modules.filter(file => file.includes('/design-data/'));
    assert.equal(designModules.length, 2);
    assert.ok(!modules.some(file => /\/(catalog|selection)\.js$/.test(file)), 'Individual imports must exclude full catalog/discovery');
    assert.equal(modules.filter(file => file.endsWith('/resolve-core.js')).length, 1, 'Shared geometry is bundled once');
    if (mode === 'local') assert.ok(!modules.some(file => file.includes('/@ranx729/medieval-ornaments/')), 'Copied code needs no runtime package');
    if (framework === 'vanilla') assert.ok(!modules.some(file => file.includes('/react/')), 'Vanilla needs no React');
    records.push({ kind: label, includedDesigns: 2, sharedResolvers: 1, localTypes: mode === 'local' ? 'pass' : undefined });
    pages.push({ label, framework, assetsBase });
  }
  return pages;
}
