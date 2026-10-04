import type { WholeOrnament, ResolvedOrnament, OrnamentController, ImageOptions as BaseImageOptions } from '../common.js';
export declare const ornament: WholeOrnament & { readonly name: "painted-sprawling-floral-panel"; readonly asset_type: "decoration" };
export type ImageOptions = Omit<BaseImageOptions, 'design' | 'format'> & { design?: "painted-sprawling-floral-panel"; format?: "auto" | "svg" | "webp" | "png" };
export declare function resolveOrnament(use: 'image', options?: ImageOptions): ResolvedOrnament;
export declare function createOrnamentImage(element: HTMLImageElement, options?: ImageOptions): OrnamentController<ImageOptions>;
