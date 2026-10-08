import type { WholeDesign } from '../common.js';
type Design = WholeDesign<"floral-bird-panel-left", "webp" | "png", "decoration">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type ImageOptions = Design['imageOptions'];
export declare const createOrnamentImage: Design['createOrnamentImage'];
