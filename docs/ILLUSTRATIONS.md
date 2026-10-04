# Illustrations and autonomous selection

The collection includes 41 manuscript-style illustrations migrated from
medieval-cutouts, alongside 56 repeating borders and 14 whole decorations.
Illustrations can ornament a page, but they remain distinct catalog types.
Their descriptions, categories, subjects, facing, colors and composition are
preserved from the reviewed cutout catalog. No illustration was redrawn,
traced, resized or re-encoded during migration.

## Use one illustration

In an existing React or vanilla application, install the lightweight runtime:

```sh
npm install @ranx729/medieval-ornaments@0.6.1
```

React applications also need their own React dependency. The commands and imports
below request only displayed artwork from the pinned CDN; neither artwork archive
is installed automatically. To copy editable components instead of depending on
the runtime, use [`add`](#copy-only-selected-code-and-artwork).

```jsx
import { OrnamentImage as FlyingPig } from
  '@ranx729/medieval-ornaments/react/flying-pig';

<FlyingPig size={128} loading="lazy" decoding="async" alt="" />
```

```js
import { createOrnamentImage } from
  '@ranx729/medieval-ornaments/designs/rabbit-reading-book';
import '@ranx729/medieval-ornaments/styles.css';

const illustration = createOrnamentImage(document.querySelector('img'), {
  size: 160,
  loading: 'lazy',
  decoding: 'async',
  alt: 'A rabbit reading an open book'
});
// illustration.update({ size: 128 });
// illustration.destroy();
```

`size` is the image's CSS **height**, preserving its proportions. At the default
`pixelRatio: 2`, a 128px square image chooses the smallest listed raster at least
256px across. Portrait and landscape images use actual dimensions, not square
assumptions. The resolver returns `asset.resolutionLimited` when even the master
cannot satisfy the requested resolution. Assets are never enlarged during
generation; choose another image or a smaller display when needed.

WebP is the default. PNG is available explicitly with `format: 'png'`. Cutouts
have no SVG, repeat unit, corner or frame capability. The individual modules
export `OrnamentImage` / `createOrnamentImage` only. The generic APIs accept the
same names with a required `design` option. Use `/react/unstyled/<name>` for
plain Node SSR and load CSS in the browser entry.

Use `alt=""` for a purely decorative image; describe imagery conveying meaning.
Descriptions are selection metadata, not automatically assigned alt text.
`loading="lazy"` suits offscreen illustrations. For a prominent visible image,
use eager loading; `fetchPriority="high"` is available when that image is important
to first paint. Image dimensions reserve the aspect ratio before loading.
`decoding="async"`, native load/error events and forwarded refs work as for an img.
Defaults remain eager loading, automatic decoding/priority and 2× density.

## Copy only selected code and artwork

```sh
npx @ranx729/medieval-ornaments@0.6.1 add flying-pig rabbit-reading-book
```

This writes editable React modules under `src/ornaments/` and only their verified
WebP masters/variants under `public/ornaments/`. It also copies the required
helpers, CSS, declarations and rights notices. It does not install the complete
artwork archive. Import from `./ornaments/flying-pig.js` in a component under src.
For vanilla use `--framework vanilla`. `--format png` or `--format all` selects
other available formats; attempting SVG fails before downloads.

```jsx
import { OrnamentImage as FlyingPig } from './ornaments/flying-pig.js';
<FlyingPig size={128} loading="lazy" />
```

Package imports use the independently version-pinned artwork CDN. For self-hosted
images, pass `assetsBase: '/ornaments/'`; the installer sets this default in copied
modules. Offline/mirror installs, edits, incremental additions and upgrades use
the existing [selective installer contract](SELECTIVE.md). The complete artwork
remains optional; adding illustrations does not make it a runtime dependency.

For illustration-only offline copying, first install the runtime/CLI and the
data-only archive while connected, then copy locally:

```sh
npm install @ranx729/medieval-ornaments@0.6.1
npm install --save-dev @ranx729/medieval-ornaments-illustration-assets@0.1.0
npx --no-install medieval-ornaments copy-assets public/ornaments \
  --design flying-pig --offline
```

The archive alone does not provide the CLI. `--no-install` uses your installed
generator; `--offline` prevents artwork requests. Then use
`<FlyingPig assetsBase="/ornaments/" size={128} />`, or the equivalent vanilla
`assetsBase` option, so the application reads the copied files. Your server must
serve `public/ornaments/` at `/ornaments/`; adjust that URL for deployments under
a subpath. Copying files does not switch the default CDN URL automatically.

Its 406 PNG/WebP masters and variants are separate from the border/decoration
archive, so illustration-only projects need not install borders. The full
`@ranx729/medieval-ornaments-assets@0.4.0` install includes both through a pinned
dependency. Direct image imports use the illustration package:

```js
import pigUrl from '@ranx729/medieval-ornaments-illustration-assets/webp/256/flying-pig.webp?url';
```

The `?url` suffix is Vite-specific; other bundlers can use their image import
convention. These data packages have no runtime code or image generation hooks.

## Help an agent choose

Use [the public catalog](https://adrian729.github.io/medieval-ornaments/images.json), the npm `/catalog.json`, and
[its JSON schema](../images.schema.json). All entries contain the same six
descriptive selection fields plus:

| Field | Decision it supports |
| --- | --- |
| `asset_type` | `border` for repetition, `decoration` for a complete ornament, `illustration` for a figure/group/scene |
| `kind`, `uses` | Whether frame/divider/image rendering is supported; `uses` is supplied by the npm catalog |
| `has_transparency` | Whether the main PNG has any alpha below 255; false means a fully opaque canvas |
| `usage_notes` | Retained backgrounds, original direction, corner constraints, extraction limitations and important exceptions |
| `width`, `height`, `variants` | Aspect ratio and the smallest adequate existing size |
| `formats`, `derivation`, `reference` | Available formats (`formats` is added by the npm catalog), fidelity and documented source family |

The schema describes the complete public catalogs. Installer catalogs are
format-filtered subsets and intentionally omit paths for formats not installed.

An autonomous selection workflow:

1. Identify the use and content type. A separator needs border/divider capability;
   an animal beside text needs an illustration/image. A whole corner is a
   decoration/image, even if its source resembles a border.
2. Filter broad categories and specific subjects. Match the face direction to
   the layout; `facing` describes the head, not the instrument. All requested
   tags must match; categories overlap. For alternatives, combine separate queries.
3. Compare composition, proportions and colors. `framed-scene` preserves a scene
   or frame; `multiple-figures` is an unframed group. Transparency can coexist
   with an opaque interior frame or ground strip; inspect the preview.
4. Read the description and usage notes. Preserve uncertain identifications
   such as bird-like creatures. Do not convert whole artwork into a repeat merely
   because it visually contains recurring forms.
5. Inspect a preview on the intended background. Resolve the desired size and
   density; check `resolutionLimited`. Use an available catalog path, not a guessed
   folder name. SVG traces do not recover missing historical detail.
6. Import or install the chosen names individually. Keep discovery catalogs out
   of the final UI bundle when design choices are already made.

```js
import { findOrnaments } from
  '@ranx729/medieval-ornaments/catalog/illustrations';

const candidates = findOrnaments({
  categories: ['animals', 'music'],
  subjects: ['rabbit'],
  facing: 'left',
  hasTransparency: true,
  composition: 'single-figure'
});
```

This scoped catalog imports only illustration metadata, with no React or image
requests. `/catalog/borders` and `/catalog/decorations` work the same way.
`/catalog` searches all 111 entries. The complete API also supports `assetType`,
for example `findOrnaments({ assetType: 'illustration', query: 'wings gold' })`.
Search is case-insensitive, with all whitespace-separated tokens required;
it includes descriptions, usage notes, subjects, colors, types and composition.
Results are alphabetical and do not imply relevance ranking.

The [design browser](https://adrian729.github.io/medieval-ornaments/examples/?type=illustration) offers type,
category, search, facing, composition and transparency filters. The permanent
React/vanilla demos accept every illustration in the whole-image picker.

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
- Any catalog/artwork change requires **both** artwork archive versions and root
  pins to advance, plus the full archive's exact illustration dependency. The
  archives share one verified manifest. Follow the
  [release sequence](INTEGRATION.md#examples-and-development); code-only changes
  retain the existing artwork pins.
- `illustration-import.json` records migration hashes and the original checkout's
  HEAD. `sources/medieval-cutouts/` retains the original catalog, metadata guide,
  extraction records and the two documented source references. The migration
  includes the newer `musicians-and-dancers` working-tree addition. Its prompt
  records the retained left vine and removal of the cropped right vine.
- The original checkout/history remains intact. Future collection development
  belongs here. This was an allowlisted file migration, without rewriting either
  repository's Git history or committing unrelated workspace files.

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

Then advance both artwork revisions/dependency as described above, generate the
new manifest with `npm run build:assets -- --update-manifest`, and run
`npm run build` to synchronize all public catalogs, individual entries and types.
Inspect the actual illustration at its intended sizes and backgrounds. The
migration hash regression deliberately protects imported artwork; an intentional
correction also needs a separate documented revision and an updated regression
expectation, while the original import inventory remains unchanged.

The original bytes, metadata snapshot and hashes make the merge auditable. New
artwork corrections need their own source/method record; do not silently rewrite
the migration snapshot or claim AI extractions are exact source crops. Artwork
rights remain separate from the integration software; see [ASSET-RIGHTS.md](../ASSET-RIGHTS.md).
