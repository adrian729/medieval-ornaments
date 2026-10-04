export interface AssetSource { readonly id: string; readonly collection: string; readonly package: string; readonly version: string; readonly base: string; readonly manifestSha256: string; readonly filesSha256: string; readonly activeFilesSha256: string; }
export declare function getAssetSource(name: string): AssetSource;
