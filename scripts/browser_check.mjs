// Optional browser verification: Node 22+ and Chrome with --remote-debugging-port=9227.
import {writeFile} from 'node:fs/promises';
const origin=(process.argv[2]||'http://127.0.0.1:8765').replace(/\/$/,'');
const tabs=await(await fetch('http://127.0.0.1:9227/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails)});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
function assert(ok,message){if(!ok)throw Error(message)}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){for(let i=0;i<100;i++){if(await evaluate('document.body.dataset.ready==="true"'))return;await pause(50)}throw Error('Preview failed to load')}
async function choose(id,value){await evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(String(value))};el.dispatchEvent(new Event('input',{bubbles:true}));})()`)}
await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:origin+'/examples/'});await ready();
const catalog=await(await fetch(origin+'/images.json')).json();let checks=0;
for(const item of catalog){
  await choose('design',item.name);
  for(const format of item.kind==='repeat-tile'?['svg','png','webp']:['png','webp']){
    await choose('format',format);
    const result=await evaluate(`(async()=>{const vector=${item.kind==='repeat-tile'},frame=document.getElementById('frame'),standalone=document.getElementById('standalone');const path=vector?JSON.parse(getComputedStyle(frame).borderImageSource.slice(4,-1)):standalone.src;const img=new Image();img.src=path;await img.decode();return {loaded:img.naturalWidth>0,frameVisible:getComputedStyle(frame).display!=='none',standaloneVisible:getComputedStyle(standalone).display!=='none',slice:getComputedStyle(frame).borderImageSlice,format:path.split('.').pop()}})()`);
    assert(result.loaded&&result.format===format,'Image load/format failed '+item.name+' '+JSON.stringify(result));
    assert(result.frameVisible===(item.kind==='repeat-tile')&&result.standaloneVisible===(item.kind==='standalone'),'Visibility failed '+item.name);
    checks++;
  }
}
await choose('design','red-berry-vine');await choose('format','svg');
for(const viewport of [320,375,768,1200]){
  await send('Emulation.setDeviceMetricsOverride',{width:viewport,height:1000,deviceScaleFactor:1,mobile:false});
  for(const [width,height,thickness] of [[240,180,12],[640,330,32],[1050,650,80]]){
    await choose('width',width);await choose('height',height);await choose('thickness',thickness);
    const g=await evaluate(`(()=>{const frame=document.getElementById('frame'),r=frame.getBoundingClientRect();return {width:r.width,height:r.height,border:parseFloat(getComputedStyle(frame).borderTopWidth),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
    assert(g.width===width&&g.height===height&&g.border===thickness&&!g.overflow,'Sizing failed '+JSON.stringify({viewport,...g}));checks++;
  }
}
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:1100,deviceScaleFactor:1,mobile:false});
for(const [name,theme,width,height,thickness,format] of [
 ['red-berry-vine','light',680,330,32,'svg'],
 ['interlocking-ribbon','dark',1000,400,64,'webp'],
 ['plate-13-leaf-and-flower-vine','light',320,240,24,'svg'],
 ['plate-36-greek-key','dark',640,330,32,'png'],
 ['floral-bird-panel-blue','dark',640,650,32,'webp']]){
  for(const [id,value] of Object.entries({design:name,theme,width,height,thickness,format}))await choose(id,value);
  await pause(150);const shot=await send('Page.captureScreenshot',{captureBeyondViewport:false});
  await writeFile(new URL('../tmp/browser-'+name+'.png',import.meta.url),Buffer.from(shot.data,'base64'));
}
// The small usage demo consumes the same stylesheet as the full playground.
await send('Page.navigate',{url:origin+'/examples/demo.html'});await ready();
for(const viewport of [320,375,768,1200]){
  await send('Emulation.setDeviceMetricsOverride',{width:viewport,height:1000,deviceScaleFactor:1,mobile:false});
  const result=await evaluate(`(async()=>{await Promise.all([...document.images].map(i=>i.decode()));const divider=getComputedStyle(document.querySelector('.ornament-divider')),frame=getComputedStyle(document.getElementById('frameExample'));for(const cssUrl of [divider.backgroundImage,frame.borderImageSource]){const image=new Image();image.src=JSON.parse(cssUrl.slice(4,-1));await image.decode()}return {overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,loaded:[...document.images].every(i=>i.naturalWidth>0),tileSize:divider.backgroundSize}})()`);
  assert(!result.overflow&&result.loaded&&result.tileSize==='64px 24px','Demo layout failed '+JSON.stringify({viewport,...result}));checks++;
}
for(const name of ['red-berry-vine','plate-13-leaf-and-flower-vine','plate-36-greek-key'])for(const size of [16,28,48]){
  await choose('frameDesign',name);await choose('thickness',size);
  const result=await evaluate(`(()=>{const frame=getComputedStyle(document.getElementById('frameExample')),code=document.getElementById('frameCode').textContent;return {border:parseFloat(frame.borderTopWidth),image:frame.borderImageSource,code}})()`);
  assert(result.border===size&&result.image.includes(name+'-border.svg')&&result.code.includes('--ornament-size: '+size+'px')&&result.code.includes(name+'-border.svg'),'Demo setting/code mismatch');checks++;
}
await evaluate("document.getElementById('theme').click()");
assert(await evaluate("document.body.classList.contains('dark')&&document.getElementById('theme').getAttribute('aria-pressed')==='true'"),'Theme toggle failed');checks++;
await evaluate("document.getElementById('remoteUrls').checked=false;document.getElementById('remoteUrls').dispatchEvent(new Event('input'))");
assert(await evaluate("['frameCode','dividerCode','panelCode'].every(id=>document.getElementById(id).textContent.includes('../')&&!document.getElementById(id).textContent.includes('https://'))"),'Local snippets failed');checks++;
await evaluate("document.getElementById('remoteUrls').checked=true;document.getElementById('remoteUrls').dispatchEvent(new Event('input'))");
assert(await evaluate("['frameCode','dividerCode','panelCode'].every(id=>document.getElementById(id).textContent.includes('https://adrian729.github.io/medieval-ornaments/ornaments.css'))"),'Hosted stylesheet snippets failed');checks++;
// Verify copy output without modifying the user's system clipboard.
await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedDemoText=text}}})");
for(const id of ['frameCode','dividerCode','panelCode']){
  await evaluate(`document.querySelector('[data-copy="${id}"]').click()`);
  assert(await evaluate(`window.copiedDemoText===document.getElementById('${id}').textContent`),'Copy mismatch '+id);checks++;
}
// Exercise the alternate divider orientation through the same usage contract.
const vertical=await evaluate(`(()=>{const el=document.querySelector('.ornament-divider');el.dataset.axis='y';el.style.setProperty('--ornament-length','180px');const style=getComputedStyle(el);const result={width:style.width,height:style.height,repeat:style.backgroundRepeat,size:style.backgroundSize};el.removeAttribute('data-axis');el.style.removeProperty('--ornament-length');return result})()`);
assert(vertical.width==='24px'&&vertical.height==='180px'&&vertical.repeat==='repeat-y'&&vertical.size==='24px 64px','Vertical divider contract failed');checks++;
await choose('frameDesign','red-berry-vine');await choose('thickness',28);
for(const [width,height,name] of [[1200,1500,'desktop'],[375,1100,'mobile']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await pause(100);
  const shot=await send('Page.captureScreenshot',{captureBeyondViewport:false});
  await writeFile(new URL('../tmp/usage-demo-'+name+'.png',import.meta.url),Buffer.from(shot.data,'base64'));
}
assert(errors.length===0,'Browser errors '+JSON.stringify(errors));
await writeFile(new URL('../tmp/browser-verification.json',import.meta.url),JSON.stringify({checks,designs:catalog.length,viewportWidths:[320,375,768,1200],errors},null,2));
console.log(`PASS ${checks} browser checks across ${catalog.length} designs, all formats, four viewport sizes, and shared usage/demo controls.`);ws.close();
