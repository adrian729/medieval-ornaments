# npm package and integration plan

Status: implementing runtime 0.5.0 individual imports and the local component/artwork installer. Runtime 0.4.0 and artwork 0.3.2 are published and verified. The code-only 0.5.0 release retains artwork 0.3.2; publication/deployment checks are pending.

## Goal and scope

Make this collection easy to use in other projects through `@ranx729/medieval-ornaments`, following the integration approach in `@ranx729/elder-scrolls`. Support native browser JavaScript, JavaScript with a bundler, and React with the same artwork behavior and options. Provide runnable examples, TypeScript declarations, clear asset hosting, and a tested public npm release.

This plan covers **medieval-ornaments only**. Keep medieval-cutouts, Polyhymnia logos, and elder-scrolls unchanged. Publishing the cutout collection would be a separate task.

Preserve the original 49 designs and their sources, variants, geometry and audit. Version 0.3.0 adds 21 audited source designs; the current collection has 56 repeats and 14 whole decorations.

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
| Whole decoration | `OrnamentImage` | `createOrnamentImage(img, options)` | The 14 whole decorations |

Require a `design` name; do not silently choose an unrelated design. All other artwork options have defaults. Thus a divider with only `design` preserves that design's original direction and proportions.

Whole plate corner designs remain whole images. Do not pretend that they can construct an arbitrary frame. Reference crops and individual corner pieces remain available as assets/catalog components for advanced uses, rather than receiving a misleading generic repeating component.

Provide `ornaments`, `getOrnament(name)`, and `findOrnaments(filters)` without a React dependency. Selection supports use/capability, categories, subjects, colors, and text search. Expose supported uses and formats so tools can choose designs without probing by trial and error. Keep results alphabetically ordered. Read and generate this metadata from `images.json`; do not maintain another hand-written artwork catalog.

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

Since 0.4.0, default images use `https://unpkg.com/@ranx729/medieval-ornaments-assets@ASSETS_VERSION/`. The runtime exports `assetsPackage`, `assetsVersion` and `defaultAssetsBase`; root `ornamentAssets` pins the independently released companion. Code-only releases retain that pin. Never use `latest` or moving branches. Catalog imports perform no artwork requests.

The runtime includes core/React APIs, CSS, types, catalog, notices and integration documentation. It contains no artwork files or asset dependency. React remains an optional peer. `/react` imports CSS automatically and `/react/unstyled` supports ordinary Node SSR; preserve their side-effect metadata.

The optional companion exports `/catalog.json`, `/assets-manifest.json`, `/svg/*`, `/png/*`, `/webp/*` and `/package.json`. Direct image imports migrate from the runtime to this companion in 0.4.0. It preserves every approved asset byte and the separate rights notices.

`copy-assets <destination>` discovers the matching optional companion or downloads only selected files from the pinned CDN. Keep design/format filters, components/variants, filtered catalog, CSS and rights notices. Verify the trusted manifest and each asset; stream four files concurrently with bounded memory. `--offline` forbids network access; `--from` supports approved local/HTTP mirrors. Preserve unrelated files, reject package/source overlap and external destination symlinks, and remove failed temporary files. No install-time download hooks.

The browser ZIP remains a full self-hosted distribution with modules, CSS and unchanged artwork. Pages retains self-hosted vanilla/React examples. Filesystem copy destinations never determine public `assetsBase` automatically.

Use allowlists for both packages. Exclude source sheets, audit scripts, private files, temporary folders, tests and demos. The runtime must stay below 150 KB compressed/1 MB unpacked. Measure both archives and verify every artwork hash before release. Ordinary npm packaging rebuilds only metadata. `build:assets` verifies and stages approved existing files; changed artwork/catalog needs a companion version bump and audited manifest update. Publish/verify the asset revision before a runtime referencing it.

Document licensing scope honestly before release. The current repository does not establish a blanket license for supplied reference artwork. Do not label the whole package or collection MIT. Choose an explicit license for the new integration code and include a separate asset provenance/rights notice reflecting what is actually known; publication itself does not grant additional artwork rights.

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
- [ ] Commit/push, publish the exact tested runtime archive, verify fresh registry/CDN consumers.
- [ ] Verify Pages/live examples/browser ZIP; tag/release and record sizes/results in QA.md.
