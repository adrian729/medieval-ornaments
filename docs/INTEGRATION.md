# Integrating medieval ornaments

Install the package:

```sh
npm install @ranx729/medieval-ornaments
```

The core has no runtime dependencies. React is an optional peer dependency.
Use ESM imports with a bundler, or native browser modules as described below.
The package includes TypeScript declarations and the cataloged SVG/PNG/WebP assets.
Code and artwork have separate licensing scopes: see [LICENSE](../LICENSE) and
[ASSET-RIGHTS.md](../ASSET-RIGHTS.md).

## Shared contract

Import `@ranx729/medieval-ornaments/styles.css` once in your application's entry point.
All designs use the same three components/functions:

| Use | React | Vanilla | Designs |
| --- | --- | --- | --- |
| Frame around content | `OrnamentFrame` | `createFrame` | 40 repeat designs |
| Repeating divider | `OrnamentDivider` | `createDivider` | 40 repeat designs |
| Whole decoration | `OrnamentImage` | `createOrnamentImage` | Nine whole designs |

Only `design` is required. No default ornament is chosen for you. A whole
corner/panel is an image, not a source of seamless frame pieces. Reference
crops and individual corners are advanced assets available in the catalog.

| Option | Default | Meaning |
| --- | --- | --- |
| `design` | Required | Stable catalog name; TypeScript narrows names by supported use |
| `size` | Frame 32, divider 24, image 256 | Positive CSS pixel number; thickness for frames/dividers, height for whole images |
| `format` | `auto` | `svg`, `webp`, `png`, or `auto`; auto selects SVG for six floral vectors, WebP for painted artwork |
| `pixelRatio` | 2 | Positive raster density multiplier; deterministic across browser/server |
| `assetsBase` | Version-pinned CDN | Absolute http(s) public URL or root-relative path such as `/ornaments/` |
| `orientation` | `original` | Divider only: `original`, `horizontal`, or `vertical` |
| `length` | Horizontal `100%`, vertical 256 | Divider only: available pixel number or positive CSS length/percentage |
| `alt` | Empty | Whole image only: meaningful text when the image conveys content |

`length` accepts ordinary positive units such as `%`, `px`, `rem`, `em`, `vw`,
`vh`, `svh`, `dvh`, and `ch`. Expressions such as `calc()` are outside the shared
validated contract; use a containing element of the desired size and `100%`.

The default divider direction comes from the selected design. Changing to
horizontal or vertical automatically switches between original and rotated
assets. Changing the design while keeping `orientation="horizontal"` keeps the
divider horizontal even if the new artwork was originally vertical.

The library uses each design's actual slice/repeat geometry. Frames fit whole
units with `round`. Dividers retain their proportions and paint complete,
contiguous sections centered in the available length. If one section cannot
fit, none is painted. This uses the existing CSS `round()` contract; older
browsers fall back to fitting whole units by adjusting their length. Keep a
divider's `::before` available for the artwork. See [USAGE.md](../USAGE.md) for
artwork-specific geometry and adaptations.

## Vanilla JavaScript

```js
import { createFrame, createDivider, createOrnamentImage } from '@ranx729/medieval-ornaments';
import '@ranx729/medieval-ornaments/styles.css';

const frame = createFrame(document.querySelector('#card'), {
  design: 'red-berry-vine', size: 33
});
const divider = createDivider(document.querySelector('#divider'), {
  design: 'plate-02-stepped-ribbon' // Originally vertical; no orientation needed.
});
const image = createOrnamentImage(document.querySelector('#flourish'), {
  design: 'floral-bird-panel-blue', size: 128, alt: ''
});

divider.update({ orientation: 'horizontal', length: '100%' });
// Later, changing design retains the requested orientation:
divider.update({ design: 'red-rosette-vine' });

// On route teardown:
frame.destroy(); divider.destroy(); image.destroy();
```

Frames/dividers require HTML container elements such as `div` or `article`.
Whole images require an existing `img`. Children are never moved/recreated.
Your input values and unrelated classes/styles remain intact.

Controllers expose `element`, `configuration`, `update(partialOptions)`, and
`destroy()`. Updates are synchronous and validate before changing the element.
Setting an option to `undefined` resets it to its default. `destroy()` is
idempotent and restores prior owned values; an external edit to an owned
attribute/style after the last update is retained. Updating a destroyed
controller throws. One controller may be attached to an element at a time.

For images, attach native `load`/`error` handlers before creating the controller,
or use `img.decode()`. Frames/dividers use CSS backgrounds and do not provide a
synthetic image-loading event. Inspect `configuration.asset` for the selected
URL, dimensions, format, and `resolutionLimited` flag.

## React

```jsx
import { OrnamentFrame, OrnamentDivider, OrnamentImage } from '@ranx729/medieval-ornaments/react';
import '@ranx729/medieval-ornaments/styles.css';

function GardenCard() {
  return <>
    <OrnamentFrame design="red-berry-vine" size={33} className="card">
      <h2>Notes from the garden</h2>
      <YourForm />
    </OrnamentFrame>
    <OrnamentDivider design="plate-02-stepped-ribbon" />
    <OrnamentDivider design="plate-02-stepped-ribbon" orientation="horizontal" length="100%" />
    <OrnamentImage design="floral-bird-panel-blue" size={128} loading="lazy" />
  </>;
}
```

The wrapper supports React 18/19, refs to real DOM elements, `className`, `style`,
native attributes, and native image load/error handlers. Frames accept children.
Dividers and images do not. Image sources, dimensions and geometry are controlled
through the library options; do not pass `src`, `srcSet`, `width`, or `height`.
Use `size` for image height. A divider is decorative (`aria-hidden`) by default;
React callers can override that attribute when providing their own semantics.

React renders ordinary elements directly. It preserves content/input nodes when
artwork props change, supports Strict Mode, and works with server rendering and
hydration. Pass identical options and `assetsBase` on server and client. No
browser globals or image requests are used while resolving/rendering on the
server. The React entry is marked `use client` for environments that require it.

Reserved CSS properties (`--ornament-size`, `--ornament-image`, slice, ratio,
length) are managed by the library. Frame padding, text, backgrounds, spacing,
and application layout are yours. Avoid overriding the frame border geometry
or divider pseudo-element; no rounded clipping of ornate frames is promised.

## Finding designs

```js
import { findOrnaments, getOrnament, ornaments } from '@ranx729/medieval-ornaments';

const frames = findOrnaments({ use: 'frame', categories: ['floral'] });
const birds = findOrnaments({ use: 'image', subjects: ['bird'] });
const gold = findOrnaments({ query: 'gold', colors: ['gold'] });
const item = getOrnament('plate-02-stepped-ribbon');
console.log(item.uses, item.formats, item.repeat_axis);
```

Results are alphabetical. Array filters require all supplied values to match;
query words are case-insensitive and match name, description, categories,
subjects, and colors. Catalog entries are deeply frozen. Importing them does not
download artwork. `getOrnament()` throws on unknown names.

The package's `/catalog.json` export includes supported `uses` and `formats` in
addition to the existing selection metadata. Advanced integrations can call
`resolveOrnament('divider', options)` to obtain normalized styles, attributes,
and a selected asset without modifying the DOM.

## Image sizes and formats

Raster selection uses actual catalog dimensions and the target size times
`pixelRatio`, not guessed folder names. For frames, the atlas slice determines
the required source resolution; for dividers, the repeat ratio does. The
smallest sufficient variant is selected. If the master is too small, it is used
and `configuration.asset.resolutionLimited` is true. Displaying larger artwork
does not create additional detail; no enlarged raster exports are generated.

The default density is 2 to keep initial server/client output stable. Pass a
different `pixelRatio` explicitly, or update vanilla options to
`window.devicePixelRatio` after mounting if needed. For React SSR, do not change
the initial density based on `window` during hydration.

SVG is genuinely scalable geometry. Numbered SVGs are approximate color traces;
they do not recover missing detail. Painted PNG/WebP retain the source
appearance, and their pairs are lossless. The five extracted panels have no
SVG. Requesting an unsupported format or use throws a useful error.

## CDN or self-hosting

By default, image URLs use the exact installed package version:

```text
https://cdn.jsdelivr.net/npm/@ranx729/medieval-ornaments@0.1.0/
```

Only selected images are requested; the image collection is not embedded in
your JavaScript bundle. This mode requires access to that CDN and an appropriate
`img-src` policy. Install updates to obtain new artwork; URLs do not follow
`latest` or the repository's main branch.

For local/offline assets:

```sh
npx medieval-ornaments copy-assets public/ornaments
# Or copy just the designs you use, with all their components and sizes:
npx medieval-ornaments copy-assets public/ornaments \
  --design red-berry-vine --design floral-bird-panel-blue
```

Then pass `assetsBase: '/ornaments/'` or `<OrnamentFrame assetsBase="/ornaments/" .../>`.
For an application deployed at `/garden/`, use `/garden/ornaments/`. A filesystem
destination and a public URL are different: supply your application's actual
public path. Relative paths such as `./ornaments/` are rejected because CSS
image URLs would otherwise resolve against the stylesheet instead of the page.

The copy command also includes shared CSS, rights notices, and a filtered
`catalog.json`. `--format webp`/`png`/`svg` copies just one format; request that
same format in the application, since `auto` may choose another. SVG-only
copying requires selecting designs that have SVG. The command does not remove
unrelated existing files and refuses to overwrite the installed package.

Direct asset imports are exported too, e.g.
`@ranx729/medieval-ornaments/webp/128/floral-bird-panel-blue.webp`. Their handling
depends on the application's bundler. The standard component path does not
depend on bundler-specific dynamic asset imports.

## Native browser modules, no bundler

Download the [browser ZIP](https://adrian729.github.io/medieval-ornaments/medieval-ornaments-browser.zip)
and serve it over HTTP. It includes a self-hosted vanilla example. Or copy the
package's `lib/`, artwork folders, and `ornaments.css` to your static site:

```html
<link rel="stylesheet" href="/vendor/ornaments/ornaments.css">
<script type="module">
  import { createDivider } from '/vendor/ornaments/lib/index.js';
  createDivider(document.querySelector('#divider'), {
    design: 'red-berry-vine', assetsBase: '/vendor/ornaments/'
  });
</script>
```

Native modules need HTTP serving, not opening the page with `file://`.

## Examples and development

- [Vanilla example](https://adrian729.github.io/medieval-ornaments/examples/vanilla/)
- [React example](https://adrian729.github.io/medieval-ornaments/examples/react/)
- [Categorized design browser](https://adrian729.github.io/medieval-ornaments/examples/)

In a checkout, `npm ci`, then `npm run build`. Serve the checkout over HTTP for
the native example. For the React source example, run
`npx vite examples/react` (images default to the pinned CDN), or
`npm run build:browser` to build the self-hosted Pages example and browser ZIP.
Consumers do not need Python; artwork maintenance is a separate workflow.

Before release:

```sh
npm ci
npm run build
npm test
npm run test:types
npm run test:integration
npm run build:browser
npm pack
```

Integration checks install a real archive into independent consumers and use
Chromium (`CHROME_BIN` overrides the executable). See repository QA.md for the
recorded coverage and limitations. Regenerate catalog/types after artwork
changes and bump the package version before publishing. Rebuild before
publishing so CDN URLs pin the new version. `npm publish --access public` runs
the package metadata build via `prepack`; complete validations beforehand.
