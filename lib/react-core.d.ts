import type { CSSProperties } from 'react';
export type OrnamentStyle = CSSProperties & { [key: `--${string}`]: string | number | undefined };
