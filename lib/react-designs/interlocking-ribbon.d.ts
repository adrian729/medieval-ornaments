import type { BoundComponent, BoundProps } from '../react-core.js';
import type { FrameOptions, DividerOptions } from '../designs/interlocking-ribbon.js';
export { ornament } from '../designs/interlocking-ribbon.js';
export type { OrnamentStyle } from '../react-core.js';
export type OrnamentFrameProps = BoundProps<'frame', FrameOptions>;
export declare const OrnamentFrame: BoundComponent<'frame', FrameOptions>;
export type OrnamentDividerProps = BoundProps<'divider', DividerOptions>;
export declare const OrnamentDivider: BoundComponent<'divider', DividerOptions>;
