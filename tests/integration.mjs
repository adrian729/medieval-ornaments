// Independent consumers of the real archive, with Chromium and real React.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, cp, symlink, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import { assetPaths, assetCatalog } from '../scripts/package-assets.mjs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer as createViteServer, build } from 'vite';
const exec = promisify(execFile), root = fileURLToPath(new URL('../', import.meta.url));
const folder = await mkdtemp(path.join(tmpdir(), 'ornaments-integration-'));
const app = path.join(folder, 'app'), records = [], errors = [], failed = [], requests = [];
const pause = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms));
let server, chrome, ws, vite;

try {
  const packageSource = process.env.ORNAMENTS_PACKAGE;
  const assetSource = process.env.ORNAMENTS_ASSETS_PACKAGE;
  let install, assetInstall;
  const expectedAssets = assetPaths(await assetCatalog());
  if (packageSource) install = packageSource;
  else {
    const packed = JSON.parse((await exec('npm', ['pack', '--json', '--pack-destination', folder], { cwd: root, maxBuffer: 3e6 })).stdout)[0];
    const allowed = /^(?:lib\/|docs\/(?:INTEGRATION|PERFORMANCE)\.md$|ornaments\.css$|package\.json$|README\.md$|SELECTION\.md$|USAGE\.md$|LICENSE$|ASSET-RIGHTS\.md$)/;
    assert.ok(packed.files.every(file => allowed.test(file.path)), 'Unexpected runtime packed file');
    assert.deepEqual(packed.files.filter(file => /^(svg|png|webp)\//.test(file.path)), [], 'Runtime must contain no artwork');
    assert.ok(packed.size < 150_000 && packed.unpackedSize < 1_000_000, 'Lean runtime size budget');
    assert.ok(packed.files.find(file => file.path === 'lib/cli.js').mode & 0o111);
    records.push({ package: { bytes: packed.size, unpacked: packed.unpackedSize, files: packed.entryCount, integrity: packed.integrity, archive: path.join(folder, packed.filename) } });
    install = path.join(folder, packed.filename);
  }
  if (assetSource) assetInstall = assetSource;
  else {
    await exec(process.execPath, ['scripts/build-assets-package.mjs'], { cwd: root });
    const packed = JSON.parse((await exec('npm', ['pack', '--json', '--pack-destination', folder], { cwd: path.join(root, 'dist/medieval-ornaments-assets'), maxBuffer: 3e6 })).stdout)[0];
    assert.ok(packed.files.every(file => /^(?:svg\/|png\/|webp\/|catalog\.json$|assets-manifest\.json$|package\.json$|README\.md$|LICENSE$|ASSET-RIGHTS\.md$)/.test(file.path)), 'Unexpected artwork packed file');
    assert.deepEqual(packed.files.filter(file => /^(svg|png|webp)\//.test(file.path)).map(file => file.path).sort(), expectedAssets);
    records.push({ assetPackage: { bytes: packed.size, unpacked: packed.unpackedSize, files: packed.entryCount, integrity: packed.integrity, archive: path.join(folder, packed.filename) } });
    assetInstall = path.join(folder, packed.filename);
  }
  await mkdir(app);
  await writeFile(path.join(app, 'package.json'), '{"private":true,"type":"module"}');
  await exec('npm', ['install', install, '--ignore-scripts', '--no-audit', '--no-fund', ...(packageSource ? [] : ['--offline'])], { cwd: app });
  const installed = path.join(app, 'node_modules/@ranx729/medieval-ornaments');
  await assert.rejects(access(path.join(app, 'node_modules/react')), 'Vanilla consumers must not require React');
  await assert.rejects(access(path.join(app, 'node_modules/@ranx729/medieval-ornaments-assets')), 'Normal installs must not fetch artwork');
  await assert.rejects(access(path.join(installed, 'svg')), 'Runtime must contain no artwork');
  const manifest = JSON.parse(await readFile(path.join(installed, 'package.json')));
  assert.ok(!manifest.dependencies && !manifest.optionalDependencies, 'No automatic artwork dependencies');
  const api = await import(pathToFileURL(path.join(installed, 'lib/index.js')));
  assert.equal(api.version, manifest.version);
  assert.equal(api.assetsPackage, manifest.ornamentAssets.package);
  assert.equal(api.assetsVersion, manifest.ornamentAssets.version);
  assert.equal(api.defaultAssetsBase, `https://unpkg.com/${api.assetsPackage}@${api.assetsVersion}/`);
  const bin = path.join(app, 'node_modules/.bin/medieval-ornaments');
  await assert.rejects(exec(process.execPath, [bin, 'copy-assets', path.join(folder, 'offline-missing'), '--offline'], { cwd: app }), /Offline artwork not found/);
  // Install artwork explicitly, then exercise consumer-local discovery through the real bin.
  await exec('npm', ['install', '--save-dev', assetInstall, '--ignore-scripts', '--no-audit', '--no-fund', ...(assetSource ? [] : ['--offline'])], { cwd: app });
  const companion = path.join(app, 'node_modules', api.assetsPackage);
  const artworkPackage = JSON.parse(await readFile(path.join(companion, 'package.json')));
  assert.equal(artworkPackage.version, api.assetsVersion);
  assert.ok(!artworkPackage.dependencies && !artworkPackage.peerDependencies);
  assert.deepEqual(await readFile(path.join(companion, 'assets-manifest.json')), await readFile(path.join(root, 'assets-manifest.json')));
  const require = createRequire(path.join(app, 'package.json'));
  for (const relative of ['svg/red-berry-vine.svg', 'png/128/floral-bird-panel-blue.png', 'webp/128/floral-bird-panel-blue.webp']) {
    assert.equal(require.resolve(api.assetsPackage + '/' + relative), path.join(companion, relative));
  }
  await assert.rejects(exec(process.execPath, [bin, 'copy-assets', companion, '--offline'], { cwd: app }), /outside the package directory and artwork source/);
  // Copying all assets also checks each packed image against the trusted byte/hash manifest.
  await exec(process.execPath, [bin, 'copy-assets', path.join(folder, 'local/ornaments'), '--offline'], { cwd: app });
  const copied = JSON.parse(await readFile(path.join(folder, 'local/ornaments/catalog.json')));
  assert.equal(copied.length, api.ornaments.length);
  records.push({ kind: 'lean-install-optional-offline-artwork', assetsPackage: api.assetsPackage, assetsVersion: api.assetsVersion, verifiedFiles: expectedAssets.length });
  await writeFile(path.join(folder, 'native.html'), `<!doctype html><html lang="en" data-assets-base="/local/ornaments/"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/local/ornaments/ornaments.css"><script type="importmap">{"imports":{"@ranx729/medieval-ornaments":"/app/node_modules/@ranx729/medieval-ornaments/lib/index.js"}}</script><body><article id="frame" class="existing" style="color:red;--ornament-size:7px"><input id="note" value="Initial"></article><div id="divider"></div><img id="whole" alt="Original"><script type="module">import * as api from '@ranx729/medieval-ornaments';window.api=api;const assetsBase='/local/ornaments/';window.frame=api.createFrame(document.getElementById('frame'),{design:'red-berry-vine',size:33,assetsBase});window.divider=api.createDivider(document.getElementById('divider'),{design:'plate-02-stepped-ribbon',assetsBase});window.whole=api.createOrnamentImage(document.getElementById('whole'),{design:'floral-bird-panel-blue',size:128,assetsBase});document.body.dataset.ready='true';</script></body></html>`);
  await writeFile(path.join(folder,'lazy-native.html'),`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/local/ornaments/ornaments.css"><div style="height:10000px"></div><article id="frame" class="existing" style="height:180px;--ornament-size:7px"><input id="note" value="Keep me"></article><div id="divider"></div><img id="whole" width="13" height="17" loading="eager"><script type="module">import * as api from '/app/node_modules/@ranx729/medieval-ornaments/lib/index.js';window.api=api;const assetsBase='/local/ornaments/',loading='lazy';window.frame=api.createFrame(document.getElementById('frame'),{design:'red-berry-vine',assetsBase,loading});window.divider=api.createDivider(document.getElementById('divider'),{design:'plate-02-stepped-ribbon',assetsBase,loading});window.whole=api.createOrnamentImage(document.getElementById('whole'),{design:'gold-scroll-with-blue-bellflowers',assetsBase,loading,size:80,decoding:'async',fetchPriority:'low'});window.original=document.getElementById('note');document.body.dataset.ready='true';</script>`);
  // A vanilla bundled consumer under a nested deployment root.
  const vanilla = path.join(folder, 'vanilla');
  await mkdir(vanilla);
  await symlink(path.join(app, 'node_modules'), path.join(vanilla, 'node_modules'), 'dir');
  await writeFile(path.join(vanilla, 'index.html'), '<!doctype html><meta charset="utf-8"><div id="divider"></div><script type="module" src="/main.js"></script>');
  await writeFile(path.join(vanilla, 'main.js'), `import {createDivider} from '@ranx729/medieval-ornaments';import '@ranx729/medieval-ornaments/styles.css';import imageUrl from '@ranx729/medieval-ornaments-assets/webp/128/floral-bird-panel-blue.webp?url';window.importedAsset=imageUrl;window.divider=createDivider(document.getElementById('divider'),{design:'plate-02-stepped-ribbon',orientation:'horizontal',assetsBase:'/local/ornaments/'});document.body.dataset.ready='true';`);
  await build({ root: vanilla, configFile: false, base: '/vanilla/dist/', logLevel: 'error' });
  for (const name of ['react', 'react-dom', '@types']) await symlink(path.join(root, 'node_modules', name), path.join(app, 'node_modules', name), 'dir');
  // One imported component must retain its CSS through production tree shaking.
  const single = path.join(folder, 'single-react'); await mkdir(single);
  await symlink(path.join(app, 'node_modules'), path.join(single, 'node_modules'), 'dir');
  await writeFile(path.join(single, 'index.html'), '<!doctype html><div id="root"></div><script type="module" src="/main.js"></script>');
  await writeFile(path.join(single, 'main.js'), `import {createElement as h} from 'react';import {createRoot} from 'react-dom/client';import {OrnamentDivider} from '@ranx729/medieval-ornaments/react';createRoot(document.getElementById('root')).render(h(OrnamentDivider,{id:'divider',design:'red-berry-vine',length:420,assetsBase:'/local/ornaments/'}));`);
  await build({ root: single, configFile: false, base: '/single-react/dist/', logLevel: 'error' });
  await cp(path.join(root, 'examples/react/main.jsx'), path.join(app, 'main.jsx'));
  await cp(path.join(root, 'examples/integration.css'), path.join(folder, 'integration.css'));
  await writeFile(path.join(app, 'index.html'), '<!doctype html><html lang="en" data-assets-base="/local/ornaments/"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script type="module" src="/main.jsx"></script></html>');
  await writeFile(path.join(app, 'react-ssr.mjs'), `export { OrnamentFrame, OrnamentDivider, OrnamentImage } from '@ranx729/medieval-ornaments/react/unstyled';`);
  const { OrnamentFrame, OrnamentDivider, OrnamentImage } = await import(pathToFileURL(path.join(app, 'react-ssr.mjs')));
  const markup = renderToString(h(OrnamentFrame, { design: 'red-berry-vine', assetsBase: '/local/ornaments/', id: 'hydrated' }, h('input', { id: 'hydrated-input', defaultValue: 'Server value' }), h(OrnamentDivider, { design: 'plate-02-stepped-ribbon', assetsBase: '/local/ornaments/', id: 'hydrated-divider' }), h(OrnamentImage, { design: 'floral-bird-panel-blue', assetsBase: '/local/ornaments/', size: 128, alt: 'Birds and flowers' })));
  await writeFile(path.join(app, 'hydrate.html'), `<!doctype html><html><meta charset="utf-8"><div id="root">${markup}</div><script type="module" src="/hydrate.jsx"></script></html>`);
  await writeFile(path.join(app, 'hydrate.jsx'), `import React,{StrictMode,useState,useRef,useEffect} from 'react';import {hydrateRoot} from 'react-dom/client';import {OrnamentFrame,OrnamentDivider,OrnamentImage} from '@ranx729/medieval-ornaments/react';window.before=document.getElementById('hydrated-input');before.value='Typed before hydration';function App(){const [orientation,setOrientation]=useState('original'),ref=useRef(null);useEffect(()=>{window.hydrationReady=true;window.forwarded=ref.current;window.changeOrientation=setOrientation;},[]);return <OrnamentFrame design="red-berry-vine" assetsBase="/local/ornaments/" id="hydrated" ref={ref}><input id="hydrated-input" defaultValue="Server value"/><OrnamentDivider design="plate-02-stepped-ribbon" orientation={orientation} assetsBase="/local/ornaments/" id="hydrated-divider"/><OrnamentImage design="floral-bird-panel-blue" assetsBase="/local/ornaments/" size={128} alt="Birds and flowers"/></OrnamentFrame>}hydrateRoot(document.getElementById('root'),<StrictMode><App/></StrictMode>);`);
  const lazyMarkup=renderToString(h('div',null,h('div',{style:{height:10000}}),h(OrnamentFrame,{id:'frame',design:'red-berry-vine',loading:'lazy',assetsBase:'/local/ornaments/',style:{height:180}},h('input',{id:'note',defaultValue:'Keep me'})),h(OrnamentDivider,{id:'divider',design:'plate-02-stepped-ribbon',loading:'lazy',assetsBase:'/local/ornaments/'}),h(OrnamentImage,{id:'whole',design:'gold-scroll-with-blue-bellflowers',loading:'lazy',assetsBase:'/local/ornaments/',size:80,decoding:'async',fetchPriority:'low'})));
  await writeFile(path.join(app,'lazy.html'),`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root">${lazyMarkup}</div><script type="module" src="/lazy.jsx"></script>`);
  await writeFile(path.join(app,'lazy.jsx'),`import React,{StrictMode,useState,useEffect,useRef} from 'react';import {hydrateRoot} from 'react-dom/client';import {OrnamentFrame,OrnamentDivider,OrnamentImage} from '@ranx729/medieval-ornaments/react';window.original=document.getElementById('note');original.value='Before hydration';function App(){const [design,setDesign]=useState('red-berry-vine'),[loading,setLoading]=useState('lazy'),ref=useRef(null);useEffect(()=>{window.lazyReady=true;window.setLazyDesign=setDesign;window.setLazyLoading=setLoading;window.forwarded=ref.current;},[]);return <div><div style={{height:10000}}/><OrnamentFrame id="frame" design={design} loading={loading} ref={ref} assetsBase="/local/ornaments/" style={{height:180}}><input id="note" defaultValue="Keep me"/></OrnamentFrame><OrnamentDivider id="divider" design="plate-02-stepped-ribbon" loading="lazy" assetsBase="/local/ornaments/"/><OrnamentImage id="whole" design="gold-scroll-with-blue-bellflowers" loading="lazy" assetsBase="/local/ornaments/" size={80} decoding="async" fetchPriority="low"/></div>}hydrateRoot(document.getElementById('root'),<StrictMode><App/></StrictMode>);`);
  await cp(path.join(root, 'tests/types.tsx'), path.join(app, 'types.tsx'));
  await exec(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--noUncheckedSideEffectImports', '--module', 'nodenext', '--target', 'es2022', '--jsx', 'react-jsx', 'types.tsx'], { cwd: app });
  const buildApp=()=>build({ root: app, configFile: false, base: '/app/dist/', logLevel: 'error',build:{rollupOptions:{input:{main:path.join(app,'index.html'),lazy:path.join(app,'lazy.html')}}} });
  await buildApp();
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let filename = path.resolve(folder, '.' + pathname);
      if (!filename.startsWith(folder + path.sep)) throw new Error('Outside fixture');
      if (pathname.endsWith('/')) filename = path.join(filename, 'index.html');
      const content = await readFile(filename);
      response.writeHead(200, { 'content-type': mime[path.extname(filename)] || 'application/octet-stream' }); response.end(content);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = path.join(folder, 'chrome');
  chrome = spawn(process.env.CHROME_BIN || 'google-chrome', ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let log = '', failure = ''; chrome.stderr.on('data', data => { log += data; }); chrome.on('error', error => { failure = error.message; }); chrome.on('exit', code => { failure = 'exit ' + code; });
  let endpoint;
  for (let i = 0; i < 400 && !endpoint && !failure; i++) {
    try { const [port, route] = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).trim().split('\n'); endpoint = `ws://127.0.0.1:${port}${route}`; }
    catch { await pause(); }
  }
  assert.ok(endpoint, 'Chromium did not start. ' + failure + log.slice(-1000));
  const tabs = await (await fetch(endpoint.replace(/^ws:/, 'http:').replace(/\/devtools\/browser\/.*/, '/json'))).json();
  ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let sequence = 0; const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args);
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400 && !message.params.response.url.endsWith('/favicon.ico')) failed.push(message.params.response.url);
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  async function until(expression) { for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await pause(); } throw new Error('Timeout: ' + expression + JSON.stringify({ errors, failed })); }
  async function navigate(url, ready) { await send('Page.navigate', { url }); await until(`location.href===${JSON.stringify(url)}`); await until(ready); await pause(100); }
  async function geometry(id = 'divider') {
    return evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)}),box=getComputedStyle(el),art=getComputedStyle(el,'::before'),axis=el.dataset.axis;const period=parseFloat(box.getPropertyValue('--ornament-size'))*parseFloat(box.getPropertyValue('--ornament-ratio')),available=parseFloat(box[axis==='x'?'width':'height']),used=parseFloat(art[axis==='x'?'width':'height']),inset=parseFloat(art[axis==='x'?'left':'top'])+new DOMMatrix(art.transform)[axis==='x'?'m41':'m42'];return {axis,period,available,used,inset,url:JSON.parse(art.backgroundImage.slice(4,-1)),size:art.backgroundSize,thickness:parseFloat(box[axis==='x'?'height':'width'])};})()`);
  }
  function checkGeometry(result) {
    assert.ok(Math.abs(result.used - Math.floor((result.available + 1e-7) / result.period) * result.period) < .03, JSON.stringify(result));
    assert.ok(Math.abs(result.inset - (result.available - result.used) / 2) < .03, JSON.stringify(result));
  }
  async function decodeImages() {
    await evaluate(`Promise.all([...document.querySelectorAll('.ornament-image,.ornament-frame,.ornament-divider')].map(async el=>{const source=el.tagName==='IMG'?el.src:el.classList.contains('ornament-frame')?getComputedStyle(el).borderImageSource:getComputedStyle(el,'::before').backgroundImage;const image=new Image();image.src=el.tagName==='IMG'?source:JSON.parse(source.slice(4,-1));await image.decode();if(!image.naturalWidth)throw Error('Empty image');}))`);
  }
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 997, height: 900, deviceScaleFactor: 1, mobile: false });
  await navigate(origin + '/native.html', `document.body?.dataset.ready==='true'`); await decodeImages();
  assert.equal((await geometry()).axis, 'y');
  const initialImages = requests.filter(url => /\.(webp|svg|png)$/.test(url));
  assert.equal(new Set(initialImages).size, 3, 'Only chosen images should load');
  assert.ok(initialImages.every(url => url.startsWith(origin + '/local/ornaments/')));
  const redundantWrites=await evaluate(`(()=>{const observer=new MutationObserver(()=>{});for(const el of [frame.element,divider.element,whole.element])observer.observe(el,{attributes:true});for(let i=0;i<20;i++){frame.update({});divider.update({});whole.update({});}const count=observer.takeRecords().length;observer.disconnect();return count;})()`);
  assert.equal(redundantWrites,0,'Unchanged updates should not rewrite image sources or geometry');
  await evaluate(`window.original=document.getElementById('note');original.focus();original.value='Keep my note';`);
  // All designs through their installed DOM controllers, both axes and fractional densities.
  for (const item of api.findOrnaments({ use: 'divider' })) {
    for (const orientation of ['original', 'horizontal', 'vertical']) {
      await evaluate(`divider.update(${JSON.stringify({ design: item.name, orientation, size: 33, length: 260 })});frame.update(${JSON.stringify({ design: item.name })});`);
      const result = await geometry(); checkGeometry(result);
      assert.equal(result.axis, orientation === 'original' ? item.repeat_axis : orientation === 'horizontal' ? 'x' : 'y');
      await decodeImages();
      records.push({ kind: 'native-design', design: item.name, orientation, ...result });
    }
  }
  for (const pixelRatio of [1, 1.25, 2, 3]) for (const orientation of ['horizontal', 'vertical']) for (const length of [10, 100, 420, 421]) {
    await evaluate(`divider.update(${JSON.stringify({ design: 'red-rosette-vine', orientation, format: 'webp', pixelRatio, size: 33, length })});`);
    checkGeometry(await geometry()); await decodeImages();
  }
  const invalid = await evaluate(`(()=>{const el=divider.element,before=el.outerHTML;try{divider.update({design:'floral-bird-panel-blue'});return false}catch{return el.outerHTML===before}})()`);
  assert.equal(invalid, true);
  assert.equal(await evaluate(`(()=>{try{api.createFrame(frame.element,{design:'red-berry-vine'});return false}catch{return true}})()`), true);
  await evaluate(`frame.destroy();frame.destroy();`);
  assert.equal(await evaluate(`original===document.getElementById('note')&&original.value==='Keep my note'&&document.activeElement===original&&document.getElementById('frame').className==='existing'&&document.getElementById('frame').style.getPropertyValue('--ornament-size')==='7px'&&document.getElementById('frame').style.color==='red'`), true);
  await evaluate(`frame=api.createFrame(document.getElementById('frame'),{design:'red-berry-vine',size:33,assetsBase:'/local/ornaments/'});frame.element.style.setProperty('--ornament-size','11px');frame.destroy();whole.element.alt='External edit';whole.destroy();`);
  assert.equal(await evaluate(`document.getElementById('frame').style.getPropertyValue('--ornament-size')==='11px'&&document.getElementById('whole').alt==='External edit'&&!document.getElementById('whole').hasAttribute('src')`), true);
  await navigate(origin + '/vanilla/dist/', `document.body?.dataset.ready==='true'`); await decodeImages(); checkGeometry(await geometry());
  assert.equal((await geometry()).axis, 'x'); assert.ok(await evaluate(`typeof window.importedAsset==='string'&&window.importedAsset.length>0`)); records.push({ kind: 'vanilla-bundled-direct-asset-import' });
  await navigate(origin + '/single-react/dist/', `!!document.getElementById('divider')`); await decodeImages(); checkGeometry(await geometry());
  assert.equal(await evaluate(`getComputedStyle(document.getElementById('divider'),'::before').content`), '""');
  records.push({ kind: 'single-react-automatic-styles' });

  const noArtworkSince=start=>requests.slice(start).filter(url=>/\.(svg|png|webp)$/.test(url));
  const pendingArt=()=>evaluate(`getComputedStyle(document.getElementById('frame')).borderImageSource==='none'&&getComputedStyle(document.getElementById('divider'),'::before').backgroundImage==='none'`);
  let lazyStart=requests.length;
  await navigate(origin+'/lazy-native.html',`document.body?.dataset.ready==='true'`);await pause(250);
  assert.deepEqual(noArtworkSince(lazyStart),[],'Offscreen lazy vanilla artwork requested');assert.equal(await pendingArt(),true);
  const beforeBox=await evaluate(`(()=>{const b=whole.element.getBoundingClientRect();return [b.width,b.height]})()`);
  await evaluate(`frame.update({design:'red-rosette-vine'});divider.update({orientation:'horizontal'});frame.destroy();window.restored=document.getElementById('frame').className==='existing'&&document.getElementById('frame').style.getPropertyValue('--ornament-size')==='7px'&&!document.getElementById('frame').style.getPropertyValue('--ornament-image');frame=api.createFrame(document.getElementById('frame'),{design:'red-rosette-vine',assetsBase:'/local/ornaments/',loading:'lazy'});`);
  assert.equal(await evaluate('window.restored'),true);assert.equal(await pendingArt(),true);
  await evaluate(`document.getElementById('frame').scrollIntoView({block:'center'})`);
  await until(`getComputedStyle(document.getElementById('frame')).borderImageSource.includes('red-rosette-vine')`);await decodeImages();
  assert.equal((await geometry()).axis,'x');checkGeometry(await geometry());
  assert.equal(await evaluate(`original===document.getElementById('note')&&original.value==='Keep me'`),true);
  assert.deepEqual(await evaluate(`(()=>{const b=whole.element.getBoundingClientRect();return [b.width,b.height]})()`),beforeBox,'Image geometry shifted after decoding');
  await evaluate(`whole.destroy()`);
  assert.equal(await evaluate(`document.getElementById('whole').width===13&&document.getElementById('whole').height===17&&document.getElementById('whole').loading==='eager'&&!document.getElementById('whole').hasAttribute('decoding')&&!document.getElementById('whole').hasAttribute('fetchpriority')`),true,'Restore native loading attributes');
  records.push({kind:'lazy-vanilla-noop-dimensions-teardown'});
  async function exerciseLazyReact(url,label){
    await navigate('about:blank',`document.readyState==='complete'`);
    const start=requests.length;await navigate(url,'window.lazyReady===true');await pause(250);
    assert.deepEqual(noArtworkSince(start),[],label+' offscreen image requests');assert.equal(await pendingArt(),true);
    assert.equal(await evaluate(`original===document.getElementById('note')&&original.value==='Before hydration'&&forwarded===document.getElementById('frame')`),true);
    await evaluate(`setLazyDesign('red-rosette-vine')`);await pause(100);assert.equal(await pendingArt(),true);
    await evaluate(`setLazyLoading('eager')`);await until(`getComputedStyle(document.getElementById('frame')).borderImageSource.includes('red-rosette-vine')`);
    await evaluate(`setLazyLoading('lazy')`);await pause(100);
    assert.equal(await evaluate(`getComputedStyle(document.getElementById('frame')).borderImageSource.includes('red-rosette-vine')`),true,'Keep previously activated artwork');
    await evaluate(`document.getElementById('frame').scrollIntoView({block:'center'})`);
    await until(`getComputedStyle(document.getElementById('divider'),'::before').backgroundImage!=='none'`);await decodeImages();
    assert.equal(await evaluate(`original===document.getElementById('note')&&original.value==='Before hydration'`),true);
    records.push({kind:label+'-lazy-hydration-updates'});
  }

  async function exerciseReact(url, label) {
    await navigate(url, `document.getElementById('divider')?.classList.contains('ornament-divider')`);
    assert.ok((await evaluate('document.body.dataset.reactVersion')).startsWith(label.startsWith('react18') ? '18.' : '19.'), 'Wrong React runtime');
    await decodeImages();
    assert.deepEqual(await evaluate(`(()=>{const frame=getComputedStyle(document.getElementById('frame')),image=getComputedStyle(document.getElementById('whole')),divider=getComputedStyle(document.getElementById('divider'),'::before');return {border:frame.borderTopWidth,repeat:frame.borderImageRepeat,height:image.height,fit:image.objectFit,content:divider.content}})()`), {border:'33px',repeat:'round',height:'128px',fit:'contain',content:'""'}, label + ' automatic React styles');
    for (const width of [320, 375, 997, 1920]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1.25, mobile: false }); await pause(80);
      const overflow = await evaluate(`({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,width:innerWidth,offenders:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>({tag:el.tagName,id:el.id,class:el.className,right:el.getBoundingClientRect().right})).slice(0,12)})`);
      assert.equal(overflow.overflow, false, label + ' overflow ' + JSON.stringify(overflow));
      checkGeometry(await geometry());
    }
    await evaluate(`window.original=document.getElementById('note');original.focus();const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(original,'Controlled note');original.dispatchEvent(new Event('input',{bubbles:true}));`);
    async function choose(id, value) { await evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`); await pause(80); }
    await choose('design', 'plate-02-stepped-ribbon'); await until(`document.getElementById('divider').dataset.axis==='y'`);
    await choose('orientation', 'horizontal'); await until(`document.getElementById('divider').dataset.axis==='x'`);
    await choose('design', 'plate-03-spiral-bands');
    assert.equal((await geometry()).axis, 'x'); checkGeometry(await geometry());
    await choose('orientation', 'vertical'); await until(`document.getElementById('divider').dataset.axis==='y'`);
    assert.equal(await evaluate(`document.getElementById('note')===original&&original.value==='Controlled note'&&document.activeElement===original`), true);
    await choose('wholeDesign', 'butterfly-panel-red'); await decodeImages();
    assert.equal(await evaluate(`document.getElementById('whole').src.includes('butterfly-panel-red')`), true);
    await evaluate(`document.getElementById('toggle').click()`); await until(`!document.getElementById('frame')`);
    await evaluate(`document.getElementById('toggle').click()`); await until(`!!document.getElementById('frame')`);
    assert.equal(await evaluate(`document.getElementById('note').value`), 'Controlled note');
    const image = await send('Page.captureScreenshot', { captureBeyondViewport: false });
    await writeFile(path.join(root, 'tmp', label + '.png'), Buffer.from(image.data, 'base64'));
    records.push({ kind: label });
  }
  await exerciseReact(origin + '/app/dist/', 'react19-production');
  await exerciseLazyReact(origin+'/app/dist/lazy.html','react19-production');
  vite = await createViteServer({ root: app, configFile: false, logLevel: 'error', ssr: { noExternal: ['@ranx729/medieval-ornaments'] }, server: { host: '127.0.0.1', port: 0 },
    plugins: [{ name: 'fixture-public-assets', configureServer(instance) {
      instance.middlewares.use('/local/ornaments', async (request, response, next) => {
        try {
          const filename = path.resolve(folder, 'local/ornaments', '.' + new URL(request.url, 'http://localhost').pathname);
          if (!filename.startsWith(path.join(folder, 'local/ornaments') + path.sep)) throw new Error('Outside assets');
          response.setHeader('content-type', mime[path.extname(filename)] || 'application/octet-stream');
          response.end(await readFile(filename));
        } catch { next(); }
      });
    } }]
  }); await vite.listen();
  await writeFile(path.join(app, 'styled-ssr.mjs'), `import {createElement as h} from 'react';import {renderToString} from 'react-dom/server';import {OrnamentDivider} from '@ranx729/medieval-ornaments/react';export const markup=renderToString(h(OrnamentDivider,{design:'plate-02-stepped-ribbon'}));`);
  assert.match((await vite.ssrLoadModule('/styled-ssr.mjs')).markup, /data-axis="y"/, 'Vite SSR processes the automatic CSS entry');
  records.push({ kind: 'styled-vite-ssr' });
  const dev = `http://127.0.0.1:${vite.httpServer.address().port}/`;
  await exerciseReact(dev, 'react19-development');
  await navigate(dev + 'hydrate.html', 'window.hydrationReady===true'); await decodeImages();
  assert.equal(await evaluate(`before===document.getElementById('hydrated-input')&&before.value==='Typed before hydration'&&forwarded===document.getElementById('hydrated')`), true);
  assert.equal(await evaluate(`getComputedStyle(document.getElementById('hydrated')).borderTopWidth`), '32px', 'Automatic styles during hydration');
  await evaluate(`window.changeOrientation('horizontal')`); await until(`document.getElementById('hydrated-divider').dataset.axis==='x'`);
  assert.equal(await evaluate(`before===document.getElementById('hydrated-input')&&before.value==='Typed before hydration'`), true);
  records.push({ kind: 'hydration-ref-state' });
  await exerciseLazyReact(dev+'lazy.html','react19-development');
  await vite.close(); vite = null;

  // Exercise the declared older peer too, including its SSR and public types.
  const older = path.join(folder, 'react18'); await mkdir(older);
  await writeFile(path.join(older, 'package.json'), '{"private":true,"type":"module"}');
  await exec('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund', 'react@18.3.1', 'react-dom@18.3.1', '@types/react@18', '@types/react-dom@18'], { cwd: older });
  for (const name of ['react', 'react-dom', '@types']) { await rm(path.join(app, 'node_modules', name)); await symlink(path.join(older, 'node_modules', name), path.join(app, 'node_modules', name), 'dir'); }
  await exec(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--noUncheckedSideEffectImports', '--module', 'nodenext', '--target', 'es2022', '--jsx', 'react-jsx', 'types.tsx'], { cwd: app });
  await writeFile(path.join(app, 'ssr.mjs'), `import {createElement as h} from 'react';import {renderToString} from 'react-dom/server';import {OrnamentDivider} from '@ranx729/medieval-ornaments/react/unstyled';if(!renderToString(h(OrnamentDivider,{design:'plate-02-stepped-ribbon'})).includes('data-axis="y"'))throw Error('SSR axis');`);
  await exec(process.execPath, ['ssr.mjs'], { cwd: app });
  await buildApp();
  await exerciseReact(origin + '/app/dist/', 'react18-production');
  await exerciseLazyReact(origin+'/app/dist/lazy.html','react18-production');
  assert.deepEqual(errors, [], 'Browser errors'); assert.deepEqual(failed, [], 'Missing assets');
  assert.ok(requests.filter(url => /\.(svg|png|webp)$/.test(url)).every(url => new URL(url).hostname === '127.0.0.1' && new URL(url).pathname.startsWith('/local/ornaments/')), 'Unexpected external image requests');
  await writeFile(path.join(root, 'tmp/package-integration.json'), JSON.stringify({ folder, records, errors, failed }, null, 2));
  console.log(`PASS packaged consumers: ${api.ornaments.length} designs, ${api.findOrnaments({use: 'divider'}).length * 3} native axis/design cases, 32 density/length cases, vanilla native/bundled, React 18/19, development Strict Mode, production, SSR/hydration, refs/state, types, and self-hosting. Fixture: ${folder}`);
} finally {
  ws?.close(); chrome?.kill(); await vite?.close(); await new Promise(resolve => server ? server.close(resolve) : resolve());
}
