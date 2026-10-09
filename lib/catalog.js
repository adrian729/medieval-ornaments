// Generated aggregate; individual imports remain catalog-free.
export { version, assetsPackage, assetsVersion, assetsManifestSha256, defaultAssetsBase, illustrationsPackage, illustrationsVersion, defaultIllustrationsBase } from './runtime.js';
import { ornaments as borders } from './catalog-borders.js';
import { ornaments as decorations } from './catalog-decorations.js';
import { ornaments as illustrations } from './catalog-illustrations.js';
export const ornaments = Object.freeze([...borders, ...decorations, ...illustrations].sort((a,b)=>a.name.localeCompare(b.name,'en')));
