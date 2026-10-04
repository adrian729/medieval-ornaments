import type { WholeOrnament, ResolvedOrnament, OrnamentController, ImageOptions as BaseImageOptions } from '../common.js';
export declare const ornament: WholeOrnament & { readonly name: "musician-r1-c1-organ-player"; readonly asset_type: "illustration" };
export type ImageOptions = Omit<BaseImageOptions, 'design' | 'format'> & { design?: "musician-r1-c1-organ-player"; format?: "auto" | "webp" | "png" };
export declare function resolveOrnament(use: 'image', options?: ImageOptions): ResolvedOrnament;
export declare function createOrnamentImage(element: HTMLImageElement, options?: ImageOptions): OrnamentController<ImageOptions>;
