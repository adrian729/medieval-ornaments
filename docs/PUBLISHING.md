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
