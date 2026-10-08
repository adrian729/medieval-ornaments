import type { WholeDesign } from '../common.js';
type Design = WholeDesign<"hopfer-thistle-panel", "webp" | "png", "decoration">;
export declare const ornament: Design['ornament'];
export declare const resolveOrnament: Design['resolve'];
export type ImageOptions = Design['imageOptions'];
export declare const createOrnamentImage: Design['createOrnamentImage'];
