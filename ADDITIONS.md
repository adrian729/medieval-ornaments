# Ornament additions under local review

Nine supplied sheets were inspected. Originals are retained byte-for-byte in
`tmp/additions/sources/`; the five sheets without stock watermarks used by the public checkout
are also preserved in `sources/additions/`. Version 0.3.0 includes the accepted additions.

The checkout adds **21 designs: 16 repeats and five whole decorations**. The
existing 49 designs are unchanged. The checkout totals are **70 designs,
56 repeats, and 14 whole decorations**.

| Source | Added to checkout | Remaining local drafts | Decisions |
| --- | ---: | ---: | --- |
| Eight scrolling borders | 0 | 0 | Eight watermarked candidates removed from review at the user's request. |
| Three blue stencil strips | 3 | 0 | Grid retained. The grid does not share all motif phases; one motif has fractional source spacing. |
| Blue bird/leaf and vertical borders | 8 | 0 | Seven repeats; the acanthus/seed-head strip has distinct upright/inverted groups and stays whole. |
| Six fruit/flower/leaf borders | 0 | 0 | Six watermarked candidates removed from review at the user's request. |
| Six fruit/leaf/lizard borders | 0 | 0 | Six watermarked candidates removed, including teal-berry-olive-double-scroll. |
| Hand-drawn/digital pairs | 2 | 0 | Only requested digital strips 2 and 4. Leaf/berry strip repeats; gold bellflower flourish has distinct end caps and stays whole. |
| Five painted panels/bands | 5 | 0 | Rosette/fan and opposed serrated-flower vines repeat. The symmetric top, irregular middle and combined three-band bottom remain whole. |
| Tall russet floral border | 3 | 0 | Full 739px cycle includes two different opposed flower heads and eight side-band cycles. Composite, central strip and one 92px side-band cycle are provided. |
| Eight geometric bands | 0 | 0 | No exact duplicate in the existing collection. Eight candidates removed because the source has a faint stock watermark. |

## Preview

Use the main [design browser](https://adrian729.github.io/medieval-ornaments/examples/)
and [source-additions review](https://adrian729.github.io/medieval-ornaments/examples/review.html?collection=additions).
The small demo, vanilla example and React example offer all 70 designs.
The temporary additions-only test page was removed at the user's request.

The three grid-paper stencils are part of the main collection, with public names
`blue-alternating-stencil-scroll`, `blue-diamond-leaf-stencil-band` and
`blue-four-petal-stencil-vine` (the temporary names used a `review-` prefix).
Grid-paper lines remain intact and can show at joins because their spacing differs
from the ornament's repeat. They are backgrounds, not stock watermarks.

All 28 candidates from stock-watermarked sources were removed. The local builder
excludes scroll-sheet, fruit-sheet, fruit-animal-sheet and geometric-sheet on
every rebuild and deletes their generated review exports. Supplied originals
and audit records remain intact; those candidates are not release assets.

## Audit and build

`additional-patterns.json` records the integrated sources' SHA-256 hashes,
original strip bounds, canonical unit bounds, directions, complete motif/color
cycle evidence, selection metadata, native inputs, and trace parameters. Vertical
inputs are traced in canonical horizontal coordinates then exported in their
original direction. PNG/WebP retain the source background and painted pixels;
only documented two-column repeat collars change. Smaller variants come directly
from their native master, without enlargement. Rotated raster masters are exact
90-degree turns. Atlases use the same artwork's reflected miter corners and
integer raster slice coordinates, with `round` fitting.

Most SVG files are editable color traces, not original vectors or pixel-exact
reproductions. Contour fitting uses Python 3.12/VTracer 0.6.15, neighboring repeat
context and four-times sampling only for vector fitting. Rare colors and fine
negative spaces were inspected; digital red berries needed palette corrections.
Invisible neighboring paths are conservatively pruned;
crossing curves remain. Native-scale rendering before/after pruning was
pixel-identical for the ten blue/digital traces. Rich floral traces are large; the published 0.3.0 archive is about 182MB
compressed/425MB unpacked. Browsers fetch selected assets, not the whole archive.
PNG/WebP are preferable for the native source appearance and small previews.

The gold bellflower decoration uses smooth source-fitted cubic contours,
individually drawn stems/veins and blue-to-white petal gradients. This removes
the palette trace's paper speckles and stepped color bands. Native PNG/WebP and
the reference crop remain unchanged. Its distinct end caps make it a complete
decoration; repeating it would invent a join absent from the supplied artwork.
The audit's `vector_method` preserves this editable master during optional
retracing.

Ordinary artwork builds read checked-in traces and do not run VTracer. To rebuild
only one integrated design:

```sh
.venv/bin/python scripts/build_assets.py --name blue-paired-birds-and-palmettes
.venv/bin/python scripts/catalog.py
npm run build
```

Optional retracing uses the audit's source-specific parameters:

```sh
PYTHONPATH=tmp/trace-python312 /usr/bin/python3.12 scripts/trace_sources.py \
  --name blue-paired-birds-and-palmettes
```

Version 0.3.0 pins default asset URLs to UNPKG. The detailed editable traces
exceed jsDelivr's [150 MB package limit](https://www.jsdelivr.com/documentation),
so the default host changed while preserving the artwork and exact version pin.
Self-hosted `assetsBase` and asset-copy behavior are unchanged. Release validation
and measured archive sizes are recorded in QA.md and PACKAGE-PLAN.md.
