import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, cp, copyFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assetCatalog, assetPaths } from '../scripts/package-assets.mjs';
import { registry, resourceLock, manifest, digest, validateResources, resourceFile } from '../scripts/resource-store.mjs';
const exec=promisify(execFile),root=fileURLToPath(new URL('../',import.meta.url));
const json=value=>JSON.stringify(value,null,2)+'\n';
async function temporary(t){const directory=await mkdtemp(path.join(tmpdir(),'ornament-resources-'));t.after(()=>rm(directory,{recursive:true,force:true}));return directory;}

test('resource registry owns each public path and keeps descriptive metadata central',async()=>{
  const items=await assetCatalog(), {config,lock}=validateResources(items);
  const reunited={};for(const id of Object.keys(config.sources))for(const [relative,file]of Object.entries(manifest(id).files))reunited[relative]=file;
  assert.deepEqual(Object.keys(reunited).sort(),assetPaths(items));
  assert.equal(Object.keys(config.assignments).length,items.length);
  const changed=structuredClone(items);changed[0].description+=' More selection detail.';changed[0].subjects.push('factual-subject');
  validateResources(changed);
  changed[0].width++;
  assert.throws(()=>validateResources(changed),/capabilities/);
  assert.ok(Object.keys(lock.sources).length>=3);
});

test('a second border resource routes by assignment without changing names or geometry',async t=>{
  const directory=await temporary(t);
  for(const folder of ['lib','resources'])await cp(path.join(root,folder),path.join(directory,folder),{recursive:true});
  await mkdir(path.join(directory,'scripts'));
  for(const name of ['build-library.mjs','package-assets.mjs','resource-store.mjs','resources.mjs','scaffold-resource.mjs'])await copyFile(path.join(root,'scripts',name),path.join(directory,'scripts',name));
  for(const name of ['package.json','images.json','assets-manifest.json','resource-registry.json','resource-lock.json'])await copyFile(path.join(root,name),path.join(directory,name));
  const config=registry(),lock=resourceLock(),id='borders-002',name='red-berry-vine',first=manifest('borders-001');
  const chosen=first.designs[name], paths=new Set(assetPaths([chosen]));
  const next={schemaVersion:2,id,collection:'borders',package:'@ranx729/medieval-ornaments-assets-borders-002',version:'0.1.0',designs:{[name]:chosen},files:Object.fromEntries(Object.entries(first.files).filter(([p])=>paths.has(p))),inputs:{}};
  config.sources['borders-001'].retainedDesigns=[name];
  config.sources['borders-001'].state='sealed';config.sources[id]={id,collection:'borders',sequence:2,state:'open',repository:'adrian729/medieval-ornaments-assets-borders-002',package:next.package};config.collections.borders.activeSource=id;config.assignments[name]=id;
  for(const data of [first,next]){const content=json(data);await writeFile(path.join(directory,'resources/manifests',data.id+'.json'),content);lock.sources[data.id]={version:data.version,gitCommit:null,manifestSha256:digest(content),filesSha256:digest(data.files)};}
  await writeFile(path.join(directory,'resource-registry.json'),json(config));await writeFile(path.join(directory,'resource-lock.json'),json(lock));
  await assert.rejects(exec(process.execPath,['scripts/resources.mjs','assign','--design','red-berry-vine-corner','--collection','borders','--bytes','1'],{cwd:directory}),/collide with an existing resource/);
  assert.equal(await readFile(path.join(directory,'resource-registry.json'),'utf8'),json(config));
  await exec(process.execPath,['scripts/build-library.mjs'],{cwd:directory});
  const api=await import(pathToFileURL(path.join(directory,'lib/designs',name+'.js')));
  assert.ok(api.resolveOrnament('frame').asset.url.startsWith('https://unpkg.com/'+next.package+'@0.1.0/'));
  assert.equal(api.ornament.name,name);
  const source=await readFile(path.join(directory,'lib/designs',name+'.js'),'utf8');assert.ok(source.includes('asset-sources/borders-002'));assert.ok(!source.includes('asset-routing'));
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
  const data=JSON.parse(await readFile(path.join(target,'resource-manifest.json')));data.version='0.2.0';await writeFile(path.join(target,'resource-manifest.json'),json(data));
  await assert.rejects(exec(process.execPath,[cli,'copy-assets',destination,'--design',item.name,'--format','svg','--offline'],{cwd:directory}),/manifest does not match pinned/);
});
