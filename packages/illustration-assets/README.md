# Medieval illustration assets

Optional PNG and lossless WebP artwork for the 41 manuscript illustrations in
`@ranx729/medieval-ornaments@0.6.1`. Includes all 406 original masters/variants,
with their bytes preserved. Read ASSET-RIGHTS.md for artwork rights.

```sh
npm install @ranx729/medieval-ornaments@0.6.1
npm install --save-dev @ranx729/medieval-ornaments-illustration-assets@0.1.0
npx --no-install medieval-ornaments copy-assets public/ornaments --design flying-pig --offline
```

The data archive does not provide the CLI; the runtime install does.
Serve `public/ornaments/` at `/ornaments/` and pass `assetsBase: '/ornaments/'`
when rendering the copied image. Copying alone does not change the default CDN URL.

For direct bundler imports:

```js
import pig from '@ranx729/medieval-ornaments-illustration-assets/webp/256/flying-pig.webp';
```

Ordinary component imports need no artwork-package installation. The runtime
requests only selected files from this package's version-pinned CDN. `add` also
downloads only selected designs and formats; it does not install either archive.

This package has no dependencies. Installing the full optional
`@ranx729/medieval-ornaments-assets@0.4.0` also installs this exact version.
`catalog.json` contains illustration metadata; `assets-manifest.json` is the
same unified, checksum-pinned manifest carried by the full artwork package.
Maintainers stage both archives with `npm run build:assets`; staging never
regenerates artwork. See the
[illustration guide](https://github.com/adrian729/medieval-ornaments/blob/main/docs/ILLUSTRATIONS.md)
for agent selection, React/vanilla usage, sizing, local installation and maintenance.
