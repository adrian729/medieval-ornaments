// History-capacity gate for a complete resource clone (the publish workflow
// checks out with full history). Fails above policy.maxGitBytes, warns above
// policy.warnGitBytes. Usage: node scripts/check-history.mjs <source-id> <clone>
import path from 'node:path';
import { gitObjectBytes } from './publication.mjs';
import { registry } from './resource-store.mjs';

const [id, directory] = process.argv.slice(2), policy = registry().policy;
if (!registry().sources[id] || !directory) throw Error('Usage: node scripts/check-history.mjs <source-id> <clone>');
const bytes = await gitObjectBytes(path.resolve(directory));
if (bytes > policy.maxGitBytes) throw Error(`${id} Git history is ${bytes} B, above the ${policy.maxGitBytes} B policy. Seal it and approve the change on the next source.`);
console.log(`${id} Git history: ${bytes} B${bytes >= policy.warnGitBytes ? ` (warning: at or above ${policy.warnGitBytes} B)` : ''}.`);
