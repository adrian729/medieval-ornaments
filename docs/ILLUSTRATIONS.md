# Illustrations and autonomous selection

The collection includes 41 manuscript-style illustrations migrated from
medieval-cutouts, alongside later additions, for 57 illustrations, 58 repeating borders and 46 whole decorations.
Illustrations can ornament a page, but they remain distinct catalog types.
Their descriptions, categories, subjects, facing, colors and composition are
preserved from the reviewed cutout catalog. No illustration was redrawn,
traced, resized or re-encoded during migration.

## Use one illustration

In an existing React or vanilla application, install the lightweight runtime:

```sh
npm install @ranx729/medieval-ornaments@0.8.1
```

React applications also need their own React dependency. **Individual imports
with CDN delivery are the recommended default:** the imports below request only
displayed image variants and create no local image files. Leave `assetsBase`
unset; no asset archive or copy command is needed. Use
[`add`](#copy-only-selected-code-and-artwork) when editable local components and
downloaded images are deliberately wanted. Agents should follow this default
unless the application's hosting/editing/offline needs justify another workflow.

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
npx @ranx729/medieval-ornaments@0.8.1 add flying-pig rabbit-reading-book
```

This writes editable React modules under `src/ornaments/` and only their verified
WebP masters/variants under `public/ornaments/`. It also copies the required
helpers, CSS, declarations and license notice. It does not install the complete
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
npm install @ranx729/medieval-ornaments@0.8.1
npm install --save-dev @ranx729/medieval-ornaments-assets-illustrations-001@0.1.3
npx --no-install medieval-ornaments copy-assets public/ornaments \
  --design flying-pig --offline
```

The archive alone does not provide the CLI. `--no-install` uses your installed
generator; `--offline` prevents artwork requests. Then use
`<FlyingPig assetsBase="/ornaments/" size={128} />`, or the equivalent vanilla
`assetsBase` option, so the application reads the copied files. Your server must
serve `public/ornaments/` at `/ornaments/`; adjust that URL for deployments under
a subpath. Copying files does not switch the default CDN URL automatically.

The numbered illustration resource contains 520 PNG/WebP files independently
of borders/decorations. npm installs that entire resource package; the copy
command extracts only selected designs. This is an optional offline workflow.
The old `@ranx729/medieval-ornaments-illustration-assets@0.1.0` archive remains a
compatible snapshot. The full
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
`/catalog` searches all 161 entries. The complete API also supports `assetType`,
for example `findOrnaments({ assetType: 'illustration', query: 'wings gold' })`.
Search is case-insensitive, with all whitespace-separated tokens required;
it includes descriptions, usage notes, subjects, colors, types and composition.
Results are alphabetical and do not imply relevance ranking.

The [design browser](https://adrian729.github.io/medieval-ornaments/examples/?type=illustration) offers type,
category, search, facing, composition and transparency filters. The permanent
React/vanilla demos accept every illustration in the whole-image picker.

## Sources, authors and maintenance

The original 41 cutouts retain their names, six selection fields and imported
bytes. New historical extractions have optional `provenance`, including source
links and method. An optional `author` identifies the creator account, including
work performed by agents on that account's behalf. It is separate from
`provenance.artist`; unknown attribution remains absent. Polyhymnia and the
24 authored backup additions use `author: "adrian729"` and are searchable by it.

The collection now has 161 designs: 58 repeating borders, 46 whole decorations
and 57 illustrations. The new book and rabbit musician are illustrations; the
other supplied ornaments remain whole decorations. The supplied frames are
fixed complete images, and the eight corner phases remain independent images.
The four gold components also have a ready-to-use CSS composition in the
[vanilla example](https://adrian729.github.io/medieval-ornaments/examples/vanilla/).

`authored-additions.json` records the backup hash, exact source paths, native and
optimized master hashes, metadata and individual reviews. Original PNG bytes
are retained with each design in its resource; optimized masters preserve exact
RGBA pixels. Lossless PNG/WebP variants at 128/256/512/768 derive directly from
the masters. No SVG, repeat, historical source or unavailable prompt is inferred.

Historical extraction audits remain in `historical-additions.json`, Rosselli
repeat/corner evidence in `historical-border-patterns.json`, and Polyhymnia's
prompt and correction history in `illustration-additions.json`. Heavy artwork
belongs to the assigned numbered resource. Read [RESOURCES.md](RESOURCES.md)
before authoring; selected builds preserve unrelated artwork.

The complete prior migration and historical addition notes are preserved in
[the merge plan](https://github.com/adrian729/medieval-ornaments/blob/main/docs/MERGE-PLAN.md#illustration-maintenance-record).
