// Optional browser verification: Node 22+ and Chrome with --remote-debugging-port=9227.
import {writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:8765';
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
assert(errors.length===0,'Browser errors '+JSON.stringify(errors));
await writeFile(new URL('../tmp/browser-verification.json',import.meta.url),JSON.stringify({checks,designs:catalog.length,viewportWidths:[320,375,768,1200],errors},null,2));
console.log(`PASS ${checks} browser checks across ${catalog.length} designs, all formats, and four viewport sizes.`);ws.close();
