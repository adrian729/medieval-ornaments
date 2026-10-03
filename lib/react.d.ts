import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';
import type { FrameOptions, DividerOptions, ImageOptions } from './index.js';
export type OrnamentStyle = CSSProperties & { [key: `--${string}`]: string | number | undefined };
export type OrnamentFrameProps = FrameOptions & Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle };
export type OrnamentDividerProps = DividerOptions & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle; children?: never };
export type OrnamentImageProps = ImageOptions & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'height' | 'width' | 'alt' | 'children' | 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle; children?: never };
export declare const OrnamentFrame: ForwardRefExoticComponent<OrnamentFrameProps & RefAttributes<HTMLDivElement>>;
export declare const OrnamentDivider: ForwardRefExoticComponent<OrnamentDividerProps & RefAttributes<HTMLDivElement>>;
export declare const OrnamentImage: ForwardRefExoticComponent<OrnamentImageProps & RefAttributes<HTMLImageElement>>;
