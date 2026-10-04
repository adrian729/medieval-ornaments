// Build the optional artwork distribution by verifying/copying approved bytes.
import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, assetCatalog, assetPaths, catalogBytes } from './package-assets.mjs';
import { resourceFile } from './resource-store.mjs';
const pkg=JSON.parse(await readFile(new URL('packages/assets/package.json',root)));
const illustrationPkg=JSON.parse(await readFile(new URL('packages/illustration-assets/package.json',root)));
if(pkg.dependencies?.[illustrationPkg.name]!==illustrationPkg.version)throw Error('Full artwork package must pin its illustration dependency.');
const items=await assetCatalog(),catalog=catalogBytes(items);
const illustrationPaths=new Set(assetPaths(items.filter(item=>item.asset_type==='illustration')));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files={};
for(const relative of assetPaths(items)) {
  const digest=createHash('sha256');let bytes=0;
  for await(const data of createReadStream(resourceFile(relative))){bytes+=data.length;digest.update(data);}
  files[relative]={bytes,sha256:digest.digest('hex'),...(illustrationPaths.has(relative)?{package:illustrationPkg.name}:{})};
}
const manifest={package:pkg.name,version:pkg.version,illustrations:{package:illustrationPkg.name,version:illustrationPkg.version},catalogSha256:hash(catalog),files};
const content=JSON.stringify(manifest,null,2)+'\n';
const manifestPath=new URL('assets-manifest.json',root);
if(process.argv.includes('--update-manifest')) {
  let old;try{old=await readFile(manifestPath,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
  if(old && old!==content && (JSON.parse(old).version===pkg.version||JSON.parse(old).illustrations?.version===illustrationPkg.version))throw Error('Bump both artwork package versions before changing their shared approved manifest.');
  await writeFile(manifestPath,content);
} else if(await readFile(manifestPath,'utf8')!==content)throw Error('Artwork/catalog does not match the pinned manifest. Audit changes, bump assets version, and run build:assets -- --update-manifest.');
const out=new URL('dist/medieval-ornaments-assets/',root);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
// Keep a flat verified mirror for local consumers, but split npm payloads.
const mainPaths=Object.keys(files).filter(relative=>!illustrationPaths.has(relative));
await writeFile(new URL('package.json',out),JSON.stringify({...pkg,files:[...mainPaths,'catalog.json','assets-manifest.json','LICENSE']},null,2)+'\n');
await writeFile(new URL('catalog.json',out),catalog);
await writeFile(new URL('assets-manifest.json',out),content);
for(const relative of Object.keys(files)) {
  const target=new URL(relative,out);await mkdir(path.dirname(fileURLToPath(target)),{recursive:true});await copyFile(resourceFile(relative),target);
}
for(const name of ['LICENSE'])await copyFile(new URL(name,root),new URL(name,out));
await copyFile(new URL('packages/assets/README.md',root),new URL('README.md',out));
const illustrationsOut=new URL('dist/medieval-ornaments-illustration-assets/',root);
await rm(illustrationsOut,{recursive:true,force:true});await mkdir(illustrationsOut,{recursive:true});
await writeFile(new URL('package.json',illustrationsOut),JSON.stringify(illustrationPkg,null,2)+'\n');
await writeFile(new URL('catalog.json',illustrationsOut),catalogBytes(items.filter(item=>item.asset_type==='illustration')));
await writeFile(new URL('assets-manifest.json',illustrationsOut),content);
for(const relative of illustrationPaths){const target=new URL(relative,illustrationsOut);await mkdir(path.dirname(fileURLToPath(target)),{recursive:true});await copyFile(resourceFile(relative),target);}
for(const name of ['LICENSE'])await copyFile(new URL(name,root),new URL(name,illustrationsOut));
await copyFile(new URL('packages/illustration-assets/README.md',root),new URL('README.md',illustrationsOut));
console.log(`Staged ${pkg.name}@${pkg.version}: ${mainPaths.length} files, plus ${illustrationPkg.name}@${illustrationPkg.version}: ${illustrationPaths.size} files. All ${items.length} designs / ${Object.keys(files).length} artwork bytes verified and unchanged.`);
