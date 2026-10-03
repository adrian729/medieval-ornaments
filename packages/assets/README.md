# Medieval ornament assets

This optional package contains the complete approved SVG, PNG and lossless WebP
collection for [`@ranx729/medieval-ornaments`](https://www.npmjs.com/package/@ranx729/medieval-ornaments).
Artwork revision **0.3.2** retains all 70 designs and 1383 asset files unchanged.
Artwork rights are separate from integration software: read ASSET-RIGHTS.md.

Ordinary component usage needs only the lightweight runtime. It requests
selected images from this package's version-pinned CDN; it does not install
or download the full archive. To self-host just the designs you need:

```sh
npx @ranx729/medieval-ornaments copy-assets public/ornaments \
  --design red-berry-vine --format webp
```

For the complete offline collection:

```sh
npm install --save-dev @ranx729/medieval-ornaments-assets@0.3.2
npx medieval-ornaments copy-assets public/ornaments --offline
```

The archive is approximately 180 MB compressed / 420 MB unpacked. Installing it
is optional. The runtime is not a dependency of this data-only package, and this
package is not a dependency of the runtime. Direct bundler imports move here:

```js
import bird from '@ranx729/medieval-ornaments-assets/webp/128/floral-bird-panel-blue.webp';
```

`catalog.json` retains components, actual dimensions, variants and capabilities;
`assets-manifest.json` records exact bytes and SHA-256 hashes. Paths inside the
collection remain unchanged. See the repository's integration guide for sizing,
formats, SSR, migration, and public asset URLs.

Maintainers stage this package from the repository with `npm run build:assets`.
Artwork generation is a separate audited workflow; staging only verifies and
copies existing files into ignored `dist/medieval-ornaments-assets/`.
