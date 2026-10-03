# Artwork and frame verification

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
