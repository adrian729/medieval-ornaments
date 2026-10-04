# Illustration merge

The requested consolidation brings medieval-cutouts into medieval-ornaments.
“Ornaments” is the collection name; illustrations remain explicitly identified
as illustrations rather than being presented as repeating borders.

## Review and decisions

- The source checkout has 41 illustrations, including the uncommitted
  `musicians-and-dancers` addition. It has no npm package or component runtime.
  Its HEAD is `9c93e54`; migration also records the working-tree catalog and
  individual SHA-256 hashes. The original checkout and its history stay intact.
- Both collections already have description, categories, subjects, facing,
  colors and composition. Preserve all six illustration fields exactly;
  combine their vocabularies rather than flattening or renaming their tags.
- Names and asset paths do not collide. Copy only cataloged PNG/WebP files and
  documented reference sources, byte-for-byte. Keep the root `png/` / `webp/`
  paths and 128/256/512/768 variants. No resampling, tracing or AI edits.
- Store the illustration master catalog in `illustrations.json`. Preserve its
  original imported snapshot and extraction records in `sources/medieval-cutouts/`.
  The unified generated `images.json` remains the public catalog. Rebuilds must
  preserve illustrations and cannot treat them as generated border files to delete.
- Keep `kind: repeat-tile | standalone` and existing component names/options.
  Add `asset_type: border | decoration | illustration`, measured
  `has_transparency`, and factual `usage_notes` to aid autonomous selection.
  Improve the old generic descriptions from inspected artwork; retain repeat
  evidence and limitations in the existing source audits and usage notes.
- Use the existing `OrnamentImage` / `createOrnamentImage`, per-design exports and
  `add` installer for illustrations. They have image capability only, lossless
  raster formats, reserved aspect ratio, deterministic density-aware size
  selection, and native loading/decoding/priority controls. Do not add a second
  observer, React runtime or rendering engine. SVG is unavailable for cutouts.
- Keep the runtime free of artwork and automatic asset dependencies. The
  optional artwork archive grows; selected applications only request/install
  selected designs. Add scoped catalogs for borders, decorations and
  illustrations; these must import only their own metadata.
- Add type, transparency, facing and composition selection filters. Keep
  existing AND semantics, alphabetical results, and full-catalog APIs.
- Extend the permanent browser with an illustration view and metadata filters.
  Keep existing whole-image, frame and divider links/controls compatible.
  Thumbnails remain viewport-gated and use sufficient smaller variants.
- Keep artwork rights separate from software rights and preserve extraction
  limitations. No claim of new authorship, historical attribution or license.
- The merged public artwork plus the full browser ZIP approaches the Pages
  storage limit. Keep editable trace masters in Git and omit this redundant
  directory from site staging; retain source references and all public exports.
  Measure the assembled site and enforce a 950 MB deployment budget.

## Verification

1. Compare every imported file to the inventory; verify original ornament bytes
   against the pre-merge manifest and preserve cutout metadata/source bytes.
2. Verify every raster pair, dimension, alpha channel, variant size and all
   existing repeat/frame/rotation/source checks.
3. Test selection, scoped metadata graphs, per-design capabilities, image
   resolution boundaries, types, SSR and React 18/19 compatibility.
4. Exercise actual packed vanilla/React and local-component consumers, selected
   HTTP and offline installs, incremental additions and user-edit protection.
5. Measure production bundles, selected illustration file sizes, cold-cache
   loading and layout. An unchanged border import must not acquire illustrations.
6. Run browser previews for every design/format and existing frame geometry;
   inspect illustration metadata, mobile layouts and light/dark appearance.
7. Synchronize documentation, package plan, version pins, asset manifest and QA.
   Publish only verified artifacts in companion-before-runtime order if releasing.

Implementation and validation status are recorded in PACKAGE-PLAN.md and QA.md.
