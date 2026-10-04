import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';
import type { OrnamentStyle } from '../react-core.js';
import type { ImageOptions } from '../designs/snail.js';
export { ornament } from '../designs/snail.js';
export type { OrnamentStyle };
export type OrnamentImageProps = ImageOptions & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'height' | 'width' | 'alt' | 'children' | 'style' | 'dangerouslySetInnerHTML'> & { style?: OrnamentStyle; children?: never };
export declare const OrnamentImage: ForwardRefExoticComponent<OrnamentImageProps & RefAttributes<HTMLImageElement>>;
