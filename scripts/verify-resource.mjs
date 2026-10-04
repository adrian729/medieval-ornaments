// Used by the main coordinator and the resource repositories' pinned workflow.
import { readFile, readdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { registry, resourceLock, manifest, digest, stable, projectRoot, capabilities } from './resource-store.mjs';
const [id,directory]=process.argv.slice(2), source=registry().sources[id],pin=resourceLock().sources[id];
if(!source||!directory)throw Error('Usage: node scripts/verify-resource.mjs <source-id> <checkout>');
const data=manifest(id), actual=await readFile(path.join(directory,'resource-manifest.json'));
if(digest(actual)!==pin.manifestSha256)throw Error('Checkout manifest is not approved by main.');
const pkg=JSON.parse(await readFile(path.join(directory,'package.json')));
if(pkg.name!==source.package||pkg.version!==pin.version||pkg.repository?.url!==`git+https://github.com/${source.repository}.git`||pkg.dependencies||pkg.scripts)throw Error('Invalid resource package identity/dependencies/hooks.');
const snapshot=JSON.parse(await readFile(path.join(directory,'catalog.json')));
if(stable(Object.fromEntries(snapshot.map(item=>[item.name,capabilities(item)])))!==stable(data.designs))throw Error('Resource catalog rendering data differs from approved manifest.');
const allowed=[...Object.keys(data.files),'resource-manifest.json','catalog.json','LICENSE'].sort();
if(stable([...pkg.files].sort())!==stable(allowed))throw Error('Resource npm allowlist differs from approved exports.');
for(const relative of ['LICENSE'])if(digest(await readFile(path.join(directory,relative)))!==digest(await readFile(path.join(projectRoot,relative))))throw Error('License notice differs: '+relative);
let total=0;
for(const [relative,expected]of Object.entries({...data.files,...data.inputs})) {
  const hash=createHash('sha256');let bytes=0;for await(const chunk of createReadStream(path.join(directory,relative))){bytes+=chunk.length;hash.update(chunk);}
  if(bytes!==expected.bytes||hash.digest('hex')!==expected.sha256)throw Error('Resource bytes differ: '+relative);
  total+=bytes;
}
async function walk(base,prefix='') {let result=[];for(const entry of await readdir(base,{withFileTypes:true})){if(entry.name==='.git'||entry.name==='node_modules'||entry.name.endsWith('.tgz'))continue;const relative=prefix+entry.name;if(entry.isDirectory())result.push(...await walk(path.join(base,entry.name),relative+'/'));else if(entry.isSymbolicLink())throw Error('Resource repositories cannot contain symlinks: '+relative);else result.push(relative);}return result;}
const small=new Set(['package.json','catalog.json','resource-manifest.json','README.md','AGENTS.md','LICENSE','.gitignore','.github/workflows/publish.yml']);
for(const relative of await walk(directory)) {
 if(!Object.hasOwn(data.files,relative)&&!Object.hasOwn(data.inputs,relative)){if(!small.has(relative))throw Error('Unapproved repository file: '+relative);total+=(await stat(path.join(directory,relative))).size;}
}
if(total>registry().policy.maxTrackedBytes)throw Error('Resource repository exceeds tracked capacity.');
console.log(`Verified ${id}@${pin.version}: ${Object.keys(data.files).length} public files and ${Object.keys(data.inputs).length} native inputs; ${total} tracked bytes.`);
