import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';
import type { OrnamentStyle } from '../react-core.js';
import type { ImageOptions } from '../designs/musician-r2-c3-horn-player.js';
export { ornament } from '../designs/musician-r2-c3-horn-player.js';
export type { OrnamentStyle };
export type OrnamentImageProps = ImageOptions & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'height' | 'width' | 'alt' | 'children' | 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle; children?: never };
export declare const OrnamentImage: ForwardRefExoticComponent<OrnamentImageProps & RefAttributes<HTMLImageElement>>;
