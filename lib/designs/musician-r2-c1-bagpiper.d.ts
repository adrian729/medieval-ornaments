import type { WholeDesign } from '../common.js';
type Design = WholeDesign<"musician-r2-c1-bagpiper", "webp" | "png", "illustration">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type ImageOptions = Design['imageOptions'];
export declare const createOrnamentImage: Design['createOrnamentImage'];
