import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';
export type OrnamentStyle = CSSProperties & { [key: `--${string}`]: string | number | undefined };
type ElementFor<Use> = Use extends 'image' ? HTMLImageElement : HTMLDivElement;
type Omitted<Use> = 'style' | 'dangerouslySetInnerHTML' | (Use extends 'frame' ? never : 'children') | (Use extends 'image' ? 'src' | 'srcSet' | 'sizes' | 'height' | 'width' | 'alt' : never);
export type BoundProps<Use extends 'image' | 'frame' | 'divider', Options> = Options & Omit<Use extends 'image' ? ImgHTMLAttributes<HTMLImageElement> : HTMLAttributes<HTMLDivElement>, Omitted<Use>> & { style?: OrnamentStyle } & (Use extends 'frame' ? {} : { children?: never });
export type BoundComponent<Use extends 'image' | 'frame' | 'divider', Options> = ForwardRefExoticComponent<BoundProps<Use, Options> & RefAttributes<ElementFor<Use>>>;
