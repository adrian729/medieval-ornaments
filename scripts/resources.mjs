#!/usr/bin/env node
// Main-repository resource orchestration. No consumer install/build hooks.
import { readFile, writeFile, mkdir, copyFile, lstat, symlink, rm, readdir, stat } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { assetCatalog, assetPaths, catalogBytes } from './package-assets.mjs';
import { projectRoot, registry, resourceLock, manifest, resourceDirectory, sourceId, repositoryName, packageName, capabilities, designPaths, validateResources, digest, stable, checkedRelative } from './resource-store.mjs';
import { scaffold } from './scaffold-resource.mjs';
import { packResource } from './pack-resource.mjs';
const exec = promisify(execFile), json = value => JSON.stringify(value,null,2)+'\n';
const help = `npm run resources -- <command> [options]
  status | check [--verify-files]
  pack --source borders-001
  plan --collection borders --bytes 12345 [--design existing-name]
  fetch [--all | --source borders-001 | --design red-berry-vine]
  link [--all | --source borders-001 | --design red-berry-vine]
  assign --design new-name --collection borders --bytes 12345
  migrate --design existing-name --source borders-002
  release --design migrated-name
  approve --source borders-001 --version 0.2.0
  lock --source borders-001
  scaffold --source borders-001 --tooling-ref <main-commit>
  audit-history --source borders-001
  new --collection borders [--asset-type border]
Checkout/update commands refuse dirty repositories. New/assign/approve change
local registry or resource files; they never publish automatically. Publish
reviewed resource packages before adopting their exact locks in a main release.`;
const args=process.argv.slice(2), command=args.shift(), options={};
for(let i=0;i<args.length;i++) {
  const key=args[i];if(!key.startsWith('--'))throw Error(help);
  if(['--all','--verify-files'].includes(key))options[key.slice(2)]=true;
  else { const value=args[++i];if(!value||value.startsWith('--'))throw Error(help);options[key.slice(2)]=value; }
}
const items=await assetCatalog(), config=registry(), lock=resourceLock();
const saveConfig=()=>writeFile(path.join(projectRoot,'resource-registry.json'),json(config));
const saveLock=()=>writeFile(path.join(projectRoot,'resource-lock.json'),json(lock));
const selectedIds=()=>options.design ? [config.assignments[options.design]||(()=>{throw Error(`Unknown assignment: ${options.design}`)})()] : options.source ? [options.source] : options.all ? Object.keys(config.sources) : (()=>{throw Error('Select --all, --source or --design.');})();
const sourceInfo=id=>config.sources[id]||(()=>{throw Error(`Unknown resource: ${id}`)})();
const inventory=id=>({...manifest(id).files,...manifest(id).inputs});
const designStems=name=>[name,...['-border','-corner','-rotated','-reference'].map(suffix=>name+suffix)];
const belongsToDesign=(relative,name)=>designStems(name).includes(path.basename(relative).replace(/\.[^.]+$/,''));
const size=id=>Object.values(inventory(id)).reduce((sum,file)=>sum+file.bytes,0);
async function fileDigest(file) {const hash=createHash('sha256');let bytes=0;for await(const chunk of createReadStream(file)){bytes+=chunk.length;hash.update(chunk);}return {bytes,sha256:hash.digest('hex')};}
async function checkFiles(id) {for(const [relative,expected]of Object.entries(inventory(id))){const actual=await fileDigest(path.join(resourceDirectory(id),relative));if(actual.bytes!==expected.bytes||actual.sha256!==expected.sha256)throw Error(`Unapproved resource bytes: ${id}/${relative}`);}}
async function git(id,...args){return (await exec('git',args,{cwd:resourceDirectory(id),maxBuffer:8*1024*1024})).stdout.trim();}
async function clean(id){if((await git(id,'status','--porcelain')))throw Error(`Resource has uncommitted work; refusing to update/lock: ${id}`);}
function footprint(value) {const n=Number(value);if(!Number.isSafeInteger(n)||n<0)throw Error('--bytes must be the complete nonnegative integer footprint.');return n;}
function placement(collection,bytes,name) {
  const family=config.collections[collection];if(!family)throw Error(`Unknown collection: ${collection}`);
  const existing=name&&config.assignments[name],id=existing||family.activeSource,source=sourceInfo(id);
  if(source.collection!==collection)throw Error('Explicit migration is required to change a design collection.');
  const limit=existing?config.policy.maxTrackedBytes:config.policy.newDesignTrackedBytes;
  const fits=source.state!=='archived'&&(existing||source.state==='open')&&size(id)+bytes<=limit;
  const next=Math.max(...Object.values(config.sources).filter(s=>s.collection===collection).map(s=>s.sequence))+1;
  return {collection,design:name||null,source:id,currentBytes:size(id),additionalBytes:bytes,projectedBytes:size(id)+bytes,limitBytes:limit,fits,nextSource:fits?id:sourceId(collection,next)};
}
async function linkFiles(id,paths) {
  for(const relative of paths){checkedRelative(relative);const target=path.join(resourceDirectory(id),relative),alias=path.join(projectRoot,relative);
    if(!existsSync(target))throw Error(`Fetch the required input first: ${id}/${relative}`);
    await mkdir(path.dirname(alias),{recursive:true});
    try{const status=await lstat(alias);if(!status.isSymbolicLink())throw Error(`Refusing to replace a regular file with a checkout link: ${relative}`);await rm(alias);}catch(error){if(error.code!=='ENOENT')throw error;}
    await symlink(path.relative(path.dirname(alias),target),alias,'file');
  }
}
if(!command||command==='--help'){console.log(help);}
else if(command==='status'||command==='check') {
  validateResources(items);
  for(const id of Object.keys(config.sources)) {const source=sourceInfo(id);console.log(json({id,state:source.state,bytes:size(id),warning:size(id)>=config.policy.warnTrackedBytes,designs:Object.values(config.assignments).filter(v=>v===id).length,version:lock.sources[id].version,gitCommit:lock.sources[id].gitCommit}));if(options['verify-files'])await checkFiles(id);}
} else if(command==='plan') console.log(json(placement(options.collection,footprint(options.bytes),options.design)));
else if(command==='assign') {
  const name=options.design;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name||'')||config.assignments[name])throw Error('assign requires a new unique lowercase kebab-case design name.');
  const stems=new Set([name,...['-border','-corner','-rotated','-reference'].map(suffix=>name+suffix)]);
  for(const id of Object.keys(config.sources))for(const relative of Object.keys(inventory(id)))if(stems.has(path.basename(relative).replace(/\.[^.]+$/,'')))throw Error('Design output would collide with an existing resource: '+relative);
  const result=placement(options.collection,footprint(options.bytes),name);if(!result.fits)throw Error(`Provision ${result.nextSource} before assigning this design.`);
  config.assignments[name]=result.source;await saveConfig();console.log(json(result));
} else if(command==='fetch'||command==='link') {
  for(const id of selectedIds()){const source=sourceInfo(id),directory=resourceDirectory(id),pin=lock.sources[id];
    const all=inventory(id),selected=options.design?new Set(assetPaths(items.filter(x=>x.name===options.design))):null;
    const paths=Object.keys(all).filter(p=>!selected||selected.has(p)||belongsToDesign(p,options.design)||p.startsWith('sources/medieval-cutouts/sources/'));
    if(command==='fetch') {
      if(!/^[a-f0-9]{40}$/.test(pin.gitCommit||''))throw Error(`Resource has not been locked to a source commit: ${id}`);
      if(!existsSync(path.join(directory,'.git'))){if(existsSync(directory))throw Error(`Existing non-Git directory: ${directory}`);await mkdir(path.dirname(directory),{recursive:true});await exec('git',['clone','--depth=1','--filter=blob:none','--sparse',`https://github.com/${source.repository}.git`,directory]);}
      await clean(id);await git(id,'fetch','--depth=1','origin',pin.gitCommit);
      await git(id,'sparse-checkout','init','--no-cone');
      let previous=[];if(options.design){try{previous=(await git(id,'sparse-checkout','list')).split('\n').filter(p=>Object.hasOwn(all,p.replace(/^\//,'')));}catch{}}
      await git(id,'sparse-checkout','set','--no-cone',...new Set([...previous,...['package.json','resource-manifest.json','catalog.json','README.md','AGENTS.md','.gitignore','.github/workflows/publish.yml','LICENSE',...paths].map(p=>'/'+p)]));
      await git(id,'checkout','--detach',pin.gitCommit);
      for(const relative of paths){const actual=await fileDigest(path.join(directory,relative)),expected=all[relative];if(actual.bytes!==expected.bytes||actual.sha256!==expected.sha256)throw Error(`Fetched bytes differ: ${relative}`);}
    } else await linkFiles(id,paths);
    console.log(`${command}: ${id}, ${paths.length} approved files`);
  }
} else if(command==='pack') {
  const id=options.source;sourceInfo(id);await exec(process.execPath,[path.join(projectRoot,'scripts/verify-resource.mjs'),id,resourceDirectory(id)]);
  const pin=lock.sources[id],output=path.join(projectRoot,'tmp/resource-packs',`${repositoryName(id)}-${pin.version}.tgz`);
  const packed=await packResource(id,resourceDirectory(id),output);
  console.log(json({...packed,integrity:'sha512-'+createHash('sha512').update(await readFile(output)).digest('base64')}));
} else if(command==='migrate') {
  const name=options.design, previousId=config.assignments[name], targetId=options.source;
  if(!previousId||previousId===targetId)throw Error('Choose an existing design and a different registered source.');
  const previous=sourceInfo(previousId),target=sourceInfo(targetId),old=manifest(previousId),item=old.designs[name];
  if(previous.collection!==target.collection||target.state==='archived')throw Error('Migration must stay within the collection and target a writable source.');
  const paths=[...designPaths(item),...Object.keys(old.inputs).filter(p=>belongsToDesign(p,name))];
  const added=paths.reduce((sum,p)=>sum+(old.files[p]||old.inputs[p]).bytes,0);
  if(size(targetId)+added>config.policy.maxTrackedBytes)throw Error('Migrated design exceeds target capacity.');
  for(const relative of paths){const input=path.join(resourceDirectory(previousId),relative);if(stable(await fileDigest(input))!==stable(old.files[relative]||old.inputs[relative]))throw Error('Fetch approved design bytes before migration: '+relative);const output=path.join(resourceDirectory(targetId),relative);if(existsSync(output))throw Error('Migration target already contains '+relative);await mkdir(path.dirname(output),{recursive:true});await copyFile(input,output);}
  previous.retainedDesigns=[...new Set([...(previous.retainedDesigns||[]),name])];config.assignments[name]=targetId;await saveConfig();
  console.log(`Copied ${name} to ${targetId}; original ${previousId} remains immutable. Approve/publish the target, lock it, then regenerate local links.`);
} else if(command==='release') {
  // Drop a migrated design from its previous source's next revision. Published
  // versions and Git history keep it; only the next approved revision shrinks.
  const name=options.design,owner=config.assignments[name];if(!owner)throw Error(`Unknown assignment: ${name}`);
  const previousIds=Object.keys(config.sources).filter(id=>(config.sources[id].retainedDesigns||[]).includes(name));
  if(!previousIds.length)throw Error(`${name} is not retained by any previous source; migrate it first.`);
  for(const id of previousIds){
    const source=sourceInfo(id),old=manifest(id),item=old.designs[name];if(source.state==='archived')throw Error(`Archived source ${id} cannot release ${name}.`);
    const paths=[...designPaths(item),...Object.keys(old.inputs).filter(p=>belongsToDesign(p,name))];
    // Never delete before the current owner holds byte-identical copies.
    for(const relative of paths){const copy=path.join(resourceDirectory(owner),checkedRelative(relative));
      if(!existsSync(copy)||stable(await fileDigest(copy))!==stable(old.files[relative]||old.inputs[relative]))throw Error(`${owner} lacks the approved bytes of ${relative}; migrate/fetch before releasing ${name} from ${id}.`);}
    for(const relative of paths)await rm(path.join(resourceDirectory(id),relative),{force:true});
    source.retainedDesigns=source.retainedDesigns.filter(other=>other!==name);if(!source.retainedDesigns.length)delete source.retainedDesigns;
    console.log(`Released ${name} from ${id} (${paths.length} files); approve a new ${id} version to publish the smaller package.`);
  }
  await saveConfig();
} else if(command==='scaffold') {
  sourceInfo(options.source);await scaffold(options.source,options['tooling-ref']);
  console.log('Scaffolded '+options.source+'; review generated package, notices and workflow.');
} else if(command==='audit-history') {
  const id=options.source,source=sourceInfo(id),directory=path.join(projectRoot,'tmp/resource-history',id+'.git');
  if(!existsSync(directory))await exec('git',['clone','--mirror','https://github.com/'+source.repository+'.git',directory]);
  else await exec('git',['fetch','--prune'],{cwd:directory});
  async function bytes(folder){let total=0;for(const entry of await readdir(folder,{withFileTypes:true}))total+=entry.isDirectory()?await bytes(path.join(folder,entry.name)):(await stat(path.join(folder,entry.name))).size;return total;}
  const total=await bytes(directory),report={id,gitBytes:total,warn:total>=config.policy.warnGitBytes,limit:config.policy.maxGitBytes,auditedAt:new Date().toISOString()};
  await writeFile(path.join(projectRoot,'tmp',id+'-history.json'),json(report));console.log(json(report));
  if(total>config.policy.maxGitBytes)throw Error('Full repository history exceeds policy. Archive this source and migrate revised designs explicitly.');
} else if(command==='lock') {
  const id=options.source;sourceInfo(id);await checkFiles(id);await clean(id);
  const shallow=await git(id,'rev-parse','--is-shallow-repository');let partial=false;try{partial=(await git(id,'config','--get','remote.origin.promisor'))==='true';}catch{}
  if(shallow==='true'||partial)throw Error('Lock from a complete non-partial checkout, or fetch/verify a full clone first; partial history cannot establish capacity.');
  const objects=Object.fromEntries((await git(id,'count-objects','-v')).split('\n').map(line=>line.split(': ')));const gitBytes=(Number(objects.size)+Number(objects['size-pack']))*1024;
  if(gitBytes>config.policy.maxGitBytes)throw Error('Full Git object storage exceeds resource capacity.');
  lock.sources[id].gitCommit=await git(id,'rev-parse','HEAD');await saveLock();console.log(`${id}: ${lock.sources[id].gitCommit}`);
} else if(command==='approve') {
  const id=options.source,source=sourceInfo(id),pin=lock.sources[id];if(source.state==='archived')throw Error('Archived resources cannot be changed.');
  if(!/^\d+\.\d+\.\d+$/.test(options.version||'')||(options.version===pin.version&&pin.gitCommit!==null))throw Error('approve requires a new exact package version.');
  const old=manifest(id),snapshot=JSON.parse(await readFile(path.join(resourceDirectory(id),'catalog.json')));
  const retained=(source.retainedDesigns||[]).map(name=>{const previous=snapshot.find(item=>item.name===name);if(!previous)throw Error('Retained descriptive snapshot missing: '+name);return {...previous,...old.designs[name]};});
  const selected=[...items.filter(item=>config.assignments[item.name]===id),...retained],files={},inputs={};
  for(const relative of assetPaths(selected))files[relative]=await fileDigest(path.join(resourceDirectory(id),relative));
  const selectedNames=new Set(selected.map(item=>item.name)),released=Object.keys(old.designs).filter(name=>!selectedNames.has(name));
  for(const relative of Object.keys(old.inputs))if(!released.some(name=>belongsToDesign(relative,name)))inputs[relative]=await fileDigest(path.join(resourceDirectory(id),relative));
  for(const item of selected)for(const stem of designStems(item.name))for(const directory of ['sources/tiles','sources/traces'])for(const extension of ['png','svg']){const relative=`${directory}/${stem}.${extension}`;if(existsSync(path.join(resourceDirectory(id),relative)))inputs[relative]=await fileDigest(path.join(resourceDirectory(id),relative));}
  const approved={schemaVersion:2,id,collection:source.collection,package:source.package,version:options.version,designs:Object.fromEntries(selected.map(item=>[item.name,capabilities(item)])),files,inputs},content=json(approved);
  if(Buffer.byteLength(content)>(config.policy.maxManifestBytes||1048576))throw Error('Manifest exceeds installer capacity; use another source.');
  const bytes=Object.values({...files,...inputs}).reduce((sum,file)=>sum+file.bytes,0);if(bytes>config.policy.maxTrackedBytes||Object.values({...files,...inputs}).some(f=>f.bytes>config.policy.maxFileBytes))throw Error('Approved resource exceeds capacity.');
  const publicBytes=Object.values(files).reduce((sum,file)=>sum+file.bytes,0);if(publicBytes>config.policy.maxNpmUnpackedBytes)throw Error(`Public files total ${publicBytes} B, above the ${config.policy.maxNpmUnpackedBytes} B npm/CDN package limit; move complete designs to another source.`);
  await writeFile(path.join(projectRoot,`resources/manifests/${id}.json`),content);await writeFile(path.join(resourceDirectory(id),'resource-manifest.json'),content);
  const packagePath=path.join(resourceDirectory(id),'package.json'),pkg=JSON.parse(await readFile(packagePath));pkg.version=options.version;pkg.license='SEE LICENSE IN LICENSE';pkg.files=[...Object.keys(files),'resource-manifest.json','catalog.json','LICENSE'];await writeFile(packagePath,json(pkg));await writeFile(path.join(resourceDirectory(id),'catalog.json'),catalogBytes(selected));
  lock.sources[id]={version:options.version,gitCommit:null,manifestSha256:digest(content),filesSha256:digest(files)};await saveLock();console.log(`Approved ${id}@${options.version}; review and commit its source changes, then run lock.`);
} else if(command==='new') {
  const collection=options.collection;if(!/^[a-z]+(?:-[a-z]+)*$/.test(collection||''))throw Error('new requires a lowercase collection.');
  if(!config.collections[collection]){if(!['border','decoration','illustration'].includes(options['asset-type']))throw Error('New collections require an explicit supported --asset-type.');config.collections[collection]={assetTypes:[options['asset-type']],activeSource:null};}
  const sequence=Math.max(0,...Object.values(config.sources).filter(s=>s.collection===collection).map(s=>s.sequence))+1,id=sourceId(collection,sequence);
  const previous=config.collections[collection].activeSource;if(previous)config.sources[previous].state='sealed';
  config.sources[id]={id,collection,sequence,state:'open',repository:`adrian729/${repositoryName(id)}`,package:packageName(id)};config.collections[collection].activeSource=id;
  const data={schemaVersion:2,id,collection,package:packageName(id),version:'0.1.0',designs:{},files:{},inputs:{}},content=json(data);await mkdir(path.join(projectRoot,'resources/manifests'),{recursive:true});await writeFile(path.join(projectRoot,`resources/manifests/${id}.json`),content);
  lock.sources[id]={version:'0.1.0',gitCommit:null,manifestSha256:digest(content),filesSha256:digest({})};await saveConfig();await saveLock();await scaffold(id,(await exec('git',['rev-parse','HEAD'],{cwd:projectRoot})).stdout.trim());await writeFile(path.join(resourceDirectory(id),'catalog.json'),'[]\n');console.log(`Registered ${id}; provision its repository and package using the main resource guide before publishing.`);
} else throw Error(help);
