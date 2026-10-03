# Repository instructions

This public collection is separate from `../medieval-cutouts`. Keep Polyhymnia logos and unrelated workspace files outside it.

The npm/vanilla JavaScript/React library is published as `@ranx729/medieval-ornaments`. Its accepted contract and release checklist are tracked in [PACKAGE-PLAN.md](PACKAGE-PLAN.md); keep them current across sessions.

## Sources of truth

- `scripts/designs.py`: six floral vector designs and numbered design identities/categories. Floral repeat geometry is 256 × 96.
- `source-patterns.json`: audited source regions, native unit bounds, original direction, colors, repeat rationale, and whole-decoration exceptions for all 38 numbered plate designs. Do not infer a repeat from autocorrelation alone.
- `sources/numbered-ornament-plate.png`: original supplied sheet. Preserve it byte-for-byte.
- `sources/tiles/`: native painted units. Repeat units have a documented two-pixel join adjustment; their interiors retain original pixels. Whole decorations retain their original shape, including the masks for L-shaped corners.
- `sources/traces/`: checked-in editable color traces, not generic redraws or embedded raster images. They approximate print colors and curves; PNG/WebP retain the actual source appearance.
- `scripts/trace_sources.py`: optional source tracing. Use Python 3.12 and `requirements-trace.txt`; the VTracer wheel crashed under this checkout's Python 3.14. The local fallback is `PYTHONPATH=tmp/trace-python312 /usr/bin/python3.12 scripts/trace_sources.py`. `--name NAME` limits retracing. Ordinary builds use the checked-in traces and do not invoke VTracer.
- `scripts/source_patterns.py`: source-based tile/frame geometry and native pixel assembly. Corners use mitered reflections of the same artwork; never replace them with unrelated generic flowers/diamonds.
- `scripts/build_assets.py`: SVG generation, native PNG/WebP, downscaled variants, and generated `images.json`. `--name NAME` limits rebuilding to selected designs; omit it for the full collection. It removes only obsolete generated paths previously named in the catalog.
- `raster-metadata.json`: five standalone AI-extracted painted panels. Preserve these PNG masters.
- `reference-crops.json`: untouched original plate crop bounds and masks. Reference crops are comparison images, not seamless tiles.
- `scripts/catalog.py`: file validation and alphabetical README gallery generation.
- `ornaments.css`: shared `ornament-frame`, `ornament-divider`, `ornament-image` contract. Divider slots retain the available length; their `::before` backgrounds contain only complete centered repeat sections. Preserve this for both axes and responsive percentage lengths. Relative URLs in custom properties resolve against this stylesheet. JavaScript must resolve catalog URLs explicitly.
- `scripts/build_favicon.py`: renders the existing red rosette motif into root SVG/PNG/ICO favicon files. Every HTML entry point links them; keep them outside the ornament asset catalog.
- `lib/resolve.js`: dependency-free shared selection, capability validation, geometry, resolution, and version-pinned/self-hosted asset URLs. React and vanilla must use this same resolver. Default divider orientation is original; horizontal/vertical select the matching asset automatically.
- `lib/vanilla.js`: container/img controllers with validated partial updates and teardown; preserve application children/state. `lib/react.js`: ordinary declarative elements with forwarded refs and SSR support, without replacing React-owned children; exported as `/react/unstyled`. `lib/react-styled.js`: default `/react` entry imports the shared CSS automatically. Keep the wrapper and CSS marked as side effects for production bundlers.
- `scripts/build-library.mjs`: generates `lib/catalog.js`, `lib/catalog.json`, and TypeScript declarations from `images.json` and the package version. These files are generated; edit the builder/catalog, then run `npm run build`. Never regenerate artwork as part of npm packaging.
- `lib/cli.js`: installed asset-copy command. Preserve paths/components/variants and rights notices; do not overwrite the installed package. `scripts/build-browser.mjs`: native browser ZIP and bundled self-hosted React example, under ignored `dist/`.
- `docs/INTEGRATION.md`, `examples/vanilla/`, `examples/react/`: public API/hosting/release guide and runnable consumers. Keep required design names, use-specific options, defaults, and capability discovery synchronized.
- `package.json`: public ESM exports, optional React peer, package allowlist. Consumers need no Python or React for vanilla. `LICENSE` scopes the integration software grant; `ASSET-RIGHTS.md` retains artwork's separate status. Never apply MIT to the whole artwork collection.
- `tests/`: resolver/catalog/raster boundaries, SSR, public types, and real npm-packed browser consumers. Run `npm test`, `npm run test:types`, `npm run test:integration` before release. The integration check requires Chromium, npm cache access, and React 18 dependencies; `ORNAMENTS_PACKAGE` selects a registry version for post-publication verification.
- `tests/site.mjs`: verifies live vanilla/React examples, the actual pinned npm CDN, and the downloaded browser ZIP. It shares Chrome port 9227 with the artwork browser checks; run sequentially. Record published-package and deployed-site checks in QA.md.
- `.github/workflows/pages.yml`: builds the React demo/browser ZIP and assembles Pages. Pages must use GitHub Actions, not a raw-branch deployment that serves unbuilt JSX.
- `examples/demo.html`: small usage demo; `index.html` redirects to it. `examples/index.html`: categorized browser. `examples/review.html`: original/unit/repeat/frame comparisons. `examples/qa.html`: all frames.
- `tmp/`, `.venv*/`, `node_modules/`, `dist/`, `*.tgz`: ignored local work/builds. Never commit credentials/private workspace material.

## Correcting or adding artwork

1. Inspect the actual source and repeated artwork, not just its thumbnail or the previous redraw. Preserve alternating motifs/colors and original direction. Single square cells can deliberately repeat as motif cells, but label this honestly. If the supplied artwork does not establish a usable repeat, retain the whole decoration without a frame atlas.
2. Use an accurate lowercase kebab-case name. Preserve numbered plate identities. Correct all filenames and internal references together when needed.
3. Supply the six selection fields: description, broad categories, factual subjects, facing, colors, composition. Keep categories generic and consistent with `SELECTION.md`.
4. For source work, edit the audit, retrace the affected names with the compatible interpreter, inspect native pixels and traces, then run the ordinary build. Preserve untouched source and reference pixels. A narrow join adjustment must never become an excuse to hide the wrong repeat period or mismatched motifs.
5. Never upscale source raster exports. Make each smaller variant directly from its master. SVG may scale, but a trace does not recover missing source detail. PNG/WebP pairs must preserve alpha and visible RGB losslessly. Floral vector masters are at most 1024px; raster atlases use sizes with integer slice coordinates. Size folders are upper bounds, not guaranteed exact dimensions; skip a smaller atlas size if it would require fractional slices.
6. Frames require `round`: partial repeat units cannot match the corners. Dividers retain natural tile proportions; choose the main tile or `components.rotated_tile` to match the desired axis. Rotated PNG/WebP masters must be pixel-exact 90-degree turns, not rerenders or stretched images. Read `repeat_ratio` and `border_image_slice_percent` from the catalog; plate geometry is not uniformly 256 × 96 or 448 × 448. Do not rotate source-derived miter corners blindly: use the supplied atlas, which contains all four phase-matched corners.
7. Run `.venv/bin/python scripts/catalog.py --check`, `.venv/bin/python scripts/artwork_check.py`, and `git diff --check`. Inspect every changed design against the reference, as repeated strips, and in light/dark frames. Check leaves/petals and artwork continuity, not only whether a gap crosses the frame. Run browser and rendered join checks in `QA.md`, including 33px and fractional pixel ratios. Automated checks do not replace visual inspection.
8. Keep README, usage notes, browser, and examples synchronized. Do not invent provenance/authorship/licenses. Record exact prompts/method for AI extractions; never call them pixel-exact crops. Never publish a watermarked source sheet as a cleaned extraction.

The collection currently has 49 designs: 40 repeating borders and nine whole decorations (the five panels and plate 11, 16, 36, 37). Whole plate designs retain SVG alternatives but have no corner/frame components.

Codex uses `AGENTS.md`; `CLAUDE.md` imports it. Do not create a competing singular `AGENT.md`.
