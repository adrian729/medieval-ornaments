export type AssetType = 'border' | 'decoration' | 'illustration';
export type Facing = 'left' | 'right' | 'front' | 'mixed' | 'unclear';
export type Composition = 'single-ornament' | 'standalone' | 'repeat-tile' | 'single-figure' | 'multiple-figures' | 'framed-scene';
export type OrnamentUse = 'frame' | 'divider' | 'image';
export type Format = 'auto' | 'svg' | 'webp' | 'png';
export type Orientation = 'original' | 'horizontal' | 'vertical';
export interface RasterVariant {
  readonly png?: string; readonly webp?: string;
  readonly width: number; readonly height: number;
  readonly max_dimension?: number; readonly rendered_max_dimension?: number;
  readonly png_bytes?: number; readonly webp_bytes?: number;
}
export interface Asset extends RasterVariant {
  readonly svg?: string; readonly viewbox?: readonly number[];
  readonly variants: readonly RasterVariant[];
  readonly repeat_axis?: 'x' | 'y' | 'none';
  readonly repeat_ratio?: number; readonly slice_pixels?: number;
}
export interface Ornament extends Asset {
  readonly name: string; readonly description: string;
  readonly categories: readonly string[]; readonly subjects: readonly string[];
  readonly colors: readonly string[]; readonly facing: Facing; readonly composition: Composition;
  readonly asset_type: AssetType; readonly has_transparency: boolean; readonly usage_notes: readonly string[];
  readonly kind: 'standalone' | 'repeat-tile'; readonly derivation: string;
  readonly uses: readonly OrnamentUse[]; readonly formats: readonly Exclude<Format, 'auto'>[];
  readonly components: Readonly<Partial<Record<'border_image' | 'corner' | 'rotated_tile' | 'reference_crop', Asset>>>;
  readonly border_image_slice_percent?: number; readonly reference?: string;
}
export interface RepeatOrnament extends Ornament {
  readonly name: string; readonly kind: 'repeat-tile';
  readonly uses: readonly ('frame' | 'divider')[]; readonly repeat_axis: 'x' | 'y';
  readonly repeat_ratio: number; readonly border_image_slice_percent: number;
}
export interface WholeOrnament extends Ornament {
  readonly name: string; readonly kind: 'standalone';
  readonly uses: readonly 'image'[]; readonly repeat_axis: 'none';
}
export interface CommonOptions {
  size?: number; format?: Format; pixelRatio?: number; assetsBase?: string; loading?: 'eager' | 'lazy';
}
export interface FrameOptions extends CommonOptions { design: string; }
export interface DividerOptions extends CommonOptions { design: string; orientation?: Orientation; length?: number | string; }
export interface ImageOptions extends CommonOptions { design: string; alt?: string; decoding?: 'auto' | 'sync' | 'async'; fetchPriority?: 'auto' | 'high' | 'low'; }
export interface SelectionFilters {
  use?: OrnamentUse; categories?: readonly string[]; subjects?: readonly string[];
  colors?: readonly string[]; query?: string; assetType?: AssetType; hasTransparency?: boolean;
  facing?: Facing; composition?: Composition;
}
export interface ResolvedOrnament {
  design: string; use: OrnamentUse; axis?: 'x' | 'y'; size: number; loading: 'eager' | 'lazy';
  className: string; style: Record<string, string>; attributes: Record<string, string>;
  asset: { path: string; url: string; format: Exclude<Format, 'auto'>; width: number; height: number; resolutionLimited: boolean; };
}
export interface OrnamentController<Options> {
  readonly element: HTMLElement;
  readonly configuration: ResolvedOrnament;
  update(options: Partial<Options>): OrnamentController<Options>;
  destroy(): void;
}
