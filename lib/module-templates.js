// Shared by the package builder and local installer. Compact generated modules
// retain named exports and PURE annotations without adding a minifier dependency.
import { encodeMetadata } from './metadata-codec.js';
export function designData(item) {
  return `import{freeze as f}from'../freeze.js';import{decodeMetadata as d}from'../metadata-codec.js';export const ornament=/*@__PURE__*/f(/*@__PURE__*/d(${JSON.stringify(encodeMetadata(item))}));\n`;
}

export function vanillaModule(item, defaults = {}, sourceId) {
  const exports = item.uses.map(use => {
    const name = use === 'image' ? 'createOrnamentImage' : use === 'frame' ? 'createFrame' : 'createDivider';
    return `export const ${name}=(e,o={})=>a(e,'${use}',o,resolveOrnament);`;
  }).join('');
  return `${sourceId ? `import{base as b}from'../asset-sources/${sourceId}.js';` : ''}import{ornament as o}from'../design-data/${item.name}.js';import{createDesignResolver as r}from'../bind-design.js';import{attachOrnament as a}from'../vanilla-core.js';export{o as ornament};export const resolveOrnament=/*@__PURE__*/r(o,${JSON.stringify(defaults)}${sourceId ? ',b' : ''});${exports}\n`;
}

export function reactModule(item, defaults = {}, sourceId) {
  const exports = item.uses.map(use => {
    const name = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
    return `export const ${name}=/*@__PURE__*/c('${use}',v);`;
  }).join('');
  return `'use client';${sourceId ? `import{base as b}from'../asset-sources/${sourceId}.js';` : ''}import{ornament as o}from'../design-data/${item.name}.js';import{createDesignResolver as r}from'../bind-design.js';import{createOrnamentComponent as c}from'../react-core.js';export{o as ornament};const v=/*@__PURE__*/r(o,${JSON.stringify(defaults)}${sourceId ? ',b' : ''});${exports}\n`;
}

export function styledModule(name) {
  return `'use client';import'../../ornaments.css';export*from'./${name}.js';\n`;
}

export function vanillaTypes(item) {
  const kind = item.kind === 'standalone' ? 'WholeDesign' : 'RepeatDesign';
  const formats = item.formats.map(value => JSON.stringify(value)).join('|');
  return `import type{${kind}}from'../common.js';type D=${kind}<${JSON.stringify(item.name)},${formats},${JSON.stringify(item.asset_type)}>;export declare const ornament:D['ornament'];export declare const resolveOrnament:D['resolve'];` + item.uses.map(use => {
    const option = `${use[0].toUpperCase() + use.slice(1)}Options`;
    const name = use === 'image' ? 'createOrnamentImage' : use === 'frame' ? 'createFrame' : 'createDivider';
    return `export type ${option}=D['${use}Options'];export declare const ${name}:D['${name}'];`;
  }).join('') + '\n';
}

export function reactTypes(item) {
  const options = item.uses.map(use => `${use[0].toUpperCase() + use.slice(1)}Options`);
  return `import type{BoundComponent as C,BoundProps as P}from'../react-core.js';import type{${options.join(',')}}from'../designs/${item.name}.js';export{ornament}from'../designs/${item.name}.js';export type{OrnamentStyle}from'../react-core.js';` + item.uses.map((use, i) => {
    const name = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
    return `export type ${name}Props=P<'${use}',${options[i]}>;export declare const ${name}:C<'${use}',${options[i]}>;`;
  }).join('') + '\n';
}
