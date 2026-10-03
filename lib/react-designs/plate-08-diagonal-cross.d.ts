import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';
import type { OrnamentStyle } from '../react-core.js';
import type { FrameOptions, DividerOptions } from '../designs/plate-08-diagonal-cross.js';
export { ornament } from '../designs/plate-08-diagonal-cross.js';
export type { OrnamentStyle };
export type OrnamentFrameProps = FrameOptions & Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle };
export declare const OrnamentFrame: ForwardRefExoticComponent<OrnamentFrameProps & RefAttributes<HTMLDivElement>>;
export type OrnamentDividerProps = DividerOptions & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle; children?: never };
export declare const OrnamentDivider: ForwardRefExoticComponent<OrnamentDividerProps & RefAttributes<HTMLDivElement>>;
