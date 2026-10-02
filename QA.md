# Artwork and frame verification

The collection has **49 designs: 40 repeating borders and nine whole decorations**. Asset validation covers **922 cataloged files, including 164 SVGs**. Checks cover catalog coverage, filenames, dimensions, byte counts, lossless PNG/WebP visible pixels and alpha, variants produced directly from masters, and the absence of raster embedding or external references in SVGs.

## Source and artwork checks

All 38 numbered reference crops were compared with the original sheet's pixels and masks. The original sheet and five standalone panel masters are preserved. Numbered PNG/WebP units use actual source pixels, with only the documented two-pixel repeat-end adjustment. Their interiors and whole decorations are checked against the supplied source. Native plate frame assembly uses no enlargement or interpolation.

The source check verifies **272 exact corner-to-side pixel profiles** and **81 raster atlases with integer slice boundaries**. All 40 rotated tiles are verified as pixel-exact 90-degree turns of their masters, with unchanged repeat proportions. It also checks that the floral unit endpoints contain only their intended stems, preventing leaves or flowers from straddling corner clipping lines.

All numbered source regions and extracted repeat units received visual review, including alternating colors, complete motifs, and repeat phase. Plate 11, 16, 36, and 37 retain whole artwork without invented repeating frame strips. All 40 painted/vector frames were inspected at 33px. The four reported floral styles were compared across SVG, PNG, and WebP; the gold leaf scroll's red curls were removed and its leaf blades moved clear of the outer clipping edge.

Inspect [the comparison page](https://adrian729.github.io/medieval-ornaments/examples/review.html) to compare source crops, extracted units, repeating strips, and frames. It offers WebP/SVG, light/dark backgrounds, and several thicknesses. SVG color traces approximate print tones and curves; PNG/WebP preserve the painted appearance. Plate corners are reflected miter adaptations, not recovered historical corner artwork.

## Browser and rendered checks

Chrome passed **428 browser checks** across all 49 designs, available formats, and four viewport widths (320, 375, 768, 1200). Checks include image decoding, applicable controls, whole artwork size/format controls, all 40 dividers in both orientations and all three formats, matching download links and length controls, category/purpose/search filters, empty results, shared stylesheet usage, demo snippets and local/public URLs, the comparison page, and mobile overflow. Reports and screenshots are written to ignored `tmp/`.

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
