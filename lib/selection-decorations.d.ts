import type { WholeOrnament, SelectionFilters, WholeDesignName, IllustrationDesignName } from './index.js';
export type ScopedOrnament = WholeOrnament & { readonly name: Exclude<WholeDesignName, IllustrationDesignName>; readonly asset_type: "decoration" };
export declare const ornaments: readonly ScopedOrnament[];
export declare function getOrnament(name: string): ScopedOrnament;
export declare function findOrnaments(filters?: SelectionFilters): ScopedOrnament[];
