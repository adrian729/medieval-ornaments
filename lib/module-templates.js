// Shared by the package builder and the local component installer.
export function designData(item) {
  return `import { freeze } from '../freeze.js';\nexport const ornament = /* @__PURE__ */ freeze(${JSON.stringify(item)});\n`;
}

export function vanillaModule(item, defaults = {}) {
  const exports = item.uses.map(use => {
    const name = use === 'image' ? 'createOrnamentImage' : use === 'frame' ? 'createFrame' : 'createDivider';
    return `export const ${name} = (element, options = {}) => attachOrnament(element, '${use}', options, resolveOrnament);`;
  }).join('\n');
  return `import { ornament } from '../design-data/${item.name}.js';\nimport { createDesignResolver } from '../bind-design.js';\nimport { attachOrnament } from '../vanilla-core.js';\nexport { ornament };\nexport const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, ${JSON.stringify(defaults)});\n${exports}\n`;
}

export function reactModule(item, defaults = {}) {
  const exports = item.uses.map(use => {
    const name = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
    return `export const ${name} = /* @__PURE__ */ createOrnamentComponent('${use}', resolve);`;
  }).join('\n');
  return `'use client';\nimport { ornament } from '../design-data/${item.name}.js';\nimport { createDesignResolver } from '../bind-design.js';\nimport { createOrnamentComponent } from '../react-core.js';\nexport { ornament };\nconst resolve = /* @__PURE__ */ createDesignResolver(ornament, ${JSON.stringify(defaults)});\n${exports}\n`;
}

export function styledModule(name) {
  return `'use client';\nimport '../../ornaments.css';\nexport * from './${name}.js';\n`;
}

export function vanillaTypes(item) {
  const options = item.uses.map(use => `${use[0].toUpperCase() + use.slice(1)}Options`);
  const kind = item.kind === 'standalone' ? 'WholeOrnament' : 'RepeatOrnament';
  const literal = JSON.stringify(item.name);
  const formats = ['auto', ...item.formats].map(value => JSON.stringify(value)).join(' | ');
  return `import type { ${kind}, ResolvedOrnament, OrnamentController, ${options.map(value => `${value} as Base${value}`).join(', ')} } from '../common.js';\nexport declare const ornament: ${kind} & { readonly name: ${literal} };\n` + item.uses.map((use, i) => {
    const option = options[i];
    const name = use === 'image' ? 'createOrnamentImage' : use === 'frame' ? 'createFrame' : 'createDivider';
    return `export type ${option} = Omit<Base${option}, 'design' | 'format'> & { design?: ${literal}; format?: ${formats} };\nexport declare function resolveOrnament(use: '${use}', options?: ${option}): ResolvedOrnament;\nexport declare function ${name}(element: ${use === 'image' ? 'HTMLImageElement' : 'HTMLElement'}, options?: ${option}): OrnamentController<${option}>;`;
  }).join('\n') + '\n';
}

export function reactTypes(item) {
  const options = item.uses.map(use => `${use[0].toUpperCase() + use.slice(1)}Options`);
  return `import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, ImgHTMLAttributes } from 'react';\nimport type { OrnamentStyle } from '../react-core.js';\nimport type { ${options.join(', ')} } from '../designs/${item.name}.js';\nexport { ornament } from '../designs/${item.name}.js';\nexport type { OrnamentStyle };\n` + item.uses.map((use, i) => {
    const name = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
    const omit = use === 'image' ? "'src' | 'srcSet' | 'sizes' | 'height' | 'width' | 'alt' | 'children' | 'style' | 'dangerouslySetInnerHTML'" : use === 'divider' ? "'children' | 'style' | 'dangerouslySetInnerHTML'" : "'style' | 'dangerouslySetInnerHTML'";
    const element = use === 'image' ? 'HTMLImageElement' : 'HTMLDivElement';
    const html = use === 'image' ? 'ImgHTMLAttributes' : 'HTMLAttributes';
    return `export type ${name}Props = ${options[i]} & Omit<${html}<${element}>, ${omit}> & { style?: OrnamentStyle${use === 'frame' ? '' : '; children?: never'} };\nexport declare const ${name}: ForwardRefExoticComponent<${name}Props & RefAttributes<${element}>>;`;
  }).join('\n') + '\n';
}
