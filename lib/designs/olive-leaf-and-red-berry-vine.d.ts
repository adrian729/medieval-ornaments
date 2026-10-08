import type { RepeatDesign } from '../common.js';
type Design = RepeatDesign<"olive-leaf-and-red-berry-vine", "svg" | "webp" | "png", "border">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type FrameOptions = Design['frameOptions'];
export declare const createFrame: Design['createFrame'];
export type DividerOptions = Design['dividerOptions'];
export declare const createDivider: Design['createDivider'];
