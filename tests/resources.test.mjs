import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, cp, copyFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assetCatalog, assetPaths } from '../scripts/package-assets.mjs';
import { registry, resourceLock, manifest, digest, validateResources, resourceFile, cdnBase, sourceId } from '../scripts/resource-store.mjs';
const exec=promisify(execFile),root=fileURLToPath(new URL('../',import.meta.url));
const json=value=>JSON.stringify(value,null,2)+'\n';
async function temporary(t){const directory=await mkdtemp(path.join(tmpdir(),'ornament-resources-'));t.after(()=>rm(directory,{recursive:true,force:true}));return directory;}

test('resource registry owns each public path and keeps descriptive metadata central',async()=>{
  const items=await assetCatalog(), {config,lock}=validateResources(items);
  const reunited={};for(const id of Object.keys(config.sources))for(const [relative,file]of Object.entries(manifest(id).files))reunited[relative]=file;
  assert.deepEqual(Object.keys(reunited).sort(),assetPaths(items));
  assert.equal(Object.keys(config.assignments).length,items.length);
  const changed=structuredClone(items);changed[0].description+=' More selection detail.';changed[0].subjects.push('factual-subject');changed[0].author='adrian729';
  validateResources(changed);
  changed[0].width++;
  assert.throws(()=>validateResources(changed),/capabilities/);
  assert.ok(Object.keys(lock.sources).length>=3);
});

test('a further border resource routes by assignment without changing names or geometry',async t=>{
  const directory=await temporary(t);
  for(const folder of ['lib','resources'])await cp(path.join(root,folder),path.join(directory,folder),{recursive:true});
  await mkdir(path.join(directory,'scripts'));
  for(const name of ['build-library.mjs','package-assets.mjs','resource-store.mjs','resources.mjs','scaffold-resource.mjs','pack-resource.mjs'])await copyFile(path.join(root,'scripts',name),path.join(directory,'scripts',name));
  for(const name of ['package.json','images.json','assets-manifest.json','resource-registry.json','resource-lock.json'])await copyFile(path.join(root,name),path.join(directory,name));
  const config=registry(),lock=resourceLock(),name='rosselli-mask-border',owner=config.assignments[name],first=manifest(owner);
  const sequence=Math.max(...Object.values(config.sources).filter(s=>s.collection==='borders').map(s=>s.sequence))+1,id=sourceId('borders',sequence);
  const chosen=first.designs[name], paths=new Set(assetPaths([chosen]));
  const inputs=Object.fromEntries(Object.entries(first.inputs).filter(([p])=>[name,name+'-corner',name+'-border'].includes(path.basename(p,'.png'))));
  assert.equal(Object.keys(inputs).length,3,'Migration carries the repeat, edited corners and retained editor output');
  const next={schemaVersion:2,id,collection:'borders',package:'@ranx729/medieval-ornaments-assets-'+id,version:'0.1.0',designs:{[name]:chosen},files:Object.fromEntries(Object.entries(first.files).filter(([p])=>paths.has(p))),inputs};
  config.sources[owner].retainedDesigns=[name];
  config.sources[config.collections.borders.activeSource].state='sealed';config.sources[id]={id,collection:'borders',sequence,state:'open',repository:'adrian729/medieval-ornaments-assets-'+id,package:next.package};config.collections.borders.activeSource=id;config.assignments[name]=id;
  for(const data of [first,next]){const content=json(data);await writeFile(path.join(directory,'resources/manifests',data.id+'.json'),content);lock.sources[data.id]={version:data.version,gitCommit:null,manifestSha256:digest(content),filesSha256:digest(data.files)};}
  await writeFile(path.join(directory,'resource-registry.json'),json(config));await writeFile(path.join(directory,'resource-lock.json'),json(lock));
  await assert.rejects(exec(process.execPath,['scripts/resources.mjs','assign','--design','red-berry-vine-corner','--collection','borders','--bytes','1'],{cwd:directory}),/collide with an existing resource/);
  assert.equal(await readFile(path.join(directory,'resource-registry.json'),'utf8'),json(config));
  await exec(process.execPath,['scripts/build-library.mjs'],{cwd:directory});
  const api=await import(pathToFileURL(path.join(directory,'lib/designs',name+'.js')));
  assert.ok(api.resolveOrnament('frame').asset.url.startsWith(cdnBase(next.package,'0.1.0')));
  assert.equal(api.ornament.name,name);
  const source=await readFile(path.join(directory,'lib/designs',name+'.js'),'utf8');assert.ok(source.includes('asset-sources/'+id));assert.ok(!source.includes('asset-routing'));
});

test('numbered offline packages copy selected files and protect installed sources',async t=>{
  const directory=await temporary(t),id='borders-001',source=registry().sources[id],pin=resourceLock().sources[id],target=path.join(directory,'node_modules',source.package);
  await mkdir(target,{recursive:true});await writeFile(path.join(directory,'package.json'),'{"type":"module"}');
  await writeFile(path.join(target,'package.json'),json({name:source.package,version:pin.version,exports:{'./package.json':'./package.json'}}));
  await copyFile(path.join(root,'resources/manifests',id+'.json'),path.join(target,'resource-manifest.json'));
  const item=(await assetCatalog()).find(item=>item.name==='red-berry-vine');
  for(const relative of assetPaths([item]).filter(p=>p.endsWith('.svg'))){await mkdir(path.dirname(path.join(target,relative)),{recursive:true});await copyFile(resourceFile(relative),path.join(target,relative));}
  const destination=path.join(directory,'public'),cli=path.join(root,'lib/cli.js');
  await exec(process.execPath,[cli,'copy-assets',destination,'--design',item.name,'--format','svg','--offline'],{cwd:directory});
  const files=await readdir(path.join(destination,'svg'));assert.equal(files.length,4);assert.ok(!files.some(file=>file.includes('flying-pig')));
  await assert.rejects(exec(process.execPath,[cli,'copy-assets',path.join(target,'nested'),'--design',item.name,'--offline'],{cwd:directory}),/outside the package/);
  const data=JSON.parse(await readFile(path.join(target,'resource-manifest.json')));data.version='99.0.0';await writeFile(path.join(target,'resource-manifest.json'),json(data));
  await assert.rejects(exec(process.execPath,[cli,'copy-assets',destination,'--design',item.name,'--format','svg','--offline'],{cwd:directory}),/manifest does not match pinned/);
});

test('an older compatible-archive identity cannot conceal newer resource files',async t=>{
  const directory=await temporary(t);await cp(path.join(root,'lib'),path.join(directory,'lib'),{recursive:true});
  await writeFile(path.join(directory,'package.json'),'{"type":"module"}');
  const legacy=path.join(directory,'node_modules/@ranx729/medieval-ornaments-assets');await mkdir(legacy,{recursive:true});
  await writeFile(path.join(legacy,'package.json'),json({name:'@ranx729/medieval-ornaments-assets',version:'0.4.0',exports:{'./package.json':'./package.json'}}));
  await copyFile(path.join(root,'assets-manifest.json'),path.join(legacy,'assets-manifest.json'));
  // Simulate a later independent border snapshot while the optional legacy
  // archive pin stays unchanged. Offline preflight must reject it before mkdir.
  const pinFile=path.join(directory,'lib/asset-sources/borders-001.js');
  const source=await readFile(pinFile,'utf8');await writeFile(pinFile,source.replace(/"(?:activeFilesSha256|legacyFilesSha256)":"[a-f0-9]+"/g,match=>match.replace(/[a-f0-9]{64}/,'0'.repeat(64))));
  const destination=path.join(directory,'public');
  await assert.rejects(exec(process.execPath,['lib/cli.js','copy-assets',destination,'--design','red-berry-vine','--offline'],{cwd:directory}),/Offline artwork not found/);
  await assert.rejects(readdir(destination),{code:'ENOENT'});
});

test('historical and authored artwork installs offline from numbered packages with its attribution',async t=>{
  const directory=await temporary(t),items=await assetCatalog();
  const selected=['isabella-pink-rose','rosselli-roundel-top','ivy-corner','choirbook-and-ivy'].map(name=>items.find(item=>item.name===name));
  const config=registry(),lock=resourceLock();
  await writeFile(path.join(directory,'package.json'),'{"type":"module"}');
  for(const item of selected){
    const id=config.assignments[item.name],source=config.sources[id],target=path.join(directory,'node_modules',source.package);
    await mkdir(target,{recursive:true});
    await writeFile(path.join(target,'package.json'),json({name:source.package,version:lock.sources[id].version,exports:{'./package.json':'./package.json'}}));
    await copyFile(path.join(root,'resources/manifests',id+'.json'),path.join(target,'resource-manifest.json'));
    for(const relative of assetPaths([item]).filter(p=>p.endsWith('.png'))){
      await mkdir(path.dirname(path.join(target,relative)),{recursive:true});
      await copyFile(resourceFile(relative),path.join(target,relative));
    }
  }
  const out=path.join(directory,'src'),assets=path.join(directory,'public');
  await exec(process.execPath,[path.join(root,'lib/cli.js'),'add',...selected.map(item=>item.name),'--framework','vanilla','--format','png','--out',out,'--assets',assets,'--assets-base','/historical/','--offline'],{cwd:directory});
  for(const item of selected){
    const api=await import(pathToFileURL(path.join(out,item.name+'.js')));
    assert.deepEqual(api.ornament.provenance,item.provenance);
    assert.equal(api.ornament.author,item.author);
    assert.deepEqual(api.ornament.formats,['png']);
    const resolved=api.resolveOrnament('image',{size:128});
    assert.ok(resolved.asset.url.startsWith('/historical/png/'));
    assert.deepEqual(await readFile(path.join(assets,item.png)),await readFile(resourceFile(item.png)));
  }
  assert.ok(!(await readdir(path.join(assets,'png'))).some(name=>name==='flying-pig.png'));
});

test('resource tarballs list default delivery files before optional alternatives',async()=>{
  const { deliveryOrder } = await import('../scripts/pack-resource.mjs');
  const vector={derivation:'vector-reconstruction',svg:'svg/vine.svg',png:'png/vine.png',webp:'webp/vine.webp',variants:[],components:{}};
  const traced={derivation:'source-crop-and-color-trace',svg:'svg/plate.svg',png:'png/plate.png',webp:'webp/plate.webp',variants:[{png:'png/128/plate.png',webp:'webp/128/plate.webp'}],components:{}};
  const files=['svg/plate.svg','png/plate.png','png/128/plate.png','webp/plate.webp','svg/vine.svg','webp/128/plate.webp','png/vine.png','webp/vine.webp'];
  assert.deepEqual(deliveryOrder(files,{vine:vector,plate:traced}),['webp/128/plate.webp','webp/plate.webp','webp/vine.webp','svg/vine.svg','png/128/plate.png','png/plate.png','png/vine.png','svg/plate.svg']);
  for(const id of Object.keys(registry().sources)){const files=manifest(id).files;assert.ok(Object.values(files).reduce((sum,file)=>sum+file.bytes,0)<=registry().policy.maxNpmUnpackedBytes,`${id} fits the CDN package limit`);}
});

test('publishing waits until the CDN serves every approved file',async t=>{
  const { warmCdn } = await import('../scripts/warm-cdn.mjs');
  const directory=await temporary(t),good=Buffer.from('approved'),{createHash}=await import('node:crypto');
  await writeFile(path.join(directory,'package.json'),json({name:'@ranx729/example',version:'1.0.0'}));
  await writeFile(path.join(directory,'resource-manifest.json'),json({files:{'webp/a.webp':{bytes:good.length,sha256:createHash('sha256').update(good).digest('hex')}}}));
  const original=globalThis.fetch;t.after(()=>{globalThis.fetch=original});
  let attempts=0,body=good;
  globalThis.fetch=async url=>url.startsWith('https://registry.npmjs.org/')?new Response('{}',{status:200}):++attempts===1?new Response('',{status:404}):new Response(body);
  assert.deepEqual(await warmCdn(directory,{log:()=>{}}),{base:'https://cdn.jsdelivr.net/npm/@ranx729/example@1.0.0/',files:1});
  assert.equal(attempts,2,'A transient 404 is retried');
  body=Buffer.from('tampered');attempts=1;
  await assert.rejects(warmCdn(directory,{deadlineMinutes:0,log:()=>{}}),/served 0\/1 files with approved bytes/);
});
