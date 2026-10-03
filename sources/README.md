# Source artwork and editable trace inputs

`numbered-ornament-plate.png` is the original user-supplied sheet, retained byte-for-byte. `source-patterns.json` at the repository root records the exact source region and repeat/whole decision for each numbered design.

`tiles/` contains native raster build inputs. Repeating units have a two-pixel edge adjustment, with unchanged source interiors. Whole decorations retain their complete source shapes; the two L-shaped corners mask neighboring regions.

`traces/` contains genuine editable vector color traces. They approximate the source curves and print tones rather than replacing motifs with generic geometry. Original painted PNG/WebP is available independently of these traces.

The gold bellflower master uses source-fitted cubic contours, stems/veins and
individual petal gradients. Optional palette retracing preserves this master,
as recorded by `vector_method` in `additional-patterns.json`.

Optional retracing uses `scripts/trace_sources.py`, Python 3.12, and `requirements-trace.txt`. Ordinary asset builds read the checked-in tiles and traces. Keep the original sheet and untouched reference crops when making corrections.

`additions/` preserves five further user-supplied sheets without stock watermarks byte-for-byte. `additional-patterns.json` records their exact hashes, source/canonical unit bounds, repeat evidence and trace fitting settings. The digital sheet uses only strips 2 and 4. `tiles/` and `traces/` also hold these checked native inputs and editable approximations. Original backgrounds remain in raster assets. The three blue stencil designs retain their grid-paper backgrounds; their background phase can show at repeat joins. Watermarked sheets stay in ignored `tmp/additions/` and their candidates are excluded from review and release.
