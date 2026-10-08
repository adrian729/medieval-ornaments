import test from 'node:test';
import assert from 'node:assert/strict';
import { checkNpmAuthentication } from '../scripts/check-npm-auth.mjs';

const env = { GITHUB_ACTIONS: 'true', ACTIONS_ID_TOKEN_REQUEST_URL: 'https://example.test/oidc', ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'request-secret' };

test('an unauthenticated successful npm dry run does not verify trusted publishing', async () => {
  await assert.rejects(checkNpmAuthentication('/resource', {
    env, run: async () => ({ stdout: '{}', stderr: 'npm warn publish This command requires you to be logged in (dry-run)' }),
  }), /did not confirm an OIDC token exchange/);
});

test('authentication verification uses a dry run and requires npm exchange evidence', async () => {
  let called = false;
  await checkNpmAuthentication('/resource', { env, run: async (command, args, options) => {
    called = true;
    assert.equal(command, 'npm');
    assert.ok(args.includes('--dry-run'));
    assert.ok(args.includes('--ignore-scripts'));
    assert.ok(args.includes('--force')); // Existing versions may be checked.
    assert.equal(options.cwd, '/resource');
    assert.equal(options.env, env);
    return { stdout: '{}', stderr: 'npm verbose oidc Successfully retrieved and set token\n' };
  } });
  assert.equal(called, true);
});

test('authentication failures cannot expose captured credentials', async () => {
  const secret = 'secret-from-npm-output';
  await assert.rejects(checkNpmAuthentication('/resource', { env, run: async () => {
    throw Object.assign(new Error(secret), { stdout: secret, stderr: secret });
  } }), error => !String(error).includes(secret) && /no package was uploaded/.test(error.message));
  await assert.rejects(checkNpmAuthentication('/resource', { env: {}, run: async () => {
    throw Error('Must not run npm outside GitHub OIDC');
  } }), /id-token: write/);
});
