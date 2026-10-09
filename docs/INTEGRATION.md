# Integrating medieval ornaments

Install the package:

```sh
npm install @ranx729/medieval-ornaments
```

The core has no runtime dependencies. React is an optional peer dependency.
Use ESM imports with a bundler, or native browser modules as described below.
Since 0.4.0 the runtime contains JavaScript, CSS, TypeScript declarations and the
catalog, without the large artwork archive. Normal installs do not download
artwork or install the optional `@ranx729/medieval-ornaments-assets` package.
Components fetch selected images from the independently pinned asset CDN by
default. **For chosen designs, individual imports with default CDN delivery are
the recommended setup.** Leave `assetsBase` unset: no local image files are
created and no `add`, `copy-assets` or artwork-package install is required.
Self-hosting and offline workflows are deliberate alternatives described below.

| Package | Contains | When to install |
| --- | --- | --- |
| `@ranx729/medieval-ornaments@0.8.1` | JS/React, CSS, types, discovery metadata and CLI; no artwork | Component imports or the installed CLI |
| `@ranx729/medieval-ornaments-assets-borders-001@0.1.3` | All current border exports/sizes; no runtime or dependency | Selected border offline files |
| `@ranx729/medieval-ornaments-assets-decorations-001@0.1.3` | All current whole-decoration exports/sizes; no runtime | Selected decoration offline files |
| `@ranx729/medieval-ornaments-assets-illustrations-001@0.1.3` | All current illustration exports/sizes; no runtime | Selected illustration offline files |
| `@ranx729/medieval-ornaments-illustration-assets@0.1.0` | Compatibility snapshot of 41 illustrations and PNG/WebP sizes; no runtime | Illustration-only offline files or direct bundler image imports |
| `@ranx729/medieval-ornaments-assets@0.4.0` | Compatibility snapshot of border/decoration files; depends on the exact legacy illustration archive | The entire collection for offline use |

Installing an artwork archive does not install the runtime/CLI. The full optional
install totals roughly 341 MB compressed; use individual imports or `add` for
selected designs. Import paths determine bundled metadata, while rendering
determines image requests. Installing either archive alone does not change
component URLs: copy files to a served folder and set `assetsBase` to self-host.
The software license excludes artwork: see [LICENSE](../LICENSE).

## Choose an import workflow

For fixed designs, prefer `@ranx729/medieval-ornaments/react/<name>` or
`@ranx729/medieval-ornaments/designs/<name>` (since 0.5.0). They bundle only the
chosen metadata and shared helpers, and omit the `design` option. `add <name>...`
can instead copy editable component code and selected artwork into your project.
For agents, keep images on the default CDN unless the application already
self-hosts, needs editable/offline assets, explicitly chooses another host or
has a measured delivery issue. Individual imports minimize JS; CDN delivery
minimizes deployed files. Self-hosting selected files can give faster first
delivery by avoiding external connections and cold CDN misses; use the
[performance guidance](PERFORMANCE.md) to assess that separate tradeoff.
The [selective usage guide](SELECTIVE.md) covers both workflows, local defaults,
format selection, public URLs, offline use, TypeScript, SSR and updates.

The generic API below supports dynamic names, with the full catalog in its
bundle. It remains compatible with earlier releases. Import `/catalog` explicitly
when you want the full discovery API.

Since 0.6.0, `/catalog/borders`, `/catalog/decorations` and `/catalog/illustrations`
provide discovery with only that type's metadata. Illustrations use the existing
whole-image components and per-design import paths. Descriptions, subject tags,
facing, composition, measured transparency and usage notes support autonomous
selection; see [the illustration guide](ILLUSTRATIONS.md).

## Shared contract

React's `/react` entry includes the shared stylesheet automatically. For vanilla
JavaScript, import `@ranx729/medieval-ornaments/styles.css` once in your application's entry point.
All designs use the same three components/functions:

| Use | React | Vanilla | Designs |
| --- | --- | --- | --- |
| Frame around content | `OrnamentFrame` | `createFrame` | 58 repeat designs |
| Repeating divider | `OrnamentDivider` | `createDivider` | 58 repeat designs |
| Decoration or illustration | `OrnamentImage` | `createOrnamentImage` | 24 decorations and 55 illustrations |

The catalog has 137 designs. Version 0.3.0 added 21 source designs, including
three grid-paper stencils with retained backgrounds. Version 0.6.0 adds the 41
illustrations while preserving all existing artwork bytes and component geometry.

In the generic API, only `design` is required. Individual imports are already bound
to one design and omit that option. No default ornament is chosen for you. A whole
corner/panel is an image, not a source of seamless frame pieces. Reference
crops and individual corners are advanced assets available in the catalog.

| Option | Default | Meaning |
| --- | --- | --- |
| `design` | Required | Stable catalog name; TypeScript narrows names by supported use |
| `size` | Frame 32, divider 24, image 256 | Positive CSS pixel number; thickness for frames/dividers, height for whole images |
| `format` | `auto` | `svg`, `webp`, `png`, or `auto`; auto selects SVG for six floral vectors, WebP for painted artwork |
| `pixelRatio` | 2 | Positive raster density multiplier; deterministic across browser/server |
| `assetsBase` | Version-pinned CDN | Absolute http(s) public URL or root-relative path such as `/ornaments/` |
| `loading` | `eager` | Optional `lazy` artwork loading; native for whole images, shared viewport observer for frames/dividers |
| `orientation` | `original` | Divider only: `original`, `horizontal`, or `vertical` |
| `length` | Horizontal `100%`, vertical 256 | Divider only: available pixel number or positive CSS length/percentage |
| `alt` | Empty | Whole image only: meaningful text when the image conveys content |
| `decoding` | `auto` | Whole image only: native `auto`, `async`, or `sync` decode hint |
| `fetchPriority` | `auto` | Whole image only: native `auto`, `high`, or `low` fetch hint |

Frame/divider lazy loading, validated vanilla image hints and automatic image
dimension reservation are available in 0.4.0.

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

No separate CSS import is needed: your bundler handles the component entry's
stylesheet import in development and production. Existing explicit imports of
`/styles.css` can be removed.

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
server. Both React entries are marked `use client` for environments that require it.

For plain Node SSR (which cannot import CSS), or when your application manages
the stylesheet centrally, use the same components from the CSS-free entry:

```jsx
import { OrnamentFrame, OrnamentDivider, OrnamentImage } from '@ranx729/medieval-ornaments/react/unstyled';
```

Load `/styles.css` once in the browser entry or link the self-hosted
`ornaments.css` from the HTML document. The unstyled entry renders identical
elements; it only omits the stylesheet import. The browser can hydrate these
elements using either React entry. For Vite SSR with the default styled entry,
set `ssr.noExternal: ['@ranx729/medieval-ornaments']` so Vite processes its CSS
import; see [Vite's SSR guide](https://vite.dev/guide/ssr.html#ssr-externals).

Reserved CSS properties (`--ornament-size`, `--ornament-image`, slice, ratio,
length) are managed by the library. Frame padding, text, backgrounds, spacing,
and application layout are yours. Avoid overriding the frame border geometry
or divider pseudo-element; no rounded clipping of ornate frames is promised.

## Performance options

Choose lazy loading for artwork below the fold, and keep prominent artwork
eager. The same option works in both APIs:

```jsx
<OrnamentFrame design="red-berry-vine" loading="lazy"><YourContent /></OrnamentFrame>
<OrnamentDivider design="plate-02-stepped-ribbon" loading="lazy" />
<OrnamentImage design="gold-scroll-with-blue-bellflowers" size={96}
  loading="lazy" decoding="async" fetchPriority="low" />
```

```js
createFrame(element, { design: 'red-berry-vine', loading: 'lazy' });
createOrnamentImage(img, {
  design: 'gold-scroll-with-blue-bellflowers', size: 96,
  loading: 'lazy', decoding: 'async', fetchPriority: 'low'
});
```

Frames/dividers retain their dimensions, borders and children immediately,
but omit the artwork URL until they intersect the viewport plus a 200px margin.
One observer per window serves all pending decorations and releases targets
after loading or teardown. Changing pending artwork loads the latest design;
switching to eager activates it immediately. Activated artwork stays active
when scrolling away. Browsers without `IntersectionObserver` load it eagerly.
Lazy CSS artwork requires client JavaScript; lazy SSR markup contains the
content/geometry and activates after hydration. Native image lazy loading uses
the browser's own distance threshold rather than the library's 200px margin.

Whole images include source width/height attributes to reserve their proportions
before decoding. Continue using `size` to control display height. `decoding`
and `fetchPriority` are browser hints, not guarantees or CSS background options.
For prominent whole-image artwork, use `loading="eager"` and optionally
`fetchPriority="high"`; avoid lazily loading the page's main image.

Keep `format="auto"` for source artwork: detailed traces can be tens of MB,
whereas selected lossless WebP variants are much smaller. The six floral
vectors retain their scalable SVG default. Self-host only the designs/formats
you use, compress text assets, and cache versioned URLs. See the measured
[performance audit](PERFORMANCE.md) for bundle, image, rendering, package-size,
and caching findings and the reproducible audit command.

## Finding designs

```js
import { findOrnaments, getOrnament, ornaments } from '@ranx729/medieval-ornaments/catalog';

const frames = findOrnaments({ use: 'frame', categories: ['floral'] });
const birds = findOrnaments({ use: 'image', subjects: ['bird'] });
const gold = findOrnaments({ query: 'gold', colors: ['gold'] });
const item = getOrnament('plate-02-stepped-ribbon');
console.log(item.uses, item.formats, item.repeat_axis);
```

Results are alphabetical. Array filters require all supplied values to match;
all query words must match, case-insensitively, across name, description,
categories, subjects, colors, type, facing, composition and usage notes.
Catalog entries are deeply frozen. Importing them does not
download artwork. `getOrnament()` throws on unknown names.

The package's `/catalog.json` export includes supported `uses` and `formats` in
addition to the existing selection metadata. Advanced integrations can call
`resolveOrnament('divider', options)` to obtain normalized styles, attributes,
and a selected asset without modifying the DOM.

## Image sizes and formats

PNG/WebP files are generated ahead of time, not when a component requests a
size. Available smaller variants have longest-edge limits of 128, 256, 512 and
768px, plus the native master. Limits at or above the master size are skipped.
Each smaller image is resized directly from its master; PNG and WebP pairs are
lossless equivalents.

Raster selection uses actual catalog dimensions and the target size times
`pixelRatio`, not guessed folder names. For frames, the atlas slice determines
the required source resolution; for dividers, the repeat ratio does. For whole
images, `size` is the displayed height, so wide artwork also accounts for its
width-to-height ratio. The
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

The runtime routes each design through an explicit resource assignment. Version
0.8.1 uses numbered packages at exact version 0.1.3:

| Resource | CDN base |
| --- | --- |
| Borders | `https://unpkg.com/@ranx729/medieval-ornaments-assets-borders-001@0.1.3/` |
| Decorations | `https://unpkg.com/@ranx729/medieval-ornaments-assets-decorations-001@0.1.3/` |
| Illustrations | `https://unpkg.com/@ranx729/medieval-ornaments-assets-illustrations-001@0.1.3/` |

Future collections can span several numbered repositories. Use the resolver or
`getAssetSource(name)` rather than constructing URLs from an asset type:

```js
import { getAssetSource } from '@ranx729/medieval-ornaments/resources';
const source = getAssetSource('flying-pig');
console.log(source.package, source.version, source.base);
```

This entry loads routing metadata without the design catalog. Normal rendering
includes no manifest request. Individual component entries include only their
own design and their assigned URL constant. An explicit `assetsBase` overrides
routing for a flat self-hosted collection.

`assetsPackage`, `assetsVersion`, `defaultAssetsBase`, `illustrationsPackage`,
`illustrationsVersion`, `defaultIllustrationsBase` remain **legacy compatibility
archive pins**. They no longer describe the resolver's default source; replace
such assumptions with `getAssetSource`. Runtime 0.6.1 and earlier keep their old
immutable URLs. Code-only and descriptive-metadata updates need not republish
artwork. UNPKG hosts exact npm versions; no released URL follows `latest`.

Only selected images are requested; the collection is not embedded in your
JavaScript bundle. This mode requires CDN access and an appropriate `img-src`
policy. Install a runtime update to obtain a new supported artwork revision.

To self-host selected designs without installing the complete asset archive:

```sh
npx --no-install medieval-ornaments copy-assets public/ornaments \
  --design red-berry-vine --design floral-bird-panel-blue
```

The command downloads only their cataloged files, components and sizes. With no
`--design`, it deliberately downloads the complete collection. It verifies the
pinned SHA-256 manifest, each file's byte count and checksum, streams at most
four files concurrently, and replaces each image only after verification.
Failed transfers remove temporary files; already verified files may remain,
and rerunning the command is safe. There is no install-time download hook.

For fully offline copies, first install the runtime above and the matching
artwork package while connected. The following full install includes illustrations
through an exact dependency:

```sh
npm install --save-dev @ranx729/medieval-ornaments-assets@0.4.0
npx --no-install medieval-ornaments copy-assets public/ornaments \
  --design red-berry-vine --offline
```

The command discovers the exact matching version in your project or alongside
the runtime. `--offline` makes no network requests and fails clearly if artwork
is absent. An installed different artwork revision is skipped; ordinary mode
falls back to the pinned CDN, and offline mode reports the missing revision.
You can supply a local checkout, extracted browser ZIP, or HTTP(S) mirror with
`--from <directory-or-URL>`. Mirrors must retain the pinned `assets-manifest.json`
and selected relative asset paths. Combine local `--from` with `--offline`.

Then pass `assetsBase: '/ornaments/'` or `<OrnamentFrame assetsBase="/ornaments/" .../>`.
For an application deployed at `/garden/`, use `/garden/ornaments/`. A filesystem
destination and a public URL are different: supply your application's actual
public path. Relative paths such as `./ornaments/` are rejected because CSS
image URLs would otherwise resolve against the stylesheet instead of the page.

The copy command includes shared CSS, license notice and a filtered
`catalog.json`. `--format webp`/`png`/`svg` copies just one format; request that
same format in the application, since `auto` may choose another. SVG-only
copying requires selecting compatible designs. Existing unrelated files are
retained. Destinations must be outside both installed runtime and artwork
source directories; external destination symlinks are rejected.

For illustration-only copying, replace the full archive install with
`npm install --save-dev @ranx729/medieval-ornaments-illustration-assets@0.1.0`
and select names such as `--design flying-pig`. The
[illustration guide](ILLUSTRATIONS.md#copy-only-selected-code-and-artwork) includes
a complete offline sequence. Direct image imports need only the relevant data
package and your bundler's image import convention.

### Migrating from 0.3.x

Component imports, design names, options, CSS, `assetsBase` and the copy command
retain their API. Direct image imports move to the optional artwork package:

```js
// Install the matching assets package first; Vite example:
import panelUrl from '@ranx729/medieval-ornaments-assets/webp/128/floral-bird-panel-blue.webp?url';
```

Replace the old `@ranx729/medieval-ornaments/svg/...`, `/png/...` and `/webp/...`
prefixes with `@ranx729/medieval-ornaments-assets/...`. Their handling depends on
your bundler. The standard component API needs no asset-package installation.
Offline CI must install that optional package or supply a verified local mirror;
previously the artwork was included in every runtime installation. Versions
0.3.x and their existing pinned CDN URLs remain available.

## Native browser modules, no bundler

Download the [browser ZIP](https://github.com/adrian729/medieval-ornaments/releases/download/v0.8.1/medieval-ornaments-browser.zip)
and serve it over HTTP. It includes a self-hosted vanilla example. Or copy the
runtime's `lib/` and `ornaments.css`, plus artwork copied with `copy-assets --offline`, to your static site:

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
`npm run build:react` and `npm run build:site` for CDN-backed Pages examples.
`npm run build:browser` explicitly fetches no files: prepare resource checkouts
first, then build the optional self-hosted browser ZIP. See [RESOURCES.md](RESOURCES.md).
Consumers do not need Python; artwork maintenance is a separate workflow.

Before release:

```sh
npm ci
npm run build
npm test
npm run test:types
npm run test:integration
npm run build:browser
npm run build:site
npm pack
```

Integration checks pack the runtime and both artwork distributions, install the
runtime alone, then explicitly install the full companion and verify every artwork file through offline
copying. They exercise Chromium (`CHROME_BIN` overrides the executable) and real
React 18/19 consumers. See QA.md for recorded coverage and limitations.

For a code-only or descriptive-metadata release, bump the root package/lockfile
version and retain resource pins. Run the checks and publish the tested runtime
archive. `prepack` builds metadata only and requires exact locked source commits;
it never renders, copies or downloads artwork.

For artwork changes, follow [RESOURCES.md](RESOURCES.md). Audit/regenerate only
affected designs in their assigned checkouts, approve **only changed resource
packages**, commit/push and publish them, verify registry/CDN bytes, then lock
exact source SHAs in main. Update the runtime, rebuild/test and release. Main
metadata stays authoritative; search descriptions do not force image updates.
Check actual compressed npm size and full Git history independently of current
tracked-file capacity. Source inputs stay outside npm distributions.

`build:browser` assembles a complete offline ZIP from prepared resource
checkouts. Upload it to the versioned main GitHub Release. Pages uses
`build:react` / `build:site` and pinned CDN images, without the full artwork/ZIP.
After publication, run the registry consumer tests and live site/ZIP checks:

```sh
ORNAMENTS_PACKAGE=@ranx729/medieval-ornaments@0.8.1 npm run test:integration
node tests/site.mjs
```

The optional compatibility archives at assets 0.4.0 / illustrations 0.1.0 remain
snapshots of the original 111 designs; new artwork uses numbered resources. `build:assets` stages their
approved bytes and a flat mirror; it rejects art/catalog changes under their
unchanged versions. Updating these **optional compatibility snapshots** still
requires bumping both package versions, their shared manifest, the root legacy
pins and the full archive's exact illustration dependency, then
`build:assets -- --update-manifest`. Publish illustrations before the full
companion. This coupling does not apply to numbered resource releases. Existing
snapshots remain available even when later artwork is delivered independently.

## Migration to numbered resources

See [RESOURCE-MIGRATION.md](RESOURCE-MIGRATION.md) for the 0.7.0 changes and
commands. Component APIs and design names stay stable. Raw main-branch artwork
URLs, Pages image paths and the Pages ZIP link change; use assigned immutable
CDN URLs or copy a flat self-hosted mirror. New resource packages are optional
and the main checkout contains no large export/native-input files.
