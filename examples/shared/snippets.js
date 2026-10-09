// Copyable snippets generated from the library's own resolution, so every
// example shows exactly what another project would write.
import { version } from '../../lib/runtime.js';

const pkg = '@ranx729/medieval-ornaments';
const factory = { frame: 'createFrame', divider: 'createDivider', image: 'createOrnamentImage' };
const component = { frame: 'OrnamentFrame', divider: 'OrnamentDivider', image: 'OrnamentImage' };
const target = { frame: "document.querySelector('.card')", divider: "document.querySelector('.divider')", image: "document.querySelector('img.ornament')" };

// The runtime stylesheet comes from the same host as the artwork.
export function stylesheetUrl(assetUrl) {
  const at = assetUrl.indexOf('@ranx729/');
  // Self-hosted mirrors keep ornaments.css beside their svg/png/webp folders.
  return at < 0 ? assetUrl.replace(/\/(?:svg|png|webp)\/.*$/, '/ornaments.css') : `${assetUrl.slice(0, at)}${pkg}@${version}/ornaments.css`;
}

const quote = value => String(value).replaceAll('"', "'");
const optionsLiteral = options => {
  const entries = Object.entries(options).filter(([, value]) => value !== undefined);
  return entries.length ? `, { ${entries.map(([key, value]) => `${key}: ${typeof value === 'string' ? `'${value}'` : value}`).join(', ')} }` : '';
};
const props = options => Object.entries(options).filter(([, value]) => value !== undefined)
  .map(([key, value]) => typeof value === 'string' ? ` ${key}="${value}"` : ` ${key}={${value}}`).join('');

export function htmlSnippet(resolved, content = 'Your content') {
  const link = `<link rel="stylesheet" href="${stylesheetUrl(resolved.asset.url)}">`;
  if (resolved.use === 'image') {
    const { src, width, height, alt } = resolved.attributes;
    return `${link}\n\n<img class="ornament-image" src="${src}"\n     width="${width}" height="${height}" alt="${alt}" loading="lazy"\n     style="--ornament-size: ${resolved.size}px">`;
  }
  const attributes = Object.entries(resolved.attributes).map(([key, value]) => ` ${key}="${value}"`).join('');
  const declarations = Object.entries(resolved.style).map(([key, value]) => `    ${key}: ${quote(value)};`).join('\n');
  const open = `<div class="${resolved.className}"${attributes} style="\n${declarations}">`;
  return resolved.use === 'divider' ? `${link}\n\n${open}</div>` : `${link}\n\n${open}\n  ${content}\n</div>`;
}

export const jsSnippet = (use, name, options = {}) =>
  `import { ${factory[use]} } from '${pkg}/designs/${name}';\nimport '${pkg}/styles.css';\n\n${factory[use]}(${target[use]}${optionsLiteral(options)});`;

export function reactSnippet(use, name, options = {}, content = 'Your content') {
  const tag = component[use];
  const markup = use === 'frame' ? `<${tag}${props(options)}>\n  ${content}\n</${tag}>` : `<${tag}${props(options)} />`;
  return `import { ${tag} } from '${pkg}/react/${name}';\n\n${markup}`;
}

export const cliSnippet = name =>
  `# React components (default)\nnpx ${pkg}@${version} add ${name}\n\n# Plain JavaScript\nnpx ${pkg}@${version} add ${name} --framework vanilla`;

export const installCommand = `npm i ${pkg}`;
