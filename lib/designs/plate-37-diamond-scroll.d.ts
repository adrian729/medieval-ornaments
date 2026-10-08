import type { WholeDesign } from '../common.js';
type Design = WholeDesign<"plate-37-diamond-scroll", "svg" | "webp" | "png", "decoration">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type ImageOptions = Design['imageOptions'];
export declare const createOrnamentImage: Design['createOrnamentImage'];
