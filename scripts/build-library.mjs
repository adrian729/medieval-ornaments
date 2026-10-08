// Package metadata only. Never regenerates or touches artwork.
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { root, assetCatalog, catalogBytes } from './package-assets.mjs';
import { designData, vanillaModule, reactModule, styledModule, vanillaTypes, reactTypes } from '../lib/module-templates.js';
import { validateResources, manifest as resourceManifest, designPaths, digest } from './resource-store.mjs';
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const items = await assetCatalog(),catalog=catalogBytes(items);
const manifestBytes=await readFile(new URL('assets-manifest.json',root)),manifest=JSON.parse(manifestBytes);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
if(manifest.package!==pkg.ornamentAssets.package||manifest.version!==pkg.ornamentAssets.version)throw Error('Pinned compatibility archive does not match the runtime package.');
const {config: resourceRegistry, lock: resourcePins} = validateResources(items);
if(process.argv.includes('--release') && Object.values(resourcePins.sources).some(pin=>!/^[a-f0-9]{40}$/.test(pin.gitCommit||'')))throw Error('Release packaging requires exact locked resource commits.');
const illustrationPin=pkg.ornamentIllustrations;
if(manifest.illustrations?.package!==illustrationPin.package||manifest.illustrations?.version!==illustrationPin.version)throw Error('Pinned illustration manifest does not match runtime package.');
const base = `https://unpkg.com/${manifest.package}@${manifest.version}/`;
const illustrationBase=`https://unpkg.com/${illustrationPin.package}@${illustrationPin.version}/`;
// Preserve the JSON API without duplicating indentation in the installed package.
// The signed artwork catalog retains its original deterministic serialization.
await writeFile(new URL('lib/catalog.json', root), JSON.stringify(items) + '\n');
await writeFile(new URL('lib/runtime.js', root), `// Generated release pins; contains no design catalog.\nexport const version = ${JSON.stringify(pkg.version)};\nexport const assetsPackage = ${JSON.stringify(manifest.package)};\nexport const assetsVersion = ${JSON.stringify(manifest.version)};\nexport const assetsManifestSha256 = ${JSON.stringify(hash(manifestBytes))};\nexport const defaultAssetsBase = ${JSON.stringify(base)};\nexport const illustrationsPackage = ${JSON.stringify(illustrationPin.package)};\nexport const illustrationsVersion = ${JSON.stringify(illustrationPin.version)};\nexport const defaultIllustrationsBase = ${JSON.stringify(illustrationBase)};\n`);
await mkdir(new URL('lib/asset-sources/', root), {recursive: true});
for (const [id, source] of Object.entries(resourceRegistry.sources)) {
  const pin = resourcePins.sources[id], approved = resourceManifest(id);
  const info = {id, collection: source.collection, package: source.package, version: pin.version, manifestSha256: pin.manifestSha256, filesSha256: pin.filesSha256, activeFilesSha256: digest(Object.fromEntries(items.filter(item=>resourceRegistry.assignments[item.name]===id).flatMap(designPaths).map(p=>[p,approved.files[p]]))), base: `https://unpkg.com/${source.package}@${pin.version}/`};
  // Bind the unchanged intersection with the immutable compatibility archive.
  // New numbered artwork must never force refreshing those optional snapshots.
  info.legacyFilesSha256 = digest(Object.fromEntries(items.filter(item=>resourceRegistry.assignments[item.name]===id).flatMap(designPaths)
    .filter(p=>manifest.files[p] && manifest.files[p].bytes===approved.files[p].bytes && manifest.files[p].sha256===approved.files[p].sha256)
    .map(p=>[p,approved.files[p]])));
  await writeFile(new URL(`lib/asset-sources/${id}.js`, root), `// Generated immutable asset pin; no catalog.\nexport const base = ${JSON.stringify(info.base)};\nexport const source = /* @__PURE__ */ Object.freeze(${JSON.stringify(info)});\n`);
}
await writeFile(new URL('lib/asset-sources.js', root), `${Object.keys(resourceRegistry.sources).map((id,i)=>`import { source as s${i} } from './asset-sources/${id}.js';`).join('\n')}\nexport const assetSources = Object.freeze({${Object.keys(resourceRegistry.sources).map((id,i)=>`${JSON.stringify(id)}:s${i}`).join(',')}});\n`);
await writeFile(new URL('lib/asset-routing.js', root), `import { assetSources } from './asset-sources.js';\nconst assignments = ${JSON.stringify(resourceRegistry.assignments)};\nexport function getAssetSource(name) {\n  if (typeof name !== 'string' || !Object.hasOwn(assignments, name)) throw new RangeError('Unknown ornament: ' + String(name));\n  return assetSources[assignments[name]];\n}\n`);
await writeFile(new URL('lib/asset-routing.d.ts', root), `export interface AssetSource { readonly id: string; readonly collection: string; readonly package: string; readonly version: string; readonly base: string; readonly manifestSha256: string; readonly filesSha256: string; readonly activeFilesSha256: string; }\nexport declare function getAssetSource(name: string): AssetSource;\n`);
for (const directory of ['design-data', 'designs', 'react-designs']) await mkdir(new URL(`lib/${directory}/`, root), { recursive: true });
for (const directory of ['design-data', 'designs', 'react-designs']) {
  const expected = new Set(items.flatMap(item => directory === 'design-data' ? [`${item.name}.js`] : directory === 'designs' ? [`${item.name}.js`, `${item.name}.d.ts`] : [`${item.name}.js`, `${item.name}.d.ts`, `${item.name}-styled.js`]));
  for (const file of await readdir(new URL(`lib/${directory}/`, root))) if (/\.(?:js|d\.ts)$/.test(file) && !expected.has(file)) await rm(new URL(`lib/${directory}/${file}`, root));
}
for (const item of items) {
  const files = {
    [`design-data/${item.name}.js`]: designData(item),
    [`designs/${item.name}.js`]: vanillaModule(item, {}, resourceRegistry.assignments[item.name]),
    [`designs/${item.name}.d.ts`]: vanillaTypes(item),
    [`react-designs/${item.name}.js`]: reactModule(item, {}, resourceRegistry.assignments[item.name]),
    [`react-designs/${item.name}-styled.js`]: styledModule(item.name),
    [`react-designs/${item.name}.d.ts`]: reactTypes(item)
  };
  for (const [file, contents] of Object.entries(files)) await writeFile(new URL(`lib/${file}`, root), contents);
}
await writeFile(new URL('lib/catalog.js', root), `// Generated aggregate; use per-design imports for selective bundles.\nexport { version, assetsPackage, assetsVersion, assetsManifestSha256, defaultAssetsBase, illustrationsPackage, illustrationsVersion, defaultIllustrationsBase } from './runtime.js';\n${items.map((item, i) => `import { ornament as item${i} } from './design-data/${item.name}.js';`).join('\n')}\nexport const ornaments = Object.freeze([${items.map((_, i) => `item${i}`).join(', ')}]);\n`);
const union = values => values.map(value => JSON.stringify(value)).join(' | ');
const names = items.map(item => item.name);
const repeats = items.filter(item => item.kind === 'repeat-tile').map(item => item.name);
const whole = items.filter(item => item.kind === 'standalone').map(item => item.name);
const illustrationNames = items.filter(item => item.asset_type === 'illustration').map(item => item.name);
const categories = [...new Set(items.flatMap(item => item.categories))].sort();
const declarations = `// Generated design/capability types; edit scripts/build-library.mjs.
export type DesignName = ${union(names)};
export type RepeatDesignName = ${union(repeats)};
export type WholeDesignName = ${union(whole)};
export type IllustrationDesignName = ${union(illustrationNames)};
export type Category = ${union(categories)};
export type AssetType = 'border' | 'decoration' | 'illustration';
export type Facing = 'left' | 'right' | 'front' | 'mixed' | 'unclear';
export type Composition = 'single-ornament' | 'standalone' | 'repeat-tile' | 'single-figure' | 'multiple-figures' | 'framed-scene';
export type OrnamentUse = 'frame' | 'divider' | 'image';
export type Format = 'auto' | 'svg' | 'webp' | 'png';
export type Orientation = 'original' | 'horizontal' | 'vertical';
export interface RasterVariant {
  readonly png: string; readonly webp: string;
  readonly width: number; readonly height: number;
  readonly max_dimension?: number; readonly rendered_max_dimension?: number;
  readonly png_bytes: number; readonly webp_bytes: number;
}
export interface Asset extends RasterVariant {
  readonly svg?: string; readonly viewbox?: readonly number[];
  readonly variants: readonly RasterVariant[];
  readonly repeat_axis?: 'x' | 'y' | 'none';
  readonly repeat_ratio?: number; readonly slice_pixels?: number;
}
export interface Provenance {
  readonly institution: string; readonly title: string; readonly object_identifier: string;
  readonly date: string; readonly artist?: string; readonly record_url: string;
  readonly image_url?: string; readonly image_rights: string; readonly rights_url: string;
  readonly source_sha256?: string;
  readonly method: 'ai-assisted-extraction' | 'independent-ai-interpretation';
  readonly audit: string;
}
export interface Ornament extends Asset {
  readonly name: DesignName; readonly description: string;
  readonly categories: readonly Category[]; readonly subjects: readonly string[];
  readonly colors: readonly string[]; readonly facing: Facing; readonly composition: Composition;
  readonly asset_type: AssetType; readonly has_transparency: boolean; readonly usage_notes: readonly string[];
  readonly kind: 'standalone' | 'repeat-tile'; readonly derivation: string;
  readonly uses: readonly OrnamentUse[]; readonly formats: readonly Exclude<Format, 'auto'>[];
  readonly components: Readonly<Partial<Record<'border_image' | 'corner' | 'rotated_tile' | 'reference_crop', Asset>>>;
  readonly border_image_slice_percent?: number; readonly reference?: string;
  readonly provenance?: Provenance;
}
export interface RepeatOrnament extends Ornament {
  readonly name: RepeatDesignName; readonly kind: 'repeat-tile';
  readonly uses: readonly ('frame' | 'divider')[]; readonly repeat_axis: 'x' | 'y';
  readonly repeat_ratio: number; readonly border_image_slice_percent: number;
}
export interface WholeOrnament extends Ornament {
  readonly name: WholeDesignName; readonly kind: 'standalone';
  readonly uses: readonly 'image'[]; readonly repeat_axis: 'none';
}
export interface CommonOptions {
  size?: number; format?: Format; pixelRatio?: number; assetsBase?: string; loading?: 'eager' | 'lazy';
}
export interface FrameOptions extends CommonOptions { design: RepeatDesignName; }
export interface DividerOptions extends CommonOptions { design: RepeatDesignName; orientation?: Orientation; length?: number | string; }
export interface ImageOptions extends CommonOptions { design: WholeDesignName; alt?: string; decoding?: 'auto' | 'sync' | 'async'; fetchPriority?: 'auto' | 'high' | 'low'; }
export interface SelectionFilters {
  use?: OrnamentUse; categories?: readonly Category[]; subjects?: readonly string[];
  colors?: readonly string[]; query?: string; assetType?: AssetType; hasTransparency?: boolean;
  facing?: Facing; composition?: Composition;
}
export interface ResolvedOrnament {
  design: DesignName; use: OrnamentUse; axis?: 'x' | 'y'; size: number; loading: 'eager' | 'lazy';
  className: string; style: Record<string, string>; attributes: Record<string, string>;
  asset: { path: string; url: string; format: Exclude<Format, 'auto'>; width: number; height: number; resolutionLimited: boolean; };
}
export interface OrnamentController<Options> {
  readonly element: HTMLElement;
  readonly configuration: ResolvedOrnament;
  update(options: Partial<Options>): OrnamentController<Options>;
  destroy(): void;
}
export declare const version: string;
export declare const assetsPackage: string;
export declare const assetsVersion: string;
export declare const defaultAssetsBase: string;
export declare const illustrationsPackage: string;
export declare const illustrationsVersion: string;
export declare const defaultIllustrationsBase: string;
export interface AssetSource { readonly id: string; readonly collection: string; readonly package: string; readonly version: string; readonly base: string; readonly manifestSha256: string; readonly filesSha256: string; readonly activeFilesSha256: string; }
export declare function getAssetSource(name: DesignName | string): AssetSource;
export declare const ornaments: readonly Ornament[];
export declare function getOrnament(name: RepeatDesignName): RepeatOrnament;
export declare function getOrnament(name: WholeDesignName): WholeOrnament;
export declare function getOrnament(name: string): Ornament;
export declare function findOrnaments(filters: SelectionFilters & { use: 'frame' | 'divider' }): RepeatOrnament[];
export declare function findOrnaments(filters: SelectionFilters & { use: 'image' }): WholeOrnament[];
export declare function findOrnaments(filters?: SelectionFilters): Ornament[];
export declare function resolveOrnament(use: 'frame', options: FrameOptions): ResolvedOrnament;
export declare function resolveOrnament(use: 'divider', options: DividerOptions): ResolvedOrnament;
export declare function resolveOrnament(use: 'image', options: ImageOptions): ResolvedOrnament;
export declare function createFrame(element: HTMLElement, options: FrameOptions): OrnamentController<FrameOptions>;
export declare function createDivider(element: HTMLElement, options: DividerOptions): OrnamentController<DividerOptions>;
export declare function createOrnamentImage(element: HTMLImageElement, options: ImageOptions): OrnamentController<ImageOptions>;
`;
await writeFile(new URL('lib/index.d.ts', root), declarations);
const common = declarations.slice(declarations.indexOf('export type AssetType'), declarations.indexOf('export declare const version'))
  .replace(/\b(?:DesignName|RepeatDesignName|WholeDesignName|Category)\b/g, 'string')
  .replace(/readonly (png|webp|png_bytes|webp_bytes):/g, 'readonly $1?:');
const boundTypes = `
type BoundOptions<Base, Name extends string, Available extends Exclude<Format, 'auto'>> = Omit<Base, 'design' | 'format'> & { design?: Name; format?: 'auto' | Available };
export interface RepeatDesign<Name extends string, Available extends Exclude<Format, 'auto'>, Type extends AssetType = 'border'> {
  ornament: RepeatOrnament & { readonly name: Name; readonly asset_type: Type };
  frameOptions: BoundOptions<FrameOptions, Name, Available>;
  dividerOptions: BoundOptions<DividerOptions, Name, Available>;
  resolve: {
    (use: 'frame', options?: BoundOptions<FrameOptions, Name, Available>): ResolvedOrnament;
    (use: 'divider', options?: BoundOptions<DividerOptions, Name, Available>): ResolvedOrnament;
  };
  createFrame: (element: HTMLElement, options?: BoundOptions<FrameOptions, Name, Available>) => OrnamentController<BoundOptions<FrameOptions, Name, Available>>;
  createDivider: (element: HTMLElement, options?: BoundOptions<DividerOptions, Name, Available>) => OrnamentController<BoundOptions<DividerOptions, Name, Available>>;
}
export interface WholeDesign<Name extends string, Available extends Exclude<Format, 'auto'>, Type extends AssetType> {
  ornament: WholeOrnament & { readonly name: Name; readonly asset_type: Type };
  imageOptions: BoundOptions<ImageOptions, Name, Available>;
  resolve: (use: 'image', options?: BoundOptions<ImageOptions, Name, Available>) => ResolvedOrnament;
  createOrnamentImage: (element: HTMLImageElement, options?: BoundOptions<ImageOptions, Name, Available>) => OrnamentController<BoundOptions<ImageOptions, Name, Available>>;
}
`;
await writeFile(new URL('lib/common.d.ts', root), common + boundTypes);
await writeFile(new URL('lib/selection.d.ts', root), `export { ornaments, getOrnament, findOrnaments } from './index.js';\nexport type { Ornament, RepeatOrnament, WholeOrnament, SelectionFilters, AssetType, Facing, Composition } from './index.js';\n`);
for (const [scope, type] of [['borders', 'border'], ['decorations', 'decoration'], ['illustrations', 'illustration']]) {
  const scoped = items.filter(item => item.asset_type === type);
  await writeFile(new URL(`lib/catalog-${scope}.js`, root), `// Generated scoped catalog; excludes other artwork families.\n${scoped.map((item, i) => `import { ornament as item${i} } from './design-data/${item.name}.js';`).join('\n')}\nexport const ornaments = Object.freeze([${scoped.map((_, i) => `item${i}`).join(', ')}]);\n`);
  await writeFile(new URL(`lib/selection-${scope}.js`, root), `import { ornaments } from './catalog-${scope}.js';\nimport { createSelection } from './selection-core.js';\nexport { ornaments };\nexport const { getOrnament, findOrnaments } = /* @__PURE__ */ createSelection(ornaments);\n`);
  const baseType = type === 'border' ? 'RepeatOrnament' : 'WholeOrnament';
  await writeFile(new URL(`lib/selection-${scope}.d.ts`, root), `import type { ${baseType}, SelectionFilters } from './index.js';\nexport type ScopedOrnament = ${baseType} & { readonly name: ${union(scoped.map(item => item.name))}; readonly asset_type: ${JSON.stringify(type)} };\nexport declare const ornaments: readonly ScopedOrnament[];\nexport declare function getOrnament(name: string): ScopedOrnament;\nexport declare function findOrnaments(filters?: SelectionFilters): ScopedOrnament[];\n`);
}
const customKey = String.fromCharCode(96) + '--' + '$' + '{string}' + String.fromCharCode(96);
await writeFile(new URL('lib/react-core.d.ts', root), `import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';
export type OrnamentStyle = CSSProperties & { [key: ${customKey}]: string | number | undefined };
type ElementFor<Use> = Use extends 'image' ? HTMLImageElement : HTMLDivElement;
type Omitted<Use> = 'style' | 'dangerouslySetInnerHTML' | (Use extends 'frame' ? never : 'children') | (Use extends 'image' ? 'src' | 'srcSet' | 'sizes' | 'height' | 'width' | 'alt' : never);
export type BoundProps<Use extends 'image' | 'frame' | 'divider', Options> = Options & Omit<Use extends 'image' ? ImgHTMLAttributes<HTMLImageElement> : HTMLAttributes<HTMLDivElement>, Omitted<Use>> & { style?: OrnamentStyle } & (Use extends 'frame' ? {} : { children?: never });
export type BoundComponent<Use extends 'image' | 'frame' | 'divider', Options> = ForwardRefExoticComponent<BoundProps<Use, Options> & RefAttributes<ElementFor<Use>>>;
`);
await writeFile(new URL('lib/react.d.ts', root), `import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';
import type { FrameOptions, DividerOptions, ImageOptions } from './index.js';
export type OrnamentStyle = CSSProperties & { [key: ${customKey}]: string | number | undefined };
export type OrnamentFrameProps = FrameOptions & Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle };
export type OrnamentDividerProps = DividerOptions & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle; children?: never };
export type OrnamentImageProps = ImageOptions & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'height' | 'width' | 'alt' | 'children' | 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle; children?: never };
export declare const OrnamentFrame: ForwardRefExoticComponent<OrnamentFrameProps & RefAttributes<HTMLDivElement>>;
export declare const OrnamentDivider: ForwardRefExoticComponent<OrnamentDividerProps & RefAttributes<HTMLDivElement>>;
export declare const OrnamentImage: ForwardRefExoticComponent<OrnamentImageProps & RefAttributes<HTMLImageElement>>;
`);
console.error(`Built package metadata/types for ${items.length} designs at ${pkg.version}; artwork unchanged.`);
