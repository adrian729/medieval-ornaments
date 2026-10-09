import type { WholeOrnament, SelectionFilters, IllustrationDesignName } from './index.js';
export type ScopedOrnament = WholeOrnament & { readonly name: IllustrationDesignName; readonly asset_type: "illustration" };
export declare const ornaments: readonly ScopedOrnament[];
export declare function getOrnament(name: string): ScopedOrnament;
export declare function findOrnaments(filters?: SelectionFilters): ScopedOrnament[];
