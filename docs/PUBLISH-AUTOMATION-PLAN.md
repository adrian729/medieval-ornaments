# Hands-off publication plan (agreed 2026-10-26)

Goal: the maintainer only requests changes and, when ready, says "publish". Agents (Claude Code, Codex) author, validate, approve, commit and push each change and record it as pending; nothing reaches npm until the maintainer asks. On "publish", one agent ships every pending change as a single batch: new repositories and packages, every affected resource, the runtime, Pages, the offline downloads and the verification records. The maintainer is asked only for the items under "Still the maintainer's call". The pipeline must not depend on how artwork is laid out across packages, because the storage will be reorganized next and must reuse it.

Status: phase 1 (D1, D3) is implemented and accepted (main `2b3be3c`, `5974e71`; QA.md). Phases 2–6 are not started. No trust setting has changed. Two independent reviews against the code found design errors and omissions in the first draft; their fixes are folded in below. The earlier idea of storing volumes as versions of one package per collection was dropped: it ties version numbers to the storage layout (incompatible with the planned reorganization), loses semver meaning, and complicates offline installs of several volumes.

## Findings that shape the design

- The binding limit is jsDelivr's 150 MB package limit (our policy: 140 MB public files per package), not GitHub's 1 GB repository guidance. All 29 resource repositories hold 100–220 MB including native inputs.
- Revisions to the 29 existing packages can already be automated: each has a working npm Trusted Publisher bound to its own repository and `publish.yml`, and `gh` (logged in as `adrian729`) can dispatch those workflows. The blocker is process, not credentials: `scaffold --tooling-ref` rewrites the resource workflow for every release, so each release needs main commit → resource commit → dispatch → lock → main commit, one resource at a time, plus manual CDN-timeout recovery.
- Creating a new npm package is the one step that inherently needs the maintainer. npm requires a package to exist before a trusted publisher can be added, `npm trust` requires interactive account 2FA (bypass tokens are rejected), and a new connection expires unless it publishes within 2 days.
- Tokens are not a way around this: npm's access-token documentation says direct publishing with granular access tokens will be removed in January 2027.
- The installed npm 11.19.0 documentation (`npm help trust`) says the registry supports one trusted-publisher configuration per package; replacing it needs `npm trust revoke` and 2FA. (npm's website mentions up to 10; this plan assumes the stricter rule.)
- npm allows about 80 `npm trust` calls in the 5-minute window after one 2FA confirmation, so new packages can be set up in batches.

## Target design

### D1. Layout-independent publishing for every package

Every resource package, existing or created during the reorganization, is published the same way: by its own storage repository's `publish.yml`, through a shared reusable workflow in main. The orchestrator works from `resource-registry.json` and `resource-lock.json` only, so any reorganization (new repositories, new names, moved designs) is just a registry and lock change that the same pipeline ships.

- `publish-resource.yml` (reusable) takes `tooling-ref` as a dispatch input instead of a value baked into each caller. `scripts/check-publish-ref.mjs` checks through GitHub's compare API that `tooling-ref` is part of main **and** that the source's pin at `tooling-ref` equals its pin at main's head, so an older approval cannot be published. The run must build exactly the locked resource commit; it checks it out with full history and enforces the history budget (`scripts/check-history.mjs`). A `verify-only` mode runs every check and the pack without contacting npm.
- Upload is idempotent but never blind: if `package@version` exists, or npm answers E403 "cannot publish over the previously published version", compare the registry `dist.integrity` with the deterministic local pack's sha512 (`scripts/publish-package.mjs`). A match continues to CDN verification; a mismatch fails loudly.
- After `warm-cdn.mjs` passes, the workflow creates the storage repository's own `v<version>` release (`contents: write` in caller and reusable workflow). That release is the CDN-verified marker used by D3 and replaces the manual release step.
- Each resource `publish.yml` is rewritten once to forward `tooling-ref` and call the reusable workflow at a pinned workflow SHA that changes only when the publishing logic changes. `approve` rewrites it in that repository's next revision; borders-006 adopted it in workflow-only commit `c7f3003` (no republish). Trusted publishing matches the caller filename only, so the existing trust survives. `scaffold` writes the new form for every new repository.
- `release.yml` (runtime) gets the same skip-and-compare step, so a CDN-timeout rerun still reaches Pages instead of failing with E403. It also creates the `v<runtime>` tag and a draft release that later stages attach downloads to.
- AGENTS.md, RESOURCES.md and PUBLISHING.md describe this (updated in phase 1): workflow logic stays SHA-pinned through `publishWorkflowRef`; scripts come from a `tooling-ref` that must match main's current pin.

### D2. New packages: one confirmation sitting per publish batch

npm needs the maintainer's passkey (Google Password Manager) to create a package and its trust connection. Revisions of existing packages need nothing: they publish through OIDC. A publish batch therefore needs the maintainer only if it contains new packages, and then for one short sitting:

- During preparation, before the maintainer is involved, agents do everything else: `plan`, `new`, `gh repo create` (backing off on GitHub's repository-creation rate limit), the initial pushes, assignments, artwork, approvals, verified tarballs and scaffolded `publish.yml` files.
- The sitting: the agent starts `npm login --auth-type=web` and opens the page in the maintainer's Chrome. The maintainer presses Continue in the passkey dialog, ticking npm's "remember for 5 minutes" option on the first write confirmation. The agent then runs, back to back inside that window, for each new package:
  - a tiny `0.0.0` stub publish that only creates the package (stub rules below). Real artwork is too large to upload inside the window;
  - `npm trust github <package> --repo <storage repository> --file publish.yml --allow-publish --yes`, with a 2-second pause between calls. npm documents about 80 trust calls per window.
- Expected cost: one or two passkey confirmations (login, then the first write) for the whole batch. npm's installed docs document the 5-minute window for `npm trust`; the 2022 npm changelog documents "remember me for 5 minutes" for publishes. This is untested on this account: the first batch measures it, and the runbook records the real count. If publishes do not share the window, run all stubs first, then all trust calls, checkpointing each in the journal.
- Before the sitting, every new repository passes a `verify-only` dispatch of its `publish.yml`: the full publication checks and pack, with no npm request. This catches verification, capacity and identity problems before any trust connection exists.
- Stub rules: build it in a temporary directory, never the resource checkout. It contains only `package.json` (name, `0.0.0`, `repository.url` of the storage repository, `publishConfig.access: public`) and README; no `resource-manifest.json`. Publish with `--access public` and wait until `npm view <package>@0.0.0` succeeds before calling `npm trust`. This in-batch stub is not a "placeholder reserved ahead of need": it exists only to create a package the same batch publishes minutes later.
- Credentials: the sitting uses the maintainer's interactive `npm login` session only for stubs and trust calls; `ship` never uses local npm credentials for anything else. Run `npm logout` at the end of the sitting.
- Immediately afterwards, `check-authentication` dispatches confirm each new connection (a successful OIDC exchange, no upload), then the orchestrator publishes each package's real first version through OIDC from CI. That satisfies npm's 2-day activation limit, so the stub is superseded within minutes. No identical-artwork activation patch is needed.
- The journal records each new connection's 2-day deadline. If a first publish cannot complete in time, the recovery is `npm trust revoke` plus a new trust call in another sitting; this is within the batch's authorization.
- If the 5-minute window expires partway, the agent asks once more and resumes from the journal; packages and trust connections already created are skipped.
- The reorganization should create all its new packages in one such batch, sized with growth headroom so later batches rarely need new packages.

### D3. Lock before publishing; derive publication from the registry and CDN

- `resource-lock.json` now means "approved exact commit, version and hashes", no longer "published, CDN-verified and locked". `lock` runs right after the resource commit is pushed. It verifies bytes, the current `publish.yml`, and that the locked commit is the remote default branch's head, because README raw URLs, `fetch` and the CI checkout all depend on it. It no longer needs a full local clone.
- History capacity is measured in the publish workflow before upload, from the full-history checkout's Git object storage (`check-history.mjs`); `audit-history` remains the manual full-mirror audit. If that audit fails after the lock is on main, recovery is to approve a new version on the next source; no partial publication will have occurred.
- `scripts/check-resources-published.mjs` (and `npm run resources -- pending`) keeps the earlier guarantee. A pin counts as published only when all three hold:
  - npm lists the version;
  - the storage repository's `v<version>` tag, created only after the CDN check (D1), points at the locked commit;
  - the CDN serves `resource-manifest.json` with the approved manifest digest.
- `release.yml` runs this check before packing. `build-library.mjs --release` (prepack) keeps only its offline lock-shape check, so local `npm pack` and offline integration tests do not need the network.
- Pages deploys the commit of the `v<runtime>` tag for `package.json`'s version, never main's tip (`check-site-release.mjs` outputs the tag's commit; `pages.yml` checks it out). Pending library, example or metadata changes on main therefore never reach the live site before "publish". `release.yml` creates that tag only after the runtime and every pinned resource are published, and keeps the GitHub release as a draft until the offline downloads are attached.
- `approve` refuses any version that already exists on npm (today it treats `gitCommit !== null` as published), and `scripts/import_finished.py`'s patch bump uses the same check.
- `warm-cdn.yml` (weekly `--all`) reports locked-but-unpublished pins as pending instead of failing.
- RESOURCES.md (lock and publication sections), PUBLISHING.md (first publication, verification, CDN recovery) and the `catalog.py` gallery comment were updated in phase 1. HISTORICAL-ASSET-HANDOFF.md and AGENTS.md's dated release notes keep their historical wording.
- Each change needs one main commit carrying its approvals, locks and regenerated outputs, instead of two per resource.

### D4. Pending changes and one resumable orchestrator: `npm run ship`

Each requested change ends after stage 3 below (`npm run ship -- --prepare`): approved, locked, committed and pushed. Its record is committed in main in `release-pending.json` (request summary, designs, sources, bump class), so any agent, machine or session sees the same pending set. The runtime also counts as pending whenever main's packaged files differ from the last `v<runtime>` tag, even without a resource change. Pages and the runtime stay on the last published release meanwhile (D3).

When the maintainer says "publish", `npm run ship` re-runs the automated stage 1 checks on the combined batch (not the visual inspection already recorded), then runs stages 4–8 once for everything pending and clears `release-pending.json`. A later pending change to a source that already has an unpublished version re-approves that same version, raising patch to minor if needed, instead of bumping again. The design guard's baseline is the manifests at the last published locks.

Rollover belongs to authoring, not shipping. AGENTS.md requires assignment before any writes, and `assign` refuses a full source. So the authoring helper runs `plan`; if the source is full it runs `new`, `gh repo create` and the initial push, then `assign`, all before artwork is generated. `ship` checks that every assigned source's repository exists and is pushed.

`scripts/ship.mjs --designs <names>` takes the explicit list of designs the request changed. It keeps a journal under `tmp/ship/<id>.json`; every stage is idempotent, and an interrupted run resumes from the journal.

1. Preflight:
   - clean trees in main and the affected checkouts; `gh` authentication;
   - `resources fetch` for what the checks need (fresh clones lack checkouts);
   - design guard: fail if any manifest entry or capability of a design outside `--designs` changed. This enforces "existing published artwork must not change";
   - checks: `catalog.py --check`, `artwork_check.py`, the relevant import `--check` scripts (for example `import_bestiary.py --check`), and `check_illustration_build.py` when a pipeline changed;
   - builds and tests: `npm run build`, `npm test`, `npm run test:types`, `npm run audit:selective`, `check-runtime-package.mjs`, `build:examples` and `build:site` with the 50 MB guard, `git diff --check`;
   - browser checks in sequence (they share Chrome port 9227): `browser_check.mjs`, `frame_join_check.mjs` at 33px and fractional pixel ratios;
   - agent visual inspection of every changed design against its reference, as repeated strips and in light/dark frames (AGENTS.md: automated checks do not replace it), recorded in the journal.
2. Approve each changed source with an automatic version bump: minor for added or changed artwork, patch for workflow-only or identical-artwork changes.
3. Commit and push the resource repositories, then `lock` them. Regenerate `lib/` and the README gallery (`npm run build`, `catalog.py`), add the change to `release-pending.json`, then make one main commit and push.
4. New packages, only if the batch needs any: `verify-only` dispatches first, then the D2 sitting (notify the maintainer once, drive the login page, create stubs and trust connections inside the window, `npm logout`), then `check-authentication` dispatches. The real first versions publish in stage 5.
5. Publish:
   - dispatch every changed source's `publish.yml` in parallel with `tooling-ref` and a nonce input echoed in `run-name`, so each run can be found;
   - wait for all runs and re-run only the CDN check after a timeout;
   - finish when `check-resources-published.mjs` passes for every pin.
6. Runtime:
   - bump `package.json` per policy (minor for new designs, patch otherwise);
   - run `npm run test:integration` against the published resources;
   - commit, push, dispatch `release.yml` and wait. It publishes, warms the CDN, creates the `v<runtime>` tag and draft release, and dispatches Pages (which deploys that tag).
7. Offline downloads: a new `browser-release.yml` builds both ZIPs and `browser-downloads.json` on a GitHub runner, attaches them to the draft `v<runtime>` release and then publishes it.
   - `build-browser.mjs` currently reads local checkouts, so it gets a resolver backed by the published npm tarballs.
   - ubuntu-latest guarantees only about 14 GB free, so files are streamed per resource with a disk check first.
8. Post-publication checks, in sequence:
   - registry consumers (`ORNAMENTS_PACKAGE`);
   - `tests/site.mjs` against live Pages, the actual CDN and the downloaded ZIPs;
   - generated QA.md and PACKAGE-PLAN.md entries with run IDs, sizes and hashes; AGENTS.md's release-status paragraph and README counts; the cleared `release-pending.json`. Committed and pushed.

Modes: `--dry-run` (plan only), `--until <stage>`, `--resume <id>`, `--check-authentication` (all trusted publishers, no upload).

### D5. Standing authorization for agents

Replace AGENTS.md's interim "Publishing and releases" section with a pointer to a new `docs/RELEASING.md` runbook and the maintainer's standing authorization:

> When the maintainer requests a change to artwork, metadata or the library, agents complete it through approval: resource repository creation, approval, commits, pushes and locks, recorded as pending. Publish only when the maintainer says so; then ship every pending change as one batch with `npm run ship` (new packages and their trust connections, resource and runtime publication, Pages, GitHub releases and QA records). Do not ask for confirmation of these steps. This authorization excludes npm trust changes outside a batch's new packages, force-pushes, deleting or deprecating packages, repositories or releases, changing published artwork the request did not name, relaxing policy limits, and resuming the paused historical extraction.

AGENTS.md's resource-workflow line was already amended in phase 1 for D1 and D3. Claude Code gets a small project skill (`.claude/skills/ship/SKILL.md`) that loads the runbook; Codex reads it through AGENTS.md.

## Still the maintainer's call

Agents stop and ask only for:

- saying "publish" to ship the pending batch;
- one passkey confirmation sitting during a batch that creates new npm packages (D2);
- terms of use for a new source (existing rule);
- the exclusions listed in the D5 authorization;
- a failure the pipeline cannot recover from by retrying (for example npm rejecting a trust connection, or an integrity mismatch on an existing version).

Versions are never one of these: agents choose them.

## Implementation phases

Each phase lands as reviewed commits on main and leaves today's process working. Testing (maintainer decision): no new unit tests for the pipeline; acceptance comes from dry runs and no-upload dispatches against the real services. The existing suite was trimmed to remove redundant and batch-specific tests (49 → 33).

1. Publishing core (D1, D3). **Done** (2026-10-26).
   - Work: dispatch-time `tooling-ref` with the pin-equality check; locked-commit checkout; `verify-only` mode; integrity-compared idempotent upload and the self-created release marker; the same idempotency in `release.yml`; lock-before-publish with the remote-existence check; `check-resources-published.mjs`; Pages deploying the release tag; the `approve` and `import_finished.py` version guards; `warm-cdn.yml` pending handling.
   - Acceptance: a workflow-only commit in one existing repository passes a `check-authentication` dispatch, `resources pending` reports every current pin as published, and the Pages gate resolves to the released tag.
2. Authoring rollover helper and orchestrator stages 1–6, including `release-pending.json`, the D2 sitting, the design guard, the journal, dry run and resume.
   - Acceptance: a dry run on the current clean tree reports "nothing to publish", and a `--prepare` run of a real change records it in `release-pending.json`.
3. CI offline downloads (stage 7) and automated post-publication records (stage 8).
   - Acceptance: `browser-release.yml` reproduces the v0.12.0 ZIP contents (the same 8,493 artwork files and hashes) on a draft release.
4. Permanent documentation (D5). This plan file is not a source of truth after execution; every rule in it must move into the permanent docs:
   - `docs/RELEASING.md`: the complete runbook (pending changes, the "publish" batch, `npm run ship` stages and modes, the new-package passkey sitting with its measured confirmation count, recovery from each failure, versioning policy);
   - AGENTS.md: the standing authorization and its exclusions, the maintainer decisions below, a pointer to the runbook, and the amended lines that conflict with D1 and D3;
   - `docs/RESOURCES.md` and `docs/PUBLISHING.md`: lock-before-publish, the published check, dispatchable `tooling-ref`, the new-package procedure; retire the per-release scaffold, first-publication and CDN-recovery steps they replace;
   - PACKAGE-PLAN.md and QA.md: completion records;
   - the Claude Code skill `.claude/skills/ship/SKILL.md` pointing to the runbook.
   - Acceptance: a reviewer reading only AGENTS.md and the docs it links, without this plan, can run a change and a publish batch correctly. Then this file is marked as a historical record of the decision (or removed) and AGENTS.md stops referring to it.
5. First real use: the next requested change goes through authoring plus `npm run ship` end to end. The maintainer only reads the summary.
6. Reorganization (separate plan), shipped through this pipeline, with its new packages created in one D2 batch.

## Risks and mitigations

- **A new package still needs the maintainer's passkey.** npm's current rules do not allow automating this. Batching and full preparation keep it to one sitting per publish batch, and only for batches with new packages; headroom chosen during the reorganization keeps those rare. The exact number of confirmations per sitting is untested until the first batch.
- **GitHub rate-limits rapid repository creation** (seen after ten). The authoring helper backs off and resumes; normal rollovers need one repository at a time.
- **Agents publish without a human in the loop.** Every gate that runs today still runs, plus the design guard. Uploads never overwrite a version and are integrity-checked. Rollback means a new main release pointing at previous pins, and the summary and QA entries record exactly what shipped.
- **CI disk for offline downloads is tight.** Streamed per-resource assembly with a disk check; fall back to the local build if a runner is too small.

## Alternatives rejected

- **Volumes stored as versions of one package per collection.** Ties version numbers to the storage layout, breaking the planned reorganization. Also makes `latest` and semver meaningless and requires npm aliases for offline installs of several volumes.
- **Pre-reserving packages with placeholders before each rollover.** Rejected by the maintainer.
- **A long-lived npm token in GitHub secrets.** Write tokens expire within 90 days, tokens cannot manage trust, and npm removes direct granular-token publishing in January 2027.
- **Moving all packages to one central publishing workflow.** One trust configuration per package means revoking and replacing each in a 2FA session, plus activation releases of every package within 2 days.
- **Serving new artwork from jsDelivr's GitHub endpoint.** It needs no npm at all. But its 20 MB per-file limit already excludes 20 current files (the largest is 48 MB), it keeps the 150 MB per-ref limit, and it drops npm offline installs and provenance.

## Maintainer decisions (2026-10-26)

1. Publication waits for the maintainer's explicit "publish". That instruction is also the maintainer's approval of the pending artwork, so there is no separate sign-off step. Agents still perform their own checks and visual inspection before marking a change pending.
2. Agents choose all versions (resource and runtime) without asking: minor for new or changed artwork and new designs, patch otherwise.
3. Volumes stored as versions of one package and long-lived npm tokens are rejected. New packages cost one passkey sitting per batch that needs them.
