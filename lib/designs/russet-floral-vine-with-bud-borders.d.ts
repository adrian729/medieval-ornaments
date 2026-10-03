import type { RepeatOrnament, ResolvedOrnament, OrnamentController, FrameOptions as BaseFrameOptions, DividerOptions as BaseDividerOptions } from '../common.js';
export declare const ornament: RepeatOrnament & { readonly name: "russet-floral-vine-with-bud-borders" };
export type FrameOptions = Omit<BaseFrameOptions, 'design' | 'format'> & { design?: "russet-floral-vine-with-bud-borders"; format?: "auto" | "svg" | "webp" | "png" };
export declare function resolveOrnament(use: 'frame', options?: FrameOptions): ResolvedOrnament;
export declare function createFrame(element: HTMLElement, options?: FrameOptions): OrnamentController<FrameOptions>;
export type DividerOptions = Omit<BaseDividerOptions, 'design' | 'format'> & { design?: "russet-floral-vine-with-bud-borders"; format?: "auto" | "svg" | "webp" | "png" };
export declare function resolveOrnament(use: 'divider', options?: DividerOptions): ResolvedOrnament;
export declare function createDivider(element: HTMLElement, options?: DividerOptions): OrnamentController<DividerOptions>;
