// Reproducible local audit. Production JS, gzip text, cold cache, own Chrome.
// Timings are observations, not brittle pass/fail thresholds.
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';
import { build } from 'vite';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { OrnamentFrame } from '../lib/react.js';
import { ornaments, findOrnaments, resolveOrnament } from '../lib/index.js';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const work = path.join(root, 'tmp/performance');
await mkdir(work, { recursive: true });
const output = process.argv[2] || path.join(work, 'audit.json');
const lazy = process.env.ORNAMENTS_AUDIT_LAZY !== '0';
const viewportWidth = Number(process.env.ORNAMENTS_AUDIT_WIDTH || 1200);
const pixelRatio = Number(process.env.ORNAMENTS_AUDIT_DPR || 1);
const fixtures = path.join(work, 'fixtures');
await mkdir(fixtures, { recursive: true });
const jsx = `import React,{StrictMode} from 'react';import {createRoot} from 'react-dom/client';
import {OrnamentFrame,OrnamentDivider,OrnamentImage} from ${JSON.stringify(path.join(root, 'lib/react-styled.js'))};
import {ornaments} from ${JSON.stringify(path.join(root, 'lib/index.js'))};
const loading=${lazy}&&location.search.includes('lazy')?'lazy':'eager';
createRoot(document.getElementById('root')).render(<StrictMode><h1>Offscreen collection</h1><div style={{height:10000}}/>{ornaments.map(i=>i.kind==='standalone'?<OrnamentImage key={i.name} design={i.name} size={80} assetsBase="/" {...(${lazy}?{loading}:{})}/>:<OrnamentFrame key={i.name} design={i.name} size={24} assetsBase="/" {...(${lazy}?{loading}:{})} style={{height:180}}>Content<OrnamentDivider design={i.name} assetsBase="/" {...(${lazy}?{loading}:{})}/></OrnamentFrame>)}</StrictMode>);
window.auditReady=true;`;
await writeFile(path.join(fixtures, 'index.html'), '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script type="module" src="/main.jsx"></script>');
await writeFile(path.join(fixtures, 'main.jsx'), jsx);
await build({ root: fixtures, configFile: false, base: '/audit/', logLevel: 'error', build: { outDir: path.join(work, 'react'), emptyOutDir: true } });
const entries = [];
await build({ root, configFile: false, logLevel: 'silent', build: { write: false, minify: true, lib: { entry: path.join(root, 'lib/index.js'), formats: ['es'], fileName: 'core' }, rollupOptions: { external: ['react'] } }, plugins: [{ name: 'measure', generateBundle(_options, bundle) { for (const value of Object.values(bundle)) if (value.type === 'chunk') entries.push({ file: value.fileName, bytes: Buffer.byteLength(value.code), gzipBytes: gzipSync(value.code).length }); } }] });
const assets = await Promise.all(ornaments.flatMap(item => [item, ...Object.values(item.components)]).flatMap(asset => ['svg','png','webp'].filter(format => asset[format]).map(async format => ({ path: asset[format], format, bytes: (await stat(path.join(root, asset[format]))).size }))));
const benchmarks = [];
for (let run = 0; run < 5; run++) {
  let start = performance.now();
  const repeat = findOrnaments({use:'frame'});
  for (let i = 0; i < 10000; i++) resolveOrnament('frame', {design:repeat[i%repeat.length].name,format:'webp',size:33});
  const resolutionMs = performance.now()-start; start=performance.now();
  for (let i=0;i<1000;i++) findOrnaments({query:'floral gold',use:'frame'});
  const searchMs=performance.now()-start; start=performance.now();
  renderToString(h('div', null, ...Array.from({length:1000}, (_,i)=>h(OrnamentFrame, {key:i,design:repeat[i%repeat.length].name,size:33}, 'Content'))));
  benchmarks.push({resolution10kMs:resolutionMs,search1kMs:searchMs,ssr1kMs:performance.now()-start});
}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server = createServer(async (req,res) => {
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
    const base=pathname.startsWith('/audit/')?path.join(work,'react'):root;
    let file=path.resolve(base,'.'+(base===root?pathname:pathname.slice(6)));
    if(file!==base&&!file.startsWith(base+path.sep))throw Error('path');
    if(pathname.endsWith('/'))file=path.join(file,'index.html');
    let content=await readFile(file);const type=mime[path.extname(file)]||'application/octet-stream';
    const headers={'content-type':type,'cache-control':'public,max-age=31536000'};
    if(/text|json|svg/.test(type)&&req.headers['accept-encoding']?.includes('gzip')) {content=gzipSync(content);headers['content-encoding']='gzip';}
    res.writeHead(200,headers);res.end(content);
  } catch {res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const profile=path.join(work,'chrome-'+Date.now());
const chrome=spawn(process.env.CHROME_BIN||'google-chrome',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let ws;
try {
  let port;
  for(let i=0;i<150&&!port;i++){try{port=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];}catch{await pause(50);}}
  if(!port)throw Error('Chrome did not start');
  const tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json();
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let seq=0;const pending=new Map();const errors=[];
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Performance.enable');
  await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:viewportWidth,height:900,deviceScaleFactor:pixelRatio,mobile:false});
  await send('Emulation.setCPUThrottlingRate',{rate:4});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.audit={cls:0,shifts:[],longTasks:[]};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){window.audit.cls+=e.value;window.audit.shifts.push({value:e.value,sources:e.sources.map(s=>({node:s.node?.id||s.node?.className||s.node?.tagName,before:s.previousRect.toJSON(),after:s.currentRect.toJSON()}))})}}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.audit.longTasks.push(e.duration)}).observe({type:'longtask',buffered:true});`});
  const pages=[];
  for(const route of ['/examples/','/examples/?design=gold-scroll-with-blue-bellflowers&format=webp','/examples/?type=illustration&design=flying-pig&height=128','/examples/review.html','/examples/qa.html','/audit/?eager',...(lazy?['/audit/?lazy']:[])]){
    await send('Page.navigate',{url:'about:blank'});await pause(100);
    await send('Page.navigate',{url:origin+route});
    for(let i=0;i<400;i++){if(await evaluate(`location.href===${JSON.stringify(origin+route)}&&(document.body?.dataset.ready==='true'||window.auditReady===true)`))break;await pause(50);if(i===399)throw Error('page not ready '+route);}
    await pause(2000);
    const result=await evaluate(`(()=>{const entries=performance.getEntriesByType('resource'),nav=performance.getEntriesByType('navigation')[0];return {resources:entries.map(e=>({path:new URL(e.name).pathname,encodedBytes:e.encodedBodySize,decodedBytes:e.decodedBodySize,durationMs:e.duration})),readyMs:nav.domContentLoadedEventEnd,loadMs:nav.loadEventEnd,cls:window.audit.cls,shifts:window.audit.shifts,longTasks:window.audit.longTasks,domNodes:document.querySelectorAll('*').length}})()`);
    const metrics=Object.fromEntries((await send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
    pages.push({route,...result,scriptSeconds:metrics.ScriptDuration,layoutSeconds:metrics.LayoutDuration,heapBytes:metrics.JSHeapUsedSize});
    console.log(route,JSON.stringify({requests:result.resources.length,encodedBytes:result.resources.reduce((n,e)=>n+e.encodedBytes,0),cls:result.cls,longTasks:result.longTasks.length}));
  }
  if(errors.length)throw Error(JSON.stringify(errors));
  const report={date:new Date().toISOString(),node:process.version,chrome:(await send('Browser.getVersion')).product,method:{viewport:[viewportWidth,900],pixelRatio,cpuSlowdown:4,coldCache:true,textCompression:'gzip',network:'local; not a real-user latency/throughput test',settleMs:2000},bundles:entries,benchmarks,assets:{totals:Object.fromEntries(['svg','png','webp'].map(f=>[f,assets.filter(a=>a.format===f).reduce((n,a)=>n+a.bytes,0)])),largest:assets.sort((a,b)=>b.bytes-a.bytes).slice(0,15)},pages};
  await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log('Audit saved:',output);
} finally {ws?.close();chrome.kill();await new Promise(r=>server.close(r));}
