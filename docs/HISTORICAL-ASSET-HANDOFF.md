# Historical asset extraction handoff

**Unfinished-source extraction paused at the user's request on 2026-10-12.**
The user subsequently authorized a separate task: fix `tmp/todos.md` **only for
finished new assets**, investigate the real repository/demo/resource/release
workflows, then integrate those finished assets into the project. Existing published
artwork and the 35 unfinished sources are outside the correction scope. The starting
557 accepted IDs and pre-fix inventory are frozen in
`tmp/extraction-work/todo-fixes-20261012/finished-scope-at-start.json` and
`metadata-before-fixes.json`. This newer instruction authorizes public-project
integration of the finished assets; earlier staging-only limits below describe the
state at the pause, not a prohibition on the newly requested integration.
This document preserves the task across sessions. It supersedes the older instruction
in the generated local status file to continue without stopping. No extraction
process was running when this handoff was written. The pause inventory below is
historical; the completed-assets integration and release update immediately below
records subsequent authorized work.

## Completed-assets release update — 2026-10-13

The user subsequently authorized commits, pushes, npm publication and production
release of all completed work. After corrections and duplicate removal, **541 new
assets** are integrated, bringing the real catalog to **702 designs** (89 borders,
281 decorations, 332 illustrations). The original 161 designs are unchanged.
All 24 changed resource revisions are published, verified against every approved
CDN file and pinned to clean source commits; all 22 new repositories/packages
have trusted publishers and public version releases. Runtime 0.11.0 is published with provenance, the production site is deployed,
and both offline browser archives are on the public GitHub release. Actual npm
consumer tests, live Pages/CDN checks and both downloaded offline archives pass.
All completed-assets work is merged and released; see QA.md and PACKAGE-PLAN.md
for release evidence.

The explicit metadata budget is now 1 MB packed / 6 MB installed; artwork remains
outside the runtime. Final offline archives contain all 8,321 public artwork
paths across two ZIPs. Earlier local-only limits and publication blockers below
are historical, superseded by this update. **The 35 unfinished sources remain
paused** and must only be resumed on the user's request.

## Extraction state at pause

| Measure | At pause |
| --- | ---: |
| Approved original source images | 159 |
| Sources completely processed and audited | 115 |
| Duplicate sources skipped in favor of a preferred source | 9 |
| Partly processed sources | 22 |
| Sources awaiting completed detailed extraction | 13 |
| **Unfinished sources** | **35** |
| Staged assets with recorded visual acceptance | 557 |
| Assets with reviewed SVG alternatives | 23 |

The remaining count is **source images**, not final assets: a source can yield many
illustrations and ornaments. “Pending” sources can have private work in progress;
it does not mean no preparation exists. Accepted means the assistant recorded a
source/white/dark visual review, not that the user has approved every result.

The most recent aggregate validator passed at **551 assets** on
2026-10-12 11:30:21 UTC: 159 original hashes, 767 PNG components, 224 generated
native-resolution caps and 32 repeat units, with no reported errors. The latest
six assets were individually reviewed and accepted afterward; **aggregate validation
has not yet been rerun at 557**. Do not describe all 557 as aggregate-validated.

## Files to open first

All paths below are relative to this repository unless stated otherwise.

- `tmp/new-crops/review.html`: existing visual review gallery, source comparisons,
  white/dark previews and downloadable assets.
- `tmp/new-crops/metadata.json`: authoritative current source statuses and asset
  list; `sources` is a dictionary, `assets` is a list. Per-folder `metadata.json`,
  `metadata.csv` and individual JSON sidecars retain detailed provenance.
- `tmp/new-crops/entity-policy.json`, `quality-reaudit.json`: grouping decisions
  and recorded quality corrections.
- `tmp/new-assets/`: untouched downloaded originals and source metadata.
- `tmp/extraction-work/source-inventory.json`: all 159 originals, paths, hashes,
  dimensions and source records.
- `tmp/extraction-work/*--job.json`: extraction jobs. A job or candidate file is
  **not** proof that an asset is accepted. Check the staged sidecar and inventory.
- `tmp/extraction-work/continuation-20261010/`: current scripts, native inputs,
  masks, exact prompts, failed/rejected attempts, audit JSON and visual proofs.
- `tmp/extraction-work/CURRENT-PROCESSING-STATE.md`: generated checkpoint;
  regeneration overwrites it. This handoff owns the pause and resumption notes.
- `tmp/extraction-work/handoff-20261012/`: frozen machine-readable source/status
  inventory and copies of the last checkpoint and validation result.

`/tmp/new-crops` is a symlink to this checkout's `tmp/new-crops`.
The checkout is `/home/ranx729/projects/medieval-ornaments`.
**The artwork, jobs and proofs are ignored local files. A fresh Git clone alone
cannot resume this work. Preserve/copy `tmp/new-assets`, `tmp/new-crops` and
`tmp/extraction-work` together.** SAM dependencies/model also live under `tmp/`.
This handoff is outside the ignored directories so the instructions can be retained
in the repository; no commit was made for this pause.

## User requirements and acceptance rules

1. Deliver reusable illustrations and ornaments with transparency outside the
   subject and through actual holes. Rectangular image crops are not deliverables.
   Retain intrinsic pale paint, skin, gold, paper-colored illustrated surfaces,
   engraving shading and all subject colors; these are not background.
2. Keep figures that touch or share a meaningful prop as one contacting group.
   Examples: hand-holding dancers, monkeys playing chess with their board, and a
   mounted group. Independent disconnected actors should be separate. A meaningful
   scene with shared painted surroundings may coexist with independent usable actors;
   preserve parent/child relationships. Do not deliver redundant collages of actors.
3. Exclude letters themselves across **all** collections. Extract usable foliage,
   figures, flowers and patterns decorating them; do not accidentally retain glyph
   serifs, rules or a letter's tassel as part of an ornament.
4. Audit ornaments as carefully as figures. Preserve whole finite decorations.
   Identify full source-established pattern cycles, including alternating motifs
   and colors, before making bars or frames. Corners need faithful phase and artwork
   continuity. If only bars are supported, withhold a bad frame and document why.
5. Preserve native proportions and resolution. No upscaled raster deliverables,
   crude polygon outlines, staircase edges, invented anatomy or invented connectors.
   Prefer SVG only when the actual trace faithfully preserves the source; otherwise
   keep raster. Never supply an SVG containing only an embedded bitmap.
6. Review each source, final whole subject and relevant native details on white and
   dark backgrounds. Check extremities, fine stems, props, holes and crop boundaries.
   Model confidence and automated validation do not establish visual correctness.
7. Dedupe using actual image quality, rendering and license. Keep the better source;
   preserve duplicate decisions and original metadata. Do not invent rights or authors.
8. Maintain exact source hashes, source bounds, method, actual AI prompts/results
   where used, transformations and review evidence. AI edits are not pixel-exact crops.
9. This remains **local staging**. Do not modify public catalogs, resource packages,
   historical import snapshots or releases as part of resuming extraction. Read
   `AGENTS.md` and the resource guide before any later public import.

User corrections already recorded: the hunter's animal is a **boar**; the long-beaked
orange-winged creature is a **bird**. The putto with shield/scroll has an audited
1.20° counter-clockwise straighten and narrow bottom-rule repair. Do not redo these
or the accepted `seriphium-absinthium` / `six-leaf-blue-vine` quality references
without a specific reason.

## Remaining sources

Numbers in the Assets column are currently staged assets for that source. Notes
are known outstanding work, **not an exhaustive substitute for a final whole-source
audit**. “Pending” means no accepted output for the source yet.

| Source | State | Assets | Known remaining work |
| --- | --- | ---: | --- |
| `cma-1952-532` | Pending | 0 | Dancing lovers/musicians; complete contacting groups and source-native extraction. |
| `cma-1999-127` | Partial | 1 | Whole painted scene, finite floral/ivy frame, line fillers, initial-counter plant. |
| `cma-2003-171` | Partial | 5 | Top/left and lower margin ornaments, contacting network, two-saint counter painting; exclude letter Q. |
| `cma-2006-15-a` | Partial | 6 | Counter decoration, full red frame and fillers. |
| `cma-2011-52` | Pending | 0 | Entwined pink beast/green serpent: native trial still includes page rules/fragments. |
| `cma-2011-53` | Partial | 6 | Flower, decorated stems, finite white-vine panel and usable finials; see active-work notes. |
| `cma-2011-65-a` | Partial | 4 | Contacting hedge figures, complete blue/red acanthus corner stem, fillers. |
| `met-364656` | Pending | 0 | Putti, winged creatures and vase; inspect contacting group structure. |
| `met-364697` | Pending | 0 | Double-medallion decoration and musical figures. |
| `met-399018` | Pending | 0 | Bat candelabrum / sphinx and armor decoration; reconcile older job names. |
| `mkg-dc00101641` | Pending | 0 | Detailed ornament/actor identification and native extraction. |
| `mkg-dc00101700` | Pending | 0 | Detailed ornament/actor identification and native extraction. |
| `nga-3385` | Pending | 0 | Acanthus/flower decoration with wild figures and ribbons. |
| `nga-3502` | Pending | 0 | Complete connected putto/double scroll: genuine hollow openings still need cleanup; see below. |
| `nga-3512` | Pending | 0 | Tall candelabrum with three children; reconcile older jobs. |
| `nga-3515` | Pending | 0 | Child riding sphinx / pilaster decoration. |
| `nga-4322` | Pending | 0 | Winged female figure and tethered creatures. |
| `openn-lewis-e-m-031-029` | Partial | 5 | Green acanthus, left female/red hybrid, right blue fish/red-mouth tail; retain actual clipped source ends. |
| `walters-w148-31r` | Partial | 3 | Chevron phase correction, other glyph decoration/frame; trial cuts blue point/red hook. |
| `walters-w148-49r` | Pending | 0 | Pink ovals, gilt inlays, gray daisies, blue/white vine, red/gray alternating pattern, counter plant. |
| `walters-w148-52r` | Partial | 2 | Towers/counter frame and plant; quarter-turned trial atlas has wrong phase. |
| `walters-w171-12r` | Partial | 14 | Standing water bearer and five pale filigree motifs; blue background must be removed from the latter. |
| `walters-w186-276v` | Partial | 4 | Upper-right gilt ivy including fine wire connectors; don't duplicate existing whole margin. |
| `walters-w7-1r` | Partial | 4 | Whole painted five-column arcade: native paper/cap/base cleanup. |
| `walters-w82-169r` | Partial | 1 | Full source ornament/scene audit beyond the accepted orange-winged bird. |
| `walters-w82-179v` | Partial | 3 | Contortionist: blue-ground residue around foot/hands; another actor ends at actual page edge. |
| `walters-w82-182v` | Partial | 2 | Kneeling blue actor/contacted ornament: expand clipped hand/left leaf; Magi counter scene/frame. No invented bird on hand. |
| `walters-w82-184r` | Partial | 3 | Orange-headed green-winged grotesque with complete gilt stem and gray leaf terminal; pole is an actual stem. |
| `walters-w82-191v` | Partial | 3 | Mermaid/mirror, rabbit musician, small birds, frame and fillers. |
| `walters-w82-197r` | Partial | 1 | Most actors/scenes and whole ornaments remain beyond the accepted repeat. |
| `walters-w82-31r` | Partial | 7 | Final whole-source audit for remaining figures, margin decoration and fillers. |
| `walters-w82-52r` | Partial | 6 | Royal groups: trial retains glyph/gold ground and has flesh holes. |
| `walters-w82-62v` | Partial | 12 | Inspect meaningful green-landscape bird counter painting and verify remaining source coverage. |
| `walters-w82-75v` | Partial | 2 | Remaining actors, fillers and margins beyond bellringer/reclining figure. |
| `walters-w88-52r` | Partial | 7 | Orange-flower/blue-curl vine and final ornament audit. |

Folder totals: Cleveland 7, Met 3, MKG Hamburg 2, National Gallery of Art 5,
Open Free Library 1, Walters 17. Both e-rara folders are complete.

## Most recent finished work — preserve it

- **Cleveland `cma-1950-154`: complete, 7 assets.** Whole apostle/city scene,
  independently usable apostle, two lower haloed actors, finite original frame,
  white-vine/blue repeat and gold-S-leaf/red repeat. The two repeats support bars;
  generated miter-corner trials visibly failed and were withheld. The finite frame
  preserves the actual four original finials. Do not restore rejected trial atlases.
- **MKG `mkg-dc00101865`: complete, 11 assets.** Native original is only 364×500;
  outputs retain that available detail without upscaling. Last four: winged putto
  with contacted animal-headed finial, seated man pulling looped cord, paired bulbous
  pendants/curling stems, lower-right foliate trophy/tied ribbon. Complete finial,
  foot, cord and source curls have been reviewed. Entire letter B is excluded.
- **Cleveland `cma-2011-53`: partial, 6 accepted assets.** Latest two are the whole
  gold-ground Paul portrait and two-facing-men scene with central tan band. Original
  hair, hats, robes and true flat lower boundary were restored after rejecting an
  over-tight ellipse. Existing independently usable actor extractions remain linked
  as children. The obsolete disconnected pair job must not be delivered as a collage.
- Other recent complete sources include `cma-2014-22-a` (16 assets), `nga-3513`
  (3), `met-364800` (3), and `walters-w73-1r` (14). Use current source records for
  exact complete-source lists. Do not restart completed sources from old candidates.

## Active NGA 3502 work — precise restart point

Private job ID: `nga-3502--winged-putto-gripping-acanthus-scroll`.
**Nothing from this source has been accepted or exported as finished.** The title
overstates wings: use a neutral final name such as `putto-holding-double-foliate-scroll`
after visual confirmation. The figure and scrolls are physically connected; keep
the complete decoration, with no unsupported repeat.

In the continuation directory:

- Immutable native input: `<private-id>--original.png`, 3443×1794.
- Current candidate, referenced by job `native_matte.candidate_png`:
  `<private-id>--complete-original-native-with-inspected-grid-fragments-removed.png`.
- Native model masks: `nga3502-native-tile-{0..5}-mask-0.png`; original complete
  figure ownership is `<private-id>--native-semantic-part-1.png`.
- The current body was rebuilt using
  `finish_nga3502_source_native_complete_network_from_tiles.py`,
  `clean_nga3502_detached_native_print_ground.py`, then
  `remove_nga3502_inspected_detached_print_ground.py`.
- Latest whole proof:
  `nga3502-restored-complete-leaf-paint-without-false-rectangular-openings.jpg`.
- **Retired, unsafe recipe:** `clear_nga3502_reviewed_true_scroll_openings.py`.
  Its rectangular dark-key scopes cut genuine curved leaf shading. Those cuts were
  undone. Do not rerun it or treat those rectangles as established background.
- Real hollow curl lies within original coordinates `[850,750,1150,1110]`.
  `nga3502-actual-source-inner-loop-native-coordinates.jpg` shows its actual contour.
  `inspect_nga3502_actual_hollow_curl_native_ground.py` targets background inside it.
  The most recent run **finished successfully before the pause**, after fixing a
  float-mask indexing error by casting to boolean. It saved three
  `nga3502-actual-curl-background-mask-{0,1,2}.png` files, a JSON audit and
  `nga3502-actual-hollow-curl-ground-native-ownership-proof.jpg`.
  Scores were approximately 0.527, 0.045, 0.631. **The new proof has not been viewed,
  and none of these masks has been applied to the candidate.** Inspect them first.
- Also inspect attached checker-ground beneath the left curl, approximately native
  `[250,1000,360,1150]`, and remaining hollow pockets. Remove actual ground without
  erasing the engraving's curved dark shading. These are search bounds, not masks.
- Real thin stem around `[2835,1538,3018,1579]` must survive component cleanup.
  A largest-component filter is wrong: this artwork has many real disconnected
  foreground regions. Preserve the small real foot and pale/shaded fragments too.
- Top leaf truncations exist in the original plate; preserve visible artwork, do
  not invent missing leaf tips. Inspect face, hair, hands, foot, all scroll extremities
  and holes against native originals before accepting.

The job's recursive metadata had grown to ~65 MB. Its full history was saved as
gzip with original-byte SHA-256 in `continuation-20261010/metadata-history/`;
`compact_nga3502_working_metadata_history.py` replaced nested previous-history
objects with archive pointers. Current job is ~67 KB. Preserve the archive and refs.
Do not apply this compaction indiscriminately to other jobs: some refinement helpers
still traverse their previous-matte chains.

## Active Cleveland 2011.53 work

The accepted counter scenes are done; ornaments remain. Original is 5219×7176.
Useful retained inspections in the continuation directory:

- `cma201153-native-original-left-blue-stem-pattern.jpg`, source box
  `[1050,3600,1320,5480]`: four-petal tan/cream flower, faint star/dot motifs, finite
  white curling vine on blue. Establish native bounds before extracting.
- `cma201153-native-original-right-tan-curled-stem-pattern.jpg`, box
  `[2650,2560,2940,3940]`: changing blue/tan/orange foliate stem with white curls.
- `cma201153-native-original-left-flower-and-finials.jpg`, box
  `[780,1650,1300,4110]`: prepared but **not yet visually inspected**.

Long thin preview images are resized by the viewer. Do not guess source coordinates
from their displayed pixels; make short native-coordinate proofs. The varying curls
do not yet establish a repeat. A faithful finite decorative bar is valid. Exclude
bare glyph strokes while retaining independently usable ornament. Old guessed flower
coordinates were not verified and must not be used as established bounds.

## Other important pending-candidate cautions

- `walters-w171-12r`: good water-bearer base is the retained
  `--complete-native-candidate.png` (882×933); `complete_native_trial` records it.
  Later gold-key trial erased warm gray water. Gold curls are hair/beard, not a crown.
  Five filigree ROIs: `[1000,1840,1510,2750]`, `[1050,3000,1480,3710]`,
  `[3540,1740,4100,2670]`, `[3540,2660,4100,3240]`, `[3600,3280,4090,3970]`.
  Keep the pale ornament, not blue-filled letter shapes.
- `walters-w82-184r`: expand the grotesque's older input through the actual gilt
  support and gray leaf terminal near source y=2350. Accepted man holding a
  long-tailed bird is separate and should be left alone.
- `walters-w82-182v`: old kneeling-actor input `[3392,5993,5072,7537]` clips the
  left contacted decoration. Inspect roughly 400–600 source pixels farther left;
  identify visible props neutrally. The old “bird on hand” label was wrong.
- `cma-2003-171`: removing the Q can disconnect marginal components. Identify
  true connected groups from the original before delivering a whole margin layout.

## Tools and workflow for resumption

Read the current job and relevant helper before invoking it. Use repository cwd.
Do not rerun every historical script: many are failed or superseded experiments.

```sh
# Regenerate counts/gallery only after deliberate staged changes.
.venv/bin/python tmp/extraction-work/continuation-20261010/update_checkpoint.py

# Aggregate verification; first run on resumption still needs to cover 557 assets.
.venv/bin/python tmp/extraction-work/continuation-20261010/validate_current.py

# Useful final whitespace check when changing repository documentation.
git diff --check
```

- `.venv/bin/python` has PIL/numpy/OpenCV/scipy. Native SAM/matting scripts use
  `tmp/segmentation-venv/bin/python` (Python 3.12, torch/SAM2/pymatting).
  Model: `tmp/sam2.1_hiera_base_plus.pt`, config
  `configs/sam2.1/sam2.1_hiera_b+.yaml`, CPU, six threads.
- `native_mask_refinements_20261011.py`: source-native closed-form alpha matting,
  original opaque RGB preserved. `solve(id, body, note, extras=None, band=3,
  certain_background=None, certain_foreground=None)`. Body matches the actual input
  dimensions. **Repeated calls overwrite the same candidate/audit paths**; preserve
  an immutable good base before modifying it. Avoid recursively duplicating history.
- `register_native_batch.py`: registers an AI ownership guide to original pixels.
  Many unique matches and low error still do not prove correct subject ownership;
  MKG's earlier low-inlier 90° mapping was rejected. Final visual verification is required.
- `proof_native_candidates.py` expects a **path to a JSON ID list**, not an inline list.
  `proof_source_details.py` uses **input-local** crop coordinates. Native original
  coordinates and delivered trimmed-image coordinates are different spaces.
- `tmp/extraction-work/export_work.py`: `export(jobPath, mode)` with `native-matte`,
  `ink`, `repeat` or `generated`; inspect implementation before calling. Repeat mode
  supports bars without frames and records `frame_withheld`. Do not reintroduce
  previously rejected corners just because trial files exist.
- `accept_reviewed.py`: `accept(ids, notes, evidence)` only after actual inspection;
  `source_audit(sid, status, notes)` only when the entire source has been accounted
  for. Source audit alone does not refresh all derived counts.
- `update_checkpoint.py` executes on **import**. Do not import it just to access a
  helper. Run sequentially after staged mutations. Avoid concurrent reads/writes of
  the same job or root metadata; a prior partial-JSON read caused a failed run.
- `tmp/extraction-work/ink_vector.py`: measured paper/ink unmixing is different from
  preserving original RGB; record it honestly. `skip_vector_trial=True` is a top-level
  job setting when a trace would lose detail.

### Failures not to repeat

- OpenCV `fillPoly(mask, [overlapping polygons], ...)` can XOR overlaps. Fill each
  polygon separately when building a union of opaque cores.
- Global darkness keys erase engraving shadows, hair and flesh. Use reviewed actual
  background ownership, not darkness alone or rectangular guessed pockets.
- Native unknown bands can erase 1–3 pixel ink. Recover actual thin strokes only
  in inspected scopes; preserve existing retained foreground. The MKG fine-stroke
  recovery was corrected to modify only previously absent pixels (`alpha < 8`).
- Source inputs can themselves clip feet, wings, finials and stems. Expand the input
  from the untouched original when needed; do not synthesize missing source-visible art.
- Never use only the largest alpha component for branched ornaments.
- Do not infer a repeat from similarity alone or accept a corner merely because
  it forms a closed outline. Inspect motif continuation and painted edges.

Historical-image generative requests for several pending sources were moderation
blocked. Exact failures are retained. **Do not retry by rewording/cropping to evade a
block.** Source-only inspection and native segmentation have been used instead.
Known blocked pending-source families include NGA 3385/3502/3512/3515/4322,
Met 364656/364697/399018, MKG 01641/01700, Cleveland 1952-532/1999-127/2011-52/
2011-65-a and Walters W7-1r/W82-52r/W82-179v. Check retained request records for
the specific attempt. Prior blocked MKG01865 actor requests were completed with
native source methods; that source is now finished.

## Completion criteria and next session

When the user asks to resume: read this handoff, inspect the live inventory, and
continue the active NGA3502/Cleveland2011.53 work or another unfinished source.
The new NGA hollow-ground proof is the immediate unreviewed result. Finish sources
systematically rather than repeatedly revisiting accepted assets without evidence
of a defect. Status questions do not cancel an active task; this explicit pause does.

The task is complete only when all 159 originals have a completed source audit or
documented duplicate decision; all delivered assets have traceable metadata and
actual final visual review; the aggregate validator passes the final inventory; and
the gallery/counts agree. Do not claim completion from asset count alone. Final
public import or publication is a separate task.

Preexisting repository changes at pause were `M AGENTS.md` and untracked
`docs/ARTWORK-SOURCES.md`. Preserve them. This handoff adds documentation only;
no public asset or runtime changes are part of the pause.

## Finished-only integration authorized after the pause

The subsequent instruction authorizes fixing `tmp/todos.md` only on finished
new artwork, studying the real resource/catalog/demo/release pipelines, and
adding the finished artwork to the project. It does not resume the 35
unfinished source images. The frozen starting selection contains 557 reviewed
assets. Corrections and the 557-asset validation are retained under
`tmp/extraction-work/todo-fixes-20261012/`; `tmp/todos.md` records their disposition.
A visual duplicate audit selected 541 distinct assets and excluded 16 older
alternate extractions. The selection and each keep/exclude decision are in
`tmp/finished-integration/selection.json`. `scripts/import_finished.py` measures
actual delivery bytes in memory, assigns complete designs before writing
resource files, and journals progress in `tmp/finished-integration/import-journal.json`.
The 161 previously published designs and their artwork must remain unchanged.

## Current state after finished-only import — 2026-10-12

The TODO corrections and local project import are complete. **Do not restart
extraction, repeat the import, or rebuild the original artwork.** The unfinished
35 source images remain paused. The completed extraction gallery now contains
541 assets; 16 superseded versions were moved to `tmp/new-crops-superseded/`
with their sidecars and keep/exclude decisions. Their historical metadata also
remains in the checked-in per-source audits. The 73 named sets remain searchable.

The real project now contains **702 designs: 89 borders, 281 whole decorations,
and 332 illustrations**. The new 31 repeat patterns include 29 frames and two
divider-only patterns whose source corners were not suitable. The public API,
types, download components, gallery, overview examples and integration pickers
respect that distinction. Four corner phases and both bar orientations stay
with each complete design.

Permanent records:

- `finished-additions.json`: 541 stable names/owners/master hashes, source links,
  duplicate decisions and a preserved original-161 inventory.
- `audits/finished-assets/`: original extraction methods/prompts/reviews and
  source identities; `preserved-existing-files.json` protects the old artwork.
- `illustrations.json`, `raster-metadata.json`, `finished-border-patterns.json`:
  editable metadata and retained-master build inputs. Existing artwork was not
  regenerated. SVG paths were retained; missing viewBoxes received their native
  canvas dimensions only.
- `resource-registry.json`, `resource-lock.json`, `resources/manifests/`: actual
  placement and approved bytes. New native inputs/exports live only in ignored
  `tmp/resource-checkouts/<id>/`, with local Git repositories initialized.
- `tmp/finished-integration/`: frozen selection, import journal, baseline,
  duplicate comparison sheets, validation logs and local package drafts.

Local review: run `npm run preview:local`, then open
`http://127.0.0.1:8767/examples/index.html` or
`http://127.0.0.1:8767/examples/react/`. This builds the production demos and
serves their assigned local resource artwork automatically, including after
navigation; no query parameter is needed. To serve an existing build, run
`node scripts/preview-site.mjs`. Set `ORNAMENTS_PREVIEW_PORT` to change the port.
The server binds only to loopback and serves the built site plus registered
resource files. It does not publish or copy artwork into the site build.
The older Vite preview on 8766 requires `?assets=local`; a reported blank,
unstyled React shell there was not reproduced in a fresh browser. The built
preview avoids that development module loading path. Extraction/source
comparisons remain at `tmp/new-crops/review.html`. No remote repository, npm
publication or Pages deployment was performed.

The 2026-10-13 loading fix applies to both demos: initial designs render before
the catalog downloads, discovery loads on picker opening, and results render in
48-item batches with full search. HTML/styles and loading placeholders appear
before the interactive JavaScript. The preview compresses/caches hashed bundles.
See `docs/PERFORMANCE.md` and the dated checks in `QA.md` for throttled measurements,
mobile testing, input preservation, deferred-loading and failure recovery checks.

### Release work remains separate

There are 24 changed resource revisions across 29 registered resources; 22 are
new local resource repositories. Their `gitCommit: null` pins intentionally
prevent release packaging. Commit/review the main tooling first, pin each
resource workflow to that immutable reviewed SHA, provision new repositories
and first-package publishing identities, publish resources, warm/verify every
approved CDN file, then lock exact clean source commits before releasing main.
Do not deploy this local catalog against unpublished CDN versions.

The expanded runtime draft is 809,036 bytes compressed / 4,949,945 bytes
unpacked, above the existing 210 KB / 1.25 MB contract. The limits have **not**
been relaxed. Resolve the catalog/package size contract before release; the
normal integration command currently stops at the earlier unlocked-resource
release guard. The Pages build is 48,918,125 bytes and passes its 50 MB guard
by compacting JSON and omitting the unused duplicate npm JSON catalog, without
removing source artwork or metadata fields. Final verification results are in
`QA.md` and `tmp/finished-integration/`.

Changed owners and newly added design counts:

| Resource | New designs |
| --- | ---: |
| `borders-004` | 18 |
| `borders-005` | 2 |
| `borders-006` | 11 |
| `decorations-002` | 10 |
| `decorations-003` | 25 |
| `decorations-004` | 8 |
| `decorations-005` | 25 |
| `decorations-006` | 47 |
| `decorations-007` | 32 |
| `decorations-008` | 16 |
| `decorations-009` | 41 |
| `decorations-010` | 31 |
| `illustrations-002` | 4 |
| `illustrations-003` | 47 |
| `illustrations-004` | 25 |
| `illustrations-005` | 7 |
| `illustrations-006` | 3 |
| `illustrations-007` | 3 |
| `illustrations-008` | 4 |
| `illustrations-009` | 62 |
| `illustrations-010` | 46 |
| `illustrations-011` | 21 |
| `illustrations-012` | 28 |
| `illustrations-013` | 25 |

Final local verification passed: catalog/README, unchanged original artwork, native master/corner/bar checks, isolated rebuild retention, types, corrected unit fixtures, 86 browser page checks, all 29 new frames on light/dark backgrounds at DPR 1/1.25/2, React selections/mobile layout, and all 24 resource package verifications/packs. The largest resource package is 128,092,234 bytes unpacked, under 140 MB. Only the documented release steps and the separately paused unfinished-source extraction remain.
