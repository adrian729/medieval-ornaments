// Render actual frame joins for pixel-level review; optional base URL and label.
import {writeFile} from 'node:fs/promises';
const origin=(process.argv[2]||'http://127.0.0.1:8765').replace(/\/$/,'');
const label=process.argv[3]||'review';
const dpr=Number(process.argv[4]||1);
const tabs=await(await fetch('http://127.0.0.1:9227/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}});
function send(method,params={}){return new Promise((resolve,reject)=>{const sequence=++id;pending.set(sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}))})}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:1000,deviceScaleFactor:dpr,mobile:false});
// The internal QA page supplies ornaments.css; frames are built here with the library.
await send('Page.navigate',{url:origin+'/examples/qa.html?assets=local'});
for(let i=0;i<100;i++){if(await evaluate('document.body?.dataset.ready==="true"'))break;await pause(50)}
if(label==='matrix'){
  const catalog=await(await fetch(origin+'/images.json')).json();
  const representatives=['gold-quatrefoil-vine','red-berry-vine','gold-leaf-scroll','red-rosette-vine'];
  const samples=[];
  for(const name of representatives)for(let size=16;size<=48;size++)samples.push({name,size});
  for(const item of catalog.filter(i=>i.kind==='repeat-tile'&&!representatives.includes(i.name)))samples.push({name:item.name,size:33});
  const sheets=[];
  for(const format of ['svg','png','webp'])for(const scale of [1,1.25,2])for(let offset=0;offset<samples.length;offset+=24){
    const cases=samples.slice(offset,offset+24).map((sample,i)=>{
      const item=catalog.find(i=>i.name===sample.name),asset=item.components.border_image;
      const slice=item.border_image_slice_percent,need=100/slice*sample.size*scale;
      const choice=[...asset.variants,asset].sort((a,b)=>Math.max(a.width,a.height)-Math.max(b.width,b.height)).find(a=>Math.max(a.width,a.height)>=need)||asset;
      return {...sample,x:20.5+(i%4)*280,y:24.25+Math.floor(i/4)*210,width:250,height:180,slice,source:origin+'/'+(format==='svg'?asset.svg:choice[format])};
    });
    const height=Math.ceil(cases.at(-1).y+cases.at(-1).height+16);
    await evaluate(`(async()=>{document.body.className='';document.body.innerHTML='';document.body.style.background='white';document.body.style.margin='0';const frames=${JSON.stringify(cases)};for(const item of frames){const el=document.createElement('div');el.className='ornament-frame';Object.assign(el.style,{position:'absolute',left:item.x+'px',top:item.y+'px',width:item.width+'px',height:item.height+'px',padding:'0'});el.style.setProperty('--ornament-slice',item.slice+'%');el.style.setProperty('--ornament-size',item.size+'px');el.style.setProperty('--ornament-image','url("'+item.source+'")');document.body.append(el)}await Promise.all([...new Set(frames.map(i=>i.source))].map(async url=>{const image=new Image();image.src=url;await image.decode()}));})()`);
    await send('Emulation.setDeviceMetricsOverride',{width:1200,height:1000,deviceScaleFactor:scale,mobile:false});await pause(100);
    const shot=await send('Page.captureScreenshot',{clip:{x:0,y:0,width:1200,height,scale:1},captureBeyondViewport:true});
    const file=`frame-matrix-${format}-${scale}-${offset}.png`;
    await writeFile(new URL('../tmp/'+file,import.meta.url),Buffer.from(shot.data,'base64'));sheets.push({file,format,ratio:scale,frames:cases});
    console.log(`Rendered ${format} DPR ${scale}, cases ${offset+1}–${offset+cases.length}.`);
  }
  await writeFile(new URL('../tmp/frame-matrix.json',import.meta.url),JSON.stringify({sheets},null,2));
  console.log(`Rendered ${samples.length*9} cases: four reported floral styles at every 16–48px thickness, every border at 33px, all formats and three pixel ratios.`);ws.close();
  process.exit(0);
}
const results=[];
for(const name of ['red-berry-vine','plate-13-leaf-and-flower-vine','plate-38-diagonal-meander'])for(const size of [32,33,34]){
  const rect=await evaluate(`(async()=>{const api=await import('/lib/index.js');const resolved=api.resolveOrnament('frame',{design:${JSON.stringify(name)},size:${size},assetsBase:location.origin+'/'});document.body.className='';document.body.innerHTML='';document.body.style.cssText='margin:0;background:#fbf8f2';const frame=document.createElement('div');frame.className=resolved.className;frame.style.cssText='position:absolute;left:40px;top:40px;width:420px;height:240px';for(const [key,value] of Object.entries(resolved.style))frame.style.setProperty(key,value);document.body.append(frame);const image=new Image();image.src=resolved.asset.url;await image.decode();const r=frame.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,border:parseFloat(getComputedStyle(frame).borderTopWidth),source:resolved.asset.path}})()`);
  await pause(50);const shot=await send('Page.captureScreenshot',{captureBeyondViewport:false});
  const file=`frame-joins-${label}-${name}-${size}.png`;
  await writeFile(new URL('../tmp/'+file,import.meta.url),Buffer.from(shot.data,'base64'));
  results.push({name,size,file,dpr,...rect});
}
await writeFile(new URL('../tmp/frame-joins-'+label+'.json',import.meta.url),JSON.stringify(results,null,2));
console.log(`Rendered ${results.length} frame samples at device pixel ratio ${dpr} (full viewport, crop using the recorded bounds).`);ws.close();
