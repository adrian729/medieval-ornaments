import type { WholeOrnament, ResolvedOrnament, OrnamentController, ImageOptions as BaseImageOptions } from '../common.js';
export declare const ornament: WholeOrnament & { readonly name: "seated-rabbit"; readonly asset_type: "illustration" };
export type ImageOptions = Omit<BaseImageOptions, 'design' | 'format'> & { design?: "seated-rabbit"; format?: "auto" | "webp" | "png" };
export declare function resolveOrnament(use: 'image', options?: ImageOptions): ResolvedOrnament;
export declare function createOrnamentImage(element: HTMLImageElement, options?: ImageOptions): OrnamentController<ImageOptions>;
