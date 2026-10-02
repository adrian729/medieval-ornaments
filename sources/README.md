# Source artwork and editable trace inputs

`numbered-ornament-plate.png` is the original user-supplied sheet, retained byte-for-byte. `source-patterns.json` at the repository root records the exact source region and repeat/whole decision for each numbered design.

`tiles/` contains native raster build inputs. Repeating units have a two-pixel edge adjustment, with unchanged source interiors. Whole decorations retain their complete source shapes; the two L-shaped corners mask neighboring regions.

`traces/` contains genuine editable vector color traces. They approximate the source curves and print tones rather than replacing motifs with generic geometry. Original painted PNG/WebP is available independently of these traces.

Optional retracing uses `scripts/trace_sources.py`, Python 3.12, and `requirements-trace.txt`. Ordinary asset builds read the checked-in tiles and traces. Keep the original sheet and untouched reference crops when making corrections.
