// Build the optional artwork distribution by verifying/copying approved bytes.
import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, assetCatalog, assetPaths, catalogBytes } from './package-assets.mjs';
const pkg=JSON.parse(await readFile(new URL('packages/assets/package.json',root)));
const items=await assetCatalog(),catalog=catalogBytes(items);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files={};
for(const relative of assetPaths(items)) {
  const digest=createHash('sha256');let bytes=0;
  for await(const data of createReadStream(new URL(relative,root))){bytes+=data.length;digest.update(data);}
  files[relative]={bytes,sha256:digest.digest('hex')};
}
const manifest={package:pkg.name,version:pkg.version,catalogSha256:hash(catalog),files};
const content=JSON.stringify(manifest,null,2)+'\n';
const manifestPath=new URL('assets-manifest.json',root);
if(process.argv.includes('--update-manifest')) {
  let old;try{old=await readFile(manifestPath,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
  if(old && old!==content && JSON.parse(old).version===pkg.version)throw Error('Bump the asset package version before changing its approved manifest.');
  await writeFile(manifestPath,content);
} else if(await readFile(manifestPath,'utf8')!==content)throw Error('Artwork/catalog does not match the pinned manifest. Audit changes, bump assets version, and run build:assets -- --update-manifest.');
const out=new URL('dist/medieval-ornaments-assets/',root);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await writeFile(new URL('package.json',out),JSON.stringify(pkg,null,2)+'\n');
await writeFile(new URL('catalog.json',out),catalog);
await writeFile(new URL('assets-manifest.json',out),content);
for(const relative of Object.keys(files)) {
  const target=new URL(relative,out);await mkdir(path.dirname(fileURLToPath(target)),{recursive:true});await copyFile(new URL(relative,root),target);
}
for(const name of ['LICENSE','ASSET-RIGHTS.md'])await copyFile(new URL(name,root),new URL(name,out));
await copyFile(new URL('packages/assets/README.md',root),new URL('README.md',out));
console.log(`Staged ${pkg.name}@${pkg.version}: ${items.length} designs / ${Object.keys(files).length} byte-verified assets. Artwork unchanged.`);
