// Shared by the package builder and the local component installer.
import { encodeMetadata } from './metadata-codec.js';
export function designData(item) {
  return `import { freeze } from '../freeze.js';\nimport { decodeMetadata } from '../metadata-codec.js';\nexport const ornament = /* @__PURE__ */ freeze(/* @__PURE__ */ decodeMetadata(${JSON.stringify(encodeMetadata(item))}));\n`;
}

export function vanillaModule(item, defaults = {}, sourceId) {
  const exports = item.uses.map(use => {
    const name = use === 'image' ? 'createOrnamentImage' : use === 'frame' ? 'createFrame' : 'createDivider';
    return `export const ${name} = (element, options = {}) => attachOrnament(element, '${use}', options, resolveOrnament);`;
  }).join('\n');
  return `${sourceId ? `import { base } from '../asset-sources/${sourceId}.js';\n` : ''}import { ornament } from '../design-data/${item.name}.js';\nimport { createDesignResolver } from '../bind-design.js';\nimport { attachOrnament } from '../vanilla-core.js';\nexport { ornament };\nexport const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, ${JSON.stringify(defaults)}${sourceId ? ', base' : ''});\n${exports}\n`;
}

export function reactModule(item, defaults = {}, sourceId) {
  const exports = item.uses.map(use => {
    const name = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
    return `export const ${name} = /* @__PURE__ */ createOrnamentComponent('${use}', resolve);`;
  }).join('\n');
  return `'use client';\n${sourceId ? `import { base } from '../asset-sources/${sourceId}.js';\n` : ''}import { ornament } from '../design-data/${item.name}.js';\nimport { createDesignResolver } from '../bind-design.js';\nimport { createOrnamentComponent } from '../react-core.js';\nexport { ornament };\nconst resolve = /* @__PURE__ */ createDesignResolver(ornament, ${JSON.stringify(defaults)}${sourceId ? ', base' : ''});\n${exports}\n`;
}

export function styledModule(name) {
  return `'use client';\nimport '../../ornaments.css';\nexport * from './${name}.js';\n`;
}

export function vanillaTypes(item) {
  const kind = item.kind === 'standalone' ? 'WholeDesign' : 'RepeatDesign';
  const formats = item.formats.map(value => JSON.stringify(value)).join(' | ');
  return `import type { ${kind} } from '../common.js';\ntype Design = ${kind}<${JSON.stringify(item.name)}, ${formats}, ${JSON.stringify(item.asset_type)}>;\nexport declare const ornament: Design['ornament'];\nexport declare const resolveOrnament: Design['resolve'];\n` + item.uses.map(use => {
    const option = `${use[0].toUpperCase() + use.slice(1)}Options`;
    const name = use === 'image' ? 'createOrnamentImage' : use === 'frame' ? 'createFrame' : 'createDivider';
    return `export type ${option} = Design['${use}Options'];\nexport declare const ${name}: Design['${name}'];`;
  }).join('\n') + '\n';
}

export function reactTypes(item) {
  const options = item.uses.map(use => `${use[0].toUpperCase() + use.slice(1)}Options`);
  return `import type { BoundComponent, BoundProps } from '../react-core.js';\nimport type { ${options.join(', ')} } from '../designs/${item.name}.js';\nexport { ornament } from '../designs/${item.name}.js';\nexport type { OrnamentStyle } from '../react-core.js';\n` + item.uses.map((use, i) => {
    const name = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
    return `export type ${name}Props = BoundProps<'${use}', ${options[i]}>;\nexport declare const ${name}: BoundComponent<'${use}', ${options[i]}>;`;
  }).join('\n') + '\n';
}
