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

1. Validate assignments, source revisions, capacities and file ownership.
2. Run the affected artwork checks and publish the changed numbered packages.
3. Verify pinned CDN files and manifests before adopting their versions.
4. Assemble compatibility archives and the optional offline browser download.
5. Build/test the runtime and demos against the resulting locked snapshot.
6. Publish the runtime, upload download archives to GitHub Releases, deploy
   Pages and record package/site verification in `QA.md`.

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

First publication can approve the initial version; later publications require
a new version. `approve` hashes source bytes, capabilities and allowlists.
Commit the reviewed main manifests/tooling, then pin the resource workflow:

```sh
npm run resources -- scaffold --source borders-002 --tooling-ref <immutable-main-commit>
node scripts/verify-resource.mjs borders-002 tmp/resource-checkouts/borders-002
# Commit/push the resource checkout; check npm pack before publishing.
```

Uploads (`scripts/pack-resource.mjs`) order npm's file set WebP, vector SVG,
PNG, then trace SVG, so CDNs reach common files first.

The scaffold imports the pinned main reusable workflow. Configure npm Trusted
Publishing separately for each package with its **own resource repository**,
workflow `publish.yml`, and GitHub-hosted runner; the caller's repository
identity matters. The workflow supplies Node 22 and npm 11.19, verifies approved
hashes/notices, caps compressed uploads at 200 MB and publishes with provenance.
Initial/manual publication may use an already authorized maintainer npm login.
Never put credentials in repository files. Do not dispatch before approval.
See [authentication checks](PUBLISHING.md) for setup and verification.

After registry/CDN verification, run `lock --source <id>` in a complete,
non-partial clone, then commit the resulting exact source SHA in main. `lock`
checks approved bytes, a clean checkout and full Git object capacity. Partial
fetches cannot establish history capacity; use a full authoring clone when
locking. `audit-history --source <id>` measures a fresh complete remote mirror
and fails above the history budget. Reports stay ignored under `tmp/`.

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
50 MB local guard detects accidental resource bundling. `build:browser` is an
explicit full-resource offline artifact, uploaded to the runtime GitHub Release.

README gallery previews use `raw.githubusercontent.com` URLs pinned to the
assigned resource's exact Git commit. GitHub renders that host directly;
proxying npm CDN images through Camo produced intermittent fetch timeouts.
The catalog generator owns these URLs, so regenerating the README preserves
the fix. Download links and component/demo defaults still use exact npm CDN
versions. Preview files remain in the resource repositories, outside main
and Pages; lock a published resource commit before updating the public gallery.
