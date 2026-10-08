# Artwork and frame verification

## Automated publishing authentication follow-up (2026-10-09)

Added an authentication-only caller input and a pinned npm 11.19.0 check that
requires positive evidence from npm's actual GitHub OIDC token exchange. Its
dry run cannot upload; real publication and capacity-pack steps are skipped.
An unauthenticated npm dry run exiting successfully is deliberately rejected.
Captured CLI errors/output are never echoed into workflow logs. setup-node no
longer writes an unused token-based npmrc.

41 unit tests and public types pass. Normal candidate pack remains within the
original budget at 199,952 B / 1,215,973 B, 875 files; no runtime code or artwork
changed. The main tooling commit bb0fec2c09437645196071076221691db8e0b539 is
pinned in all three pushed resource callers. Pages deployment for it passes.

GitHub authentication-only runs 37854145728 (borders), 37854149453 (decorations)
and 37854153460 (illustrations) all pass approved bytes and repository identity,
then reject the missing successful OIDC exchange. The real publish steps were
skipped in every run. No npm version, manifest, artwork or published source pin
changed. Trusted Publisher configuration remains unresolved: the current local
publishing token receives E403 when listing settings. An interactive account
login is required; the initial web login link expired without completing.
See [authentication setup](docs/PUBLISHING.md). Evidence: ignored tmp/npm-auth/.

## 0.8.0 published release verification (2026-10-08)

The final normal npm pack is **199,920 B packed / 1,215,901 B unpacked**, 875
files, inside the unchanged 200,000 B / 1,250,000 B budget. It contains no
artwork or automatic asset dependencies. 38 unit tests, public types and the
actual packed consumer release gate pass: 137 designs, 174 native-axis cases,
32 density/length cases, React 18/19, SSR/hydration, selective/copy imports and
self-hosting. All 2,059 public artwork files match approved manifest hashes.
Fixture: /tmp/ornaments-integration-v9jbCC. Final catalog generation validates
137 designs and 233 genuine SVGs; isolated rebuild retention and artwork checks
pass (416 exact joins, 110 integer atlases, 58 pixel-exact rotations).

All three numbered resource packages are published at 0.1.2, with clean exact
source commits locked after registry/CDN verification:

- borders-001: ef24915da1bfec54f7263871a4ffa2ddc0eea5b4.
- decorations-001: 5f4cca1a625af43c08040ed70f97e736e999c7e0.
- illustrations-001: d44f1405d44a8276d1b75246db297f2db84a3d74.

Their approved CDN manifests and 79 selected files match SHA-256, covering all
corrected Polyhymnia variants, new master images and Rosselli frame components.
Resource GitHub tags/releases v0.1.2 exist. Workflows pinned to reviewed tooling
1eef0552577e0dea7b874c649b03f72d4bec9b79 passed byte/identity verification,
but npm rejected automated publication with E404. Publication succeeded using
the already authorized maintainer login; Trusted Publisher configuration still
needs verification before relying on automation for a future release.
Legacy compatibility archives stay immutable at 0.4.0/0.1.0.

The rebuilt browser ZIP is 431,547,944 B. The CDN-backed Pages build is
42,548,588 B, below its 50 MB guard, with source audits and no local heavy
artwork or ZIP. Runtime 0.8.0 is published; its npm integrity matches the exact
tested archive. Registry consumers pass again using all published resource
packages, with all 2,059 artwork hashes verified; fixture:
/tmp/ornaments-integration-g3eEYQ. CDN catalog matches all 137 designs.
The main v0.8.0 tag points to tested release commit
05d7f67f85f4dee04f60005104c524ac88926dd9. All four repos have pushed commits
and public GitHub tags/releases; npm latest tags select 0.8.0 / 0.1.2. Pages
deployment run 37825067535 passed. Deployed catalog and all three source audits
match main bytes. Live vanilla/React at 375/1200px and fractional DPR, forced
axes, pinned npm modules/artwork (including both Rosselli frames and corrected
Polyhymnia), and downloaded offline ZIP all pass without browser errors or
missing assets. ZIP fixture: /tmp/ornaments-browser-release-HfAObb. Uploaded,
local and downloaded ZIP SHA-256:
c6146646ec1eff3bdc6d1996bf907550551a9b61b060b3f8d959d0d13601e994.

Evidence: ignored tmp/polyhymnia-replacement/, tmp/package-integration.json and
tmp/package-site.json. [Runtime release](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.8.0).

## Corrected Polyhymnia and 0.8.0 release preparation (2026-10-08)

Replaced all 10 existing Polyhymnia exports and its native input with the supplied
`polyhymnia-final.png`, now 1004×1567. All names, descriptions, tags and usage
notes remain unchanged; other 136 entries and approved resource files/inputs
are identical. Compression preserves new RGBA pixels; each PNG/WebP size was
reviewed on light/dark and verified lossless. Superseded hashes and original
generation prompt remain audited; no unknown correction prompt is invented.
Browser checks, source/resource hash checks, catalog, unit/types, isolated rebuild
retention and selective imports pass. Release coordination continues below.

## Polyhymnia illustration · local candidate (2026-10-08)

Added `polyhymnia` as a complete 1004×1566 framed scene in illustrations-001.
`illustration-additions.json` retains the supplied exact generation prompt,
original hash/bytes and compressed PNG hash. It records a modern AI illustration
without inferring the unidentified reference frame's historical attribution.
PNG compression reduced 3,536,416 B to 3,357,834 B with identical RGBA pixels.
Native lossless PNG/WebP plus 128/256/512/768 variants supply 10 public files;
every pair preserves alpha and visible RGB. All sizes and the complete scene
were visually reviewed, including organ, veil, border and irregular outer alpha.

The original 136 catalog entries and every earlier approved illustration file
and native input are unchanged. The catalog now has 137 designs (58 borders,
24 decorations, 55 illustrations), 2,059 public asset files. Resource ownership,
approved hashes and resource package verification pass; illustrations-001 has
221,489,530 B of approved artwork/input bytes, below capacity. PNG/WebP display
correctly on light/dark in the main browser; unavailable SVG is disabled. The
simple added-assets overview includes the new image.

38 unit tests, public types, catalog/README validation, artwork checks and
selective import audits pass. Individual imports retain one design. The latest
packed consumer integration passes all 137 designs, 174 native-axis cases and
32 density/length cases, with React 18/19, SSR/hydration, copied components and
self-hosting; all 2,059 public artwork files are verified against pinned hashes.
Fixture: `/tmp/ornaments-integration-a8ARzk`.
The latest
runtime is **199,283 B packed / 1,204,457 B unpacked**, 875 files, no artwork,
inside the original budget. Evidence lives in ignored `tmp/polyhymnia/`.
All resource revisions remain local at 0.1.2 with pending publication/commit pins.

## Refined Rosselli corners · local candidate (2026-10-08)

Replaced the rigid diagonal corner splices in both Rosselli borders with four
separately edited foliate turns per design. These are modern AI-assisted
adaptations of the same leaves/scrolls. The editor outputs and native four-corner
sheets are retained in borders-001; exact prompts, hashes, downscaling and
assembly are recorded in `historical-border-patterns.json`. A 12px original
connecting collar and 12px premultiplied-alpha feather preserve each phase.

Only 28 corner/atlas exports changed. All earlier native input hashes, straight
atlas strips, repeat units, whole strips and the other 134 catalog entries match
the pre-edit snapshot. All eight corners were visually inspected on light/dark
at native size and in working frames, including 33px at fractional DPR.

Catalog/README validation, 416 exact joins (16 in these two borders), 110 integer
atlas slices, 58 exact rotations, isolated illustration rebuild retention,
38 unit tests, public types, resource byte verification and `git diff --check`
pass. Chromium checks pass 48 frame and 48 divider cases across PNG/WebP,
light/dark, 33/96px and DPR 1/1.25/2. Before/after preview and evidence are in
ignored `tmp/rosselli-corners/`; working frame screenshots in `tmp/rosselli-review/`.
The latest runtime archive is **197,828 B packed / 1,198,353 B unpacked**, 869
files, within the original budget. borders-001 is 482,795,571 B, below capacity.
No publication or commit pin was added. Packed integration results below belong
to the preceding repeat-border candidate; they were not rerun for this corner edit.

## Rosselli repeating borders and runtime size · local candidate (2026-10-08)

Added `rosselli-mask-border` (270×290, original vertical direction) and
`rosselli-foliate-border` (274×438, original vertical direction). The mask unit
retains a complete human-mask/foliate alternation; the foliate unit uses an upper
paired-leaf cycle and excludes the distinct lower terminal. Source print and
approved whole strips were inspected. Interior pixels remain unchanged; only
a two-pixel join collar is averaged. Whole strips remain unchanged.
`historical-border-patterns.json` records bounds, hashes and accepted reviews.

Native PNG/WebP atlases are 830×830 with 270px slices, and 986×986 with 274px
slices. Each supplies four phase-matched, reflected miter corners made from the
same artwork. These are modern adaptations, not recovered historical corners.
Smaller atlas exports have integer slices; rotations are exact 90-degree turns.
No SVG stand-in or raster upscaling was introduced. Ordinary selected builds
reuse the assigned border resource's retained native unit and reference crop;
source preparation is explicit.

- Previous 134 catalog entries and all earlier border artwork/input hashes match
  the pre-edit snapshot. Original museum scans and whole-strip masters are intact.
- Native checks: 416 exact source-frame joins, 110 integer-sliced atlases and
  58 pixel-exact rotated tiles. Both new reference crops retain the original pixels.
- Chromium: 48 frame and 48 divider cases, PNG/WebP, light/dark, 33px/96px,
  DPR 1/1.25/2; no errors, incomplete divider cycles or overflow. Large artwork,
  leaves/stems and all corners were visually inspected. Main browser disables
  unavailable SVG; source review includes both designs. Mobile overview fits.
- 38 unit tests, public types and isolated rebuild retention pass. Actual packed
  consumers pass 136 designs, 174 native-axis cases, 32 density/length cases,
  vanilla, copied components, React 18/19, SSR/hydration and self-hosting.
- Resource verification passes: borders-001 is 472,166,185 B, below capacity.
  All three resource 0.1.2 revisions remain local with pending exact commit pins.

Shared generic TypeScript declarations and a private field/path codec remove
installed duplication while keeping the public JSON catalog and all metadata
values intact. Copied components include the codec; rendering entries import
only their own data and assigned URL constant. Individual production bundles
still include one design: representative vanilla 15,146 JS bytes / React 14,899.
The original **200,000 B packed / 1,250,000 B unpacked** test limits are restored
and also enforced for supplied candidate archives. Final reviewed candidate:
**197,754 B packed / 1,198,063 B unpacked**, 869 files, no artwork or automatic
artwork dependency. The earlier size issue below is resolved.

Evidence: ignored `tmp/rosselli-review/` screenshots, browser reports, resource
snapshots and integration log; `tmp/package-integration.json` and selective audit.
Catalog/README, resource hash checks and `git diff --check` pass. Ordinary release
packaging still rejects missing source commit pins; nothing was published.

## Historical additions · local candidate (2026-10-08)

Added 23 designs (13 illustrations, 10 whole decorations), for a total of 134:
56 borders, 24 decorations and 54 illustrations. Twenty-two are AI-assisted
extractions from historical objects with CC0/public-domain reproductions. One is
an independently composed modern interpretation of the rabbit/hound/horn motif;
no restricted Fitzwilliam scan was imported. Exact prompts, untouched source
hashes, retained generated inputs, export caps and individual reviews are in
`historical-additions.json`. Existing origins were not researched or backfilled.

Every final asset was compared with its source/motif and viewed in the main
browser on light and dark backgrounds. The 46 screenshots and six contact sheets
are in ignored `tmp/historical-review/`. Both frame centers have alpha zero;
their fixed shapes are complete images. Thin ropes, bowstring, antennae, sepals,
petals and penwork were inspected. Strips retain their original endings; no
new repeat unit, corner or adaptable frame atlas is claimed. Integrated panels
and overlapping apple halves remain whole. Authored usage notes describe retained
panel ground, source resolution and AI extraction limits.

Validation passed:

- All 111 previous catalog entries retain their values, field order and catalog
  positions. All 1,909 previously approved public/input files match their original
  byte counts and SHA-256 hashes. The historical import snapshot is untouched.
- 37 unit tests, public TypeScript checks, metadata build and source-search checks;
  provenance survives full/scoped/individual metadata and copied components.
- Catalog/README validation: 134 designs, 233 SVG files, 1,985 public artwork files;
  PNG/WebP pairs preserve visible RGB/alpha and variants do not upscale masters.
- Existing artwork check: 400 exact source-frame joins, 102 raster atlases with
  integer slices and 56 pixel-exact rotated tiles.
- Isolated rebuild retention: 510 illustration files and all PNG masters retained,
  including missing-entry/new-entry, authored-note, idempotence and preflight cases.
- Numbered-resource inventory verification: borders unchanged at 456,187,466 bytes;
  decorations 150,662,105 bytes; illustrations 209,566,115 bytes. All fit capacity.
- Actual packed candidate consumers passed with 134 designs, 168 native-axis/design
  cases, 32 density/length cases, vanilla native/bundled code, React 18/19,
  Strict Mode, production, SSR/hydration, refs/state, types and self-hosting.
  Candidate runtime packing used `npm pack --ignore-scripts` explicitly, followed
  by `ORNAMENTS_PACKAGE=<local archive> npm run test:integration`; this does not
  claim a published or release-approved package.
- Optional compatibility staging reproduces the original 111-design snapshot at
  archive versions 0.4.0/0.1.0 without changing its shared approved manifest.
  Legacy selections remain usable; new selections fail before requests/writes.
  Exact numbered packages supply the full current catalog in packed consumers.
- Selective production audit still includes one design for individual imports
  (representative vanilla 15,405 JS bytes / React 15,158); artwork remains external.
- Runtime archive: 207,792 bytes packed, 1,427,906 bytes unpacked, 856 files; no artwork payload or automatic artwork dependency.
  This exceeds the previous 111-design runtime budget (200 KB / 1.25 MB); package-size work remains a release gate rather than a passed optimization check.
- `git diff --check` passes. Ordinary release prepack correctly refuses unlocked
  resource commits before writing package metadata.

Decoration and illustration 0.1.2 revisions are prepared locally with pending
commit pins. Resource publication, npm/CDN verification, exact clean commit locks,
runtime version/release and live deployment checks remain pending. README keeps
working published links for old artwork and labels the new rows pending.

## Consolidation review · runtime 0.6.1 (2026-10-04)

Reviewed migration fidelity, selection metadata, generated/individual APIs,
packaging, offline copying, maintenance commands, the main demos and usage docs.
The review found and fixed these concrete gaps:

- A border rebuild could delete an illustration's files after its master entry
  was removed. Cleanup now owns only generated border/decoration files.
- A new illustration without `variants` failed after writing its WebP. New
  entries now accept omitted variants and validate metadata, canonical paths,
  unique names and ownership before writes, including component-name collisions.
- Metadata refresh discarded usage notes authored in the illustration master.
  It now composes/deduplicates those notes without carrying generated notes
  forward from the previous catalog. Repeated refresh is byte-stable.
- The CLI protected only the selected archive, allowing destinations inside an
  unused installed companion. Both archives and older revisions are now
  protected, including explicit mirrors and symlink aliases, before mkdir.
- Offline examples omitted the runtime/CLI prerequisite; data archives provide
  no executable. Guides now include complete installed-runtime/`--no-install`
  sequences, public hosting URLs, the package split, sizing/resolution limits,
  scoped discovery and a tested new-illustration template.
- The landing demo still advertised 70 designs and used native border rasters.
  It now reports the live catalog count, groups illustrations and decorations,
  and selects sufficient smaller raster variants at 2× density for its borders.

Validation for the patch:

- 29 unit tests (including expanded nested/offline archive destination cases),
  public TypeScript checks and real npm-packed consumers all pass. Packed
  consumers cover React 18/19, SSR/hydration, refs/state, lazy image geometry,
  independent illustration-only installs, selective local/npm components and
  all 1,789 verified offline artwork files.
- The isolated artwork fixture preserves all 406 imported files and every PNG
  master, retains removed illustration files, builds a new entry without initial
  variants/upscaling, preserves authored notes idempotently, and rejects path
  collisions, invalid facing and unsafe stale variants before writes.
- Catalog/full public JSON schemas, local guide links/JSON examples and artwork
  validation pass: 400 exact joins, 102 integer-slice atlases, 56 exact rotations.
  The current catalog, master metadata, manifest, source artwork and all image
  bytes remain unchanged; the original cutouts working tree is untouched.
- All 1,079 Chromium artwork/browser checks pass. The rebuilt self-hosted site
  and downloaded browser ZIP pass responsive React/vanilla, image decode and
  illustration gallery checks. Desktop/mobile demo screenshots were inspected.
  Individual and scoped bundle sizes match the 0.6.0 measurements.
- `build:browser`/`build:site` pass. The site remains about 935.8 MB against its
  950 MB budget: move optional archives to release hosting before substantial
  future additions. Unit tests and packing run sequentially because `prepack`
  regenerates modules; an initial overlapping check was discarded and rerun.

The tested runtime archive contains **711 files / 168,502 compressed bytes /
1,136,545 unpacked bytes**, with SHA-512 integrity
`sha512-se9Hn0CzOvRD++pOgKrZRxKMakkfGQyrz0lR8Inau7g7MgHN+XVkC6leMUWnhFwdMGSTbOlyTRgRsUfJbGzWLA==`.
Artwork pins remain full 0.4.0 and illustrations 0.1.0; no artwork package is
republished. Updated data-package README sources will ship with their next
artwork revision; corrected workflows ship in this runtime's guides now.

Published **@ranx729/medieval-ornaments@0.6.1** as npm `latest`. The registry's
integrity matches the exact tested archive above, and the pinned CDN's CLI is
byte-exact. Fresh registry consumers pass with full artwork 0.4.0 and
illustrations 0.1.0. No artwork archive was republished.

Application deployment
[37213217140](https://github.com/adrian729/medieval-ornaments/actions/runs/37213217140)
at `ffc8cb16b910326ef046321c4f358b5b732dfea2` succeeded. The public landing demo,
CLI/runtime and all three usage guides match the local files byte-for-byte.
Live React/vanilla examples pass at 375/1200px; actual pinned npm CDN modules and
13 selected images decode; the downloaded browser ZIP self-hosts its images and
its illustration gallery contains all 41 entries. Public release:
[v0.6.1](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.6.1).
The follow-up release-record commit changes QA/plan text only.

Evidence: `tmp/post-merge-review/`, including `local-release-integration.json`,
`registry-integration.log`, `registry.json`, `live-site.log` and `deployment.log`.

## Illustration consolidation · 0.6.0 / artwork 0.4.0 + illustrations 0.1.0 (2026-10-04)

Reviewed decisions: [docs/MERGE-PLAN.md](docs/MERGE-PLAN.md). Migration preserves
41 illustrations, including the newer uncommitted musicians-and-dancers addition,
with all six descriptive fields and every master/variant byte unchanged.
`illustration-import.json` records 412 allowlisted file hashes. All 1,383 existing
ornament files also match the pre-merge manifest. The cutouts checkout/status is
unchanged. Total catalog: 111 designs / 233 genuine SVGs / 1,789 artwork files.

Selection now distinguishes border/decoration/illustration, records measured
transparency and practical usage notes, and supports facing/composition/type/
transparency filters. Forty-four formerly generic ornament descriptions were
reviewed against the artwork and improved; old subject tags retain singular
aliases. Scoped catalogs import only their own metadata. Both public catalogs
validate against images.schema.json with a Draft 2020-12 validator.

Validation completed:

- 29 unit tests and public TypeScript checks; every individual entry has parity
  with generic geometry/SSR at available formats and densities. Illustration
  metadata/hash preservation, format/capability failures, resolution limits,
  scoped selection and selected offline local installs pass.
- Actual packed consumers: lean runtime with no React or automatic artwork
  installation; a two-design HTTP install before the companion downloads only
  one manifest, four selected border SVGs and five selected illustration WebPs.
  All 1,789 offline artwork files verify. Four production npm/local × React/
  vanilla consumers contain exactly three metadata modules and one resolver.
  Local declarations reject unavailable formats. Existing 168 native axis cases,
  32 density/length cases, React 18/19, Strict Mode, production, SSR/hydration,
  refs/state, teardown, unchanged DOM writes and lazy-image geometry pass.
- Catalog validation checks every dimension, byte count, native/downscaled
  PNG/WebP visible pixel and alpha pair. Artwork checks retain 400 exact joins,
  102 integer-slice atlases and 56 exact rotations. No artwork generator ran
  during migration/package builds.
- All 1,074 local browser checks pass across 111 designs, formats, responsive
  sizes, original/forced axes, main/usage/review pages and the new metadata
  filters. Light/dark illustration screenshots were inspected, including the
  wide seven-figure group at 375px. Shared CSS/rendering geometry remains unchanged; the resolver routes
  illustration CDN defaults to their separate optional archive. Source/reference bytes remain untouched.
- Production and cold-cache audit results are in docs/PERFORMANCE.md. Selected
  React illustration: 4,072 B gzip; selected React border: 4,763 B; CSS: 473 B.
  Scoped illustration discovery contains 41 entries and no aggregate catalog.
  Lazy offscreen collection requests two code/style resources and no artwork;
  eager fixture requests 169 resources. Reports remain under tmp/merge-review/.
- Isolated selected-border rebuild retains all 406 illustration files and their
  metadata. Selected illustration resizing leaves every PNG master unchanged,
  skips the 768 limit for the 650px corrected creature, and leaves other
  illustrations unchanged. The test never writes to real artwork.
- `build:browser` and `build:site` pass. The assembled site is **935,771,819 B**
  before final release-document updates, under the 950 MB budget. Editable trace
  masters remain in Git; all public exports and reference sources remain in the
  deployed site. The ZIP includes the unified browser and illustration guide.

Release artifacts, assembled site size and completed post-publication checks are
recorded below. The runtime budgets are 200 KB compressed / 1.25 MB unpacked
for the richer 111-design catalog; artwork remains excluded and optional.

The initially verified unified artwork archive (340,776,285 B compressed) was
rejected by npm with HTTP 413 before publication. Optional artwork now ships as
two archives without changing image bytes. The full package pins the illustration
archive as a dependency; the runtime depends on neither. Both contain the same
approved unified manifest. Tests additionally cover independent illustration-only
offline installation and pnpm-style nested dependency discovery. Final artifact
measurements and registry/deployment checks follow below after publication.

Final tested archives (fixture /tmp/ornaments-integration-VwAusI):

- runtime: **711 files / 166,742 B compressed / 1,129,754 B unpacked**.
  SRI: `sha512-36tnBS52ASYVFMxzJ+r5qk7YXAoM819qQopUt9SO/clQcvpXvb8b/YkmCWG9uT6or76kbonEq+DgE2r4kMVdNw==`.
- assets: **1389 files / 180,512,757 B compressed / 420,496,810 B unpacked**.
  SRI: `sha512-PGp1L7sjl1V90z++9mq1ik/QNzjr1G022s4OXEVzEyeV3yrkanU+Pu+OJFj9Jeg2fHOuuGbuv6IDUAqF2wC9Ww==`.
- illustrations: **412 files / 160,377,910 B compressed / 161,468,881 B unpacked**.
  SRI: `sha512-hrpL0TIbZ9ZX2zx9YTnle8cj1vofrdlsuMrtKb1YetNZiWHqX0h0g4mfQ9QsY4YSGsWBWG9VBYLVOPL3gW8dpQ==`.

The exact three archives passed the complete packed consumer matrix. The assembled
site after packaging changes is 935,810,212 B, below the 950 MB budget. The
approved archives are recorded in ignored tmp/merge-review/approved-release.json.


Post-publication verification:

- Published `@ranx729/medieval-ornaments@0.6.0`, full artwork companion `0.4.0`
  and illustration archive `0.1.0`. All registry SHA-512 integrity values match
  the exact tested archives above; all three latest tags point to these versions.
  The full companion's upload returned HTTP 202 while npm scanned it; verified
  installability and pinned CDN availability before publishing the runtime.
- Fresh registry integration (`/tmp/ornaments-integration-4v9pdc`) passes the
  complete consumer matrix, real selective CDN downloads before any archive is
  installed, independent illustration-only offline copying, both archives and
  all 1,789 verified files. A separate fresh full-artwork-only registry install
  automatically obtains its exact illustration dependency without runtime/React.
- 140 pinned CDN files match the checked-in bytes: all 111 individual metadata
  modules, 17 shared/scoped modules, schema/guides/CSS, both manifests and six
  artwork samples. All 13 resolver-selected live CDN image cases additionally
  match original hashes and decode successfully in Chromium. One initial cold
  CDN transfer timed out; the checksum sweep and browser checks passed afterward.
- Pages code deployment [37206813547](https://github.com/adrian729/medieval-ornaments/actions/runs/37206813547)
  succeeded at `9f46425`. All 1,074 checks pass against the actual live gallery.
  Actual vanilla/React demos pass at 375/1200px, including original/forced axes,
  generic/bound illustrations, 55 whole-image choices, sizing and lazy loading.
  The downloaded browser ZIP passes archive integrity, self-hosted decoding and
  the illustration browser with all 41 cards. No console errors or missing files.
- Fixed the ZIP test server's directory recognition when URLs contain query
  strings; added specific CDN decode URLs and final gallery error assertions.
  This changes the test harness only. The passing site report is tmp/package-site.json;
  published integrity, CDN hashes, installs and screenshots remain under tmp/merge-review/.
- Release: [v0.6.0](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.6.0).
  The final audit commit follows the tested code deployment; artwork and runtime
  package inputs are unchanged. The original cutouts checkout/status remains intact.


## Selective imports and local installer · 0.5.0 (2026-10-04)

The code-only release adds bound `/designs/<name>`, `/react/<name>` and
`/react/unstyled/<name>` exports, optional `/catalog` discovery, and the `add`
installer. Artwork remains pinned to 0.3.2; no asset/source/CSS bytes changed.
The complete walkthrough is in [docs/SELECTIVE.md](docs/SELECTIVE.md), also
included in the npm package and browser ZIP. Permanent vanilla/React examples
now render an individual-import divider and link the guide.

Pre-publication checks pass:

- 24 unit tests, including all 70 individual designs' geometry/SSR parity across
  available formats and DPR 1/1.25/2, capability/format errors, mixed-format local
  installs, edit protection, incremental additions and offline/hosting guards.
- Public TypeScript checks plus independently installed local React/vanilla
  declarations, including rejected uninstalled formats; React 18/19 types/SSR.
- Actual packed consumers: lean install; one-design CDN `add` before installing
  any artwork archive; all 1,383 offline files verified; four two-design
  production consumers (npm/local × React/vanilla) with two metadata modules,
  one resolver, retained CSS and no full catalog or runtime dependency in copied
  code. Existing 168 native axis/design and 32 density/length cases, loading,
  controller teardown, React state/refs/SSR/hydration and self-hosting pass.
- Production audit: individual React divider **14,760 B raw / 4,589 B gzip**,
  versus full **254,432 B / 32,792 B**; vanilla **15,007 B / 4,662 B**, versus
  full **254,580 B / 32,825 B**. React is external; CSS is 473 B gzip in each.
  This is a fixture-specific roughly 86% reduction in library JS transfer.
- Catalog/artwork: 70 designs, 233 SVGs, 1,383 files, 400 exact source-frame
  joins, 102 integer-slice atlases and 56 exact rotated tiles. All original
  artwork/masters/traces and manifest remain unchanged. All 740 local browser
  checks and the browser ZIP/React build pass; `git diff --check` is clean.

The tested runtime archive contains **453 files / 121,700 compressed bytes /
885,904 unpacked bytes**, with no artwork or automatic dependencies. SRI:
`sha512-sfU4SQH+yz/M1TBbYJeMaqXq6p0gnVD2jKKoSQVnuR6M9Z3IE1tTypm+E3BXYOr1EtLr7ySv1dmISZUG7avDIg==`.
This stays under the existing 150 KB compressed / 1 MB unpacked budgets.
Published **@ranx729/medieval-ornaments@0.5.0** as npm `latest`; registry SRI
matches the tested archive above. A fresh registry consumer repeats the full
integration matrix, including selected CDN `add` without the full archive,
individual/copy-local React and vanilla, declarations, SSR/hydration and React
18/19. The actual pinned UNPKG runtime, all 70 individual data modules, selected
helpers/entry and usage guide match the release bytes (**83/83 files**).

[Pages deployment 37161832045](https://github.com/adrian729/medieval-ornaments/actions/runs/37161832045)
succeeded. All **740 live gallery checks** pass. Live vanilla/React examples at
375/1200px render both generic and individual APIs, decode self-hosted assets,
retain the original/forced axes, and link the new guide. The actual pinned npm
CDN generic/individual modules and all ten image configurations pass. The
published browser ZIP downloads, validates and renders offline self-hosted
artwork, including the individual vanilla example. The mobile React rendering
was inspected. [Release/tag v0.5.0](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.5.0)
is public; reports/screenshots remain under ignored `tmp/`.

UNPKG initially returned version-not-found 404s while its npm metadata updated;
a transient DNS error also occurred during polling. Both cleared before the
successful checksum and actual-browser verification. No alternate version or
artwork reduction was used.

## Performance audit and package split · 0.4.0 (2026-10-03/04)

The broad audit covers production bundles, asset sizes/complexity, selected
resolutions, startup/computation/SSR, controller updates, observer lifecycles,
image proportions/layout shifts, caching and full npm/archive delivery. Detailed
methods, measured before/after results and remaining opportunities are in
[docs/PERFORMANCE.md](docs/PERFORMANCE.md). Raw reports stay under ignored
`tmp/performance/`. Desktop observations use 1200×900/DPR 1, gzip text, cold
cache, production React and 4× CPU slowdown; mobile uses 375px/DPR 2. These are
local observations, not field performance or cross-browser guarantees.

The design browser's initial response bodies fell from 5,067,690 to 292,143
bytes (94.2%); comparison from 11,946,012 to 54,139 (99.5%); frame overview
from 28,005,606 to 1,058,908 (96.2%). Desktop observed shifts are zero after
space reservation. Mobile has small observed shifts from responsive text/content,
recorded in the report. The offscreen 70-design React fixture makes zero artwork
requests in lazy mode, versus 126 artwork resources eagerly.

Checks pass: **20 unit tests**, public TypeScript types, real packed vanilla
and React **18/19** consumers, production/development Strict Mode,
SSR/hydration, ordinary refs/children/state, pending design/loading updates,
image geometry before/after decoding, observer pooling/cancellation/fallback,
owned-attribute restoration and zero mutations for unchanged updates. Existing
**168 native axis/design cases** and **32 density/length cases** still pass.
The first lazy-development assertion counted an old page's pending request;
the fixture now navigates to blank before taking its request baseline.

All **740 local browser checks** pass. Comparison checks scroll to each card
and decode every original/unit/frame in both WebP/SVG modes, rather than
forcing an offscreen lazy image to decode before it can start loading. Native
lazy demo images are also scrolled into view. Desktop/mobile browser and dark
comparison screenshots were inspected after visible deferred artwork decoded.
Browser ZIP and production React builds pass; ZIP integrity and the packaged
library/docs are checked against the checkout. Package dry-run includes the
new observer and report; the separate companion preserves every artwork file. Catalog checks
retain **70 designs / 233 SVGs / 1383 assets**; source geometry checks retain
**400 joins / 102 integer-sliced atlases / 56 pixel-exact rotations**.
`git diff --check` passes. **No artwork/source/catalog asset file changed.**

The 0.4.0 split moves all 1383 artwork files to the optional
`@ranx729/medieval-ornaments-assets@0.3.2` package. The runtime is approximately
93 KB compressed / 637 KB unpacked, versus the old 180,450,015-byte archive.
No automatic companion/React installation or download hook is present.
Actual packed consumers verify the lean installation first, then explicitly
install the companion. All 1383 assets pass trusted SHA-256/byte-count checks
through offline copying. Direct asset exports work in production Vite. CLI
tests cover selected-format HTTP downloads, untrusted manifests, corrupted/
missing files, temporary cleanup, existing-file preservation, offline failures
and destination/source protection. The complete self-hosted browser ZIP is
retained with the same artwork and a pinned manifest.

Final tested archives: runtime **92,710 B compressed / 637,142 B unpacked / 21
files**; companion **180,469,930 B / 420,216,827 B / 1389 files**. Both notices
retain the artwork's separate rights status. The complete current production
core measures **33,029 B gzip** after the split; the earlier performance audit's
32,993-byte measurement predates the independent pin/exports. Reports:
`tmp/approved-release.json`, `tmp/performance/split-bundle.json`, and
`tmp/package-integration.json`. Runtime archive bytes were compared against all
21 current public files. Browser ZIP integrity and runtime/docs/manifest/notices
match the checkout after the final documentation rebuild.

Published both exact tested archives: runtime **@ranx729/medieval-ornaments@0.4.0**
and independent **@ranx729/medieval-ornaments-assets@0.3.2**. Registry integrity
matches both approved archives. Actual pinned companion CDN manifest, vector
frame, WebP variant and fitted bellflower SVG match their approved SHA-256
checksums. A fresh runtime-only registry install contains no artwork or React;
its default-CDN copy downloads just selected WebP files and retains notices.
Fresh registry React 18/19, types, SSR/hydration, production/development and all
native geometry cases pass with the explicitly installed companion.

GitHub Actions Pages run **37157632739** succeeded for **71d2e67**. All **740
live browser checks** pass. The initial npm 202 acceptance was followed by
brief registry/CDN propagation; checks completed after actual availability.
Registry consumer checks now force fresh metadata (`--prefer-online`) to avoid
an old npm cache reporting ETARGET immediately after publication. Reports:
`tmp/assets-publication.json`, `tmp/lean-registry-install.json`,
`tmp/package-integration.json` and `tmp/browser-verification.json`.

Live vanilla/React examples pass at **375/1200px**, including original/forced
axes and image decoding. The actual 0.4.0 npm CDN module resolves the independent
0.3.2 companion pin; all ten tested asset configurations decode, including
stencils, russet artwork, sprawling panel and the fitted bellflower PNG/SVG.
The downloaded browser ZIP passes integrity checks and serves its native
example locally with no external artwork requests. Report:
`tmp/package-site.json`. Release **v0.4.0** records the completed work. No release
verification remains.

## Sprawling floral panel lower-border patch 0.3.2 (2026-10-03)

At the user's request, the lower corner-shaped border now spans the complete
panel. The native 11px top band (red outer stripe, gold band, thin black inner
rule) is reflected into rows 218–228. Three pale-gold rows below the red stripe
are trimmed, yielding **722×229**. Source rows **0–217** are byte-for-byte
unchanged; the original supplied sheet and every 722×232 reference crop/variant
are preserved. The lower native band is pixel-exact to the reflected top band.

The SVG retains all original floral paths and palette, with local vector reuse,
clipping and reflection of the existing top band. Rendering the old/new SVGs at
native size confirms the floral interior is pixel-identical. The mirrored SVG
band has a mean CairoSVG antialiasing difference below 0.1/255 per channel.
Native/enlarged PNG, SVG and original comparisons were visually inspected.
The repair is recorded in the audit and shared source geometry, including the
optional retracer's native preparation. The panel remains a whole decoration.

Scoped rebuilding updates the native PNG/WebP and all smaller variants. Catalog
checks pass **70 designs / 233 genuine SVGs / 1383 assets**; artwork checks retain
**400 exact source-frame joins / 102 integer-sliced atlases / 56 pixel-exact
rotated masters**. All **740 local browser checks**, npm tests and public types
pass. Packed consumers pass **70 designs / 168 native axis/design cases /
32 density/length cases**, including vanilla, React 18/19, Strict Mode,
SSR/hydration, refs/state and self-hosting. The tested archive contains **1402
files / 180,450,015 compressed bytes / 420,292,831 unpacked bytes**, and its
corrected SVG/PNG/WebP match the reviewed exports. Browser ZIP/React builds
also pass.

Published **@ranx729/medieval-ornaments@0.3.2** as npm latest and created
[v0.3.2](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.3.2).
Registry integrity matches the exact tested archive, and fresh registry consumers
pass the same 70-design/168-native-case/32-density-case checks. GitHub Actions
deployed successfully; the public browser passes all **740 checks**. Live
vanilla/React demos pass at 375/1200px, and the downloaded browser ZIP passes
archive checks and renders with local assets. Both Pages and pinned UNPKG serve
the exact reviewed PNG/SVG bytes; the CDN catalog reports **722×229**.
UNPKG initially returned HTTP 500 for the new version while it became available;
those errors cleared before all ten pinned module/asset configurations passed.

## Whole-decoration quality patch 0.3.1 (2026-10-03)

The design browser selected wide whole decorations using only displayed height,
although variant limits measure the longest edge. The released bellflower preview
loaded a **128×27** PNG for about **507×107 CSS pixels** at density 1. Corrected
selection includes aspect ratio and loads the **516×107 native master**. This
applies to every whole decoration; thumbnails also account for screen density.
The shared vanilla/React resolver already included aspect ratio.

The existing 128/256/512/768px variants follow the same master-first downsampling
approach as `medieval-cutouts`. No source raster enlargement or new size scheme
is needed. The gold decoration's native raster pixels are identical to its
supplied digital strip; the preview selection caused the visible enlargement.

Added browser checks cover all **14 whole decorations × PNG/WebP × densities
1/1.25/2**, verifying both source dimensions against the actual rendered image.
These pass locally alongside the existing checks (**740 total**). `npm test`
and `npm run test:types` also pass for 0.3.1.

The bellflower SVG now uses cubic contours fitted to the source silhouette,
explicit veins/stems and 14 individual flower lobes with linear/radial gradients.
All five placements, both distinct caps and the top rule remain. White paper
speckles and gold color noise are omitted in the SVG; native PNG/WebP and
reference files are byte-for-byte unchanged (16 files checked). The SVG is a
smooth approximation, not a recovery of the original vectors. Native/enlarged
source comparisons and the generated SVG were visually inspected. Named
optional retracing preserves the fitted master.

Catalog validation passes **70 designs / 233 genuine SVGs / 1383 assets**.
Artwork checks retain **400 exact source-frame joins / 102 integer-sliced
atlases / 56 pixel-exact rotated masters**. The original 49 artwork designs
remain unchanged. Packed consumers pass **70 designs / 168 native axis/design
cases / 32 density/length cases**, including vanilla, React 18/19, SSR/hydration,
Strict Mode, refs/state, public types and self-hosting. The tested archive has
**1402 files / 180,470,936 compressed bytes / 420,312,053 unpacked bytes**; its
bellflower SVG and native PNG match the reviewed files. Browser ZIP/React builds
also pass.

Published **@ranx729/medieval-ornaments@0.3.1** as npm latest and created
[v0.3.1](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.3.1).
Registry SHA-512 integrity matches the exact tested archive. A fresh named-version
registry install passes the same 70-design/168-native-case/32-density-case consumer
checks. GitHub Actions deployed the patch successfully; the public browser passes
all **740 checks**. Live vanilla/React demos pass at 375/1200px, and the downloaded
browser ZIP passes archive checks and renders with local assets. Ten actual pinned
UNPKG configurations decode, including the native 516×107 gold PNG and new SVG.
Both Pages and UNPKG serve the exact reviewed SVG bytes (SHA-256
`9e6d0bb4b0066fac48f1ba7ee1ffc13f89b0096ce70c95c3b24228801e882089`).

## Source additions release 0.3.0 (2026-10-03)

The published release contains **70 designs: 56 repeats and 14 whole decorations**.
Twenty-one source designs were added (16 repeats/five whole), including the three
blue stencils with their grid-paper backgrounds retained. Grid lines are not stock
watermarks; their distinct background period can show at repeat joins. All 28
stock-watermarked candidates are excluded. All original 49 catalog entries and
artwork files are unchanged, and all nine uploaded source masters retain their
recorded hashes. Five accepted originals are preserved in sources/additions/.
See [ADDITIONS.md](ADDITIONS.md) for per-sheet decisions.

Passed `npm test` (11 tests), `npm run test:types`, `npm run test:integration`
and `npm run build:browser`. The actual packed consumer contains 70 designs and
passes 168 native direction/design cases, 32 density/length cases, vanilla
native/bundled usage, React 18/19, development Strict Mode/production,
SSR/hydration, public types, refs/state, automatic styles and self-hosting.
The inspected archive contains **1402 files / 182,192,358 compressed bytes /
425,161,375 unpacked bytes**.

Catalog validation passes for **233 genuine SVGs / 1383 cataloged asset files**.
Source checks pass **400 exact source-frame profiles**, **102 integer-sliced
raster atlases** and **56 pixel-exact rotated tile masters**. Native interiors,
untouched reference crops, source hashes, direct-from-master downscales and
lossless visible RGB/alpha pairs are verified. `git diff --check` passes.

The permanent collection/browser/demo checker passes **656 checks** across all 70
designs, all formats and four viewport widths, including new demo selections,
copyable snippets and the source-additions review filter.

The main demo offers all repeat designs for frames and horizontal dividers, and
all whole decorations. Snippets follow the selected artwork's actual geometry
and raster dimensions. The permanent browser, artwork review and vanilla/React
examples share the complete catalog. The temporary additions-only page and its
checker were removed at the user's request. The review supports
`?collection=additions` for source comparisons.

Before retiring the temporary page, all 21 remaining additions passed 114 browser
checks and **144 rendered frames** (16 repeats × 3 formats × DPR 1/1.25/2) at
**33px**, including fractional positions, passed the outside-to-center open-join
check. All original/unit/trace comparisons and repeat/frame sheets were visually
inspected; all 13 initial accepted repeats were checked in light/dark frames.
The three stencil traces render pixel-identically before/after conservative
context pruning. Native/SVG stencil comparisons were visually reviewed again
before registration. Paper-grid background phase remains an explicit limitation.

Rich color traces are large; native PNG/WebP remains the default for source-based
artwork. Default version-pinned CDN URLs move to UNPKG because the intact detailed
traces exceed jsDelivr's [150 MB package limit](https://www.jsdelivr.com/documentation).
Self-hosted assetsBase, asset-copy paths, formats and exact version pins are
preserved.

Published **@ranx729/medieval-ornaments@0.3.0** as npm latest. Registry integrity
matches the exact locally tested archive. A fresh registry install passes the
complete 70-design consumer matrix (168 native axis/design cases and 32 density
cases), including React 18/19, styled/unstyled SSR, hydration and self-hosting.
Publication initially returned HTTP 202 while npm processed the large archive;
registry availability and named-version installation were verified after it
became visible.

Commit [a5e67d4](https://github.com/adrian729/medieval-ornaments/commit/a5e67d4adb783f20306f05ee1d7c0729ee208231)
is pushed. Public release/tag [v0.3.0](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.3.0)
and successful Pages run [37135108933](https://github.com/adrian729/medieval-ornaments/actions/runs/37135108933)
are verified. All **656 live artwork/browser/demo checks** pass. The actual
pinned UNPKG modules report version 0.3.0 and 70 designs; eight old/new frame,
divider and whole-image asset configurations decode using default URLs.
Live vanilla/React examples pass at 375/1200px with original/forced axes,
automatic React styles and new stencil/russet/painted designs. The downloaded
browser ZIP passes archive integrity and serves its example using only local
assets. Evidence is also in tmp/package-site.json and tmp/registry-release.json.

Ignored evidence: tmp/package-integration.json, tmp/browser-check.json,
tmp/additions-frame-matrix.json, tmp/additions-frame-pixel-verification.json,
and tmp/additions/stencil-release-comparison.png. The historical additions frame
check remains reproducible from its saved matrix with scripts/check_frame_pixels.py;
current gallery coverage uses scripts/browser_check.mjs.

## React automatic styles (0.2.0)

The default `/react` entry now imports the existing shared stylesheet. A production consumer importing only `OrnamentDivider` verifies that tree shaking retains the CSS. The React demo and copyable snippet require only the component import. `/react/unstyled` provides the same components for plain Node SSR or centrally managed CSS. Both entries share the same declarations and component implementation.

Pre-release checks pass: `npm test`, `npm run test:types`, packed React 18/19 consumers in production and React 19 development/Strict Mode, plain Node SSR, Vite SSR with automatic CSS, hydration, forwarded refs and retained inputs, native/bundled vanilla, local asset hosting, catalog/artwork checks, `git diff --check`, and `npm run build:browser`. Computed-style checks cover frame borders, divider pseudo-elements and whole-image sizing without an application CSS import. Reviewed the rendered React example. Artwork and `ornaments.css` are unchanged; the existing frame matrix remains applicable.

Published **@ranx729/medieval-ornaments@0.2.0** as npm `latest`; the tested archive contains **941 files / 52,286,453 unpacked bytes** (29,257,655 compressed bytes). A fresh registry install passes the complete consumer matrix, including styled Vite SSR and the single-component production CSS check. GitHub release/tag [v0.2.0](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.2.0) is public, and Pages deployment [37110852625](https://github.com/adrian729/medieval-ornaments/actions/runs/37110852625) succeeded. Live vanilla/React demos pass at 375/1200px with original/forced axes, preserved sizing, decoded self-hosted images and the updated React snippet. The actual 0.2.0 CDN modules/images and downloaded browser ZIP pass. Reviewed the live mobile React rendering; all 473 existing live artwork-browser checks pass. `tests/site.mjs` now derives the CDN version from package metadata.

## npm integration verification (0.1.0)

The integration layer preserves the approved artwork and `ornaments.css` byte-for-byte. Catalog/artwork checks and the existing **473 browser checks** pass after adding the library and example links. The prior rendered frame matrix remains applicable because neither artwork nor shared geometry changed.

`npm test` checks generated immutable metadata/capabilities, all 40 designs' original and forced divider directions in all formats, default formats for all nine whole designs, actual raster resolution boundaries at three densities, invalid input, discovery, scoped asset copying, and React server output. `npm run test:types` checks the public API, refs, custom properties, capability-specific design names, and invalid prop rejection. Capability-filtered discovery returns appropriately narrowed TypeScript names for direct component use.

`node tests/integration.mjs` builds/installs a real npm archive into independent consumers. It verifies:

- No React dependency is installed for vanilla use; all 922 assets are included, and the archive has only the explicit runtime/documentation allowlist.
- The installed CLI copies the full catalog/components/sizes to a public asset folder.
- Native ESM and bundled vanilla under a nested deployment root.
- **120 native design/direction cases** (40 × original/horizontal/vertical), matching asset decoding and geometry, plus **32 density/length cases** including less than one full repeat fitting.
- Atomic invalid updates, partial-option retention, duplicate-controller rejection, idempotent cleanup, prior-value restoration, and preservation of child input values/focus/unrelated styles/external edits.
- React **19.3.0** development Strict Mode and production; React **18.3.1** production plus fresh-process SSR; public consumer declarations against both versions' React types.
- React 19 SSR/hydration, forwarded DOM refs, input entered before hydration, and retained nodes/state during orientation/design changes and component remounts.
- Four viewport widths (320, 375, 997, 1920), complete centered divider geometry, self-hosted images without external image requests, and no browser exceptions/missing assets.

Reports and reviewed React screenshots are in ignored `tmp/package-integration.json` and `tmp/react*-*.png`. This is Chromium coverage, not certification across all browsers/frameworks. The browser ZIP and self-hosted live demos receive separate release verification. CDN defaults require internet access; the copy command supports local/offline hosting.

The inspected archive is approximately **29.3 MB compressed / 52.3 MB unpacked** because it includes all raster sizes and editable SVG traces. These files are installed on disk, not embedded wholesale in the application's JavaScript bundle; browsers request selected images. Source sheets, audit scripts, temporary files, tests, and demos are excluded from npm. The browser download includes runnable native modules and artwork.

For post-publication consumer checks, run `ORNAMENTS_PACKAGE=@ranx729/medieval-ornaments@0.1.0 node tests/integration.mjs`. Release/deployment verification is recorded below after completion.

The collection has **49 designs: 40 repeating borders and nine whole decorations**. Asset validation covers **922 cataloged files, including 164 SVGs**. Checks cover catalog coverage, filenames, dimensions, byte counts, lossless PNG/WebP visible pixels and alpha, variants produced directly from masters, and the absence of raster embedding or external references in SVGs.

### Published release verification

Published **@ranx729/medieval-ornaments@0.1.0** to the public npm registry. A fresh registry install passed the same complete consumer matrix, including the installed asset-copy command and both React versions' types. npm normalized the command path from `./lib/cli.js` to `lib/cli.js`; its published `bin` is present and tested. The registry archive has **940 files / 52,284,801 unpacked bytes**. The repository now uses that normalized command path.

GitHub Pages uses the checked-in build/deploy workflow. The live site passed all **473 existing browser checks**. `node tests/site.mjs` also passed the live vanilla and React demos at **375/1200px**, original and forced directions, painted-image changes, exact complete-unit centering, image decoding, and page overflow checks. The actual pinned CDN core modules/catalog loaded in Chrome, and default floral frame, painted original/rotated divider, and small whole-image assets decoded successfully. The live browser ZIP downloaded, passed archive integrity checks, and its extracted native example rendered with local images and orientation switching. Live mobile/desktop screenshots were visually inspected.

Repeat live release checks with `node tests/site.mjs` after starting the review Chrome on port 9227. Run it sequentially with the existing browser checker because they share a tab. Reports/screenshots are under ignored `tmp/package-site.json` and `tmp/live-*.png`. These checks verify the public distribution as well as local source; artwork/source/shared CSS remain unchanged from the approved artwork commit.

## Source and artwork checks

All 38 numbered reference crops were compared with the original sheet's pixels and masks. The original sheet and five standalone panel masters are preserved. Numbered PNG/WebP units use actual source pixels, with only the documented two-pixel repeat-end adjustment. Their interiors and whole decorations are checked against the supplied source. Native plate frame assembly uses no enlargement or interpolation.

The source check verifies **272 exact corner-to-side pixel profiles** and **81 raster atlases with integer slice boundaries**. All 40 rotated tiles are verified as pixel-exact 90-degree turns of their masters, with unchanged repeat proportions. It also checks that the floral unit endpoints contain only their intended stems, preventing leaves or flowers from straddling corner clipping lines.

All numbered source regions and extracted repeat units received visual review, including alternating colors, complete motifs, and repeat phase. Plate 11, 16, 36, and 37 retain whole artwork without invented repeating frame strips. All 40 painted/vector frames were inspected at 33px. The four reported floral styles were compared across SVG, PNG, and WebP; the gold leaf scroll's red curls were removed and its leaf blades moved clear of the outer clipping edge.

Inspect [the comparison page](https://adrian729.github.io/medieval-ornaments/examples/review.html) to compare source crops, extracted units, repeating strips, and frames. It offers WebP/SVG, light/dark backgrounds, and several thicknesses. SVG color traces approximate print tones and curves; PNG/WebP preserve the painted appearance. Plate corners are reflected miter adaptations, not recovered historical corner artwork.

## Browser and rendered checks

Chrome passed **473 browser checks** across all 49 designs, available formats, and four viewport widths (320, 375, 768, 1200). Checks include image decoding, applicable controls, whole artwork size/format controls, all 40 dividers in both orientations and all three formats, matching download links and length controls, complete centered sections at repeat boundaries (fixed and percentage lengths, including less than one section), all five pages' SVG/PNG/ICO favicons, category/purpose/search filters, empty results, shared stylesheet usage, demo snippets and local/public URLs, the comparison page, and mobile overflow. Reports and screenshots are written to ignored `tmp/`.

The frame matrix covers **1,512 rendered cases**:

- Gold quatrefoil vine, red berry vine, gold leaf scroll, and red rosette vine at every integer thickness from 16–48px.
- All remaining repeating borders at 33px.
- SVG, PNG, and WebP at device pixel ratios 1, 1.25, and 2, with fractional element positions.

A flood-fill check verifies that the exterior background cannot pass through an open join into the transparent center. This catches open seams, but does not assess chopped motifs or subtle color differences; source-profile checks and visual review address those separately. These results describe Chrome and the tested combinations, not a guarantee for every browser or arbitrarily small frame.

## Repeat the checks

```sh
.venv/bin/python scripts/catalog.py --check
.venv/bin/python scripts/artwork_check.py
git diff --check
```

Browser verification requires Node 22+ and Google Chrome. With the preview server running on port 8765, start Chrome in another terminal:

```sh
google-chrome --headless --no-sandbox --disable-gpu --remote-debugging-port=9227 \
  --user-data-dir=/tmp/medieval-ornaments-chrome about:blank
```

Run the browser and matrix scripts sequentially because they control the same Chrome tab:

```sh
node scripts/browser_check.mjs
node scripts/frame_join_check.mjs http://127.0.0.1:8765 matrix
.venv/bin/python scripts/check_frame_pixels.py
```

Pass the deployed collection URL to either browser script to check GitHub Pages. Without `matrix`, the frame renderer captures the three demo styles at 32, 33, and 34px. New or changed artwork needs fresh source, repeat, and light/dark visual review as described in [AGENTS.md](AGENTS.md); passing a gap check alone is insufficient.

## Numbered resource split · 0.7.0 (2026-10-04)

The public resource repositories are medieval-ornaments-assets-borders-001,
medieval-ornaments-assets-decorations-001 and
medieval-ornaments-assets-illustrations-001 under adrian729. Matching npm
packages under @ranx729 are published at 0.1.0; registry tarball integrities,
CDN manifests and SVG/WebP samples match approved hashes. Each source is pinned
to its exact Git commit in resource-lock.json and tagged v0.1.0.

| Resource | Designs | Artwork/input files | Full mirrored Git storage | Compressed npm |
| --- | ---: | ---: | ---: | ---: |
| borders-001 | 56 | 456,187,466 B | 160,810,826 B | 158,119,373 B |
| decorations-001 | 14 | 81,140,460 B | 21,092,466 B | 22,393,078 B |
| illustrations-001 | 41 | 163,065,762 B | 162,231,071 B | 160,314,271 B |

All 1,789 public files and 120 native inputs were compared byte-for-byte before
removing their physical main-tree copies. No artwork was regenerated. Shared
reference sheets, all six descriptive fields, extraction/source audits, native
geometry, raster variants, alpha, trace masters and rights scopes are preserved.
The main tree is approximately 9 MB; old Git history is intentionally retained.
The site is approximately 8.4 MB instead of 935.8 MB, with a 50 MB local guard.
It contains no public artwork folders, native-input aliases or offline ZIP.
The ZIP is a GitHub Release download; Pages loads exact-version CDN images.

Passed: 33 unit tests, public types, packed vanilla/React 18/19 consumers,
SSR/hydration/refs/state and offline self-hosting; catalog validation; 400 native
source-frame joins, 102 integer-slice raster atlases and 56 pixel-exact rotated
tiles. Isolated generator tests preserve imported bytes/masters, restore/new
metadata and reject path/ownership errors before writes. Actual production
bundles retain one design and one URL module per individual entry, with no
full catalog/routing import. Scoped discovery sizes are unchanged.

A fresh shallow/partial Git checkout fetched red-berry-vine (44 approved files),
then blue-alternating-leaf-vine (24), retaining the first selection. Ignored
flat aliases are readable. Rollover tests route a retained design to borders-002
without changing its public name; richer search metadata passes without artwork
publication, while changed rendering geometry fails approval checks.

Consumer changes are explicit in docs/RESOURCE-MIGRATION.md: raw main-branch and
Pages image paths are retired; the ZIP URL moves to Releases; legacy exported
CDN constants identify compatibility snapshots, with getAssetSource replacing
manual default routing. Component APIs, design imports and flat assetsBase paths
stay supported. Installer-owned version upgrades use fresh reviewed output.
No consuming repository was edited.

Initial resource publications used the authorized maintainer npm login. Pinned
resource publication workflows are included; automated OIDC publication requires
per-package npm Trusted Publisher configuration for the caller resource repo.
Until configured, verified manual npm publication remains available.

Evidence: ignored tmp/resource-*-verification.json, tmp/resource-packages.json,
full-history reports, tmp/resource-*-integration.log and bundle/artwork reports.
Runtime publication and live deployment verification are recorded below.

The final collection browser passes all **1,079 checks** across 111 designs,
all formats, four viewport widths and shared demo controls, with zero browser
errors. A missing import on the small demo was corrected before release; the
complete browser suite and targeted decoded-image/snippet checks then passed.
Resource workflows now use a sparse, immutable main-tooling checkout; their
code-only source commits preserve the already-published artwork bytes.

All **1,656 rendered frame cases** pass the white-pixel enclosure check: four
floral styles at every 16–48px thickness, every border at 33px, SVG/PNG/WebP,
and pixel ratios 1 / 1.25 / 2. A final installer review also added a regression
check: an unchanged legacy archive identity cannot mask a newer numbered
resource snapshot; online mode falls back to the pinned CDN and offline mode
fails before creating output. Legacy lookup uses selected artwork types,
so future differently named collections remain supported.

### Published release verification

[Runtime 0.7.0](https://www.npmjs.com/package/@ranx729/medieval-ornaments/v/0.7.0)
is published as `latest`. The registry artifact matches the tested packed
artifact's SHA-512 integrity. It contains 719 files: 180,980 B compressed and
1,230,333 B unpacked. A fresh registry install includes only this runtime
package, without React or resource archive dependencies. Its generic and
individual resolvers agree; all 111 designs and the 41-illustration discovery
catalog are available; selected WebP downloads from each of the three numbered
sources return successfully.

[Pages deployment](https://github.com/adrian729/medieval-ornaments/actions/runs/37234191754)
succeeded at release commit `483a66fa95cf061c186f0a5006afaf51634aa362`.
The final assembled site is **8,422,245 B**, down from **935,825,529 B**.
Live vanilla and React demos pass at 375/1200px, including original/forced
axes, complete centered dividers, automatic React styles, individual designs,
illustrations, sizing and image decoding. Direct imports of the actual pinned
npm CDN runtime, individual modules and scoped discovery pass; all 13 selected
SVG/PNG/WebP assets decode from their numbered resource packages. npm CDN
propagation initially returned 404 for the runtime; the successful verification
used the ordinary exact-version URLs after propagation, without URL overrides.

[Release v0.7.0](https://github.com/adrian729/medieval-ornaments/releases/tag/v0.7.0)
contains the **341,941,779 B** browser ZIP. The downloaded archive passes ZIP
integrity checks and renders its vanilla demo and illustration browser using
local images, with no browser errors or missing requests. Its SHA-256 matches
the published release asset digest:
`9f6da56556909ab74dbf910e43b2d11aaff7ec45c033bc20217de11e0bf00297`.

Post-publication evidence: `tmp/package-site.json`,
`tmp/resource-site-verification.log`, `tmp/resource-registry-consumer.json`,
`tmp/resource-cdn-verification.json` and `tmp/site-build.json`.
General application migration steps and the breaking direct URL/checkout
assumptions are documented in [RESOURCE-MIGRATION.md](docs/RESOURCE-MIGRATION.md).

### README delivery correction and live latency review

GitHub's Camo proxy returned 504 (`Error Fetching Resource`) for README
previews while the original npm CDN images returned 200. Purging one proxy
entry restored it, but another still failed. The README generator now selects
commit-pinned raw URLs from the assigned resource repositories for previews;
GitHub's Markdown renderer serves these directly without Camo. All 111
preview images returned 200 with approved byte counts and SHA-256 hashes.
Resource pixels, component URL defaults and file download links are unchanged.

A fresh Chromium profile checked the deployed illustration browser at
1200×900/DPR 1. Initial 13 image requests were CDN hits at 60–120ms. After
scrolling, all 41 thumbnails and the selected whole image decoded with zero
page errors. A separate 512px `musicians-and-dancers` request measured 2,604ms
on a CDN miss and 34ms on its next hit. These are local network observations;
new publication and regional cache misses can explain slow initial delivery,
and warm results do not guarantee first-load latency elsewhere.

Evidence: `tmp/delivery-review/readme-previews.json`, `gallery-cold.json`,
`gallery-scroll.json`, `cdn-repeat.json` and the live README verification report.

### Consumer workflow documentation

README, selection/agent guidance, integration, selective usage, illustration
usage and the migration report now recommend individual npm imports with CDN
delivery and no local image copies. Local `add`/`copy-assets` workflows remain
explicit alternatives; smaller deployment size is distinguished from first-load
latency. Illustration instructions now pin runtime 0.7.0 and the numbered
offline illustration resource. Direct HTML/CSS examples replace retired Pages
image URLs with exact npm resource pins. Documentation-only packaging remains
within the runtime budgets: 183,464 B compressed / 1,242,494 B unpacked before
this QA/checklist record, which is excluded from the runtime package.

## Notice removal and patch release · 2026-10-05

The standalone artwork document was removed at the user's request from main,
the three numbered resource repositories and their current npm revisions.
Package allowlists, copy/add installers, scaffolding, verification workflows,
documentation and the offline ZIP now include LICENSE only. The existing
scoped software license is unchanged apart from its obsolete document link.
Historical package versions and release archives remain immutable.

All 1,789 public artwork exports and 120 native inputs match the prior
resource manifests exactly, including rendering capabilities. All 412 files
in the medieval-cutouts migration inventory retain their original SHA-256
hashes. Descriptive catalogs and import records are unchanged.

The three resources are published at 0.1.1, with GitHub releases and exact
clean source locks. Registry SHA-512 integrities match the locally verified
archives; each actual pinned CDN manifest and a smaller WebP were checked
against their approved SHA-256 hashes.

- borders-001: `ab792af0317c3556731510dbbcd7da3e2173b4fa`.
- decorations-001: `c82d3acca383e3fa43f394bc256eee3d8de0a116`.
- illustrations-001: `127ff668acdc681586d9d08c8c81e3b84022440d`.

Runtime 0.7.1 passes 33 unit tests, public types, selective bundle checks and
packed consumers: vanilla, React 18/19, development/production, SSR/hydration,
state/refs, automatic CSS, lazy loading, original/forced divider axes and
offline/selected artwork copying. Native checks preserve original references,
400 source-frame joins, 102 integer-sliced raster atlases and 56 exact rotated
tiles. No artwork generation or fidelity reduction was performed.

Final runtime archive: **182,555 B compressed / 1,239,993 B unpacked**, 718 files, below 200 KB / 1.25 MB. The final archive differs from the packed-consumer fixture only in regenerated README preview commit URLs; all other files and modes are identical. A fresh install of the final archive additionally verifies the lean dependency tree, 111 designs, individual resolver and 0.1.1 resource pins.

Offline browser ZIP: **341,942,647 B**, verified ZIP integrity and absence of the removed document. SHA-256: `58c36595d5863d176453bdd28d7fc98a8c1f2b5bf5b155825cb0b4c0b3cfde50`. Pages still excludes artwork and the ZIP; its pre-release build is **8,437,428 B**, below the 50 MB guard.

No component API migration is required. Upgrade the runtime to 0.7.1;
offline consumers should install the 0.1.1 resource selected by
getAssetSource(design). Custom packaging that explicitly copied the former
document should remove that step and retain LICENSE.

Evidence is in ignored tmp/remove-rights/ and tmp/package-integration.json.
Post-publication runtime/site checks follow below.

### Publication and original repository retirement

Runtime 0.7.1 is published as npm `latest`; its registry SHA-512 matches the
final verified archive. The exact-version CDN runtime returns successfully.
The GitHub Release is public and its uploaded ZIP digest matches the verified
local archive. Pages deployment
[37240575802](https://github.com/adrian729/medieval-ornaments/actions/runs/37240575802)
succeeded from `6ee910e5d347e61bde2c918b0f05653e9b689955`. All 111 README
previews return the exact approved bytes from current locked resource commits.
The removed document returns 404 in main and all three published source pins.

After the user granted the required GitHub deletion scope, the original
`adrian729/medieval-cutouts` repository was deleted and its API returns 404.
The local original checkout remains intact and the complete Git bundle passes
verification. There was no separate cutouts npm package. Migration snapshots
were not rewritten; the resource/runtime packages remain available.

Live post-publication checks pass: deployed vanilla and React demos at
375/1200px, original/forced divider axes, centered complete repeats, individual
imports, generic and individual illustrations, sizing and image decoding.
The actual pinned npm CDN modules and 13 SVG/PNG/WebP cases pass. The downloaded
v0.7.1 ZIP passes integrity checks and renders its vanilla example and full
illustration browser using local artwork, with no missing requests or browser
errors. The final Pages build remains approximately **8.44 MB**, below its
50 MB guard. Evidence: tmp/remove-rights/live-site.log,
tmp/package-site.json and tmp/site-build.json.
