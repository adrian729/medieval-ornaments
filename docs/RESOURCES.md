# Resource repositories and release coordination

The main `medieval-ornaments` repository owns the public library, unified
selection catalog, artwork audits, shared reference sheets, resource registry,
version locks, tooling and release coordination. Resource repositories own
large approved artwork files and editable inputs. Repository placement is
independent of public categories and does not change a design's name or import.

## Names and ownership

Use `medieval-ornaments-assets-<collection>-<sequence>` for both the GitHub
repository name and the npm package name under `@ranx729/`. Collections start
with `borders`, `decorations` and `illustrations`. Sequences are positive
integers padded to at least three digits: `001`, `002`, …, `1000`. Never reuse
an identifier or renumber an existing repository.

Examples:

| Resource ID | GitHub repository | npm package |
| --- | --- | --- |
| `borders-001` | [`adrian729/medieval-ornaments-assets-borders-001`](https://github.com/adrian729/medieval-ornaments-assets-borders-001) | `@ranx729/medieval-ornaments-assets-borders-001` |
| `borders-002` | `adrian729/medieval-ornaments-assets-borders-002` | `@ranx729/medieval-ornaments-assets-borders-002` |
| `decorations-001` | [`adrian729/medieval-ornaments-assets-decorations-001`](https://github.com/adrian729/medieval-ornaments-assets-decorations-001) | `@ranx729/medieval-ornaments-assets-decorations-001` |
| `illustrations-001` | [`adrian729/medieval-ornaments-assets-illustrations-001`](https://github.com/adrian729/medieval-ornaments-assets-illustrations-001) | `@ranx729/medieval-ornaments-assets-illustrations-001` |

The existing unnumbered npm archives remain compatibility distributions. They
are not resource IDs and must not be converted into empty dependency wrappers:
their direct file exports and full offline installation remain supported.

Every design has one explicit assignment in `resource-registry.json`. Its
masters, native tiles, traces, ordinary/rotated variants, corners, atlas and
reference crops stay together. Shared source sheets stay in the main repository
once, with their existing audits and hashes. Selection metadata and historical
import records also stay here. A registry change must not erase descriptive
information, provenance, extraction prompts or license notice.

## Capacity and rollover

These are project policies, not claims about GitHub's hard repository limit:

- Warn at 600 MB of current tracked resource files.
- Assign new designs to another repository before projected files exceed
  700 MB; reserve room for corrections to existing designs.
- Stop extending a repository at 850 MB of current files.
- Monitor actual Git object storage using a complete mirror, independently of
  current-file size. Warn at 800 MB and stop extending it at 950 MB. Partial
  developer clones are not valid measurements of total object storage.
- Keep each resource manifest below 1 MiB and each compressed npm upload below 200 MB; these independent limits can require rollover before the tracked-file budget. `pack --source <id>` verifies and measures the actual upload.
- Keep each package's public files at or below 140 MB unpacked (jsDelivr
  refuses 150 MB); `plan`, `approve`, `pack` and publishing enforce it.
- Reject regular Git files above 90 MiB. Splitting repositories does not solve
  a single oversized file; that resource needs an explicitly reviewed storage
  method.

GitHub recommends keeping repositories below 1 GB and blocks ordinary Git
files above 100 MiB. See [GitHub's large-file documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

Each collection has one repository accepting new designs. States are `open`
(new designs and revisions), `sealed` (revisions only, within reserve), and
`archived` (no further writes). Before an addition, calculate its complete
footprint, including editable inputs and all generated components/variants.
If it will not fit, provision the next sequence, seal the previous repository
for additions and update the registry. Never split one design across repositories.

Existing assignments remain stable by default. If an existing design needs a
new revision after its repository is full, migrate the entire design to the
next suitable repository explicitly. Keep its public name and logical paths;
retain old published packages and pinned source revisions. A new main release
can then route that design to its new resource without breaking old releases.

## Registry, lock and publication

`resource-registry.json` owns collections, repository identities, assignments,
states and capacity policy. `resource-lock.json` records exact source commits,
npm versions, approved manifest checksums and file inventories. Checkouts are
ignored local material. No runtime installation or library metadata build may
clone resource repositories, regenerate artwork or invoke Python.

Publish each numbered resource independently. Its manifest binds approved
files and rendering capabilities; descriptions and search tags are maintained
by the main catalog and must not force image publication. Ordinary publication
verifies and copies approved bytes. Artwork generation is an explicit authoring
step and follows the existing source audit and visual-review requirements.

The main repository coordinates releases in this order:

1. Validate assignments, source revisions, capacities and file ownership, and run the affected artwork checks.
2. Approve, commit, push and lock each changed resource; commit the locks in main. The change is now pending, and nothing is published.
3. When the maintainer says "publish", dispatch each pending resource's `publish.yml`. Every workflow waits until jsDelivr serves every approved file (`scripts/warm-cdn.mjs`) before creating its `v<version>` release marker.
4. Require `scripts/check-resources-published.mjs` to pass for every pin.
5. Build/test the runtime and demos against the published locked snapshot, then publish the runtime through `release.yml`. It creates the `v<runtime>` tag that Pages deploys, and a draft GitHub release.
6. Attach the offline browser downloads to that release, publish it, and record package/site verification in `QA.md`.

Use exact versions and source commits, never `latest`, branch tips or mutable
URLs in released output. Old package versions are retained. Rollback selects
the previous main snapshot; it never overwrites a published package.

## Loading and bundles

Runtime routing uses a design's assigned resource, not a two-way check of
`asset_type`. Individual component imports include only their design metadata
and its resource's URL configuration. Common rendering helpers must not import
the complete resource registry, catalog or all resource URL modules. Multiple
designs in one resource share its URL module. Discovery stays centrally scoped
by border/decoration/illustration; the full API remains available.

Rendering performs no registry/manifest request. Keep current geometry, format
selection, density, lazy loading, image proportions, SSR and React/vanilla
behavior. Explicit `assetsBase` continues to select a flat self-hosted mirror.
The installer verifies selected files and supports local/offline sources,
including the compatibility archives; installing the runtime alone downloads
no artwork. Protect all installed resource/archive directories before writes.

## Agent checklist for additions

1. Read this guide, `AGENTS.md`, the relevant source audit and selection schema.
2. Choose the factual asset type and collection, then inspect capacity before
   assigning the design to the collection's open resource.
3. Preserve the source and six selection fields; add repeat evidence or retain
   whole decoration status. Register the assignment before writing outputs.
4. Fetch only the required resource inputs; use the central tools to author
   and validate. Full collection audits explicitly fetch all resources.
5. Keep every associated file with its design. Validate source/master hashes,
   alpha, variants, joins and comparisons; do not regenerate unrelated artwork.
6. Review the resource changes and main metadata/lock together. Publish assets
   first, verify availability and then adopt the exact versions here.
7. Run packed consumers, scoped/individual bundle checks, offline and browser
   checks. Record measured sizes and any consumer migration instructions.

## Migration contract

See [RESOURCE-MIGRATION.md](RESOURCE-MIGRATION.md) for the changes consumers
must review. This split does not authorize modifying another consuming repo.

## Commands and checkouts

Run from the main repository. No command runs during consumer installation or
`npm run build`. Checkouts live under ignored `tmp/resource-checkouts/<id>`.

```sh
npm run resources -- status
npm run resources -- fetch --design red-berry-vine
npm run resources -- link --design red-berry-vine
# Full artwork tests and offline ZIP preparation:
npm run resources -- fetch --all
npm run resources -- link --all
npm run resources -- check --verify-files
```

Fetching uses shallow partial Git clones, exact commits and file-level sparse
checkout. Subsequent design fetches in one source accumulate required files.
Dirty checkouts are protected. `link` creates ignored flat aliases for existing
review/test tools; generators read/write the canonical checkout directly.
References shared across designs remain in main. Local flat views and npm
mirrors are different: `npm run build:assets` reproduces the approved optional
compatibility snapshot. Install the matching numbered packages for a complete
current-catalog offline copy; `build:browser` creates its full self-hosted ZIP.

Historical additions use `historical-additions.json` for untouched shared scan
hashes, chosen entities, exact extraction prompts, source-region resolution caps
and per-asset reviews. `scripts/import_historical.py` imports only explicitly
selected new results after checking ownership and source hashes. Generated
native inputs and PNG masters belong to the assigned numbered resource; the
importer trims outer canvas and downsamples, without cleaning pixels or inventing
repeats. New master entries may carry `provenance`; existing unknown origins stay
absent. See [ILLUSTRATIONS.md](ILLUSTRATIONS.md) for the reviewed batch.

Authored PNG imports use `authored-additions.json` and
`scripts/import_authored.py ARCHIVE --name NAME`. Plan and assign every name
before import. The importer checks archive/input hashes and ownership, retains
original native bytes, and optimizes PNG compression without changing pixels or
canvas. Selected normal builds supply lossless WebP and smaller sizes. Optional
`author` identifies a creating account, including work done on its behalf;
unknown authors remain absent. It is descriptive metadata and does not change
resource capabilities. The gold components remain individually selectable;
the vanilla example supplies their original flexible CSS compositions.

The installer verifies a separate pinned checksum for the unchanged intersection
with the legacy archives. These immutable snapshots can still supply old selected
designs after numbered additions, but cannot supply new or changed files. Missing
selections are rejected before artwork requests/writes; install the matching
numbered package for those designs. Do not advance the compatibility archive
versions merely to add numbered artwork.

`historical-border-patterns.json` audits PNG/WebP-only repeating borders derived
from approved historical extractions. `scripts/raster_borders.py --prepare
--name NAME` is an explicit authoring step for native phase crops and their
two-pixel join collars. Ordinary selected `build_assets.py` runs reuse retained
native inputs and reference crops from the border's own resource, assemble
phase-matched corners, and skip atlas sizes with fractional slices. Retained
AI-assisted corner sheets preserve exact connecting collars. Their native inputs
use the design's `-corner`/`-border` stems and follow its owner on fetch/migration.

For a new design, estimate **all** bytes (exports, all variants, native inputs),
then plan and assign before running the normal artwork pipeline:

```sh
npm run resources -- plan --collection borders --bytes 15000000
npm run resources -- assign --design new-border-name --collection borders --bytes 15000000
# Inspect sources, write audits/selection metadata, generate selected artwork.
.venv/bin/python scripts/build_assets.py --name new-border-name
```

If the plan says the source is full, run `new --collection borders` first.
This registers and scaffolds `borders-002` (then `003`, etc.) and seals `001`.
For a new named collection, include `--asset-type border|decoration|illustration`.
Create the scaffolded repository with `gh repo create <owner/repository> --public`,
initialize its checkout with Git and set its origin. No copies belong in main.

```sh
npm run resources -- new --collection borders
npm run resources -- approve --source borders-002 --version 0.1.0
```

First publication can approve the initial version; later publications require a new version. `approve` refuses any version npm already lists (a locked but unpublished version may be re-approved), hashes source bytes, capabilities and allowlists, and rewrites the resource's `publish.yml` from `scaffold-resource.mjs`. `verify-resource.mjs <id> <checkout>` checks the result locally.

Uploads (`scripts/pack-resource.mjs`) order npm's file set WebP, vector SVG, PNG, then trace SVG, so CDNs reach common files first.

Locks precede publication. Commit and push the resource checkout to its default branch, then run `lock --source <id>`: it verifies the approved bytes, a clean checkout, the current `publish.yml`, and that the locked commit is the remote default branch's head, then records that commit in `resource-lock.json`. Commit the lock in main and push. Pushing does not publish anything: `npm run resources -- pending` lists locked versions that are not yet published, and Pages keeps deploying the last `v<runtime>` tag. Publish only when the maintainer says "publish" (see AGENTS.md "Publishing and releases").

Each resource's `publish.yml` calls main's reusable `publish-resource.yml`, pinned to `publishWorkflowRef` in `resource-registry.json` (bump that ref only when the workflow logic changes, then re-approve resources to pick it up). Dispatch it with the main commit whose lock approves the source:

```sh
gh workflow run publish.yml --repo adrian729/medieval-ornaments-assets-borders-002 \
  -f tooling-ref=<main commit> -f nonce=<identifier shown in the run name>
```

The workflow refuses tooling outside main or whose pin differs from main's current pin, builds exactly the locked commit with full history, enforces the history budget (`check-history.mjs`) and the 200 MB compressed / 140 MB unpacked limits, publishes with provenance through npm Trusted Publishing, waits until jsDelivr serves every approved file (`warm-cdn.mjs`) and only then creates the repository's `v<version>` release. That release tag at the locked commit is the published marker. Reruns are safe: an existing version is compared with the local tarball's integrity and never uploaded again. `verify-only=true` runs every check and the pack without contacting npm; `check-authentication=true` also confirms the OIDC exchange without uploading. Trusted Publishing is configured per package with its **own resource repository**, workflow `publish.yml` and a GitHub-hosted runner; see [PUBLISHING.md](PUBLISHING.md). Never put credentials in repository files.

A version counts as published only when npm lists it, its `v<version>` tag points at the locked commit, and the CDN serves its `resource-manifest.json` with the approved digest (`scripts/check-resources-published.mjs`, also run by `release.yml` before packing the runtime). `audit-history --source <id>` measures a fresh complete remote mirror and fails above the history budget. Reports stay ignored under `tmp/`.

To revise a design whose original source is archived/full, use
`migrate --design <name> --source borders-002`. It copies the complete approved
design and its native inputs, changes its explicit assignment and declares the
original an immutable retained design. Approve/publish **the target**. Old
resource manifests and old npm releases stay available; do not prune archived
history or rename the design. A source may therefore retain inactive designs
while the central assignment selects exactly one current owner.

To shrink a source, migrate designs, then `release --design <name>` removes
verified copies from the old checkout; published versions keep them.

Compatibility archives are snapshots, retained at assets 0.4.0 / illustrations
0.1.0 for runtime 0.7.0. They are optional and their direct exports remain valid.
New artwork uses independent numbered pins. Refreshing a compatibility archive
requires its existing audited two-package version procedure; descriptive
metadata alone need not trigger that refresh or numbered image publication.

Pages builds need only `npm run build:examples` and `npm run build:site`; their
50 MB local guard detects accidental resource bundling. `build:browser` creates
the full-resource offline mirror as two ordinary ZIPs: browser/WebP/SVG and PNG.
Upload both plus `browser-downloads.json` to the runtime GitHub Release. Extract
both into the same directory to merge the mirror; each download is checked
against GitHub's 2 GiB release-asset limit without changing artwork fidelity.

README gallery previews use `raw.githubusercontent.com` URLs pinned to the
assigned resource's exact Git commit. GitHub renders that host directly;
proxying npm CDN images through Camo produced intermittent fetch timeouts.
The catalog generator owns these URLs, so regenerating the README preserves
the fix. Download links and component/demo defaults still use exact npm CDN
versions. Preview files remain in the resource repositories, outside main
and Pages; lock a published resource commit before updating the public gallery.

## Finished historical extraction imports

`finished-additions.json` maps the reviewed staging identities to permanent
design names and owners; `audits/finished-assets/` retains source hashes,
original attribution, exact extraction prompts, native methods and individual
reviews. The scans and rejected trials remain in the ignored extraction
workspace; source record/download URLs and hashes make their identity explicit.
The 35 unfinished source images are outside this import.

`scripts/import_finished.py --selection PATH` accepts a frozen reviewed
selection. It prepares lossless delivery bytes in memory, measures complete
public/native footprints, assigns each design, then writes only to its resource
checkout. Its ignored journal supports interruption/resume. Masters retain
reviewed native pixels; smaller sizes come directly from each master. The
original repeat axis is restored only with exact quarter-turns.

`finished-border-patterns.json` and `scripts/finished_assets.py` retain the
approved repeat and frame geometry, including divider-only exceptions. Native
bars and each separately retained corner phase belong to the same owner as
their design. `build_assets.py --name NAME` rebuilds only selected deliveries;
it never repeats extraction or guesses new corners. Illustration and decoration
masters continue to use their established catalogs/builders.

New local manifests have `gitCommit: null` until their pushed resource commit is locked. They are reviewable with `?assets=local`; release packaging continues to reject unlocked sources. Existing published artwork is not regenerated by an import.
