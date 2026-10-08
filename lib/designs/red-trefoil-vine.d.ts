import type { RepeatDesign } from '../common.js';
type Design = RepeatDesign<"red-trefoil-vine", "svg" | "webp" | "png", "border">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type FrameOptions = Design['frameOptions'];
export declare const createFrame: Design['createFrame'];
export type DividerOptions = Design['dividerOptions'];
export declare const createDivider: Design['createDivider'];
