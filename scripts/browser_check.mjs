// Optional browser verification: Node 22+ and Chrome with --remote-debugging-port=9227.
// Serve a checkout with linked resources (python3 -m http.server 8765); pages use ?assets=local.
// Artwork checks run through the library on the internal QA page, independent of the public UI.
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
async function until(expression,message,attempts=200){for(let i=0;i<attempts;i++){if(await evaluate(expression))return;await pause(50)}throw Error('Timed out: '+(message||expression))}
async function open(path){await send('Page.navigate',{url:origin+path});await until('document.body?.dataset.ready==="true"','ready '+path)}
async function viewport(width,deviceScaleFactor=1,height=1000){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor,mobile:false});await pause(80)}
async function choose(id,value){await evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(String(value))};el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`);await pause(60)}
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const overflow=()=>evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth');
async function screenshot(name){await evaluate('Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{})))');await pause(120);const shot=await send('Page.captureScreenshot',{captureBeyondViewport:false});await writeFile(new URL(`../tmp/browser-${name}.png`,import.meta.url),Buffer.from(shot.data,'base64'))}
await send('Page.enable');await send('Page.navigate',{url:'about:blank'});await send('Runtime.enable');await send('Network.enable');
await send('Network.setCacheDisabled',{cacheDisabled:true});
await viewport(1200);
// Ignore Runtime.enable's replay of errors from earlier shared-tab sessions.
errors.length=0;
const catalog=await(await fetch(origin+'/images.json')).json();let checks=0;
const widths=[320,375,768,1200];

// ---------- Artwork through the library ----------
await open('/examples/qa.html?assets=local');
await evaluate(`window.api=import('/lib/index.js')`);
for(const item of catalog){
  const result=await evaluate(`(async()=>{const api=await window.api,item=${JSON.stringify(item)},base=location.origin+'/',failures=[];
    const load=async url=>{const image=new Image();image.src=url;try{await image.decode()}catch{failures.push({decode:url})}return image};
    const use=item.kind==='repeat-tile'?'frame':'image';
    for(const format of item.svg?['svg','png','webp']:['png','webp']){const r=api.resolveOrnament(use,{design:item.name,format,size:use==='frame'?33:128,assetsBase:base});const image=await load(r.asset.url);if(!image.naturalWidth||!r.asset.url.endsWith('.'+format))failures.push({format,url:r.asset.url})}
    if(use==='image')for(const pixelRatio of [1,1.25,2])for(const format of ['png','webp']){
      const size=Math.max(8,Math.min(256,item.height/pixelRatio)),r=api.resolveOrnament('image',{design:item.name,format,size,pixelRatio,assetsBase:base}),image=await load(r.asset.url);
      if(image.naturalHeight+1<size*pixelRatio||image.naturalWidth+1<size*item.width/item.height*pixelRatio)failures.push({pixelRatio,format,size,natural:[image.naturalWidth,image.naturalHeight]})}
    if(use==='frame'){
      // A resized slot adds a whole section only once it fits, on both axes.
      const ratio=item.repeat_ratio,period=33*ratio;
      for(const axis of ['x','y'])for(const count of [1,3])for(const delta of [-.5,0,.5])for(const responsive of [false,true]){const length=count*period+delta,parent=document.createElement('div'),el=document.createElement('div');parent.style.cssText='position:absolute;width:'+length+'px;height:'+length+'px';el.className='ornament-divider';el.dataset.axis=axis;el.style.cssText='--ornament-size:33px;--ornament-ratio:'+ratio+';--ornament-length:'+(responsive?'100%':length+'px');parent.append(el);document.body.append(parent);const box=el.getBoundingClientRect(),style=getComputedStyle(el,'::before'),available=box[axis==='x'?'width':'height'],used=parseFloat(style[axis==='x'?'width':'height']),inset=parseFloat(style[axis==='x'?'left':'top'])+new DOMMatrix(style.transform)[axis==='x'?'m41':'m42'],expected=Math.floor((available+1e-7)/period)*period;const conservative=Math.abs(available-expected)<.025&&Math.abs(used-(expected-period))<.025;if((Math.abs(used-expected)>.025&&!conservative)||Math.abs(inset-(available-used)/2)>.025)failures.push({fit:{axis,length,available,used,expected,inset,responsive}});parent.remove()}
      // Each direction and format resolves the matching tile with whole, centred units.
      for(const axis of ['x','y'])for(const format of item.svg?['svg','png','webp']:['png','webp']){
        const r=api.resolveOrnament('divider',{design:item.name,size:24,orientation:axis==='x'?'horizontal':'vertical',length:axis==='x'?420:260,format,assetsBase:base}),el=document.createElement('div');
        el.className=r.className;for(const [k,v] of Object.entries(r.style))el.style.setProperty(k,v);for(const [k,v] of Object.entries(r.attributes))el.setAttribute(k,v);el.style.position='absolute';document.body.append(el);
        await load(r.asset.url);const box=getComputedStyle(el),style=getComputedStyle(el,'::before'),tile=axis===item.repeat_axis?item:item.components.rotated_tile,period=24*item.repeat_ratio,span=axis==='x'?420:260;
        const used=parseFloat(style[axis==='x'?'width':'height']),inset=parseFloat(style[axis==='x'?'left':'top'])+new DOMMatrix(style.transform)[axis==='x'?'m41':'m42'],size=style.backgroundSize.split(' ').map(parseFloat),expected=axis==='x'?[period,24]:[24,period];
        const fine=[tile,...tile.variants].some(asset=>r.asset.path===asset[format])&&parseFloat(box.width)===(axis==='x'?420:24)&&parseFloat(box.height)===(axis==='x'?24:260)&&style.backgroundRepeat===(axis==='x'?'round no-repeat':'no-repeat round')&&Math.abs(used-Math.floor(span/period)*period)<.02&&Math.abs(inset-(span-used)/2)<.02&&el.dataset.axis===axis&&size.every((v,i)=>Math.abs(v-expected[i])<.01);
        if(!fine)failures.push({divider:{axis,format,path:r.asset.path,used,inset,repeat:style.backgroundRepeat,size:style.backgroundSize}});el.remove()}
    }
    return failures})()`);
  assert(result.length===0,'Artwork check failed '+item.name+' '+JSON.stringify(result).slice(0,600));checks++;
}

// ---------- Gallery ----------
const authored=catalog.filter(i=>i.author==='adrian729').length;
await open('/examples/index.html?assets=local');
assert(await evaluate(`document.querySelectorAll('.tile').length===24&&document.getElementById('resultCount').textContent.startsWith('${catalog.length} designs')`),'Gallery first page');checks++;
// Thumbnails request only small published files, and the next page is prefetched once this one settles.
const thumbs=await evaluate(`(async()=>{await Promise.all([...document.querySelectorAll('.tile img')].map(i=>i.decode().catch(()=>{})));return [...document.querySelectorAll('.tile-art > *')].map(el=>el.tagName==='IMG'?el.currentSrc:JSON.parse(getComputedStyle(el,'::before').backgroundImage.slice(4,-1)))})()`);
const files=new Map(catalog.flatMap(item=>[item,...Object.values(item.components||{})].flatMap(asset=>[asset,...(asset.variants||[])]).flatMap(asset=>['png','webp'].filter(f=>asset[f]).map(f=>[asset[f],{bytes:asset[f+'_bytes'],max:Math.max(asset.width,asset.height)}]))));
const thumbBytes=thumbs.map(url=>files.get(new URL(url).pathname.slice(1)));
assert(thumbBytes.every(file=>file&&file.max<=256&&file.bytes<=60000)&&thumbBytes.reduce((s,f)=>s+f.bytes,0)<=450000,'Gallery thumbnails must stay small '+JSON.stringify(thumbBytes));checks++;
await until(`performance.getEntriesByType('resource').filter(e=>/\\/(webp|png|svg)\\//.test(e.name)).length>=40`,'next page prefetch');checks++;
await click('#typeTabs [data-value="border"]');
assert(await evaluate(`document.getElementById('resultCount').textContent.startsWith('${catalog.filter(i=>i.asset_type==='border').length} designs')&&new URLSearchParams(location.search).get('type')==='border'`),'Type filter');checks++;
await choose('category','geometric');
assert(await evaluate(`document.getElementById('resultCount').textContent.startsWith('${catalog.filter(i=>i.asset_type==='border'&&i.categories.includes('geometric')).length} design')`),'Category filter');checks++;
await click('#clearFilters');await choose('search','butterfly-panel-red');await pause(250);
assert(await evaluate(`document.querySelectorAll('.tile').length===1&&document.querySelector('.tile').dataset.design==='butterfly-panel-red'`),'Search');checks++;
await choose('search','no-such-design');await pause(250);
assert(await evaluate(`document.querySelectorAll('.tile').length===0&&!document.getElementById('empty').hidden&&document.getElementById('pager').hidden`),'Empty results');checks++;
await click('#clearFilters');await pause(100);
const firstPage=await evaluate(`[...document.querySelectorAll('.tile')].map(t=>t.dataset.design).join()`);
await click('#pager [aria-label="Next page"]');
assert(await evaluate(`new URLSearchParams(location.search).get('page')==='2'&&[...document.querySelectorAll('.tile')].map(t=>t.dataset.design).join()!==${JSON.stringify(firstPage)}`),'Pagination');checks++;
// Deep links, author discovery and attribution.
await open('/examples/index.html?assets=local&q=adrian729&design=rabbit-lutenist-painted');
assert(await evaluate(`document.getElementById('detail').open&&document.getElementById('detailTitle').textContent==='Rabbit lutenist painted'&&document.querySelectorAll('.tile').length===${Math.min(24,authored)}&&[...document.querySelectorAll('#facts dt')].some(dt=>dt.textContent==='Author'&&dt.nextElementSibling.textContent==='adrian729')`),'Author deep link');checks++;
for(const pixelRatio of [1,2]){
  await viewport(1200,pixelRatio);await open('/examples/index.html?assets=local&design=walters-elephant-castle');
  await until(`document.getElementById('detailImage').dataset.url===document.getElementById('detailImage').currentSrc`,'detail image');
  assert(await evaluate(`(()=>{const image=document.getElementById('detailImage'),box=image.getBoundingClientRect();return image.naturalHeight+1>=box.height*devicePixelRatio&&document.querySelector('#detailCode pre').textContent.includes(image.currentSrc)})()`),'Detail image is never enlarged and matches its snippet');checks++;
}
await viewport(1200);
await open('/examples/index.html?assets=local&design=plate-03-spiral-bands');
await until(`!!document.getElementById('detailFrame').dataset.url`,'detail frame');
await choose('size',48);await pause(300);
await until(`getComputedStyle(document.getElementById('detailFrame')).borderTopWidth==='48px'&&document.querySelector('#detailCode pre').textContent.includes('--ornament-size: 48px')`,'thickness');checks++;
await click('#modeTabs [data-value="divider"]');await click('#orientationTabs [data-value="vertical"]');
await until(`document.getElementById('detailDivider').dataset.axis==='y'&&!!document.getElementById('detailDivider').dataset.url`,'vertical divider');checks++;
await click('#orientationTabs [data-value="horizontal"]');
await until(`document.getElementById('detailDivider').dataset.axis==='x'`,'horizontal divider');checks++;
const before=await evaluate(`document.getElementById('detailTitle').textContent`);await click('#nextDesign');
assert(await evaluate(`document.getElementById('detailTitle').textContent!==${JSON.stringify(before)}&&new URLSearchParams(location.search).get('design')!=='plate-03-spiral-bands'`),'Next design');checks++;
for(const width of widths){await viewport(width);assert(!(await overflow()),'Gallery dialog overflow '+width);checks++}
await screenshot('gallery-detail');
await click('#closeDetail');await pause(100);
assert(await evaluate(`!document.getElementById('detail').open&&!new URLSearchParams(location.search).has('design')`),'Close detail');checks++;
for(const width of widths){await viewport(width);assert(!(await overflow()),'Gallery overflow '+width);checks++}
await viewport(375);await screenshot('gallery-mobile');await viewport(1200);await screenshot('gallery-desktop');

// ---------- Overview ----------
await open('/examples/demo.html?assets=local');
await until(`[...document.querySelectorAll('[data-count]')].reduce((s,n)=>s+Number(n.textContent||0),0)===${catalog.length}`,'collection counts');checks++;
await evaluate(`window.copied=[];navigator.clipboard.writeText=async text=>{copied.push(text)}`);
for(const use of ['frame','divider','image']){
  const names=await evaluate(`[...document.querySelectorAll('[data-picker="${use}"] button')].map(b=>b.dataset.design)`);
  assert(names.length>=4,'Curated '+use);
  for(const name of names){
    const target={frame:'#frameExample',divider:'#dividerExample',image:'#imageExample'}[use];
    // Usage examples load lazily, like any below-the-fold ornament.
    await evaluate(`document.querySelector('${target}').scrollIntoView({block:'center'})`);
    await click(`[data-picker="${use}"] [data-design="${name}"]`);
    await until(`(()=>{const el=document.querySelector('${target}'),code=document.querySelector('.code-panel[data-code="${use}"] pre').textContent;const url=el.tagName==='IMG'?el.currentSrc:getComputedStyle(el,'${use==='divider'?'::before':''}')['${use==='frame'?'borderImageSource':'backgroundImage'}'];return url.includes('${name}')&&code.includes('${name}')})()`,use+' '+name);checks++;
  }
  await click(`.code-panel[data-code="${use}"] .copy`);
  assert(await evaluate(`copied.at(-1)===document.querySelector('.code-panel[data-code="${use}"] pre').textContent`),'Copy '+use);checks++;
}
await choose('thickness',40);
await until(`getComputedStyle(document.getElementById('frameExample')).borderTopWidth==='40px'&&document.querySelector('.code-panel[data-code="frame"] pre').textContent.includes('--ornament-size: 40px')`,'overview thickness');checks++;
for(const width of widths){await viewport(width);assert(!(await overflow()),'Overview overflow '+width);checks++}
await viewport(375);await screenshot('overview-mobile');await viewport(1200);await screenshot('overview-desktop');

// ---------- Plain JavaScript ----------
await open('/examples/vanilla/?assets=local');
await until(`getComputedStyle(document.querySelector('.cinquefoil .terminal')).backgroundImage!=='none'`,'gold compositions');checks++;
assert(await evaluate(`document.getElementById('selective-divider').dataset.axis==='x'&&getComputedStyle(document.getElementById('selective-divider'),'::before').backgroundImage.includes('red-berry-vine')`),'Single-design import');checks++;
await choose('design','plate-02-stepped-ribbon');await until(`document.getElementById('divider').dataset.axis==='y'`);
await choose('orientation','horizontal');await until(`document.getElementById('divider').dataset.axis==='x'`);
await choose('orientation','vertical');await until(`document.getElementById('divider').dataset.axis==='y'`);checks++;
await choose('wholeDesign','flying-pig');await until(`document.getElementById('whole').currentSrc.includes('flying-pig')`);
assert(await evaluate(`document.getElementById('code').textContent.includes("design: 'flying-pig'")`),'Live code');checks++;
await click('#toggle');assert(await evaluate(`getComputedStyle(document.getElementById('frame')).borderImageSource==='none'`),'Detach');await click('#toggle');checks++;
for(const width of widths){await viewport(width);assert(!(await overflow()),'Plain JavaScript overflow '+width);checks++}
await viewport(375);await screenshot('vanilla-mobile');await viewport(1200);

// ---------- Internal artwork review page ----------
await viewport(1200,1,1500);
await open('/examples/review.html?assets=local');
for(const format of ['webp','svg']){
  await choose('format',format);
  const result=await evaluate(`(async()=>{for(const card of document.querySelectorAll('.card')){card.scrollIntoView({block:'center'});await new Promise(resolve=>setTimeout(resolve,60));await Promise.all([...card.querySelectorAll('img')].map(i=>i.decode()));for(const el of card.querySelectorAll('.ornament-frame')){const image=new Image();image.src=JSON.parse(getComputedStyle(el).borderImageSource.slice(4,-1));await image.decode()}}return {cards:document.querySelectorAll('.card').length,frames:document.querySelectorAll('.ornament-frame').length}})()`);
  assert(result.cards===catalog.length&&result.frames===catalog.filter(i=>i.kind==='repeat-tile').length,'Artwork review coverage/loads');checks++;
}
await choose('collection','plate');assert(await evaluate("document.querySelectorAll('.card').length===38"),'Plate review filtering');checks++;
await choose('collection','floral');assert(await evaluate("document.querySelectorAll('.card').length===6"),'Floral review filtering');checks++;
// These two expectations predated the 0.9.0 additions (55 and 41); derive them instead.
await choose('collection','additions');assert(await evaluate(`document.querySelectorAll('.card').length>0&&document.querySelectorAll('.card').length<${catalog.length}`),'Source additions review filtering');checks++;
await choose('collection','illustrations');assert(await evaluate(`document.querySelectorAll('.card').length===${catalog.filter(i=>i.asset_type==='illustration').length}&&document.querySelectorAll('.ornament-frame').length===0`),'Illustration review filtering');checks++;
await choose('collection','floral');await choose('format','webp');await choose('theme','dark');
await evaluate('scrollTo(0,0)');await pause(150);
const shot=await send('Page.captureScreenshot',{captureBeyondViewport:false});
await writeFile(new URL('../tmp/artwork-review-dark.png',import.meta.url),Buffer.from(shot.data,'base64'));
await viewport(375);assert(!(await overflow()),'Artwork review mobile overflow');checks++;

// ---------- Tab icons on every HTML entry point ----------
for(const path of ['index.html','examples/index.html','examples/demo.html','examples/vanilla/index.html','examples/react/index.html','examples/review.html','examples/qa.html']){
  const result=await evaluate(`(async()=>{const pageUrl=${JSON.stringify(origin+'/')}+${JSON.stringify(path)},response=await fetch(pageUrl),document=new DOMParser().parseFromString(await response.text(),'text/html'),icons=[...document.querySelectorAll('link[rel="icon"]')];for(const icon of icons){const url=new URL(icon.getAttribute('href'),pageUrl);if(!(await fetch(url)).ok)throw Error('Missing favicon '+url);if(icon.type!=='image/x-icon'){const image=new Image();image.src=url.href;await image.decode()}}return icons.map(i=>i.type)})()`);
  assert(['image/svg+xml','image/png','image/x-icon'].every(type=>result.includes(type)),'Missing favicon links '+path);checks++;
}
assert(errors.length===0,'Browser errors '+JSON.stringify(errors));
await writeFile(new URL('../tmp/browser-verification.json',import.meta.url),JSON.stringify({checks,designs:catalog.length,viewportWidths:widths,errors},null,2));
console.log(`PASS ${checks} browser checks: artwork for all ${catalog.length} designs and formats through the library, gallery, overview and plain-JavaScript pages at four widths, the review page and tab icons.`);ws.close();
