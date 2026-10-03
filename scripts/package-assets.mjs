// Shared package metadata. Never generates or alters artwork.
import { readFile } from 'node:fs/promises';
export const root = new URL('../', import.meta.url);
export async function assetCatalog() {
  const original = JSON.parse(await readFile(new URL('images.json', root), 'utf8'));
  return original.map(item => ({ ...item,
    uses: item.kind === 'standalone' ? ['image'] : ['frame', 'divider'],
    formats: ['svg', 'webp', 'png'].filter(format => item[format])
  })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}
export const catalogBytes = items => JSON.stringify(items, null, 2) + '\n';
export function assetPaths(items) {
  return [...new Set(items.flatMap(item => [item, ...Object.values(item.components)]
    .flatMap(component => [component, ...component.variants]
      .flatMap(asset => ['svg', 'png', 'webp'].filter(format => asset[format]).map(format => asset[format])))))].sort();
}
