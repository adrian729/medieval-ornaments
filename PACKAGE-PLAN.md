# npm package and integration plan

Status: runtime 0.7.1 and numbered resource revisions 0.1.1 are published and verified, with unchanged artwork. Full artwork 0.4.0 and illustration artwork 0.1.0 remain unchanged. Reviewed merge decisions are in docs/MERGE-PLAN.md; exact artifacts, registry/CDN checks and deployment verification are recorded in QA.md.

## Goal and scope

Make this collection easy to use in other projects through `@ranx729/medieval-ornaments`, following the integration approach in `@ranx729/elder-scrolls`. Support native browser JavaScript, JavaScript with a bundler, and React with the same artwork behavior and options. Provide runnable examples, TypeScript declarations, clear asset hosting, and a tested public npm release.

The user authorized consolidation of medieval-cutouts into this collection. Preserve its original checkout/history; future illustration maintenance belongs here. Keep Polyhymnia logos, elder-scrolls and unrelated workspace files outside this repository.

Preserve the original 49 designs and their sources, variants, geometry and audit. Version 0.3.0 adds 21 audited source designs; the current collection has 56 repeats, 14 whole decorations and 41 illustrations.

## Findings already checked

- [x] Read this repository's `AGENTS.md`, usage contract, selection guide, and catalog.
- [x] Inspect elder-scrolls' package exports, optional React adapter, examples, and packaged integration checks.
- [x] Confirm that npm is authenticated as `ranx729` and elder-scrolls is published at `0.1.0`.
- [x] Check that `@ranx729/medieval-ornaments` is currently available. Recheck before the initial publish.
- [x] Inspect the current asset sizes: approximately 13 MB PNG, 7.8 MB WebP, and 32 MB SVG before package compression. Avoid automatically embedding the collection in application JavaScript.

## Accepted normalized contract

### Components and capabilities

Expose three React components and corresponding vanilla functions:

| Use | React | Vanilla | Supported designs |
| --- | --- | --- | --- |
| Frame around content | `OrnamentFrame` | `createFrame(element, options)` | The 56 designs with a frame atlas |
| Repeating separator | `OrnamentDivider` | `createDivider(element, options)` | The 56 repeat designs |
| Whole decoration | `OrnamentImage` | `createOrnamentImage(img, options)` | The 14 whole decorations and 41 illustrations |

Require a `design` name; do not silently choose an unrelated design. All other artwork options have defaults. Thus a divider with only `design` preserves that design's original direction and proportions.

Whole plate corner designs remain whole images. Do not pretend that they can construct an arbitrary frame. Reference crops and individual corner pieces remain available as assets/catalog components for advanced uses, rather than receiving a misleading generic repeating component.

Provide `ornaments`, `getOrnament(name)`, and `findOrnaments(filters)` without a React dependency. Selection supports use/capability, asset type, categories, subjects, colors, facing, composition, transparency and text search. Scoped catalogs import only their type’s metadata. Expose supported uses and formats so tools can choose designs without probing by trial and error. Keep results alphabetically ordered. Read and generate this metadata from `images.json`; do not maintain another hand-written artwork catalog.

### Shared options and defaults

| Option | Applies to | Behavior |
| --- | --- | --- |
| `design` | All | Required stable catalog name |
| `size` | All | Positive number in CSS pixels: frame/divider thickness, whole-image height |
| `format` | All | `auto`, `svg`, `webp`, or `png`; auto prefers SVG for the six floral vectors and WebP for painted artwork |
| `pixelRatio` | All | Positive density multiplier; default 2 for consistent browser/server output and reasonably sharp raster display |
| `assetsBase` | All | Optional public collection root for self-hosting; default is a version-pinned CDN root |
| `orientation` | Dividers | `original` by default, or `horizontal` / `vertical` |
| `length` | Dividers | Available space, as a positive number in pixels or a CSS length/percentage |
| `alt` | Whole images | Empty by default for decoration; accept meaningful alternative text |
| `loading` | All | Since 0.4.0: eager by default; optional native image lazy loading or shared 200px viewport observer for CSS artwork |
| `decoding`, `fetchPriority` | Whole images | Since 0.4.0: shared options, validated native hints, both default to auto |

Default sizes: frame 32px, divider 24px, whole-image height 256px. Default available divider length: 100% horizontally and 256px vertically. Choosing `original` uses the selected design's catalog axis, including originally vertical plate designs.

Normalize the following inside the library:

- Select the main or rotated tile automatically when orientation changes. Users never need to know filenames or `x`/`y` metadata.
- Use the catalog's actual repeat ratio and frame slice percentage; never assume that all designs share floral geometry.
- Preserve complete, contiguous, centered divider units and the existing responsive CSS behavior. Less than one unit fitting means no painted unit, as in the current browser.
- Preserve `round` frame fitting and supplied phase-matched atlases. Do not assemble corners independently.
- Select the smallest existing raster variant that meets the display requirement multiplied by pixel density; use actual dimensions, including atlas slice geometry. Fall back to the master when no larger asset exists. Never generate enlarged raster exports or invent filenames.
- Keep unavailable formats explicit: requesting SVG for a painted panel should produce a useful error. `auto` always selects a supported format.
- Treat unknown names, unsupported uses, invalid axes, and invalid sizes as actionable errors before mutating the DOM.

React-only props include children for frames, native HTML attributes, `className`, `style`, and forwarded DOM refs. Library geometry owns its reserved CSS variables; other application styling remains under the caller's control. A divider is decorative by default, without imposing a semantic heading or separator role. Frame content remains selectable and accessible.

Vanilla controllers expose `update(partialOptions)` and idempotent `destroy()`. Partial updates retain earlier options. Teardown restores the classes, attributes, CSS variables, and image attributes owned by the controller while preserving application children, form values, and unrelated styles. Prevent conflicting controllers on the same element.

Use a shared pure configuration/resolution layer for both APIs. React should render ordinary elements directly, preserve children across updates, support server rendering/hydration, and require no imperative replacement of React-owned content. Artwork load handlers should follow native browser behavior; do not promise a fake background-image `onLoad` event.

### Example shape

```jsx
import { OrnamentDivider, OrnamentFrame, OrnamentImage } from '@ranx729/medieval-ornaments/react';

<OrnamentDivider design="plate-02-stepped-ribbon" />
<OrnamentDivider design="plate-02-stepped-ribbon" orientation="horizontal" length="100%" />
<OrnamentFrame design="red-berry-vine" size={33}>
  <YourContent />
</OrnamentFrame>
<OrnamentImage design="floral-bird-panel-blue" size={128} />
```

```js
import { createDivider } from '@ranx729/medieval-ornaments';
import '@ranx729/medieval-ornaments/styles.css';

const divider = createDivider(document.querySelector('#divider'), {
  design: 'plate-02-stepped-ribbon'
});
divider.update({ orientation: 'horizontal', length: '100%' });
// On route teardown:
divider.destroy();
```

## Asset delivery and package contents

Since 0.4.0, borders/decorations use `https://unpkg.com/@ranx729/medieval-ornaments-assets@ASSETS_VERSION/`. Illustrations use `https://unpkg.com/@ranx729/medieval-ornaments-illustration-assets@ILLUSTRATIONS_VERSION/`. The runtime exports both package/version/base triples; root `ornamentAssets` and `ornamentIllustrations` pin the independently released archives. Code-only releases retain both pins. Never use `latest` or moving branches. Catalog imports perform no artwork requests.

The runtime includes core/React APIs, CSS, types, catalog, notices and integration documentation. It contains no artwork files or asset dependency. React remains an optional peer. `/react` imports CSS automatically and `/react/unstyled` supports ordinary Node SSR; preserve their side-effect metadata.

The optional full companion pins `@ranx729/medieval-ornaments-illustration-assets` as an exact dependency; its own archive contains borders/decorations, while the dependency contains illustration PNG/WebP. Illustrations can be installed alone. The runtime remains dependency-free and routes default URLs by asset type; an explicit assetsBase overrides both. Both archives carry the same unified checksum manifest, so a catalog/artwork change requires both archive versions and root pins to advance. Stage a flat mirror for local tests; npm archives split file allowlists and each compressed upload must stay below 200 MB.

The optional companion exports `/catalog.json`, `/assets-manifest.json`, `/svg/*`, `/png/*`, `/webp/*` and `/package.json`. Direct image imports migrate from the runtime to this companion in 0.4.0. It preserves every approved asset byte and the separate license notice.

`copy-assets <destination>` discovers the matching optional companion or downloads only selected files from the pinned CDN. Keep design/format filters, components/variants, filtered catalog, CSS and license notice. Verify the trusted manifest and each asset; stream four files concurrently with bounded memory. `--offline` forbids network access; `--from` supports approved local/HTTP mirrors. Preserve unrelated files, reject overlap with the runtime, both installed artwork archives (including unused/older revisions) and the source, reject external destination symlinks, and remove failed temporary files. Check prospective destinations before mkdir, including aliases to protected folders. No install-time download hooks.

The browser ZIP remains a full self-hosted distribution with modules, CSS and unchanged artwork. Since 0.7.0 Pages uses CDN-backed vanilla/React examples; the full self-hosted browser ZIP is a GitHub Release asset. Filesystem copy destinations never determine public `assetsBase` automatically.

Use allowlists for all three packages. Exclude source sheets, audit scripts, private files, temporary folders, tests and demos. The 111-design runtime must stay below 200 KB compressed/1.25 MB unpacked. This replaces the 70-design 150 KB/1 MB budget to accommodate 41 new typed entries and richer agent metadata; the artwork-free/optional-dependency invariant and single-design bundle checks remain mandatory. The runtime JSON catalog is compact to limit installed duplication. Measure both archives and verify every artwork hash before release. Ordinary npm packaging rebuilds only metadata. `build:assets` verifies and stages approved existing files; changed artwork/catalog needs both archive versions/dependency/pins to advance and an audited manifest update. Publish/verify illustrations, then the full companion, before a runtime referencing them.

Document licensing scope honestly before release. The current repository does not establish a blanket license for supplied reference artwork. Do not label the whole package or collection MIT. LICENSE scopes the integration code grant and excludes artwork. The separate artwork-rights document was removed at the user's request; retain source audits and provenance metadata without recreating it. Publication itself does not grant additional artwork rights.

## Implementation phases and acceptance checks

### 1. Agree on the contract

- [x] Review the component split, option names/defaults, supported uses, and CDN/self-hosting approach above.
- [x] Resolve any changes in this document before coding.

### 2. Build the dependency-free core

- [x] Generate immutable, typed selection metadata from the current catalog.
- [x] Implement capability checks, format selection, orientation selection, resolution selection, and asset URL resolution.
- [x] Implement the three vanilla controllers with update/cleanup behavior.
- [x] Reuse the existing shared CSS, including whole-section divider fitting.
- [x] Add the asset-copy command and native-browser distribution.

### 3. Add React and TypeScript

- [x] Implement the three thin components using the same shared resolution logic.
- [x] Support refs, HTML attributes, styling, frame children, and image alt text.
- [x] Verify updates, remounting, Strict Mode, SSR, and hydration without browser globals during server rendering.
- [x] Generate design-name types and capability-appropriate option declarations; do not let options drift between JavaScript and React.
- [x] Check the intended React peer range, including React 18 and 19 if declaring both supported.

### 4. Add demos and documentation

- [x] Provide runnable native-JS and React examples covering frames, both divider axes, whole decorations, and changes without losing content/state.
- [x] Add a small integration demo linked from the existing site. Keep artwork browsing, review, and QA pages working.
- [x] Make demos show original direction with only a design selection, then demonstrate horizontal/vertical switching on both an originally horizontal and an originally vertical design.
- [x] Demonstrate self-hosting, small raster selection, complete centered units, and the 33px frame case.
- [x] Document installation, exports, defaults, sizing, capabilities, asset hosting, accessibility, cleanup, SSR, and errors.
- [x] Update README, USAGE, SELECTION, AGENTS, and QA together. Keep alphabetical discovery lists.
- [x] Make installation/integration guidance findable for both humans and LLMs without requiring them to read the artwork-builder internals.

### 5. Test an actual packed consumer

- [x] Run catalog/artwork validations and compare approved asset hashes; library work must not alter artwork.
- [x] Test discovery and every design's capabilities, default format, geometry, and original/forced divider axes.
- [x] Test exact raster selection boundaries, density changes, absent variants, unavailable formats, and master limits.
- [x] Test vanilla partial updates, invalid-update atomicity, teardown, and preservation of children/form state/unrelated styling.
- [x] Run TypeScript consumer checks against the exported package declarations.
- [x] Create `npm pack`, install that archive into independent fixtures, and test the public exports rather than only checkout-relative imports.
- [x] Test native browser modules, vanilla bundled usage, and React development/production usage, including a nested deployment base.
- [x] Test React SSR/hydration, Strict Mode, orientation/design changes, image updates, ref forwarding, and preserved user input.
- [x] Verify self-hosted assets load with no unexpected external requests. Verify catalog imports do not trigger image downloads.
- [x] Inspect rendered examples at narrow/wide viewports, both axes, different lengths/densities, and 33px thickness. Check visual joins and full divider units, not just DOM attributes.
- [x] Run the existing browser checks. Run rendered join checks if shared CSS/geometry changes; artwork checks remain mandatory.
- [x] Inspect the tarball for credentials/unwanted files, stale/generated metadata, broken URLs, and size regressions.

### 6. Release and verify

- [x] Confirm npm identity, name availability, version, access, package contents, and final licensing notices.
- [x] Commit/push the tested implementation and documentation, keeping unrelated repositories untouched.
- [x] Publish `@ranx729/medieval-ornaments@0.1.0` publicly. If npm requires authentication/2FA interaction, report that concrete requirement; do not claim a successful release until verified.
- [x] Confirm the registry version and install it into a fresh consumer.
- [x] Verify version-pinned default CDN assets for frames, both divider directions, and whole images after publication.
- [x] Deploy examples/browser download and verify them on the live site.
- [x] Add a matching release/tag and record validation, package size, and any limitations in QA/release notes.
- [x] Document the future release sequence so additions to the artwork regenerate package metadata and ship under a new pinned version.

## Completion criteria

The work is complete when another project can install the published package, render a frame/divider/whole image with the documented defaults, switch divider axes without asset knowledge, use either vanilla JS or React, select designs by capability/category, and self-host images with the documented command. The existing approved artwork and previews must remain intact, and the installed release and live examples must pass the recorded checks.

## Technical references

- [npm: scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/) for public access and publication.
- [Vite: static asset handling](https://vite.dev/guide/assets.html) for build-time URL handling and the SSR limitation of `new URL(..., import.meta.url)`. Do not rely on dynamic module-relative image paths surviving arbitrary bundling.

## Continuation notes

Last checkpoint (0.2.0): automatic CSS in `/react`, `/react/unstyled`, updated demo/snippet and documentation, and version-pinned metadata are complete. Unit/type checks, packed and fresh registry React 18/19 consumers, Node/Vite SSR, hydration, production tree shaking, artwork checks and demo builds pass. Published npm 0.2.0 as `latest`, pushed to GitHub, created release/tag v0.2.0, and verified the successful Pages deployment, live demos at 375/1200px, pinned CDN modules/images and downloaded browser ZIP. Artwork/source/shared CSS are unchanged. Plain Node SSR consumers migrate to `/react/unstyled`. All 473 existing live browser checks also pass. No follow-up implementation or release work remains.

Previous release checkpoint (0.1.0): implementation, npm publication, Pages deployment, fresh registry consumer checks, actual pinned CDN assets/modules, live vanilla/React demos, downloaded self-hosted browser ZIP, and the existing 473 live browser checks all pass. Artwork/source/shared CSS are unchanged. No implementation work remains. The checkout now lives at /home/ranx729/projects/medieval-ornaments. Release v0.1.0 records this completed work. For future additions, follow docs/INTEGRATION.md and regenerate metadata/types after catalog changes.

## Artwork additions · 0.3.0 (October 2026)

Release 0.3.0 adds 21 audited source designs: 16 repeats and five whole decorations,
for totals of 70/56/14. The original 49 designs are unchanged. Three grid-paper
stencils retain their backgrounds and documented grid-phase limitations; grid
lines are not watermarks. All 28 stock-watermarked candidates are excluded.

The user authorized commits, npm release and main demo updates. The temporary
additions-only page and its checker were removed; the permanent demo, browser,
review and vanilla/React examples expose the accepted designs. All geometry,
native pixels, source hashes and editable traces remain audited. Version-pinned
UNPKG replaces jsDelivr for default URLs because the detailed traces exceed
jsDelivr's package-size limit. Do not reduce artwork fidelity to fit that limit.

Release checklist:
- [x] Bump package version and lockfile to 0.3.0 and regenerate metadata/types.
- [x] Integrate three grid-paper stencil designs and remove temporary review page.
- [x] Validate catalog, artwork, unit/types, packed consumers and main browser (656 checks).
- [x] Commit and push the tested changes (a5e67d4).
- [x] Publish npm 0.3.0 as latest; verify a fresh registry install and version-pinned UNPKG modules/assets.
- [x] Verify successful Pages run 37135108933, 656 live gallery checks, vanilla/React examples and the downloaded self-hosted browser ZIP.
- [x] Create public v0.3.0 release/tag and record final evidence in QA.md.

Final verification: registry integrity matches the exact tested archive; fresh registry consumers pass 70 designs/168 native cases/32 density cases. Pinned UNPKG returns version 0.3.0 and all eight checked asset configurations decode. Live examples pass at 375/1200px, including new stencil/russet designs and the whole painted middle panel. The downloaded browser ZIP works with local assets. See QA.md for measured package sizes and source limitations.

## Whole-decoration quality patch 0.3.1

- [x] Confirm pre-generated raster variants match the cutout collection's size scheme.
- [x] Fix whole-image browser selection to account for aspect ratio and density.
- [x] Check all 14 whole designs in PNG/WebP at densities 1, 1.25 and 2.
- [x] Bump package/lockfile and regenerate metadata for 0.3.1.
- [x] Replace the noisy bellflower SVG with faithful smooth contours and petal gradients; preserve native raster and reference files.
- [x] Validate artwork/catalog, packed consumers and the browser ZIP.
- [x] Commit/push, publish the tested package and create the patch release.
- [x] Verify fresh registry consumers, pinned CDN artwork and deployed demos; record final evidence.

Final verification: npm latest is 0.3.1, with registry integrity matching the
exact tested archive. Fresh registry consumers repeat the packed-consumer checks.
Pages passes all 740 browser checks; live vanilla/React examples and the downloaded
browser ZIP pass. Ten actual pinned UNPKG configurations decode, including the
native gold PNG and the smooth SVG, whose bytes match the reviewed export.

## Sprawling panel lower-border patch 0.3.2

- [x] Inspect the original edge/corner and document the exact repair bounds.
- [x] Reflect the 11px top band across the whole bottom and trim three trailing rows.
- [x] Keep source/reference files and floral interior unchanged; retain existing SVG paths.
- [x] Rebuild the affected PNG/WebP variants, SVG and package metadata.
- [x] Complete artwork/catalog, browser and packed-consumer checks.
- [x] Commit/push, publish the tested package and create the patch release.
- [x] Verify fresh registry consumers, pinned CDN artwork and live demos; record final evidence.

Final verification: registry integrity matches the tested 0.3.2 archive; fresh
registry consumers pass. Live Pages passes 740 browser checks and serves the
reviewed PNG/SVG bytes. Actual version-pinned UNPKG files match those exports
and report the repaired 722×229 geometry. Live vanilla/React demos and the
downloaded browser ZIP pass. The initial CDN HTTP 500 responses cleared before
verification was completed; see QA.md.


## Performance audit and package split · 0.4.0 (2026-10-03)

- [x] Measure artwork transfer/complexity, production bundles, computation/SSR,
  browser layout/long tasks, caching and package installation costs.
- [x] Add opt-in shared lazy loading without changing default geometry or content.
- [x] Reserve whole-image dimensions and expose validated native image hints.
- [x] Skip unchanged vanilla DOM writes, including image sources.
- [x] Right-size thumbnails/comparisons and defer offscreen review/QA artwork.
- [x] Record reproducible desktop/mobile observations in docs/PERFORMANCE.md.
- [x] Pass unit/types and real packed React 18/19, SSR/hydration, state/ref,
  pending-update, teardown and unchanged-mutation checks.
- [x] Pass all 740 browser checks with lazy-artwork scrolling, inspect desktop/mobile
  and dark review screenshots, and verify ZIP integrity/library/docs; record in QA.md.

- [x] Split lightweight runtime from optional artwork archive and pin artwork independently.
- [x] Preserve selected streaming downloads, checksum verification, offline copying and direct asset imports through the companion.
- [x] Document the 0.3.x migration, independent versioning and asset-first release sequence.
- [x] Pass both actual packed packages, lean install, explicit offline companion and production bundler asset imports.
- [x] Publish exact tested companion/runtime archives and verify fresh registry consumers and pinned CDN checksums.
- [x] Commit/push, tag/release 0.4.0, verify Pages/browser ZIP and record sizes/results in QA.md.


## Selective imports and local installer · 0.5.0

Individual `/designs/<name>` vanilla and `/react/<name>` React modules bind one
immutable design; `/react/unstyled/<name>` supports plain Node SSR. Repeat designs
export frame/divider APIs; whole decorations export image APIs. The `design`
option is optional and can only match the bound name. Generic APIs remain
compatible and require a design. `/catalog` exposes optional full discovery.
All adapters use catalog-free shared geometry/rendering/visibility; generated
modules import only their own data. Preserve styled wrappers' CSS side effects.

`add <name>...` copies editable selected modules, shared helpers, declarations,
notices and only requested artwork formats/components/variants into a consumer.
Defaults are React, `src/ornaments`, `public/ornaments`, `/ornaments/`, and auto
format (SVG for six vector reconstructions, lossless WebP for painted designs).
Copied code has no runtime-package dependency. The asset manifest/streaming
verification and guards also apply to add. Keep metadata/types filtered to
installed formats. Reuse same-version/configuration helpers, merge chosen designs,
retain unrelated files and protect edited requested files; `--overwrite` is
explicit. Updates across versions/configuration use fresh directories and a
reviewed merge. No artwork rebuilding or automatic dependency installation.

- [x] Implement shared cores, generated individual metadata/modules/types and optional catalog export.
- [x] Implement selected local code/artwork installer, checksum verification, offline support and edit protection.
- [x] Document runnable imports, installer, hosting, formats, TypeScript, SSR, edits and updates in docs/SELECTIVE.md.
- [x] Measure production bundles and assert selected module graphs, one resolver and retained CSS.
- [x] Pass complete unit/types, actual packed consumers, artwork/catalog and browser/ZIP checks.
- [x] Commit/push, publish the exact tested runtime archive, verify fresh registry/CDN consumers.
- [x] Verify Pages/live examples/browser ZIP; tag/release and record sizes/results in QA.md.

## Illustration consolidation · 0.6.0 / artwork 0.4.0

Reviewed plan: docs/MERGE-PLAN.md. Preserve the original checkout/history and all
artwork bytes while making future illustration maintenance part of this repo.
The asset package remains independently pinned and optional.

- [x] Inspect both pipelines, metadata vocabularies, artwork, sources and working-tree additions.
- [x] Import 41 illustrations, variants, source records and descriptive metadata with an auditable byte inventory.
- [x] Make full/selected border builds retain illustrations; provide a selected illustration resize command.
- [x] Add type, transparency and usage metadata; improve generic ornament descriptions and preserve all cutout fields.
- [x] Extend selection/types/schema and introduce scoped catalogs while preserving rendering geometry/CSS.
- [x] Cover illustrations in selective imports, local installation, permanent demos and metadata filters.
- [x] Verify unit/types, actual packed consumers, lossless pairs/source preservation and all 1,074 local browser checks.
- [x] Measure selected/scoped bundles, real size selection and cold-cache eager/lazy behavior.
- [x] Split optional artwork archives after npm rejected the unified payload; retain all bytes and full/illustration-only offline installs.
- [x] Verify packed companions/runtime and assembled deployment; final archives are recorded in QA.md.
- [x] Commit/publish illustration archive, full companion, then runtime; verify fresh registry/CDN consumers.
- [x] Verify deployed examples/ZIP and live gallery; tag/release and record final results.

## Consolidation review · runtime 0.6.1

Keep artwork 0.4.0 and illustrations 0.1.0 unchanged. This patch hardens
maintenance/CLI behavior and fills documentation/demo gaps found after the merge.

- [x] Preserve removed illustration files during border cleanup; validate new illustration metadata/path ownership before writes and allow omitted initial variants.
- [x] Preserve authored illustration usage notes without accumulating generated notes on refresh.
- [x] Protect both installed artwork archives, older versions, explicit mirrors and symlink aliases before creating copy destinations.
- [x] Document runtime versus data packages, complete offline/hosting sequences, current capabilities, agent selection and the new-illustration template.
- [x] Update the landing demo count/grouping and use adequate smaller raster variants for border previews.
- [x] Verify 29 unit tests, public types, isolated rebuild cases, packed consumers, 1,079 browser checks, artifact/site builds and unchanged individual/scoped bundle sizes.
- [x] Publish the tested runtime patch, verify fresh registry/CDN consumers and deployed demos/ZIP, and record final evidence in QA.md.

## Numbered resources · runtime 0.7.0

Plan and agent workflow: docs/RESOURCES.md. Consumer changes:
docs/RESOURCE-MIGRATION.md. Artwork pixels, design names, props, geometry,
scoped metadata and individual imports remain unchanged. Resource ownership is
independent of factual asset type and supports additional numbered repositories.

Consumer/agent default: individual npm imports with pinned CDN images and no
local `assetsBase`. `add` deliberately copies code and artwork; `copy-assets`
deliberately downloads images for self-hosting. Choose local delivery for existing
hosting, explicit editable/offline requirements or measured delivery problems.
CDN reduces deployment size but does not guarantee faster first paint.

- [x] Validate the ownership split, preserve approved bytes/metadata and define stable collection/sequence naming and capacity reserves.
- [x] Implement central registry/manifests/locks, explicit sparse fetching, canonical generator paths, local aliases, approval, new-source scaffolding and immutable retained-design migration.
- [x] Route generic/individual components and verified installs through exact source pins without runtime artwork dependencies or full routing in individual bundles.
- [x] Retain compatibility archive exports and flat self-hosted layout; document raw/Pages artwork links, legacy constants, local authoring and ZIP URL changes.
- [x] Move Pages artwork to CDN delivery and the optional browser ZIP to GitHub Releases; separate demo build from full offline packaging.
- [x] Publish/verify three resource repositories and npm packages; lock exact source commits and remove migrated physical files from main.
- [x] Complete packed/browser/artwork/performance checks, publish runtime, deploy Pages and attach the verified offline ZIP.
- [x] Record final sizes, release links and consumer migration examples after final review.

## Notice removal · runtime 0.7.1

Remove the separate artwork document at the user’s request from current main
and numbered resource revisions. Keep the existing scoped LICENSE, source
audits and artwork bytes. Old published archives are immutable compatibility
snapshots and remain available. New copied components/assets and the browser
ZIP include LICENSE only. No design, component API or geometry changes.

- [x] Publish the three numbered resources at 0.1.1 after verifying unchanged public files and editable inputs.
- [x] Lock clean source commits and update current usage/CDN examples to 0.7.1 / 0.1.1.
- [x] Pass unit, type, packed-consumer, package-size and site checks.
- [x] Publish the tested 0.7.1 runtime, upload its offline ZIP, deploy Pages and record results in QA.md.

## Historical-source additions · local candidate, 2026-10-08

Add 23 reviewed assets to numbered resources: 22 extractions of historical
objects with open museum reproductions and one explicitly modern independent
interpretation of a restricted-reference motif. Preserve all 111 earlier catalog
entries and artwork. The local total is 134: 56 borders, 24 whole decorations,
54 illustrations. Optional provenance reaches master/public/individual metadata,
types, search, browser links and copied components. No new repeat is claimed.

- [x] Assign capacity before artwork writes; retain untouched scans, generated native inputs, source/master hashes and exact edit prompts.
- [x] Split independent entities and review every final asset against its source/motif and on light/dark backgrounds; verify both transparent frame centers.
- [x] Preserve the existing catalog entries and all old approved artwork/input bytes without provenance backfill.
- [x] Keep optional compatibility archives immutable; verify their unchanged intersection and refuse new selections before writes.
- [x] Verify local unit/types, catalog/artwork, isolated rebuild retention and offline numbered-resource consumers.
- [x] Pass actual npm-packed candidate consumers with all numbered packages installed: 134 designs, React 18/19, SSR/hydration and self-hosting. Keep ordinary release prepack blocked until source commits are locked.
- [x] Prepare decoration and illustration resource 0.1.2 manifests with pending commit pins; measure an artwork-free runtime archive (about 206 KB packed, 1.43 MB unpacked).
- [x] Resolve the measured runtime size increase with shared generic declarations and compact private per-design metadata. Public JSON/descriptions/provenance remain unchanged; individual imports remain isolated. Keep the original 200 KB / 1.25 MB test limits, including provided candidate archives.
- [x] Publish the reviewed numbered resource bytes, verify npm/CDN, then lock exact clean source commits.
- [x] Choose runtime 0.8.0, rebuild and pass its actual packed-consumer release gate; keep both old compatibility snapshots unchanged.
- [x] Publish runtime, deploy source-linked browser, verify live gallery/examples and attach the verified offline ZIP.

### Rosselli repeat borders and runtime size follow-up

Two additional native raster borders bring the local total to 136: 58 borders,
24 decorations and 54 illustrations. `historical-border-patterns.json` records
complete interior mask/foliate cycles, source/master hashes, a two-pixel collar,
and refined AI-assisted foliate corner geometry with exact connecting collars.
The four distinct corner phases and editor outputs are retained in borders-001.
Original whole strips are preserved.
Both belong to borders-001; its 0.1.2 revision was prepared with a pending commit
pin at this checkpoint. Publication and exact source locks are now complete; see
the 0.8.0 release coordination below.
The reviewed 136-design runtime is 197,828 B packed / 1,198,353 B unpacked,
below the unchanged 200,000 B / 1,250,000 B budget. Packed consumers, public
types, isolated rebuilds, native/frame browser checks and selective imports pass.

### Polyhymnia illustration

Added the user-supplied `polyhymnia` framed scene to illustrations-001's local
0.1.2 candidate, retaining original bytes and the exact supplied generation
prompt in `illustration-additions.json`. Optimized PNG pixels are identical;
lossless WebP and native-derived 128/256/512/768 variants retain the outer alpha.
The catalog now has 137 designs: 58 borders, 24 decorations, 55 illustrations.
Individual vanilla/React imports and types are generated. All existing artwork
and catalog entries remain unchanged. Publication and exact pins are now complete
as part of the 0.8.0 release below.
Runtime remains within the original size limits at 199,283 B packed /
1,204,457 B unpacked (875 files), with no artwork dependency.

## Release 0.8.0 coordination (2026-10-08)

User authorized committing, pushing and releasing main plus all three changed
numbered resources. Runtime version: 0.8.0; numbered revisions: 0.1.2. Polyhymnia
uses the supplied corrected 1004×1567 source with unchanged names/descriptions.

- [x] Replace its native input and every PNG/WebP size; review all variants and preserve all unrelated artwork/metadata.
- [x] Validate resource ownership, capacity, source audits, catalog, types, unit tests and isolated rebuild retention.
- [x] Commit approved main tooling to an immutable release branch; pin resource publication workflows.
- [x] Commit/push/publish resources; verify registry/CDN bytes; lock clean exact source commits.
- [x] Pass final release pack budget and actual packed consumers; commit/push main.
- [x] Publish runtime 0.8.0, create releases/tags for all four repos, upload browser ZIP, verify registry consumers and Pages/ZIP.

Final 0.8.0 normal pack: 199,920 B / 1,215,901 B (875 files). Packed consumers
and all 2,059 public artwork hashes pass. See QA.md for exact pins and the
maintainer publication fallback after npm rejected workflow authentication.

All four releases are public and their latest npm tags are verified. Registry
consumers, all artwork hashes, live Pages examples/pinned CDN and the downloaded
ZIP pass. Release tag v0.8.0 pins 05d7f67; resource v0.1.2 tags pin the three
clean commits in resource-lock.json. Historical local-candidate checkpoints
above are superseded by this completed release; optional archives remain unchanged.

## Automated resource authentication follow-up (2026-10-09)

- [x] Add a fail-closed authentication-only workflow using npm's real OIDC exchange, with no upload or version change.
- [x] Remove setup-node's unused token npmrc; pin npm 11.19.0 and retain the caller's immutable tooling SHA and byte/identity checks.
- [x] Pass 41 unit tests and public types; keep the runtime budget at 199,952 B / 1,215,973 B with the documentation update.
- [x] Pin/push the three resource callers and run authentication-only checks from their actual GitHub identities. All byte/identity checks pass, but all three authentication checks fail; settings are still unresolved.
- [ ] Inspect/fix npm Trusted Publisher settings using an interactive account session if the checks require it. The existing maintainer publishing token is rejected for trust management (E403).
- [ ] Record successful authentication and, for any newly created connection, its first real publish/expiry status.

No artwork, approved manifests, public npm versions or published source pins have
changed in this infrastructure follow-up. docs/PUBLISHING.md records the exact
identities, permissions and safe workflow invocation. Account login is pending.

Tooling SHA: bb0fec2c09437645196071076221691db8e0b539. Caller commits:
borders 65eb1f2, decorations 4cc9a66, illustrations 49fe571. Auth-only runs:
37854145728 / 37854149453 / 37854153460. Each skipped the real publish step.
The first interactive npm login link expired; no registry setting has been
changed. Continue with a fresh interactive session, inspect existing publishers
and rerun all three checks after correcting the settings.
