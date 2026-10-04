import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, readdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { main as copyAssets } from '../lib/cli.js';
import { getOrnament } from '../lib/index.js';
const root = new URL('../', import.meta.url);
const item = getOrnament('red-berry-vine');
const svgPaths = [...new Set([item, ...Object.values(item.components)].flatMap(component => [component, ...component.variants].map(asset => asset.svg).filter(Boolean)))];

async function fixture(t, mode = 'valid') {
  const directory = await mkdtemp(path.join(tmpdir(), 'ornaments-download-'));
  const requests = [];
  const server = createServer(async (request, response) => {
    const relative = request.url.slice(1); requests.push(relative);
    try {
      assert.ok(relative === 'assets-manifest.json' || svgPaths.includes(relative), 'Only selected artwork is requested');
      let bytes = await readFile(new URL(relative, root));
      if (mode === 'manifest' && relative === 'assets-manifest.json') bytes = Buffer.from('{}');
      if (mode === 'corrupt' && relative === item.svg) { bytes = Buffer.from(bytes); bytes[0] ^= 1; }
      if (mode === 'missing' && relative === item.svg) { response.writeHead(404); response.end(); return; }
      response.end(bytes);
    } catch (error) { response.writeHead(500); response.end(error.message); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(directory, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}/`;
  const args = ['copy-assets', directory, '--design', item.name, '--format', 'svg', '--from', base];
  return { directory, requests, base, args };
}

test('lean CLI downloads only selected format/components and verifies exact bytes', async t => {
  const { directory, requests, args } = await fixture(t);
  await copyAssets(args);
  assert.deepEqual(requests.sort(), ['assets-manifest.json', ...svgPaths].sort());
  for (const relative of svgPaths) assert.deepEqual(await readFile(path.join(directory, relative)), await readFile(new URL(relative, root)));
  const catalog = JSON.parse(await readFile(path.join(directory, 'catalog.json')));
  assert.deepEqual(catalog.map(design => design.name), [item.name]);
  assert.deepEqual(catalog[0].formats, ['svg']);
  assert.equal(catalog[0].webp, undefined);
  for (const name of ['ornaments.css', 'LICENSE', 'ASSET-RIGHTS.md']) assert.deepEqual(await readFile(path.join(directory, name)), await readFile(new URL(name, root)));
});

test('untrusted manifests are rejected before any artwork is requested', async t => {
  const { requests, args } = await fixture(t, 'manifest');
  await assert.rejects(copyAssets(args), /manifest does not match pinned/);
  assert.deepEqual(requests, ['assets-manifest.json']);
});

for (const mode of ['corrupt', 'missing']) test(`failed ${mode} downloads preserve existing files and remove temporary files`, async t => {
  const { directory, args } = await fixture(t, mode);
  await mkdir(path.join(directory, 'svg'));
  const existing = path.join(directory, item.svg);
  await writeFile(existing, 'Existing file');
  await assert.rejects(copyAssets(args), mode === 'corrupt' ? /integrity mismatch/ : /HTTP 404/);
  assert.equal(await readFile(existing, 'utf8'), 'Existing file');
  assert.ok(!(await readdir(directory, { recursive: true })).some(name => name.includes('.ornament-')));
  await assert.rejects(readFile(path.join(directory, 'catalog.json')), { code: 'ENOENT' });
});

test('offline mode refuses network sources and external destination symlinks', async t => {
  const { directory, requests, args } = await fixture(t);
  await assert.rejects(copyAssets([...args, '--offline']), /requires a local/);
  assert.deepEqual(requests, []);
  const outside = await mkdtemp(path.join(tmpdir(), 'ornaments-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await symlink(outside, path.join(directory, 'svg'), 'dir');
  await assert.rejects(copyAssets(['copy-assets', directory, '--from', root.pathname, '--offline', '--design', item.name, '--format', 'svg']), /symlink outside/);
  assert.deepEqual(await readdir(outside), []);
  await assert.rejects(copyAssets(['copy-assets', root.pathname, '--from', root.pathname, '--offline']), /outside the package directory/);
});

test('split archives support nested dependencies and illustration-only offline installs', async t => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const exec = promisify(execFile);
  const { assetsPackage, assetsVersion, illustrationsPackage, illustrationsVersion } = await import('../lib/runtime.js');
  const app = await mkdtemp(path.join(tmpdir(), 'ornaments-split-offline-'));
  t.after(()=>rm(app,{recursive:true,force:true}));
  await writeFile(path.join(app,'package.json'),'{}');
  const main=path.join(app,'node_modules',assetsPackage);
  const nested=path.join(main,'node_modules',illustrationsPackage);
  const pig=getOrnament('flying-pig');
  const pigPaths=[pig,...pig.variants].map(asset=>asset.webp);
  async function packageFixture(directory,name,version,paths){
    await mkdir(directory,{recursive:true});
    await writeFile(path.join(directory,'package.json'),JSON.stringify({name,version,exports:{'./package.json':'./package.json'}}));
    for(const relative of ['assets-manifest.json',...paths]){
      await mkdir(path.dirname(path.join(directory,relative)),{recursive:true});
      await writeFile(path.join(directory,relative),await readFile(new URL(relative,root)));
    }
  }
  await packageFixture(main,assetsPackage,assetsVersion,svgPaths);
  await packageFixture(nested,illustrationsPackage,illustrationsVersion,pigPaths);
  const out=path.join(app,'selected');
  await exec(process.execPath,[new URL('../lib/cli.js',import.meta.url).pathname,'add',item.name,pig.name,'--framework','vanilla','--out',path.join(app,'components'),'--assets',out,'--offline'],{cwd:app});
  for(const relative of [...svgPaths,...pigPaths])assert.deepEqual(await readFile(path.join(out,relative)),await readFile(new URL(relative,root)));
  const { cp } = await import('node:fs/promises');
  await cp(nested,path.join(app,'node_modules',illustrationsPackage),{recursive:true});
  await rm(main,{recursive:true,force:true});
  await exec(process.execPath,[new URL('../lib/cli.js',import.meta.url).pathname,'copy-assets',path.join(app,'pig-only'),'--design',pig.name,'--format','webp','--offline'],{cwd:app});
  await assert.rejects(exec(process.execPath,[new URL('../lib/cli.js',import.meta.url).pathname,'copy-assets',path.join(app,'border-missing'),'--design',item.name,'--offline'],{cwd:app}),/Offline artwork not found/);
  await assert.rejects(readFile(path.join(app,'border-missing','catalog.json')),{code:'ENOENT'});
});
