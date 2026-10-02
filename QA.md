# Initial collection verification

The first collection has 49 designs: five complete painted ornaments and 44 adapted vector border styles, including all numbered plate designs 1–38.

Automated asset checks passed for **1,628 files**, including **132 genuine SVGs**. Checks cover catalog coverage, filenames, dimensions, byte counts, lossless PNG/WebP visible pixels and alpha, variants produced directly from masters, and the absence of raster embedding or external references in SVGs. Standalone panel masters are capped at the source image's 650px height. All 38 reference crops were compared with the supplied source pixels; corner clipping is documented in their metadata.

Chrome passed **154 browser checks**: all 49 designs in their available formats, plus three frame-size/thickness combinations at four viewport widths (320, 375, 768, 1200). Browser caching was disabled for final inspection. Light/dark contact sheets and large/small frames were inspected visually. A ribbon corner band mismatch and repeat closing-stroke artifacts were corrected during review.

After adding the usage demo and `ornaments.css`, the browser script passed **174 checks on both localhost and the live GitHub Pages site**. The additional checks cover the demo at those four widths, all three frame choices at three thicknesses, matching copied code, local/public URLs, theme switching, and the vertical divider convention. CSS image decoding is checked to catch asset-path errors on hosted pages. The playground, usage demo, and frame sheet use the same stylesheet. Existing PNG/WebP/SVG assets were unchanged.

The vector files are simplified reconstructions and adapted corners, not exact tracings. Original plate crops are retained for comparison. Whole painted panels are AI-assisted extractions and are not marked seamless.

The categorized browser passed **181 browser checks**, including purpose/category/search filters, visual selection, empty results, and controls for horizontal/vertical dividers and whole decorations. All 44 frame atlases were rebuilt with continuous closed stems, rails, or bands to remove independently drawn corner/edge joins; the separate repeat tiles, corner exports, painted masters, and reference crops remain unchanged.

The frame regression matrix passed **516 rendered pixel checks in Chrome**. It covers four representative styles at every integer thickness from 16–48px, all remaining styles at 33px, and device pixel ratios 1, 1.25, and 2 with fractional element positions. A flood-fill check confirms the exterior background cannot pass through an open join into the transparent center. Representative joins also receive visual inspection: this check does not measure every subtle color difference or guarantee identical rendering in other browsers.

Repeat automated asset validation:

```sh
.venv/bin/python scripts/catalog.py --check
git diff --check
```

Optional browser verification requires Node 22+ and Google Chrome. With the preview server running on port 8765, start Chrome in another terminal:

```sh
google-chrome --headless --no-sandbox --disable-gpu --remote-debugging-port=9227 \
  --user-data-dir=/tmp/medieval-ornaments-chrome about:blank
```

Then run `node scripts/browser_check.mjs`. It writes a report and selected screenshots to ignored `tmp/`. View [examples/qa.html](examples/qa.html) through the local server to inspect every frame. New or changed artwork needs fresh visual review as described in AGENTS.md.

Pass a base URL to check a deployed site: `node scripts/browser_check.mjs https://adrian729.github.io/medieval-ornaments/`. The demo checks decode CSS ornament images as well as ordinary images, so hosted path errors are detected.

To render and check the frame matrix with the same running Chrome:

```sh
node scripts/frame_join_check.mjs http://127.0.0.1:8765 matrix
.venv/bin/python scripts/check_frame_pixels.py
```

The renderer also accepts a deployed collection URL. Screenshots and the pixel report are stored in ignored `tmp/`. Without `matrix`, it captures the three demo styles at 32, 33, and 34px for closer visual review.
