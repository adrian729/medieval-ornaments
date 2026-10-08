import type { BoundComponent, BoundProps } from '../react-core.js';
import type { ImageOptions } from '../designs/weird-dog.js';
export { ornament } from '../designs/weird-dog.js';
export type { OrnamentStyle } from '../react-core.js';
export type OrnamentImageProps = BoundProps<'image', ImageOptions>;
export declare const OrnamentImage: BoundComponent<'image', ImageOptions>;
