import type { WholeOrnament, SelectionFilters } from './index.js';
export type ScopedOrnament = WholeOrnament & { readonly name: "blue-acanthus-and-seed-head-panel" | "butterfly-panel-red" | "floral-bird-panel-blue" | "floral-bird-panel-left" | "floral-bird-panel-right" | "gold-scroll-with-blue-bellflowers" | "painted-sprawling-floral-panel" | "painted-symmetric-leaf-and-flower-panel" | "painted-three-band-floral-panel" | "plate-11-acanthus-scroll" | "plate-16-stepped-corner" | "plate-36-greek-key" | "plate-37-diamond-scroll" | "spiral-ribbon-column"; readonly asset_type: "decoration" };
export declare const ornaments: readonly ScopedOrnament[];
export declare function getOrnament(name: string): ScopedOrnament;
export declare function findOrnaments(filters?: SelectionFilters): ScopedOrnament[];
