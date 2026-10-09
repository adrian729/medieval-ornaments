import type { RepeatOrnament, SelectionFilters, RepeatDesignName } from './index.js';
export type ScopedOrnament = RepeatOrnament & { readonly name: RepeatDesignName; readonly asset_type: "border" };
export declare const ornaments: readonly ScopedOrnament[];
export declare function getOrnament(name: string): ScopedOrnament;
export declare function findOrnaments(filters?: SelectionFilters): ScopedOrnament[];
