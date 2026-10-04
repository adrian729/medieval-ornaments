import type { RepeatOrnament, ResolvedOrnament, OrnamentController, FrameOptions as BaseFrameOptions, DividerOptions as BaseDividerOptions } from '../common.js';
export declare const ornament: RepeatOrnament & { readonly name: "red-berry-vine"; readonly asset_type: "border" };
export type FrameOptions = Omit<BaseFrameOptions, 'design' | 'format'> & { design?: "red-berry-vine"; format?: "auto" | "svg" | "webp" | "png" };
export declare function resolveOrnament(use: 'frame', options?: FrameOptions): ResolvedOrnament;
export declare function createFrame(element: HTMLElement, options?: FrameOptions): OrnamentController<FrameOptions>;
export type DividerOptions = Omit<BaseDividerOptions, 'design' | 'format'> & { design?: "red-berry-vine"; format?: "auto" | "svg" | "webp" | "png" };
export declare function resolveOrnament(use: 'divider', options?: DividerOptions): ResolvedOrnament;
export declare function createDivider(element: HTMLElement, options?: DividerOptions): OrnamentController<DividerOptions>;
