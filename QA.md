# Artwork and frame verification

## Whole-decoration quality patch 0.3.1 (2026-10-03)

The design browser selected wide whole decorations using only displayed height,
although variant limits measure the longest edge. The released bellflower preview
loaded a **128×27** PNG for about **507×107 CSS pixels** at density 1. Corrected
selection includes aspect ratio and loads the **516×107 native master**. This
applies to every whole decoration; thumbnails also account for screen density.
The shared vanilla/React resolver already included aspect ratio.

The existing 128/256/512/768px variants follow the same master-first downsampling
approach as `medieval-cutouts`. No source raster enlargement or new size scheme
is needed. The gold decoration's native raster pixels are identical to its
supplied digital strip; the preview selection caused the visible enlargement.

Added browser checks cover all **14 whole decorations × PNG/WebP × densities
1/1.25/2**, verifying both source dimensions against the actual rendered image.
These pass locally alongside the existing checks (**740 total**). `npm test`
and `npm run test:types` also pass for 0.3.1.

The bellflower SVG now uses cubic contours fitted to the source silhouette,
explicit veins/stems and 14 individual flower lobes with linear/radial gradients.
All five placements, both distinct caps and the top rule remain. White paper
speckles and gold color noise are omitted in the SVG; native PNG/WebP and
reference files are byte-for-byte unchanged (16 files checked). The SVG is a
smooth approximation, not a recovery of the original vectors. Native/enlarged
source comparisons and the generated SVG were visually inspected. Named
optional retracing preserves the fitted master.

Catalog validation passes **70 designs / 233 genuine SVGs / 1383 assets**.
Artwork checks retain **400 exact source-frame joins / 102 integer-sliced
atlases / 56 pixel-exact rotated masters**. The original 49 artwork designs
remain unchanged. Packed consumers pass **70 designs / 168 native axis/design
cases / 32 density/length cases**, including vanilla, React 18/19, SSR/hydration,
Strict Mode, refs/state, public types and self-hosting. The tested archive has
**1402 files / 180,470,936 compressed bytes / 420,312,053 unpacked bytes**; its
bellflower SVG and native PNG match the reviewed files. Browser ZIP/React builds
also pass.

Published **@ranx729/medieval-ornaments@0.3.1** as npm latest and created
[v0.3.1](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.3.1).
Registry SHA-512 integrity matches the exact tested archive. A fresh named-version
registry install passes the same 70-design/168-native-case/32-density-case consumer
checks. GitHub Actions deployed the patch successfully; the public browser passes
all **740 checks**. Live vanilla/React demos pass at 375/1200px, and the downloaded
browser ZIP passes archive checks and renders with local assets. Ten actual pinned
UNPKG configurations decode, including the native 516×107 gold PNG and new SVG.
Both Pages and UNPKG serve the exact reviewed SVG bytes (SHA-256
`9e6d0bb4b0066fac48f1ba7ee1ffc13f89b0096ce70c95c3b24228801e882089`).

## Source additions release 0.3.0 (2026-10-03)

The published release contains **70 designs: 56 repeats and 14 whole decorations**.
Twenty-one source designs were added (16 repeats/five whole), including the three
blue stencils with their grid-paper backgrounds retained. Grid lines are not stock
watermarks; their distinct background period can show at repeat joins. All 28
stock-watermarked candidates are excluded. All original 49 catalog entries and
artwork files are unchanged, and all nine uploaded source masters retain their
recorded hashes. Five accepted originals are preserved in sources/additions/.
See [ADDITIONS.md](ADDITIONS.md) for per-sheet decisions.

Passed `npm test` (11 tests), `npm run test:types`, `npm run test:integration`
and `npm run build:browser`. The actual packed consumer contains 70 designs and
passes 168 native direction/design cases, 32 density/length cases, vanilla
native/bundled usage, React 18/19, development Strict Mode/production,
SSR/hydration, public types, refs/state, automatic styles and self-hosting.
The inspected archive contains **1402 files / 182,192,358 compressed bytes /
425,161,375 unpacked bytes**.

Catalog validation passes for **233 genuine SVGs / 1383 cataloged asset files**.
Source checks pass **400 exact source-frame profiles**, **102 integer-sliced
raster atlases** and **56 pixel-exact rotated tile masters**. Native interiors,
untouched reference crops, source hashes, direct-from-master downscales and
lossless visible RGB/alpha pairs are verified. `git diff --check` passes.

The permanent collection/browser/demo checker passes **656 checks** across all 70
designs, all formats and four viewport widths, including new demo selections,
copyable snippets and the source-additions review filter.

The main demo offers all repeat designs for frames and horizontal dividers, and
all whole decorations. Snippets follow the selected artwork's actual geometry
and raster dimensions. The permanent browser, artwork review and vanilla/React
examples share the complete catalog. The temporary additions-only page and its
checker were removed at the user's request. The review supports
`?collection=additions` for source comparisons.

Before retiring the temporary page, all 21 remaining additions passed 114 browser
checks and **144 rendered frames** (16 repeats × 3 formats × DPR 1/1.25/2) at
**33px**, including fractional positions, passed the outside-to-center open-join
check. All original/unit/trace comparisons and repeat/frame sheets were visually
inspected; all 13 initial accepted repeats were checked in light/dark frames.
The three stencil traces render pixel-identically before/after conservative
context pruning. Native/SVG stencil comparisons were visually reviewed again
before registration. Paper-grid background phase remains an explicit limitation.

Rich color traces are large; native PNG/WebP remains the default for source-based
artwork. Default version-pinned CDN URLs move to UNPKG because the intact detailed
traces exceed jsDelivr's [150 MB package limit](https://www.jsdelivr.com/documentation).
Self-hosted assetsBase, asset-copy paths, formats and exact version pins are
preserved.

Published **@ranx729/medieval-ornaments@0.3.0** as npm latest. Registry integrity
matches the exact locally tested archive. A fresh registry install passes the
complete 70-design consumer matrix (168 native axis/design cases and 32 density
cases), including React 18/19, styled/unstyled SSR, hydration and self-hosting.
Publication initially returned HTTP 202 while npm processed the large archive;
registry availability and named-version installation were verified after it
became visible.

Commit [a5e67d4](https://github.com/adrian729/medieval-ornaments/commit/a5e67d4adb783f20306f05ee1d7c0729ee208231)
is pushed. Public release/tag [v0.3.0](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.3.0)
and successful Pages run [37135108933](https://github.com/adrian729/medieval-ornaments/actions/runs/37135108933)
are verified. All **656 live artwork/browser/demo checks** pass. The actual
pinned UNPKG modules report version 0.3.0 and 70 designs; eight old/new frame,
divider and whole-image asset configurations decode using default URLs.
Live vanilla/React examples pass at 375/1200px with original/forced axes,
automatic React styles and new stencil/russet/painted designs. The downloaded
browser ZIP passes archive integrity and serves its example using only local
assets. Evidence is also in tmp/package-site.json and tmp/registry-release.json.

Ignored evidence: tmp/package-integration.json, tmp/browser-check.json,
tmp/additions-frame-matrix.json, tmp/additions-frame-pixel-verification.json,
and tmp/additions/stencil-release-comparison.png. The historical additions frame
check remains reproducible from its saved matrix with scripts/check_frame_pixels.py;
current gallery coverage uses scripts/browser_check.mjs.

## React automatic styles (0.2.0)

The default `/react` entry now imports the existing shared stylesheet. A production consumer importing only `OrnamentDivider` verifies that tree shaking retains the CSS. The React demo and copyable snippet require only the component import. `/react/unstyled` provides the same components for plain Node SSR or centrally managed CSS. Both entries share the same declarations and component implementation.

Pre-release checks pass: `npm test`, `npm run test:types`, packed React 18/19 consumers in production and React 19 development/Strict Mode, plain Node SSR, Vite SSR with automatic CSS, hydration, forwarded refs and retained inputs, native/bundled vanilla, local asset hosting, catalog/artwork checks, `git diff --check`, and `npm run build:browser`. Computed-style checks cover frame borders, divider pseudo-elements and whole-image sizing without an application CSS import. Reviewed the rendered React example. Artwork and `ornaments.css` are unchanged; the existing frame matrix remains applicable.

Published **@ranx729/medieval-ornaments@0.2.0** as npm `latest`; the tested archive contains **941 files / 52,286,453 unpacked bytes** (29,257,655 compressed bytes). A fresh registry install passes the complete consumer matrix, including styled Vite SSR and the single-component production CSS check. GitHub release/tag [v0.2.0](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.2.0) is public, and Pages deployment [37110852625](https://github.com/adrian729/medieval-ornaments/actions/runs/37110852625) succeeded. Live vanilla/React demos pass at 375/1200px with original/forced axes, preserved sizing, decoded self-hosted images and the updated React snippet. The actual 0.2.0 CDN modules/images and downloaded browser ZIP pass. Reviewed the live mobile React rendering; all 473 existing live artwork-browser checks pass. `tests/site.mjs` now derives the CDN version from package metadata.

## npm integration verification (0.1.0)

The integration layer preserves the approved artwork and `ornaments.css` byte-for-byte. Catalog/artwork checks and the existing **473 browser checks** pass after adding the library and example links. The prior rendered frame matrix remains applicable because neither artwork nor shared geometry changed.

`npm test` checks generated immutable metadata/capabilities, all 40 designs' original and forced divider directions in all formats, default formats for all nine whole designs, actual raster resolution boundaries at three densities, invalid input, discovery, scoped asset copying, and React server output. `npm run test:types` checks the public API, refs, custom properties, capability-specific design names, and invalid prop rejection. Capability-filtered discovery returns appropriately narrowed TypeScript names for direct component use.

`node tests/integration.mjs` builds/installs a real npm archive into independent consumers. It verifies:

- No React dependency is installed for vanilla use; all 922 assets are included, and the archive has only the explicit runtime/documentation allowlist.
- The installed CLI copies the full catalog/components/sizes to a public asset folder.
- Native ESM and bundled vanilla under a nested deployment root.
- **120 native design/direction cases** (40 × original/horizontal/vertical), matching asset decoding and geometry, plus **32 density/length cases** including less than one full repeat fitting.
- Atomic invalid updates, partial-option retention, duplicate-controller rejection, idempotent cleanup, prior-value restoration, and preservation of child input values/focus/unrelated styles/external edits.
- React **19.3.0** development Strict Mode and production; React **18.3.1** production plus fresh-process SSR; public consumer declarations against both versions' React types.
- React 19 SSR/hydration, forwarded DOM refs, input entered before hydration, and retained nodes/state during orientation/design changes and component remounts.
- Four viewport widths (320, 375, 997, 1920), complete centered divider geometry, self-hosted images without external image requests, and no browser exceptions/missing assets.

Reports and reviewed React screenshots are in ignored `tmp/package-integration.json` and `tmp/react*-*.png`. This is Chromium coverage, not certification across all browsers/frameworks. The browser ZIP and self-hosted live demos receive separate release verification. CDN defaults require internet access; the copy command supports local/offline hosting.

The inspected archive is approximately **29.3 MB compressed / 52.3 MB unpacked** because it includes all raster sizes and editable SVG traces. These files are installed on disk, not embedded wholesale in the application's JavaScript bundle; browsers request selected images. Source sheets, audit scripts, temporary files, tests, and demos are excluded from npm. The browser download includes runnable native modules and artwork.

For post-publication consumer checks, run `ORNAMENTS_PACKAGE=@ranx729/medieval-ornaments@0.1.0 node tests/integration.mjs`. Release/deployment verification is recorded below after completion.

The collection has **49 designs: 40 repeating borders and nine whole decorations**. Asset validation covers **922 cataloged files, including 164 SVGs**. Checks cover catalog coverage, filenames, dimensions, byte counts, lossless PNG/WebP visible pixels and alpha, variants produced directly from masters, and the absence of raster embedding or external references in SVGs.

### Published release verification

Published **@ranx729/medieval-ornaments@0.1.0** to the public npm registry. A fresh registry install passed the same complete consumer matrix, including the installed asset-copy command and both React versions' types. npm normalized the command path from `./lib/cli.js` to `lib/cli.js`; its published `bin` is present and tested. The registry archive has **940 files / 52,284,801 unpacked bytes**. The repository now uses that normalized command path.

GitHub Pages uses the checked-in build/deploy workflow. The live site passed all **473 existing browser checks**. `node tests/site.mjs` also passed the live vanilla and React demos at **375/1200px**, original and forced directions, painted-image changes, exact complete-unit centering, image decoding, and page overflow checks. The actual pinned CDN core modules/catalog loaded in Chrome, and default floral frame, painted original/rotated divider, and small whole-image assets decoded successfully. The live browser ZIP downloaded, passed archive integrity checks, and its extracted native example rendered with local images and orientation switching. Live mobile/desktop screenshots were visually inspected.

Repeat live release checks with `node tests/site.mjs` after starting the review Chrome on port 9227. Run it sequentially with the existing browser checker because they share a tab. Reports/screenshots are under ignored `tmp/package-site.json` and `tmp/live-*.png`. These checks verify the public distribution as well as local source; artwork/source/shared CSS remain unchanged from the approved artwork commit.

## Source and artwork checks

All 38 numbered reference crops were compared with the original sheet's pixels and masks. The original sheet and five standalone panel masters are preserved. Numbered PNG/WebP units use actual source pixels, with only the documented two-pixel repeat-end adjustment. Their interiors and whole decorations are checked against the supplied source. Native plate frame assembly uses no enlargement or interpolation.

The source check verifies **272 exact corner-to-side pixel profiles** and **81 raster atlases with integer slice boundaries**. All 40 rotated tiles are verified as pixel-exact 90-degree turns of their masters, with unchanged repeat proportions. It also checks that the floral unit endpoints contain only their intended stems, preventing leaves or flowers from straddling corner clipping lines.

All numbered source regions and extracted repeat units received visual review, including alternating colors, complete motifs, and repeat phase. Plate 11, 16, 36, and 37 retain whole artwork without invented repeating frame strips. All 40 painted/vector frames were inspected at 33px. The four reported floral styles were compared across SVG, PNG, and WebP; the gold leaf scroll's red curls were removed and its leaf blades moved clear of the outer clipping edge.

Inspect [the comparison page](https://adrian729.github.io/medieval-ornaments/examples/review.html) to compare source crops, extracted units, repeating strips, and frames. It offers WebP/SVG, light/dark backgrounds, and several thicknesses. SVG color traces approximate print tones and curves; PNG/WebP preserve the painted appearance. Plate corners are reflected miter adaptations, not recovered historical corner artwork.

## Browser and rendered checks

Chrome passed **473 browser checks** across all 49 designs, available formats, and four viewport widths (320, 375, 768, 1200). Checks include image decoding, applicable controls, whole artwork size/format controls, all 40 dividers in both orientations and all three formats, matching download links and length controls, complete centered sections at repeat boundaries (fixed and percentage lengths, including less than one section), all five pages' SVG/PNG/ICO favicons, category/purpose/search filters, empty results, shared stylesheet usage, demo snippets and local/public URLs, the comparison page, and mobile overflow. Reports and screenshots are written to ignored `tmp/`.

The frame matrix covers **1,512 rendered cases**:

- Gold quatrefoil vine, red berry vine, gold leaf scroll, and red rosette vine at every integer thickness from 16–48px.
- All remaining repeating borders at 33px.
- SVG, PNG, and WebP at device pixel ratios 1, 1.25, and 2, with fractional element positions.

A flood-fill check verifies that the exterior background cannot pass through an open join into the transparent center. This catches open seams, but does not assess chopped motifs or subtle color differences; source-profile checks and visual review address those separately. These results describe Chrome and the tested combinations, not a guarantee for every browser or arbitrarily small frame.

## Repeat the checks

```sh
.venv/bin/python scripts/catalog.py --check
.venv/bin/python scripts/artwork_check.py
git diff --check
```

Browser verification requires Node 22+ and Google Chrome. With the preview server running on port 8765, start Chrome in another terminal:

```sh
google-chrome --headless --no-sandbox --disable-gpu --remote-debugging-port=9227 \
  --user-data-dir=/tmp/medieval-ornaments-chrome about:blank
```

Run the browser and matrix scripts sequentially because they control the same Chrome tab:

```sh
node scripts/browser_check.mjs
node scripts/frame_join_check.mjs http://127.0.0.1:8765 matrix
.venv/bin/python scripts/check_frame_pixels.py
```

Pass the deployed collection URL to either browser script to check GitHub Pages. Without `matrix`, the frame renderer captures the three demo styles at 32, 33, and 34px. New or changed artwork needs fresh source, repeat, and light/dark visual review as described in [AGENTS.md](AGENTS.md); passing a gap check alone is insufficient.
