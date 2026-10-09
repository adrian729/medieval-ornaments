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

## Registry payload adjustment

The verified unified 340,776,285 B archive was rejected by npm with HTTP 413
before publication. Preserve all artwork bytes and the single repo/runtime by
splitting the optional distribution: the existing border/decoration archive
retains direct imports and pins the separate 406-file illustration archive.
The full optional install still supplies all 111 designs; illustrations alone
need only their archive. Both contain the same approved unified manifest, whose
illustration file records identify their owning package. Resolver defaults and
CLI discovery route by family; explicit local/HTTP flat mirrors remain supported.
No artwork dependency is added to the runtime. Publish illustrations, full
artwork companion, runtime, in that order, with exact archive/integrity checks.

## Original repository retirement · 2026-10-05

At the user's request, `adrian729/medieval-cutouts` was deleted from GitHub
after all 412 imported files matched the historical migration inventory.
The latest remote main commit still matched the imported HEAD. Its complete
Git history was exported and verified as a bundle; the local checkout,
including the original uncommitted musicians-and-dancers files, is retained
at `../medieval-cutouts`. The additional local history backup is
`tmp/remove-rights/medieval-cutouts-history.bundle` (ignored, not a package or
site asset). Original import snapshots remain unchanged.

There was no separate `@ranx729/medieval-cutouts` npm package to remove.
The numbered illustration resource and legacy illustration compatibility
archive remain part of medieval-ornaments delivery. Future illustration
work belongs in this repository and its assigned resource checkout.

## Illustration maintenance record

## Migration and maintenance

- Names and PNG/WebP paths are unchanged; old raw GitHub URLs still refer to the
  old repository. New raw URLs use `adrian729/medieval-ornaments`. Pin a commit
  when using raw assets; package URLs are version-pinned automatically.
- `illustrations.json` is the editable illustration master catalog. Selection
  edits can run `.venv/bin/python scripts/selection_metadata.py`, then refresh
  the README with `scripts/catalog.py`. No image regeneration is needed.
- `selection-metadata.json` contains inspected ornament description improvements,
  subject aliases and exceptional usage notes. `scripts/selection_metadata.py`
  applies them, measures transparency and composes the unified `images.json`.
- To add an illustration, preserve a PNG master in `png/<name>.png` and append
  an entry to `illustrations.json` using the template below. The WebP path names
  the output; the WebP file need not exist yet. `variants`, dimensions and byte
  counts are generated, so they can be omitted on a new entry. Run
  `.venv/bin/python scripts/build_illustrations.py --name <name>`.
  Record factual `derivation` and `reference` when known; new entries default to
  `supplied-illustration`, without assuming an AI extraction or historical identity.
  It generates 128/256/512/768 variants directly from the master, skips equal or
  larger limits, checks lossless visible pixels/alpha and leaves all PNG masters
  unchanged. Preflight checks the shared vocabulary, unique names, canonical
  paths and collisions with border/decoration components before writing. The
  command requires explicit names to avoid collection-wide churn.
- Optional authored `usage_notes` in `illustrations.json` are preserved alongside
  generated capability/fidelity notes. Do not edit generated `images.json` or
  `lib/` modules directly.
- Border builds retain illustration files even when an entry is removed from
  the master catalog. Removing metadata is not a file deletion command: review
  orphaned artwork separately, preserving source masters and import records.
  Package builds generate metadata/types only.
- Artwork changes advance the affected numbered resource version and its
  exact main lock; publish and verify that resource before the runtime. Changes
  to descriptions or selection tags alone do not require artwork publication.
  The optional legacy archives remain compatibility snapshots; refreshing them
  requires advancing both archive versions, their shared manifest and runtime
  compatibility pins. Follow the [resource release guide](RESOURCES.md).
- `illustration-import.json` records migration hashes and the original checkout's
  HEAD. `sources/medieval-cutouts/` retains the original catalog, metadata guide,
  extraction records and the two documented source references. The migration
  includes the newer `musicians-and-dancers` working-tree addition. Its prompt
  records the retained left vine and removal of the cropped right vine.
- The original checkout/history remains intact. Future collection development
  belongs here. This was an allowlisted file migration, without rewriting either
  repository's Git history or committing unrelated workspace files.

`polyhymnia` is a user-supplied modern AI illustration retained as a complete
framed scene. Its original input hash and exact generation prompt are recorded
in `illustration-additions.json`; no historical source attribution is inferred.
The corrected native 1004×1567 master has lossless PNG/WebP exports and 128/256/512/768
variants in illustrations-001. The painted frame and landscape remain intact.

Example new entry (replace the name and description/tags with the inspected
artwork's actual details; omit provenance fields when unknown):

```json
{
  "name": "new-leafy-sprig",
  "png": "png/new-leafy-sprig.png",
  "webp": "webp/new-leafy-sprig.webp",
  "description": "A curved stem bearing three green leaves.",
  "categories": ["botanical"],
  "subjects": ["stem", "leaf"],
  "facing": "unclear",
  "colors": ["green"],
  "composition": "single-ornament",
  "usage_notes": ["Keep the open space beside the curved stem."]
}
```

After adding or changing metadata/artwork, refresh and validate the catalog:

```sh
.venv/bin/python scripts/selection_metadata.py
.venv/bin/python scripts/catalog.py
.venv/bin/python scripts/catalog.py --check
.venv/bin/python scripts/artwork_check.py
.venv/bin/python scripts/check_illustration_build.py
```

Assign and approve the affected numbered resource revision as described in
[RESOURCES.md](RESOURCES.md), then run `npm run build` to synchronize public
catalogs, individual entries and types. The legacy archives are optional,
immutable snapshots; new numbered artwork does not require refreshing them.
Inspect the actual illustration at its intended sizes and backgrounds. The
migration hash regression deliberately protects imported artwork; an intentional
correction also needs a separate documented revision and an updated regression
expectation, while the original import inventory remains unchanged.

The original bytes, metadata snapshot and hashes make the merge auditable. New
artwork corrections need their own source/method record; do not silently rewrite
the migration snapshot or claim AI extractions are exact source crops. Artwork
rights remain separate from the integration software; see [LICENSE](../LICENSE).

## Historical additions reviewed 2026-10-08

The historical additions include 23 assets: 13 illustrations and 10 whole decorations.
Twenty-two are AI-assisted extractions from historical objects with CC0 or
public-domain museum reproductions. The rabbit riding a hound is an explicitly
modern, independently composed interpretation of a documented marginal motif;
the restricted Fitzwilliam image was not imported or edited.

[historical-additions.json](../historical-additions.json) records nine untouched
source images and their hashes, each chosen region, exact edit prompt, retained
native result, source-resolution export cap and individual visual review.
[The candidate tracker](source-candidates.json) links all ten object records to
their resulting assets. New master entries carry optional `provenance`; it is
preserved in JSON, scoped/individual metadata, copied components and TypeScript.
The browser shows source links and searches institutions, artists and object
identifiers. The existing 111 entries have no provenance backfill.

Rosselli's sheet yields two whole strips and four individual roundels.
Isabella's illumination yields its fixed gold frame and five separate figures
(two butterflies, a bird, a rose and a blue flower). Hoefnagel's page yields two
separate roses, its touching apple halves as one composition and a fixed penwork
frame. The elephant, rabbit/church and engraved panels retain their connected
compositions. These 23 assets remain whole images. Two additional borders,
`rosselli-mask-border` and `rosselli-foliate-border`, use verified interior cycles
from the approved strips. Their native PNG/WebP units retain the alternating
motifs; only a two-pixel join collar is adjusted. The original strips stay
unchanged. Corners are modern AI-assisted foliate adaptations of the same artwork, with a
phase-matched atlas for `round` fitting. No SVG redraw is supplied. Bounds,
hashes and repeat evidence are in `historical-border-patterns.json`.

The 0.8.1 runtime uses numbered resource revisions 0.1.3. Exact source commits
and approved manifest hashes are recorded in `resource-lock.json`; README
previews use immutable source URLs. Use `?assets=local` only for authoring previews.
Release packing rejects missing commit pins. The user-supplied Polyhymnia scene
uses the corrected 1004×1567 native image and all rebuilt PNG/WebP sizes; its
original description, filenames, generation prompt and superseded hashes remain
audited in `illustration-additions.json`.
