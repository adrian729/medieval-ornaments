import type { WholeOrnament, ResolvedOrnament, OrnamentController, ImageOptions as BaseImageOptions } from '../common.js';
export declare const ornament: WholeOrnament & { readonly name: "hooded-harp-player"; readonly asset_type: "illustration" };
export type ImageOptions = Omit<BaseImageOptions, 'design' | 'format'> & { design?: "hooded-harp-player"; format?: "auto" | "webp" | "png" };
export declare function resolveOrnament(use: 'image', options?: ImageOptions): ResolvedOrnament;
export declare function createOrnamentImage(element: HTMLImageElement, options?: ImageOptions): OrnamentController<ImageOptions>;
