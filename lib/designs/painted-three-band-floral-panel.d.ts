import type { WholeOrnament, ResolvedOrnament, OrnamentController, ImageOptions as BaseImageOptions } from '../common.js';
export declare const ornament: WholeOrnament & { readonly name: "painted-three-band-floral-panel" };
export type ImageOptions = Omit<BaseImageOptions, 'design' | 'format'> & { design?: "painted-three-band-floral-panel"; format?: "auto" | "svg" | "webp" | "png" };
export declare function resolveOrnament(use: 'image', options?: ImageOptions): ResolvedOrnament;
export declare function createOrnamentImage(element: HTMLImageElement, options?: ImageOptions): OrnamentController<ImageOptions>;
