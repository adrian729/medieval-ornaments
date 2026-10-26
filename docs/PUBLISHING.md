# Resource publishing authentication

The resource workflow uses GitHub OIDC rather than a stored npm publishing
token. Both the calling `publish.yml` and main's pinned reusable workflow grant
`id-token: write`. npm 11.19.0 runs on Node 22. `setup-node` deliberately does not
create a token-based `.npmrc`; npm obtains its package-scoped credential through
the GitHub OIDC exchange.

Configure each package separately with these exact GitHub identities:

| npm package | GitHub repository | Calling workflow |
| --- | --- | --- |
| `@ranx729/medieval-ornaments-assets-borders-001` | `adrian729/medieval-ornaments-assets-borders-001` | `publish.yml` |
| `@ranx729/medieval-ornaments-assets-decorations-001` | `adrian729/medieval-ornaments-assets-decorations-001` | `publish.yml` |
| `@ranx729/medieval-ornaments-assets-illustrations-001` | `adrian729/medieval-ornaments-assets-illustrations-001` | `publish.yml` |
| every other `@ranx729/medieval-ornaments-assets-<id>` | the matching `adrian729/medieval-ornaments-assets-<id>` | `publish.yml` |
| `@ranx729/medieval-ornaments` (runtime) | `adrian729/medieval-ornaments` | `release.yml` |

After every publish, both workflows run `scripts/warm-cdn.mjs`: they finish only when jsDelivr serves every file of the new version with its approved bytes, so a first-request delay or transient 404 never reaches a pinned release. Only then does the resource workflow create its `v<version>` release, and the runtime workflow its `v<runtime>` tag and draft release. Both are rerun-safe: `scripts/publish-package.mjs` never uploads an existing version again, and fails if its registry integrity differs from the local tarball.

The runtime publishes through `.github/workflows/release.yml` (dispatch on
`main`; `check-authentication=true` verifies OIDC only). Run tests, browser
checks and packed consumers locally first: CI has no resource checkouts.

A new package cannot be linked before it exists (npm answers 404), and linking needs the maintainer's account 2FA. New packages are therefore created in one maintainer passkey sitting per publish batch (AGENTS.md "Publishing and releases"):

1. Before the sitting, dispatch each new repository's `publish.yml` with `verify-only=true` and the approving `tooling-ref`; fix anything it reports.
2. Start `npm login --auth-type=web` and open its page in the maintainer's Chrome; the maintainer presses Continue in the passkey dialog and ticks "remember for 5 minutes" on the first write confirmation.
3. Inside that window, for each new package: publish a `0.0.0` stub built in a temporary directory (only `package.json` with the name, `0.0.0`, the storage repository's `repository.url` and `publishConfig.access: public`, plus a README; `npm publish --access public`), wait until `npm view <package>@0.0.0` succeeds, then run `npm trust github <package> --repo adrian729/medieval-ornaments-assets-<id> --file publish.yml --allow-publish --yes`, pausing about 2 seconds between calls. If publishes do not share the window, run all stubs first, then all trust calls.
4. Run `npm logout`. Never use the local npm login for anything but stubs and trust calls.
5. Dispatch `check-authentication=true` for each new package, then publish its real first version through `publish.yml` right away: a new connection expires unless it publishes within two days. If that deadline is missed, revoke and recreate the connection in another sitting.

Record the number of passkey confirmations the sitting needed in QA.md. The 2026-10-09 packages were activated with the earlier procedure (interactive full first publish, then an identical-artwork 0.1.1 patch); the runtime connection activated with its first `release.yml` publish.

No GitHub environment is used. Enable **Allow npm publish**; a staged-publishing
permission alone does not authorize the existing direct-publish workflow. For
reusable workflows npm checks the caller's filename, not `publish-resource.yml`.
Read [npm's Trusted Publisher documentation](https://docs.npmjs.com/trusted-publishers/)
for the current provider/permission rules.

Use an interactive npm account session to inspect and configure these settings.
The token used for the 0.8.0 manual release cannot manage trust settings: npm
rejected its trust-list request with E403. The CLI supports:

```sh
npm trust list @ranx729/medieval-ornaments-assets-borders-001 --json
npm trust github @ranx729/medieval-ornaments-assets-borders-001 \
  --repo adrian729/medieval-ornaments-assets-borders-001 \
  --file publish.yml --allow-publish --yes
```

Repeat for the other two resource identities. Inspect existing connections
before changing them; keep unrelated publishers intact. npm may require account
2FA in its browser flow. Keep authentication tokens outside all repositories.
The [npm trust command](https://docs.npmjs.com/cli/v11/commands/npm-trust/)
documents authentication requirements and permissions.

## Verify without a release

Dispatch the resource's existing workflow with `check-authentication=true`:

```sh
gh workflow run publish.yml \
  --repo adrian729/medieval-ornaments-assets-borders-001 \
  -f tooling-ref=<main commit> -f check-authentication=true
```

Repositories whose `publish.yml` predates `tooling-ref` take only `check-authentication`; `approve` rewrites the file at their next revision. The workflow verifies that the tooling is part of main, approved bytes, history capacity and repository identity, then runs
the actual npm publish command with `--dry-run --force --ignore-scripts`.
`--force` permits checking the already published version; `--dry-run` prevents
an upload. The check requires npm's explicit successful OIDC exchange message.
A zero exit status alone is insufficient: npm permits unauthenticated dry runs.
Captured npm output stays private; failures print a credential-free diagnostic.
This mode skips both the upload-capacity pack and the real publish step.

New trust connections expire unless their first successful publish happens
within two days. A successful authentication-only check does not establish that
the first publish occurred. Track this separately and validate a new connection
through a reviewed resource release within npm's deadline. Follow the normal
[resource release ordering](RESOURCES.md); never republish an existing version.
Auth-only workflow commits do not change artwork manifests or published pins.

## First connection validation, 2026-10-09

The maintainer enrolled a passkey and npm reports account 2FA as enabled. All
three resource connections were created with the identities above. Checks
37892212475 / 37892216484 / 37892220297 confirmed npm's actual OIDC exchange.
The approved 0.1.3 patches preserve every 0.1.2 artwork/native hash and rendering
capability; they provide the required first real publish. Publication workflows
pin main tooling 9bfb355ec00b2236fd64915dbde26b203c8b5b13. Final registry/source
verification and connection activation status are recorded in QA.md.

## Recover a CDN-only verification failure

If the workflow's npm publish step succeeded but its CDN check failed, dispatch the same `publish.yml` again with the same `tooling-ref`. The publish step finds the existing version, confirms its integrity equals the local tarball and skips the upload; the CDN check then runs again and, when every approved file passes, the `v<version>` release is created. Record the original failure and the successful rerun in QA.md. A partial check is insufficient for adoption.

For a repository whose `publish.yml` predates this (`decorations-006` in 2026-10-13 was recovered this way), rerun only the complete CDN verification from the approved main checkout with `node scripts/warm-cdn.mjs <id>`, then create the release by hand.
