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
await send('Page.navigate',{url:origin+'/examples/demo.html'});
for(let i=0;i<100;i++){if(await evaluate('document.body?.dataset.ready==="true"'))break;await pause(50)}
if(label==='matrix'){
  const catalog=await(await fetch(origin+'/images.json')).json();
  const representatives=['red-berry-vine','interlocking-ribbon','plate-13-leaf-and-flower-vine','plate-36-greek-key'];
  const samples=[];
  for(const name of representatives)for(let size=16;size<=48;size++)samples.push({name,size});
  for(const item of catalog.filter(i=>i.kind==='repeat-tile'&&!representatives.includes(i.name)))samples.push({name:item.name,size:33});
  const frames=samples.map((sample,i)=>({ ...sample,x:20.5+(i%4)*280,y:24.25+Math.floor(i/4)*210,width:250,height:180,
    source:origin+'/'+catalog.find(i=>i.name===sample.name).components.border_image.svg }));
  await evaluate(`(async()=>{document.body.className='';document.body.innerHTML='';document.body.style.background='white';document.body.style.margin='0';const frames=${JSON.stringify(frames)};for(const item of frames){const el=document.createElement('div');el.className='ornament-frame';Object.assign(el.style,{position:'absolute',left:item.x+'px',top:item.y+'px',width:item.width+'px',height:item.height+'px',padding:'0'});el.style.setProperty('--ornament-size',item.size+'px');el.style.setProperty('--ornament-image','url("'+item.source+'")');document.body.append(el)}await Promise.all([...new Set(frames.map(i=>i.source))].map(async url=>{const image=new Image();image.src=url;await image.decode()}));})()`);
  const height=Math.ceil(frames.at(-1).y+frames.at(-1).height+16);
  for(const scale of [1,1.25,2]){
    await send('Emulation.setDeviceMetricsOverride',{width:1200,height:1000,deviceScaleFactor:scale,mobile:false});await pause(100);
    const shot=await send('Page.captureScreenshot',{clip:{x:0,y:0,width:1200,height,scale:1},captureBeyondViewport:true});
    await writeFile(new URL(`../tmp/frame-matrix-${scale}.png`,import.meta.url),Buffer.from(shot.data,'base64'));
  }
  await writeFile(new URL('../tmp/frame-matrix.json',import.meta.url),JSON.stringify({frames,pixelRatios:[1,1.25,2]},null,2));
  console.log(`Rendered ${frames.length*3} frame cases: every demo thickness, every design at 33px, and three pixel ratios.`);ws.close();
  process.exit(0);
}
const results=[];
for(const name of ['red-berry-vine','plate-13-leaf-and-flower-vine','plate-36-greek-key'])for(const size of [32,33,34]){
  const rect=await evaluate(`(async()=>{for(const [id,value] of [['frameDesign',${JSON.stringify(name)}],['thickness',${JSON.stringify(String(size))}]]){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input'))}const frame=document.getElementById('frameExample');const image=new Image();image.src=JSON.parse(getComputedStyle(frame).borderImageSource.slice(4,-1));await image.decode();frame.scrollIntoView({block:'center'});const r=frame.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,border:parseFloat(getComputedStyle(frame).borderTopWidth)}})()`);
  await pause(50);const shot=await send('Page.captureScreenshot',{captureBeyondViewport:false});
  const file=`frame-joins-${label}-${name}-${size}.png`;
  await writeFile(new URL('../tmp/'+file,import.meta.url),Buffer.from(shot.data,'base64'));
  results.push({name,size,file,dpr,...rect});
}
await writeFile(new URL('../tmp/frame-joins-'+label+'.json',import.meta.url),JSON.stringify(results,null,2));
console.log(`Rendered ${results.length} frame samples at device pixel ratio ${dpr} (full viewport, crop using the recorded bounds).`);ws.close();
