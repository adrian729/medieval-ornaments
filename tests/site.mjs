// Post-release verification of actual Pages demos, CDN defaults and browser ZIP.
// Uses the same review Chrome as scripts/browser_check.mjs; run sequentially.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
const exec = promisify(execFile);
const root = new URL('../', import.meta.url);
const { version, ornamentAssets } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const origin = (process.argv[2] || 'https://adrian729.github.io/medieval-ornaments').replace(/\/$/, '');
const tabs = await (await fetch('http://127.0.0.1:9227/json')).json();
const ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0, server; const pending = new Map(), errors = [], missing = [], records = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) { const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400 && !message.params.response.url.endsWith('/favicon.ico')) missing.push(message.params.response.url);
});
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
async function evaluate(expression) { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) { for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await pause(60); } throw new Error('Page did not become ready: ' + expression + JSON.stringify({ errors, missing })); }
async function navigate(url, ready) { await send('Page.navigate', { url }); await until(`location.href===${JSON.stringify(url)}`); await until(ready); }
async function choose(id, value) { await evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`); await pause(100); }
async function art() {
  return evaluate(`(async()=>{const frame=document.getElementById('frame'),divider=document.getElementById('divider'),whole=document.getElementById('whole'),style=getComputedStyle(divider),paint=getComputedStyle(divider,'::before'),axis=divider.dataset.axis,available=parseFloat(style[axis==='x'?'width':'height']),used=parseFloat(paint[axis==='x'?'width':'height']),period=parseFloat(style.getPropertyValue('--ornament-size'))*parseFloat(style.getPropertyValue('--ornament-ratio')),inset=parseFloat(paint[axis==='x'?'left':'top'])+new DOMMatrix(paint.transform)[axis==='x'?'m41':'m42'];const urls=[JSON.parse(getComputedStyle(frame).borderImageSource.slice(4,-1)),JSON.parse(paint.backgroundImage.slice(4,-1)),whole.src];await Promise.all(urls.map(async url=>{const image=new Image();image.src=url;await image.decode();}));return {axis,available,used,period,inset,urls,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
}
function check(result) {
  assert.ok(!result.overflow, JSON.stringify(result));
  assert.ok(Math.abs(result.used - Math.floor((result.available + 1e-7) / result.period) * result.period) < .03, JSON.stringify(result));
  assert.ok(Math.abs(result.inset - (result.available - result.used) / 2) < .03, JSON.stringify(result));
}
try {
  await send('Page.enable'); await send('Page.navigate', { url: 'about:blank' });
  await send('Runtime.enable'); await send('Network.enable');
  errors.length = 0; missing.length = 0;
  for (const example of ['vanilla', 'react']) for (const width of [375, 1200]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1.25, mobile: false });
    await navigate(origin + `/examples/${example}/`, example === 'vanilla' ? `document.body?.dataset.ready==='true'` : `!!document.getElementById('divider')`);
    if (example === 'react') {
      assert.equal(await evaluate(`document.querySelector('pre').textContent.includes('styles.css')`), false, 'React snippet needs only the component import');
      assert.equal(await evaluate(`getComputedStyle(document.getElementById('frame')).borderTopWidth`), '33px', 'Live automatic React styles');
    }
    check(await art());
    assert.equal(await evaluate(`document.getElementById('selective-divider')?.dataset.axis`), 'x', 'Live individual-design example');
    assert.ok(await evaluate(`getComputedStyle(document.getElementById('selective-divider'),'::before').backgroundImage.includes('red-berry-vine')`));
    await choose('design', 'plate-02-stepped-ribbon'); await until(`document.getElementById('divider').dataset.axis==='y'`); check(await art());
    await choose('orientation', 'horizontal'); await until(`document.getElementById('divider').dataset.axis==='x'`); check(await art());
    await choose('orientation', 'vertical'); await until(`document.getElementById('divider').dataset.axis==='y'`); check(await art());
    await choose('wholeDesign', 'butterfly-panel-red'); const result = await art(); check(result);
    for (const design of ['blue-diamond-leaf-stencil-band', 'russet-floral-vine-with-bud-borders']) {
      await choose('design', design); check(await art());
    }
    await choose('wholeDesign', 'painted-sprawling-floral-panel'); check(await art());
    assert.ok(result.urls.every(url => url.startsWith(origin + '/')));
    const screenshot = await send('Page.captureScreenshot', { captureBeyondViewport: false });
    await writeFile(new URL(`tmp/live-${example}-${width}.png`, root), Buffer.from(screenshot.data, 'base64'));
    records.push({ example, width, ...result });
  }
  // Load the actual npm modules directly from their pinned CDN, not checkout URLs.
  const cdn = await evaluate(`(async()=>{const api=await import('https://unpkg.com/@ranx729/medieval-ornaments@${version}/lib/index.js');const cases=[['frame',{design:'red-berry-vine'}],['divider',{design:'plate-02-stepped-ribbon'}],['divider',{design:'plate-02-stepped-ribbon',orientation:'horizontal'}],['image',{design:'floral-bird-panel-blue',size:128}],['frame',{design:'blue-diamond-leaf-stencil-band'}],['divider',{design:'blue-paired-birds-and-palmettes',orientation:'vertical'}],['frame',{design:'russet-floral-vine-with-bud-borders'}],['image',{design:'painted-sprawling-floral-panel',size:128}],['image',{design:'gold-scroll-with-blue-bellflowers',format:'png',size:107,pixelRatio:1}],['image',{design:'gold-scroll-with-blue-bellflowers',format:'svg',size:330}]];const assets=cases.map(([use,options])=>api.resolveOrnament(use,options).asset);await Promise.all(assets.map(async asset=>{const image=new Image();image.src=asset.url;await image.decode();}));const individual=await import('https://unpkg.com/@ranx729/medieval-ornaments@${version}/lib/designs/red-berry-vine.js');const selected=individual.resolveOrnament('divider');return {individualName:individual.ornament.name,individualUrl:selected.asset.url,version:api.version,assetsPackage:api.assetsPackage,assetsVersion:api.assetsVersion,count:api.ornaments.length,assets};})()`);
  assert.equal(cdn.individualName, 'red-berry-vine');
  assert.ok(cdn.individualUrl.startsWith(`https://unpkg.com/${ornamentAssets.package}@${ornamentAssets.version}/`));
  assert.equal(cdn.version, version); assert.equal(cdn.count, (await (await fetch(origin + '/images.json')).json()).length);
  assert.equal(cdn.assetsPackage, ornamentAssets.package);
  assert.equal(cdn.assetsVersion, ornamentAssets.version);
  assert.ok(cdn.assets.every(asset => asset.url.startsWith(`https://unpkg.com/${ornamentAssets.package}@${ornamentAssets.version}/`)));
  records.push({ cdn });
  const folder = await mkdtemp(path.join(tmpdir(), 'ornaments-browser-release-'));
  const response = await fetch(origin + '/medieval-ornaments-browser.zip'); assert.equal(response.status, 200);
  const archive = path.join(folder, 'browser.zip'); await writeFile(archive, Buffer.from(await response.arrayBuffer()));
  await exec('unzip', ['-t', archive]); await exec('unzip', ['-q', archive, '-d', folder]);
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
  server = createServer(async (request, res) => {
    try { let file = path.resolve(folder, '.' + new URL(request.url, 'http://localhost').pathname); if (!file.startsWith(folder + path.sep)) throw Error('Outside fixture'); if (request.url.endsWith('/')) file = path.join(file, 'index.html'); const bytes = await readFile(file); res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(bytes); }
    catch { res.writeHead(404); res.end('Missing file'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await navigate(`http://127.0.0.1:${server.address().port}/medieval-ornaments-browser/examples/vanilla/`, `document.body?.dataset.ready==='true'`);
  check(await art()); await choose('orientation', 'vertical'); check(await art());
  assert.ok((await art()).urls.every(url => new URL(url).hostname === '127.0.0.1'), 'ZIP example should be self-hosted');
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  records.push({ browserZip: 'pass', folder });
  await writeFile(new URL('tmp/package-site.json', root), JSON.stringify(records, null, 2));
  console.log('PASS live vanilla/React demos at 375/1200px, original and forced axes, image decoding, pinned npm CDN modules/assets, and downloaded browser ZIP with local images.');
} finally {
  ws.close(); if (server) await new Promise(resolve => server.close(resolve));
}
