// Authoring/release storage only. Never imported by browser renderers.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const read = name => JSON.parse(readFileSync(path.join(projectRoot, name), 'utf8'));
export const registry = () => read('resource-registry.json');
export const resourceLock = () => read('resource-lock.json');
export const stable = value => JSON.stringify(normalize(value));
function normalize(value) {
  return Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])])) : value;
}
export const digest = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : stable(value)).digest('hex');
export const resourceDirectory = id => path.join(projectRoot, 'tmp/resource-checkouts', id);
export const sourceId = (collection, sequence) => `${collection}-${String(sequence).padStart(3, '0')}`;
export const repositoryName = id => `medieval-ornaments-assets-${id}`;
export const packageName = id => `@ranx729/${repositoryName(id)}`;

export function checkedRelative(relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(part => part === '..' || part === '.' || !part)) throw Error(`Invalid resource path: ${relative}`);
  return relative;
}

export function manifest(id) { return read(`resources/manifests/${id}.json`); }

let cachedOwners;
export function ownedPaths() {
  if(cachedOwners) return cachedOwners;
  const result = new Map();
  for (const id of Object.keys(resourceLock().sources)) {
    const data = manifest(id);
    const config=registry();
    const retainedFiles=new Set(Object.entries(data.designs).filter(([name])=>config.assignments[name]!==id).flatMap(([,item])=>designPaths(item)));
    for (const relative of [...Object.keys(data.files).filter(p=>!retainedFiles.has(p)), ...Object.keys(data.inputs || {}).filter(p=>!Object.keys(data.designs).some(name=>config.assignments[name]!==id&&path.basename(p).replace(/\.[^.]+$/,'')===name))]) {
      checkedRelative(relative);
      if (result.has(relative)) throw Error(`Resource path has two owners: ${relative}`);
      result.set(relative, id);
    }
  }
  return cachedOwners = result;
}

export function resourceFile(relative, { write = false } = {}) {
  checkedRelative(relative);
  const owners = ownedPaths();
  let id = owners.get(relative);
  if (!id && /^(?:png|webp|svg|sources\/(?:tiles|traces))\//.test(relative)) {
    const stem = path.basename(relative).replace(/\.[^.]+$/, '');
    const assignments = registry().assignments;
    const candidates = Object.keys(assignments).filter(name => stem === name || ['-border', '-corner', '-rotated', '-reference'].some(suffix => stem === name + suffix));
    if (candidates.length !== 1) throw Error(`Register an unambiguous resource assignment before writing ${relative}`);
    id = assignments[candidates[0]];
  }
  if (!id) return path.join(projectRoot, relative);
  const target = path.join(resourceDirectory(id), relative);
  // Allows the byte-verified migration and isolated legacy fixtures. Once the
  // tracked old paths are removed, missing checkouts fail with their real path.
  return write || existsSync(target) ? target : path.join(projectRoot, relative);
}

const capabilityKeys = ['name', 'asset_type', 'kind', 'derivation', 'repeat_axis', 'repeat_ratio', 'border_image_slice_percent', 'viewbox', 'width', 'height', 'png', 'webp', 'svg', 'png_bytes', 'webp_bytes', 'variants', 'components', 'uses', 'formats'];
export const capabilities = item => Object.fromEntries(capabilityKeys.filter(key => item[key] !== undefined).map(key => [key, item[key]]));
export const designPaths = item => [item,...Object.values(item.components)].flatMap(component=>[component,...component.variants].flatMap(asset=>['svg','png','webp'].flatMap(format=>asset[format]?[asset[format]]:[])));

export function validateResources(items) {
  const config = registry(), lock = resourceLock();
  if (config.schemaVersion !== 1 || lock.schemaVersion !== 1) throw Error('Unsupported resource registry/lock schema.');
  const states = new Set(['open', 'sealed', 'archived']);
  const names = new Set(items.map(item => item.name));
  if (stable(Object.keys(config.sources).sort()) !== stable(Object.keys(lock.sources).sort())) throw Error('Registry/lock sources differ.');
  for (const [collection, definition] of Object.entries(config.collections)) {
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(collection) || !Array.isArray(definition.assetTypes)) throw Error(`Invalid collection: ${collection}`);
    const open = Object.values(config.sources).filter(source => source.collection === collection && source.state === 'open');
    if (open.length !== 1 || !open.some(source => source.id === definition.activeSource)) throw Error(`Collection must have one declared open source: ${collection}`);
  }
  for (const [id, source] of Object.entries(config.sources)) {
    if (!Number.isSafeInteger(source.sequence) || source.sequence < 1 || id !== sourceId(source.collection, source.sequence) || source.id !== id || source.repository !== `adrian729/${repositoryName(id)}` || source.package !== packageName(id) || !states.has(source.state)) throw Error(`Invalid resource identity: ${id}`);
    if (!config.collections[source.collection]) throw Error(`Unknown resource collection: ${id}`);
    const pin = lock.sources[id];
    if (!pin || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pin.version)) throw Error(`Missing exact resource version: ${id}`);
    const data = manifest(id);
    if(data.schemaVersion !== 2 || data.collection !== source.collection || (pin.gitCommit !== null && !/^[a-f0-9]{40}$/.test(pin.gitCommit))) throw Error(`Invalid resource manifest/commit: ${id}`);
    if (data.id !== id || data.package !== source.package || data.version !== pin.version || digest(readFileSync(path.join(projectRoot, `resources/manifests/${id}.json`))) !== pin.manifestSha256 || digest(data.files) !== pin.filesSha256) throw Error(`Pinned manifest mismatch: ${id}`);
    for (const [relative, file] of Object.entries({ ...data.files, ...data.inputs })) {
      checkedRelative(relative);
      // Immutable archived sources may retain a migrated design. Its active
      // owner is unambiguous and selected through the central assignment.
      if (!Number.isSafeInteger(file.bytes) || file.bytes < 1 || !/^[a-f0-9]{64}$/.test(file.sha256) || file.bytes > config.policy.maxFileBytes) throw Error(`Invalid/oversized file: ${relative}`);
    }
    for(const relative of Object.keys(data.inputs)) if(Object.hasOwn(data.files,relative)) throw Error(`Input/public file overlap: ${relative}`);
    const selected=items.filter(item=>config.assignments[item.name]===id);
    const retained=source.retainedDesigns||[];
    if(retained.some(name=>!Object.hasOwn(data.designs,name)||config.assignments[name]===id)||new Set(retained).size!==retained.length)throw Error(`Invalid retained design declaration: ${id}`);
    const catalogPaths=new Set(Object.values(data.designs).flatMap(designPaths));
    if(stable([...catalogPaths].sort())!==stable(Object.keys(data.files).sort()) || stable([...selected.map(item=>item.name),...retained].sort())!==stable(Object.keys(data.designs).sort())) throw Error(`Resource ownership does not match catalog: ${id}`);
    const bytes = Object.values({ ...data.files, ...data.inputs }).reduce((sum, file) => sum + file.bytes, 0);
    if (bytes > config.policy.maxTrackedBytes) throw Error(`Resource exceeds capacity: ${id}`);
  }
  for (const item of items) {
    const id = config.assignments[item.name], source = config.sources[id];
    if (!source || !config.collections[source.collection].assetTypes.includes(item.asset_type)) throw Error(`Missing/incorrect design assignment: ${item.name}`);
    if (stable(manifest(id).designs[item.name]) !== stable(capabilities(item))) throw Error(`Rendering capabilities do not match approved resource: ${item.name}`);
  }
  for (const name of Object.keys(config.assignments)) if (!names.has(name)) throw Error(`Assignment has no catalog design: ${name}`);
  ownedPaths();
  return { config, lock };
}
