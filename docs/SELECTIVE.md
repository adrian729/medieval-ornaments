# Use only the ornaments you need

Since 0.5.0, choose either individual npm imports or the `add` command. Both use
the same geometry, resolution selection, loading behavior and TypeScript types
as the full API. Runtime 0.6.1 retains artwork revision 0.4.0, including the merged
illustrations. See [illustration and agent selection guidance](ILLUSTRATIONS.md).

| Workflow | Component code | Artwork |
| --- | --- | --- |
| Individual imports | Your bundler includes chosen designs and shared helpers | Browser requests the selected image from the pinned CDN; self-hosting is optional |
| `add` | Copies chosen components and shared helpers into your project; you can edit them | Downloads only chosen designs/formats into your public directory |
| Full API | Includes all 111 designs for runtime selection/search | Browser still requests only displayed images |

The small runtime npm package contains all individual modules. npm installs the
package as a unit; individual imports reduce your application bundle. Installing
the optional **asset package** explicitly installs the entire roughly 341 MB artwork
through two archives: borders/decorations and its pinned illustration dependency.
For illustration-only offline work, install
`@ranx729/medieval-ornaments-illustration-assets@0.1.0` instead.
This split does not affect selective imports or downloads.
Neither of the first two workflows requires that archive. There are no
install-time artwork downloads.

## Individual React imports

Install the runtime in your React application:

```sh
npm install @ranx729/medieval-ornaments
```

Import a repeating design by name. Its `OrnamentFrame` and `OrnamentDivider`
already select that design, so omit `design`. Styled React imports include CSS.

```jsx
import {
  OrnamentFrame,
  OrnamentDivider,
} from '@ranx729/medieval-ornaments/react/red-berry-vine';

export function Card() {
  return (
    <OrnamentFrame size={33}>
      <h2>A decorated card</h2>
      <OrnamentDivider orientation="horizontal" length="100%" />
      <p>Your content stays ordinary React content.</p>
    </OrnamentFrame>
  );
}
```

Whole decorations and illustrations export `OrnamentImage`. They do not export frame/divider
components. Alias components when using multiple designs:

```jsx
import { OrnamentDivider as BerryDivider }
  from '@ranx729/medieval-ornaments/react/red-berry-vine';
import { OrnamentImage as Bellflowers }
  from '@ranx729/medieval-ornaments/react/gold-scroll-with-blue-bellflowers';

export function Decoration() {
  return <>
    <BerryDivider size={24} loading="lazy" />
    <Bellflowers size={128} alt="" loading="lazy" decoding="async" />
  </>;
}
```

Shared helpers and CSS are bundled once. Importing a design performs no artwork
request; rendering chooses its image. Explicit `format="svg"` uses an available
vector alternative; painted designs and illustrations default to lossless WebP.
SVG traces can be larger than raster files. A size selects a pre-generated raster
variant; no enlarged exports are generated. If the requested display resolution
exceeds the master, the resolver uses it and reports `asset.resolutionLimited`.
Displaying it larger cannot add detail. See [all options](INTEGRATION.md#shared-contract).

### SSR and TypeScript

For ordinary Node SSR, use `/react/unstyled/<name>` to avoid importing CSS into
Node. Load CSS once in the browser/bundler entry:

```jsx
// Server and hydration component:
import { OrnamentDivider }
  from '@ranx729/medieval-ornaments/react/unstyled/red-berry-vine';

// Browser entry only:
import '@ranx729/medieval-ornaments/styles.css';
```

React 18 and 19 are supported. Refs, HTML attributes, frame children, deterministic
SSR and opt-in lazy loading work on individual imports. Type declarations resolve
automatically. A different `design` name, image-only options on dividers, or a
frame import from a whole decoration fails type checking. JavaScript receives
the same validation. An individual import cannot switch to another design;
choose another imported component or use the full API for dynamic selection.

## Individual vanilla imports

```js
import { createDivider, createFrame, ornament, resolveOrnament }
  from '@ranx729/medieval-ornaments/designs/red-berry-vine';
import '@ranx729/medieval-ornaments/styles.css';

const frame = createFrame(document.querySelector('#card'), { size: 33 });
const divider = createDivider(document.querySelector('#divider'), {
  orientation: 'vertical',
  length: 300,
  loading: 'lazy',
});
divider.update({ orientation: 'horizontal', length: '100%' });
console.log(ornament.description, resolveOrnament('frame').asset.url);

// When removing this part of your application:
divider.destroy();
frame.destroy();
```

Whole-design imports provide `createOrnamentImage(img, options?)`, `ornament` and
`resolveOrnament('image', options?)`. Options are optional on bound functions.
Updates preserve content/state; invalid updates leave the current element intact.
Vanilla requires no React. For native browser modules, link `ornaments.css` and
import `lib/designs/<name>.js` from the browser ZIP or your own hosted runtime.

### Self-host individual npm imports

Copy selected files without installing the full asset archive:

```sh
npx --no-install medieval-ornaments copy-assets public/ornaments \
  --design red-berry-vine --format svg
```

Pass `assetsBase="/ornaments/"` in React, or `{ assetsBase: '/ornaments/' }` in
vanilla. This is the **public URL**, not the filesystem directory. If you copied
only SVG for a painted design, also pass `format: 'svg'`: npm metadata describes
every original format and cannot detect your server's files. `add` below instead
filters its local metadata to the formats actually installed.

## Add editable local components and artwork

Run this from your application's root. The examples pin the generator version
so another developer can reproduce the same source:

```sh
npx @ranx729/medieval-ornaments@0.6.1 add \
  red-berry-vine gold-scroll-with-blue-bellflowers
```

This works without installing the runtime as an application dependency. React
applications must have their own React dependency. The default React output is:

```text
src/ornaments/
  red-berry-vine.js                 # styled frame/divider exports
  red-berry-vine.d.ts
  red-berry-vine.unstyled.js         # Node SSR exports
  gold-scroll-with-blue-bellflowers.js
  ornaments.css
  styles.d.ts
  lib/                             # selected metadata + shared implementation
  package.json                     # private ESM marker; retains CSS side effects
  installation.json                # versions, hosting config, selected formats/hashes
  LICENSE
  ASSET-RIGHTS.md
public/ornaments/
  svg/                             # selected vector reconstruction
  webp/                            # selected painted decoration and size variants
  catalog.json                      # only installed designs/formats
  ornaments.css
  LICENSE
  ASSET-RIGHTS.md
```

Import relative to your component file; these paths assume it is directly under
`src/`:

```jsx
import { OrnamentFrame, OrnamentDivider }
  from './ornaments/red-berry-vine.js';
import { OrnamentImage }
  from './ornaments/gold-scroll-with-blue-bellflowers.js';

export function Card() {
  return <OrnamentFrame size={33}>
    <OrnamentDivider />
    <OrnamentImage size={128} alt="" />
  </OrnamentFrame>;
}
```

The copied components default to `/ornaments/`; you do not need an `assetsBase`
prop. You can override it per instance. Node SSR imports
`./ornaments/red-berry-vine.unstyled.js` and the browser entry imports
`./ornaments/ornaments.css`. Keep the copied files together, including the private
package marker and declarations. No import references this npm runtime package.

For vanilla code:

```sh
npx @ranx729/medieval-ornaments@0.6.1 add red-berry-vine --framework vanilla
```

```js
import { createDivider } from './ornaments/red-berry-vine.js';
import './ornaments/ornaments.css'; // Bundler entry; native HTML can link this file.
const divider = createDivider(document.querySelector('#divider'));
```

### Installer options

| Flag | Default | Purpose |
| --- | --- | --- |
| `--out` | `src/ornaments` | Component directory, relative to the current working directory |
| `--assets` | `public/ornaments` | Artwork directory; your framework must serve it |
| `--assets-base` | `/ornaments/` | Public http(s) URL or root-relative URL baked into copied components |
| `--framework` | `react` | `react` or `vanilla` |
| `--format` | `auto` | `auto`, `svg`, `png`, `webp`, or `all` |
| `--from` | Matching installed asset package, otherwise pinned CDN | Local directory or http(s) mirror containing the trusted manifest and asset paths |
| `--offline` | Off | Require local artwork and make no artwork network requests |
| `--overwrite` | Off | Explicitly replace differing existing generated files/artwork |

`auto` installs SVG for the six vector reconstructions and WebP for painted
designs and illustrations. It copies the chosen format's size variants, original/rotated tiles,
frame atlas, corners and reference components when available. Unselected designs
and formats are omitted. The local types and resolver reject formats you did not
install. `all` preserves all available format alternatives; explicit SVG fails
for a design with no vector alternative.

Each asset is checked against the pinned manifest's SHA-256 and byte count.
Downloads stream four files at a time. A download failure leaves no completed
component installation; already verified artwork files can be reused on retry.

### Custom directories and deployment paths

For an application deployed at `/my-app/`:

```sh
npx @ranx729/medieval-ornaments@0.6.1 add red-berry-vine \
  --out src/ui/ornaments \
  --assets public/ornaments \
  --assets-base /my-app/ornaments/
```

Import from the chosen `--out` directory. The installer does not infer your
public URL from a disk path or configure your web server. For a CDN, use e.g.
`--assets-base https://static.example.com/ornaments/` and upload the asset folder
with its paths preserved. Serve suitable content types and allow images from
that origin in your application's CSP. Source and artwork directories must be
separate and outside the installed runtime/artwork source directories.

### Add another design, edit, update or remove

Re-run the same pinned generator with another design name and the same directory,
framework and hosting options. It merges the installed design list/catalog and
reuses shared helpers. Previously installed designs and shared helpers retain edits when adding other designs.
Re-adding an edited design protects its differing files; the error names
the file. Review or move your edits before using `--overwrite`, which regenerates
the installed modules and replaces differing requested artwork. Requesting another format
for an existing design extends its installed formats; use `--overwrite` for the
metadata/type files that change. Unrelated files are retained.

You own the copied source. Installing a newer runtime does not update it. For a
new generator version or hosting configuration, generate into fresh directories,
compare the output, and merge your edits deliberately. The installer rejects a
mixed-version/configuration source directory, including with `--overwrite`.
Keep the corresponding artwork revision's files together; later code-only
versions may still use the same artwork revision. Commit the copied source,
artwork and `installation.json` to make builds reproducible.

There is no automatic removal command. For a full uninstall, remove the dedicated
`--out` and `--assets` folders after removing their imports. To remove one design
while retaining others, regenerate the remaining names into fresh directories
and merge your edits; this avoids deleting assets still in use.

### Offline use

For a fully local invocation, install the generator and full optional archive
while connected, then run the installed CLI:

```sh
npm install --save-dev @ranx729/medieval-ornaments@0.6.1
npm install --save-dev @ranx729/medieval-ornaments-assets@0.4.0
npx --no-install medieval-ornaments add red-berry-vine --offline
```

This explicitly installs both artwork archives. For illustrations alone, install
`@ranx729/medieval-ornaments-illustration-assets@0.1.0` instead and use a name such
as `flying-pig`. Alternatively, `--from /path/to/mirror
--offline` uses a local mirror containing the exact `assets-manifest.json` and
the selected artwork paths from that revision. The source repository qualifies.
A filtered `copy-assets` output is a hosting folder, not such a mirror: it does
not include the trusted manifest. `--offline` controls artwork requests; ensure
the pinned generator is installed/cached too, since `npx` itself may need npm.

## Discovery and the full API

Find names in the [design browser](https://adrian729.github.io/medieval-ornaments/examples/)
or import the optional full catalog for a picker:

```js
import { ornaments, findOrnaments, getOrnament }
  from '@ranx729/medieval-ornaments/catalog';
const frames = findOrnaments({ use: 'frame', categories: ['floral'] });
```

Use `/catalog/borders`, `/catalog/decorations` or `/catalog/illustrations` to
include only a content type's metadata. These export the same discovery functions;
they do not import the aggregate catalog, React, rendering helpers or images.
`findOrnaments` supports `assetType`, `hasTransparency`, `facing` and `composition`
as well as the original filters. Descriptions and usage notes retain the visual
detail and limitations needed for an agent to choose an asset without guessing.

Importing `/catalog`, the root API, or the generic `/react` entry includes all
design metadata. These remain supported for runtime switching; their `design`
option is required. An individual design's `ornament` export provides metadata
without full discovery. Use direct import paths; constructing a broad dynamic
import/glob or re-exporting every design can make a bundler include the full set.

In the reproducible Vite fixture (`npm run audit:selective`), one bound React
divider uses about **4.7 KB gzip** of library JavaScript versus **47 KB** through
the full API, with React external. Both retain **473 B gzip** of shared CSS.
The flying-pig React fixture uses about **4 KB gzip**. Three-design packed
consumers (border, decoration, illustration) include three metadata modules and
one resolver. The scoped illustration discovery fixture includes only 41 entries.
Your application, chosen design metadata, React and image bytes are additional
variables. See [performance details](PERFORMANCE.md).

The integration software license and artwork rights stay separate. Keep the
copied notices; installation does not grant additional rights to source artwork.
