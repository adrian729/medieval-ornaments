import type { WholeDesign } from '../common.js';
type Design = WholeDesign<"blue-acanthus-and-seed-head-panel", "svg" | "webp" | "png", "decoration">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type ImageOptions = Design['imageOptions'];
export declare const createOrnamentImage: Design['createOrnamentImage'];
