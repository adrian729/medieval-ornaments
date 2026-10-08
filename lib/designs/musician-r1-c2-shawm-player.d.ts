import type { WholeDesign } from '../common.js';
type Design = WholeDesign<"musician-r1-c2-shawm-player", "webp" | "png", "illustration">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type ImageOptions = Design['imageOptions'];
export declare const createOrnamentImage: Design['createOrnamentImage'];
