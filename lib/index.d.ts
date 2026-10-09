// Generated design/capability types; edit scripts/build-library.mjs.
export type DesignName = RepeatDesignName | WholeDesignName;
export type RepeatDesignName = "blue-alternating-leaf-vine" | "blue-alternating-stencil-scroll" | "blue-diamond-leaf-stencil-band" | "blue-four-petal-stencil-vine" | "blue-looped-quatrefoils" | "blue-paired-birds-and-palmettes" | "blue-staggered-leaf-scrolls" | "gold-leaf-scroll" | "gold-quatrefoil-vine" | "interlocking-ribbon" | "olive-leaf-and-red-berry-vine" | "painted-opposed-serrated-flower-vine" | "painted-rosette-and-fan-vine" | "plate-01-linked-scrolls" | "plate-02-stepped-ribbon" | "plate-03-spiral-bands" | "plate-04-heart-and-diamond" | "plate-05-blue-curls" | "plate-06-paired-red-scrolls" | "plate-07-blue-heart-leaves" | "plate-08-diagonal-cross" | "plate-09-interlaced-knot" | "plate-10-blue-palmettes" | "plate-12-arched-diamonds" | "plate-13-leaf-and-flower-vine" | "plate-14-crossed-diamonds" | "plate-15-diamond-square" | "plate-17-stepped-arches" | "plate-18-fan-palmettes" | "plate-19-cream-scrolls" | "plate-20-segmented-medallions" | "plate-21-green-flower-medallions" | "plate-22-white-petal-grid" | "plate-23-crossed-ribbon-knots" | "plate-24-gold-ring-scrolls" | "plate-25-greek-crosses" | "plate-26-eight-petal-rosette" | "plate-27-blue-flower-medallions" | "plate-28-angular-blue-meander" | "plate-29-red-acanthus" | "plate-30-layered-palmettes" | "plate-31-alternating-florets" | "plate-32-linked-ovals" | "plate-33-leaf-scrolls" | "plate-34-nested-fans" | "plate-35-crossed-white-stems" | "plate-38-diagonal-meander" | "purple-fine-scroll-lattice" | "purple-opposed-scroll-vine" | "purple-oval-rosette-vine" | "red-berry-vine" | "red-rosette-vine" | "red-trefoil-vine" | "rosselli-foliate-border" | "rosselli-mask-border" | "russet-floral-vine-with-bud-borders" | "russet-opposed-flowers-and-sage-leaves" | "sage-leaf-and-russet-bud-vine";
export type WholeDesignName = "acanthus-tailpiece" | "aldegrever-paired-tendrils" | "blue-acanthus-and-seed-head-panel" | "briar-divider" | "butterfly-panel-red" | "floral-bird-panel-blue" | "floral-bird-panel-left" | "floral-bird-panel-right" | "gold-cinquefoil-divider-center" | "gold-cinquefoil-divider-end" | "gold-lozenge-divider-center" | "gold-lozenge-divider-end" | "gold-scroll-with-blue-bellflowers" | "hoefnagel-strapwork-frame" | "hopfer-thistle-panel" | "illuminated-acanthus-corner" | "illuminated-acanthus-corner-bottom-left" | "illuminated-acanthus-corner-bottom-right" | "illuminated-acanthus-corner-top-right" | "illuminated-acanthus-frame" | "illuminated-acanthus-headpiece" | "illuminated-acanthus-tailpiece" | "isabella-gold-floral-frame" | "ivy-corner" | "ivy-corner-bottom-left" | "ivy-corner-bottom-right" | "ivy-corner-top-right" | "ivy-fleuron" | "ivy-line-filler" | "ivy-manuscript-frame" | "ivy-marginal-vine" | "painted-sprawling-floral-panel" | "painted-symmetric-leaf-and-flower-panel" | "painted-three-band-floral-panel" | "plate-11-acanthus-scroll" | "plate-16-stepped-corner" | "plate-36-greek-key" | "plate-37-diamond-scroll" | "rosselli-foliate-strip" | "rosselli-mask-strip" | "rosselli-roundel-bottom" | "rosselli-roundel-second" | "rosselli-roundel-third" | "rosselli-roundel-top" | "songbirds-headpiece" | "spiral-ribbon-column" | IllustrationDesignName;
export type IllustrationDesignName = "anafiles" | "animal-choir-landscape" | "animal-musicians-ensemble" | "bird-wind-player" | "boar-lute-player" | "bunny-harp" | "bunny-trumpet" | "canine-fiddle-player" | "cat-reading-book" | "choirbook-and-ivy" | "creature-in-gold-shape" | "crowned-cat" | "curled-cat" | "donkey-organist" | "donkey-rooster-lute-player" | "fish-with-arms" | "flying-pig" | "frog" | "funny-faced-lying-cat" | "hoefnagel-cut-apple" | "hoefnagel-rose-lower" | "hoefnagel-rose-upper" | "hooded-bagpiper" | "hooded-harp-player" | "isabella-blue-cornflower" | "isabella-gray-butterfly" | "isabella-orange-butterfly" | "isabella-pink-rose" | "isabella-small-bird" | "lizard-lute-player" | "musician-r1-c1-organ-player" | "musician-r1-c2-shawm-player" | "musician-r1-c3-horn-player" | "musician-r1-c4-horn-player" | "musician-r2-c1-bagpiper" | "musician-r2-c2-bagpiper" | "musician-r2-c3-horn-player" | "musician-r2-c4-psaltery-player" | "musician-r3-c1-bagpiper" | "musician-r3-c2-lute-player" | "musician-r3-c3-lute-player" | "musician-r3-c4-pipe-player" | "musicians-and-dancers" | "polyhymnia" | "rabbit-bagpiper" | "rabbit-horn-hound-rider" | "rabbit-lutenist-painted" | "rabbit-reading-book" | "seated-rabbit" | "snail" | "walters-centaur-archer" | "walters-elephant-castle" | "walters-horse-flute-drum" | "walters-rabbit-church-bells" | "weird-dog" | "white-animal-bagpiper" | "winged-rabbit";
export type Category = "animals" | "botanical" | "fantasy" | "floral" | "geometric" | "humans" | "hybrids" | "knotwork" | "music" | "reading" | "ribbons" | "royalty" | "scrollwork";
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
  readonly author?: string;
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
