// Exercise npm's real OIDC path, requiring positive exchange evidence even
// though npm itself allows an unauthenticated dry run to exit successfully.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function checkNpmAuthentication(directory, { env = process.env, run = promisify(execFile) } = {}) {
  if (env.GITHUB_ACTIONS !== 'true' || !env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
    throw Error('Run this check in GitHub Actions with id-token: write in both caller and reusable workflows.');
  }
  let result;
  try {
    result = await run('npm', ['publish', '--dry-run', '--force', '--ignore-scripts', '--access', 'public',
      '--provenance', '--registry', 'https://registry.npmjs.org', '--json', '--loglevel', 'verbose', '--color=false'],
    { cwd: directory, env, maxBuffer: 8 * 1024 * 1024 });
  } catch {
    // npm's captured output can contain credentials. Never echo it or propagate
    // the child-process error object into GitHub logs.
    throw Error('npm authentication dry run failed; no package was uploaded. Check the npm Trusted Publisher settings.');
  }
  if (!/\boidc\s+Successfully retrieved and set token\b/.test(result.stderr)) {
    throw Error('npm did not confirm an OIDC token exchange. Check the caller repository, publish.yml, expiry and Allow npm publish permission.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const directory = process.argv[2];
    if (!directory) throw Error('Usage: node scripts/check-npm-auth.mjs <resource-checkout>');
    const pkg = JSON.parse(await readFile(path.join(directory, 'package.json')));
    await checkNpmAuthentication(directory);
    console.log(`Verified npm OIDC authentication for ${pkg.name}@${pkg.version}; no package uploaded.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
