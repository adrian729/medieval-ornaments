// Post-release verification of actual Pages demos, CDN defaults and browser ZIP.
// Uses the same review Chrome as scripts/browser_check.mjs; run sequentially.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { getAssetSource } from '../lib/asset-routing.js';
const exec = promisify(execFile);
const root = new URL('../', import.meta.url);
const { version, ornamentAssets, ornamentIllustrations } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const illustrationCount = JSON.parse(await readFile(new URL('images.json', root))).filter(item => item.asset_type === 'illustration').length;
const authorCount = JSON.parse(await readFile(new URL('images.json', root))).filter(item => item.author === 'adrian729').length;
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
  return evaluate(`(async()=>{const frame=document.getElementById('frame'),divider=document.getElementById('divider'),whole=document.getElementById('whole'),style=getComputedStyle(divider),paint=getComputedStyle(divider,'::before'),axis=divider.dataset.axis,available=parseFloat(style[axis==='x'?'width':'height']),used=parseFloat(paint[axis==='x'?'width':'height']),period=parseFloat(style.getPropertyValue('--ornament-size'))*parseFloat(style.getPropertyValue('--ornament-ratio')),inset=parseFloat(paint[axis==='x'?'left':'top'])+new DOMMatrix(paint.transform)[axis==='x'?'m41':'m42'];const urls=[JSON.parse(getComputedStyle(frame).borderImageSource.slice(4,-1)),JSON.parse(paint.backgroundImage.slice(4,-1)),whole.src];await Promise.all(urls.map(async url=>{const image=new Image();image.src=url;try{await image.decode();}catch(error){throw new Error("Image decode failed: "+url,{cause:error});}}));return {axis,available,used,period,inset,urls,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
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
    if (example === 'vanilla') {
      await until(`getComputedStyle(document.querySelector('.cinquefoil .terminal')).backgroundImage!=='none'`);
      const compositions = await evaluate(`(async()=>{const elements=[...document.querySelectorAll('.manuscript-divider')],records=[];for(const width of [160,420,800]){for(const el of elements)el.style.width=width+'px';const data=elements.map(el=>{const paint=getComputedStyle(el,'::before');return {width:el.getBoundingClientRect().width,ornaments:[...el.querySelectorAll('.terminal,.centre')].map(x=>[x.getBoundingClientRect().width,x.getBoundingClientRect().height]),rules:[...el.querySelectorAll('.rule')].map(x=>x.getBoundingClientRect().width),continuousRule:{height:parseFloat(paint.height),width:parseFloat(paint.width),left:parseFloat(paint.left),right:parseFloat(paint.right)},urls:[...el.querySelectorAll('.terminal,.centre')].map(x=>JSON.parse(getComputedStyle(x).backgroundImage.slice(4,-1)))}});await Promise.all(data.flatMap(x=>x.urls).map(async url=>{const image=new Image();image.src=url;try{await image.decode();}catch(error){throw new Error("Image decode failed: "+url,{cause:error});}}));records.push(data);}for(const el of elements)el.style.removeProperty('width');return records;})()`);
      assert.deepEqual(compositions[0].map(x=>x.ornaments),compositions[1].map(x=>x.ornaments));
      assert.ok(compositions.flat().every(x=>x.ornaments.map(([,height])=>height).join(',')==='18,36,18'&&x.continuousRule.height===4&&Math.abs(x.continuousRule.width+x.continuousRule.left+x.continuousRule.right-x.width)<.05));
      assert.ok(compositions.flat().every(x=>x.rules.every(size=>size>0)&&x.urls.every(url=>url.startsWith(getAssetSource('gold-cinquefoil-divider-end').base))));
      records.push({goldCompositions:compositions});
    }
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
    await choose('wholeDesign', 'flying-pig'); check(await art());
    assert.ok(await evaluate("document.getElementById('whole').src.endsWith('/webp/256/flying-pig.webp')&&document.getElementById('whole').loading==='lazy'&&document.getElementById('selective-illustration').src.endsWith('/webp/256/flying-pig.webp')"), 'Live generic and individual illustration sizing/loading');
    await choose('wholeDesign', 'animal-musicians-ensemble'); check(await art());
    assert.ok(result.urls.every(url => url.startsWith('https://unpkg.com/@ranx729/medieval-ornaments-assets-')));
    const screenshot = await send('Page.captureScreenshot', { captureBeyondViewport: false });
    await writeFile(new URL(`tmp/live-${example}-${width}.png`, root), Buffer.from(screenshot.data, 'base64'));
    records.push({ example, width, ...result });
  }
  await navigate(origin + '/examples/?purpose=whole&type=all&search=adrian729&design=rabbit-lutenist-painted', `document.body?.dataset.ready==='true'`);
  assert.equal(await evaluate(`document.querySelectorAll('.design-card').length`),authorCount, 'Live author discovery');
  assert.ok(await evaluate(`!document.getElementById('author').hidden&&document.getElementById('author').textContent==='Author: adrian729'`), 'Live author attribution');
  await evaluate(`document.getElementById('standalone').decode()`);
  // Load the actual npm modules directly from their pinned CDN, not checkout URLs.
  const cdn = await evaluate(`(async()=>{const api=await import('https://unpkg.com/@ranx729/medieval-ornaments@${version}/lib/index.js');const cases=[['frame',{design:'red-berry-vine'}],['divider',{design:'plate-02-stepped-ribbon'}],['divider',{design:'plate-02-stepped-ribbon',orientation:'horizontal'}],['image',{design:'floral-bird-panel-blue',size:128}],['frame',{design:'blue-diamond-leaf-stencil-band'}],['divider',{design:'blue-paired-birds-and-palmettes',orientation:'vertical'}],['frame',{design:'russet-floral-vine-with-bud-borders'}],['image',{design:'painted-sprawling-floral-panel',size:128}],['image',{design:'gold-scroll-with-blue-bellflowers',format:'png',size:107,pixelRatio:1}],['image',{design:'gold-scroll-with-blue-bellflowers',format:'svg',size:330}],['frame',{design:'rosselli-mask-border',size:33}],['frame',{design:'rosselli-foliate-border',size:96}],['image',{design:'polyhymnia',size:256}],['image',{design:'rabbit-lutenist-painted',size:256}],['image',{design:'choirbook-and-ivy',size:256}],['image',{design:'illuminated-acanthus-frame',size:256}],['image',{design:'ivy-corner',size:256}],['image',{design:'flying-pig',size:128}],['image',{design:'musicians-and-dancers',size:128}],['image',{design:'animal-musicians-ensemble',size:128}]];if(api.findOrnaments({query:'adrian729'}).length!==${authorCount}||api.getOrnament('polyhymnia').author!=='adrian729'||api.getOrnament('rabbit-lutenist-painted').author!=='adrian729')throw Error('Published author metadata/search failed');const assets=cases.map(([use,options])=>api.resolveOrnament(use,options).asset);await Promise.all(assets.map(async asset=>{const image=new Image();image.src=asset.url;try{await image.decode();}catch(error){throw new Error('CDN image decode failed: '+asset.url,{cause:error});}}));const individual=await import('https://unpkg.com/@ranx729/medieval-ornaments@${version}/lib/designs/red-berry-vine.js');const selected=individual.resolveOrnament('divider');const illustrations=await import('https://unpkg.com/@ranx729/medieval-ornaments@${version}/lib/selection-illustrations.js');if(illustrations.ornaments.length!==${illustrationCount}||!illustrations.findOrnaments({categories:['reading'],subjects:['rabbit']}).length)throw Error('Scoped illustration discovery failed');const pig=await import('https://unpkg.com/@ranx729/medieval-ornaments@${version}/lib/designs/flying-pig.js');if(pig.resolveOrnament('image',{size:128}).asset.path!=='webp/256/flying-pig.webp')throw Error('Individual illustration failed');return {individualName:individual.ornament.name,individualUrl:selected.asset.url,version:api.version,assetsPackage:api.assetsPackage,assetsVersion:api.assetsVersion,count:api.ornaments.length,assets};})()`);
  assert.equal(cdn.individualName, 'red-berry-vine');
  assert.ok(cdn.individualUrl.startsWith(getAssetSource('red-berry-vine').base));
  assert.equal(cdn.version, version); assert.equal(cdn.count, (await (await fetch(origin + '/images.json')).json()).length);
  assert.equal(cdn.assetsPackage, ornamentAssets.package);
  assert.equal(cdn.assetsVersion, ornamentAssets.version);
  assert.ok(cdn.assets.every(asset => asset.url.startsWith('https://unpkg.com/@ranx729/medieval-ornaments-assets-')));
  assert.ok(cdn.assets.slice(-3).every(asset=>asset.url.startsWith(getAssetSource('flying-pig').base)));
  records.push({ cdn });
  const folder = await mkdtemp(path.join(tmpdir(), 'ornaments-browser-release-'));
  const response = await fetch(`https://github.com/adrian729/medieval-ornaments/releases/download/v${version}/medieval-ornaments-browser.zip`); assert.equal(response.status, 200);
  const archive = path.join(folder, 'browser.zip'); await writeFile(archive, Buffer.from(await response.arrayBuffer()));
  await exec('unzip', ['-t', archive]); await exec('unzip', ['-q', archive, '-d', folder]);
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
  server = createServer(async (request, res) => {
    try { let file = path.resolve(folder, '.' + new URL(request.url, 'http://localhost').pathname); if (!file.startsWith(folder + path.sep)) throw Error('Outside fixture'); if (new URL(request.url, 'http://localhost').pathname.endsWith('/')) file = path.join(file, 'index.html'); const bytes = await readFile(file); res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(bytes); }
    catch { res.writeHead(404); res.end('Missing file'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await navigate(`http://127.0.0.1:${server.address().port}/medieval-ornaments-browser/examples/vanilla/`, `document.body?.dataset.ready==='true'`);
  await until(`getComputedStyle(document.querySelector('.cinquefoil .terminal')).backgroundImage!=='none'`);
  const zipDividers = await evaluate(`(async()=>{const records=[];for(const el of document.querySelectorAll('.manuscript-divider')){const urls=[...el.querySelectorAll('.terminal,.centre')].map(x=>JSON.parse(getComputedStyle(x).backgroundImage.slice(4,-1)));await Promise.all(urls.map(async url=>{const image=new Image();image.src=url;try{await image.decode();}catch(error){throw new Error("Image decode failed: "+url,{cause:error});}}));records.push({rule:getComputedStyle(el,'::before').height,center:el.querySelector('.centre').getBoundingClientRect().height,urls});}return records;})()`);
  assert.equal(zipDividers.length,2);
  assert.ok(zipDividers.every(x=>x.rule==='4px'&&x.center===36&&x.urls.every(url=>new URL(url).hostname==='127.0.0.1')), 'ZIP contains corrected self-hosted gold compositions');
  check(await art()); await choose('orientation', 'vertical'); check(await art());
  await choose('wholeDesign', 'flying-pig'); check(await art());
  assert.ok((await art()).urls.every(url => new URL(url).hostname === '127.0.0.1'), 'ZIP example should be self-hosted');
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  await navigate(`http://127.0.0.1:${server.address().port}/medieval-ornaments-browser/examples/?type=illustration`, `document.body?.dataset.ready==='true'`);
  assert.ok(await evaluate(`document.querySelectorAll('.design-card').length===${illustrationCount}&&document.getElementById('purpose').value==='whole'`), 'ZIP illustration browser');
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  records.push({ browserZip: 'pass', folder });
  await writeFile(new URL('tmp/package-site.json', root), JSON.stringify(records, null, 2));
  console.log('PASS live vanilla/React demos at 375/1200px, original and forced axes, image decoding, pinned npm CDN modules/assets, and downloaded browser ZIP with local images.');
} finally {
  ws.close(); if (server) await new Promise(resolve => server.close(resolve));
}
