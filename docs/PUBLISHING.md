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
| `@ranx729/medieval-ornaments-assets-borders-002` … `-004`, `-illustrations-002` | the matching `adrian729/medieval-ornaments-assets-<id>` | `publish.yml` |
| `@ranx729/medieval-ornaments` (runtime) | `adrian729/medieval-ornaments` | `release.yml` |

After every publish, both workflows run `scripts/warm-cdn.mjs`: they finish only
when jsDelivr serves every file of the new version with its approved bytes, so a
first-request delay or transient 404 never reaches a pinned release.

The runtime publishes through `.github/workflows/release.yml` (dispatch on
`main`; `check-authentication=true` verifies OIDC only). Run tests, browser
checks and packed consumers locally first: CI has no resource checkouts.

A new package cannot be linked before it exists (npm answers 404). Publish its
verified first tarball from an interactive terminal (npm confirms in the
browser), link it with `npm trust github`, then publish an identical-artwork
patch through `publish.yml` within two days to activate the connection. The four
2026-10-09 packages were activated this way (0.1.1); the runtime connection
activates with its first `release.yml` publish.

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
  -f check-authentication=true
```

The pinned workflow verifies approved bytes and repository identity, then runs
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
