# Repository instructions

This public repository stores medieval ornaments and border assets. It is separate from `../medieval-cutouts`. Polyhymnia logos and unrelated workspace files must remain outside this repository.

## Layout and sources of truth

- `scripts/designs.py`: editable SVG geometry and 44 border specifications (6 floral border styles and the numbered plate designs 1–38).
- `scripts/build_assets.py`: deterministic SVG generation, PNG rendering, WebP conversion, downscaled variants, and `images.json` generation.
- `raster-metadata.json`: metadata for the five standalone extracted PNG masters. Preserve these PNGs.
- `reference-crops.json`: supplied plate crop filenames and source coordinates; these PNG masters are original pixels.
- `images.json`: generated catalog with six selection fields, usage metadata, dimensions, bytes, variants, and matching components. Do not hand-edit generated records.
- `svg/`: genuine vectors, without embedded raster images or external references.
- `png/`, `webp/`: masters and size folders. Size is the longest dimension.
- `EXTRACTION-PROMPTS.json`: exact extraction prompts and built-in imagegen method.
- `scripts/catalog.py`: validates files and generates the README gallery.
- `examples/index.html`: interactive browser preview; `examples/qa.html`: frame verification sheet.
- `USAGE.md`, `SELECTION.md`: human and LLM usage guidance.
- `tmp/`, `.venv/`: ignored local work only. Never commit credentials or private workspace material.

## Adding or correcting assets

1. Inspect the reference and the existing catalog for duplicates. Use an accurate lowercase kebab-case name. Preserve the original plate number for numbered designs. Correct names and all internal references together when a subject identification changes.
2. Add a standalone transparent PNG master and its record to `raster-metadata.json`, or add a native vector specification in `scripts/designs.py`. Record exact prompts/method for new AI extractions. Do not imply an AI extraction is a pixel-exact historical crop.
3. Supply a useful description, broad categories, factual subjects, facing, main colors, and composition. Keep categories generic and consistent with `SELECTION.md` and `scripts/catalog.py`.
4. Mark standalone art `repeat_axis=none`. Repeatable designs require a deliberate seamless tile, matching adapted corner, and frame atlas. Do not call a crop seamless unless verified. Preserve transparent centers in atlases and their slice metadata. Avoid IDs that collide when composing SVGs.
5. Preserve original raster PNGs; never upscale raster sources. Cap AI extraction masters at the source's longest dimension rather than treating larger generated outputs as extra source resolution (the first five panels are capped at 650px). Produce every smaller size directly from its master, only when smaller. SVG raster masters may be rendered at 1024px before downscaling. PNG/WebP must preserve alpha and visible RGB losslessly.
6. Regenerate using the commands in README. Run `.venv/bin/python scripts/catalog.py --check` and `git diff --check`. Validate original masters remain unchanged. Inspect newly changed artwork on light/dark backgrounds, repeated strips, and frames at multiple sizes. Check joins, corner rotation, crop edges, transparent margins, and small-size legibility. Automated checks do not replace visual inspection.
7. Keep documentation and generated gallery synchronized. Do not invent provenance, authorship, or licenses. Keep original reference crops alongside interpretations where available. Never publish a watermarked source sheet as a cleaned extraction.

## Border geometry

Repeat geometry uses a 256 × 96 horizontal coordinate system; vertical tiles rotate it into 96 × 256. Corners are 96 × 96. The nine-slice atlas is 448 × 448, sliced at `100 * 96 / 448` percent. Clip each repeat viewport; wrap geometry across period boundaries. Match edge bands and rails through the corner. Adapted motifs may terminate intentionally at a corner; do not claim seamless artwork through those transitions.

Codex loads this `AGENTS.md` automatically. `CLAUDE.md` imports it; do not create a competing singular `AGENT.md`.
