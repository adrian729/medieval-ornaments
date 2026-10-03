import type { WholeOrnament, ResolvedOrnament, OrnamentController, ImageOptions as BaseImageOptions } from '../common.js';
export declare const ornament: WholeOrnament & { readonly name: "gold-scroll-with-blue-bellflowers" };
export type ImageOptions = Omit<BaseImageOptions, 'design' | 'format'> & { design?: "gold-scroll-with-blue-bellflowers"; format?: "auto" | "svg" | "webp" | "png" };
export declare function resolveOrnament(use: 'image', options?: ImageOptions): ResolvedOrnament;
export declare function createOrnamentImage(element: HTMLImageElement, options?: ImageOptions): OrnamentController<ImageOptions>;
