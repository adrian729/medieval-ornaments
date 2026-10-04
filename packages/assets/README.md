# Medieval ornament assets

This optional install provides the complete approved SVG, PNG and lossless WebP
collection for [`@ranx729/medieval-ornaments`](https://www.npmjs.com/package/@ranx729/medieval-ornaments).
Artwork revision **0.4.0** contains 111 designs and 1789 asset files: 56 borders, 14 whole decorations and 41 illustrations. The original 70 designs retain their artwork bytes.
Artwork rights are separate from integration software: read ASSET-RIGHTS.md.

Ordinary component usage needs only the lightweight runtime. It requests
selected borders/decorations from this package's version-pinned CDN and
illustrations from their own archive's CDN; it does not install
or download the full archive. To self-host just the designs you need:

```sh
npx @ranx729/medieval-ornaments@0.6.1 copy-assets public/ornaments \
  --design red-berry-vine --format webp
```

For the complete offline collection:

```sh
npm install @ranx729/medieval-ornaments@0.6.1
npm install --save-dev @ranx729/medieval-ornaments-assets@0.4.0
npx --no-install medieval-ornaments copy-assets public/ornaments --offline
```

The complete optional install is approximately 341 MB compressed / 581 MB unpacked,
split between this border/decoration archive and its pinned illustration dependency.
The split keeps each npm upload below the registry's payload limit. Installing it is optional.
Illustrations can also be installed independently, without the borders archive.
The runtime is not a dependency of either data package; neither is a dependency
of the runtime. Existing border/decoration bundler imports remain here; illustration imports use
`@ranx729/medieval-ornaments-illustration-assets`:

```js
import bird from '@ranx729/medieval-ornaments-assets/webp/128/floral-bird-panel-blue.webp';
import pig from '@ranx729/medieval-ornaments-illustration-assets/webp/256/flying-pig.webp';
```

`catalog.json` retains components, actual dimensions, variants and capabilities;
`assets-manifest.json` records exact bytes and SHA-256 hashes. Paths inside the
collection remain unchanged. See the repository's integration guide for sizing,
formats, SSR, migration, and public asset URLs.

Serve the copied directory at `/ornaments/` and pass `assetsBase: '/ornaments/'`
to components. The destination directory is not a public URL, and copying files
does not change the default CDN URLs. See the
[integration guide](https://github.com/adrian729/medieval-ornaments/blob/main/docs/INTEGRATION.md).

Maintainers stage this package from the repository with `npm run build:assets`.
Artwork generation is a separate audited workflow; staging only verifies and
copies existing files into ignored `dist/medieval-ornaments-assets/`.
