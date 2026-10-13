// Shared release gate for the metadata-only runtime; npm pack writes an array.
import { readFile } from 'node:fs/promises';
const budget = JSON.parse(await readFile(new URL('../runtime-budget.json', import.meta.url)));
const packages = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (packages.length !== 1) throw Error('Expected one packed runtime.');
const packed = packages[0];
if (!(packed.size > 0 && packed.size < budget.maxPackedBytes && packed.unpackedSize > 0 && packed.unpackedSize < budget.maxUnpackedBytes)) {
  throw Error(`Runtime exceeds ${budget.maxPackedBytes} B packed / ${budget.maxUnpackedBytes} B unpacked: ${packed.size} / ${packed.unpackedSize}.`);
}
if (packed.files.some(file => /\.(?:png|webp|svg|jpe?g|gif|avif|tgz|zip)$/i.test(file.path))) throw Error('Runtime contains artwork or archives.');
console.log(packed.filename, packed.size, packed.unpackedSize);
