# npm package and integration plan

Status: implementation approved by the user ("impl!"). Implemented and published as @ranx729/medieval-ornaments@0.2.0, including automatic React styles. Packed and registry consumers, pinned CDN defaults, deployed examples, and the downloaded browser ZIP are verified. Keep this checklist current as each phase is completed. Record changes to the decisions here rather than silently diverging from them.

## Goal and scope

Make this collection easy to use in other projects through `@ranx729/medieval-ornaments`, following the integration approach in `@ranx729/elder-scrolls`. Support native browser JavaScript, JavaScript with a bundler, and React with the same artwork behavior and options. Provide runnable examples, TypeScript declarations, clear asset hosting, and a tested public npm release.

This plan covers **medieval-ornaments only**. Keep medieval-cutouts, Polyhymnia logos, and elder-scrolls unchanged. Publishing the cutout collection would be a separate task.

Preserve the existing 49 designs, original sources, catalog, variants, geometry, artwork audit, and preview pages. This is an integration layer over the approved artwork, not an artwork redesign. The current collection has 40 repeat designs and nine whole decorations.

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
| Frame around content | `OrnamentFrame` | `createFrame(element, options)` | The 40 designs with a frame atlas |
| Repeating separator | `OrnamentDivider` | `createDivider(element, options)` | The 40 repeat designs |
| Whole decoration | `OrnamentImage` | `createOrnamentImage(img, options)` | The nine whole decorations |

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

Default: `https://cdn.jsdelivr.net/npm/@ranx729/medieval-ornaments@VERSION/`. Pin the library's own exact version, never `latest` or a moving Git branch. Only selected images are requested by the browser; importing the catalog must not fetch images. This also gives the browser and server identical public URLs.

The default requires CDN access. Provide an equally documented self-hosted path for offline applications, strict content policies, or projects that want all resources on their own origin:

- Include cataloged SVG/PNG/WebP assets in the npm archive.
- Provide `medieval-ornaments copy-assets <destination>` with an optional design filter. Preserve relative paths and copy all necessary components/variants for the chosen designs.
- Show how to copy into an application's public folder and pass `assetsBase`, including deployment under a nested URL path. Never infer the application's public deployment path from filesystem paths.
- Provide a browser download with modules, CSS, assets, and a working native-JS example if following elder-scrolls' browser-download convention.

Package exports: core API, `/react`, `/react/unstyled`, `/styles.css`, `/catalog.json`, and direct `/svg/*`, `/png/*`, `/webp/*` assets. Use ESM and TypeScript declarations. React is an optional peer dependency; vanilla users need no React runtime. The default `/react` entry imports the shared stylesheet automatically; `/react/unstyled` exposes the identical components without CSS imports for plain Node SSR and centrally managed styles. Vanilla still loads CSS explicitly. Keep both CSS and the styled React wrapper marked as side effects so production builds retain the styles. This updates the original separate-React-CSS-import contract at the user's request.

Use a package allowlist. Exclude source sheets, reference audit scripts, private files, temporary folders, virtual environments, browser profiles, tests, and demos from the npm runtime package. Keep asset provenance and usage documentation included. Measure compressed/unpacked package sizes and inspect every packed path before release.

Consumers must not need Python or artwork-generation dependencies. Generate library metadata/types with a lightweight maintainer build; packaging must not retrace, redraw, or modify the approved artwork. Preserve the original catalog in the repository.

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
