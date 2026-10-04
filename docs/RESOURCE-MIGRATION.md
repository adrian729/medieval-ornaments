# Resource repository migration

Runtime **0.7.0** introduces numbered resource packages at **0.1.0**, with the
existing artwork unchanged. See QA.md for publication and verification results.

## Existing applications

The design names, individual/generic vanilla and React imports, component props,
shared CSS, capability discovery, geometry and relative artwork filenames stay
supported. Existing pinned npm/CDN releases are retained. Updating an application
is optional unless it follows the main Git branch or adopts the new release.

For applications using npm components with their default asset URLs:

**Recommended default:** individual package imports and CDN delivery. This
creates no image copies in the application repo. Leave `assetsBase` unset;
`add`, `copy-assets` and resource-package installs are unnecessary here.

1. Run `npm install @ranx729/medieval-ornaments@0.7.1`.
2. Keep your current component imports and props; no storage ID belongs in JSX.
3. Check your content-security policy allows `https://unpkg.com` in `img-src`.
4. Verify your used frames, dividers and whole images in the production build.

For self-hosted applications:

1. Update the runtime, then rerun `medieval-ornaments copy-assets` with the same
   destination and design/format selection, or update installer-owned components
   through `medieval-ornaments add` while reviewing local edits.
2. Keep the destination's public `assetsBase`; flattened `svg/`, `png/`, `webp/`
   paths and variants remain the hosting contract.
3. Offline work requires the matching optional archive/resource versions. Do not
   mix a newer runtime with an older archive and assume it contains new artwork.
4. Preserve license notice and check selected output files and application CSS.

### Switching existing local copies to CDN delivery

Install the runtime, replace local generated component imports with the matching
`/react/<name>` or `/designs/<name>` npm entry, and review any component edits
before replacing them. Preserve the unstyled/CSS setup if using Node SSR.
Remove local `assetsBase` overrides and asset-copy build steps. Verify the
application requests the pinned CDN URLs, then remove only images/generated
files that have no remaining users. Ordinary npm components need no asset
packages. CDN delivery reduces deployed files; self-hosted selected files can
still be preferable for offline use or measured first-load latency.

## Breaking repository/hosting assumptions

- **Raw main-branch URLs:** `raw.githubusercontent.com/adrian729/medieval-ornaments/main/png/...`
  and corresponding SVG/WebP paths stop working after those files move. Replace
  them with the new exact-version CDN URL or self-host using `copy-assets`.
  When deliberately retaining an old reference, use its original immutable Git
  commit URL. Raw GitHub file requests cannot be transparently redirected here.
- **Direct checkout paths:** scripts copying `png/`, `webp/`, `svg/`, native
  tiles or traces from a fresh main checkout need explicit resource fetching or
  the flat-mirror preparation command. Normal runtime builds remain asset-free.
- **Browser ZIP URL:** the downloadable archive moves from the Pages root to
  the exact GitHub Release download URL linked by the demos. Update hardcoded
  archive links; do not substitute an HTML redirect for a ZIP response.
- **Manual CDN URL construction:** do not infer a numbered package solely from
  border/decoration/illustration type. A collection can span several repositories.
  Use the runtime's resource-aware resolver or its generated source information,
  or retain a compatible flat `assetsBase`.

The public Pages `svg/`, `png/` and `webp/` image paths are retired in this release.
The demos load CDN images directly; there is no frozen local image snapshot.
Replace hardcoded Pages image URLs using the same steps as raw GitHub URLs.
This removes the growing resource footprint from the website entirely.

```js
import { getAssetSource } from '@ranx729/medieval-ornaments/resources';
const url = getAssetSource('red-berry-vine').base + 'svg/red-berry-vine-border.svg';
```

The old exported `defaultAssetsBase` / `defaultIllustrationsBase` constants
still identify compatibility archives; they no longer identify the resolver's
current default. Replace manual use of these constants with `getAssetSource`.

For an offline border installation:

```sh
npm install @ranx729/medieval-ornaments@0.7.1
npm install --save-dev @ranx729/medieval-ornaments-assets-borders-001@0.1.1
npx --no-install medieval-ornaments copy-assets public/ornaments --design red-berry-vine --offline
```

Install the corresponding decorations/illustrations numbered packages for those
selected designs. `getAssetSource(name)` reports the exact package and version;
no application needs to know the numbering policy.

For existing installer-owned components, run the same `add` command with 0.7.1
in a **fresh temporary output directory**, compare the generated code/assets
with your existing installation and merge your edits. `add` intentionally rejects
mixed runtime versions in one installation. Do not use `--overwrite` to bypass
that version guard; do not delete customized files blindly.

ZIP link: [0.7.1 browser archive](https://github.com/adrian729/medieval-ornaments/releases/download/v0.7.1/medieval-ornaments-browser.zip).

## Authoring and automation

Read [RESOURCES.md](RESOURCES.md). The main registry owns placement and the lock
owns exact versions. A new `borders-002` repository does not rename designs,
change their imports or require consumers to install every resource package.
Do not commit fetched caches or duplicate masters into the main repository.

Publication checks must cover legacy flat mirrors, matching offline archives,
individual/scoped imports, React SSR/hydration and CDN asset decoding. Report
any additional compatibility change here with an executable migration example.

## Patch 0.7.1

Install `@ranx729/medieval-ornaments@0.7.1` to use the current resource revisions
(0.1.1). All artwork bytes, names, import paths and component options are
unchanged; no application code migration is needed. `getAssetSource(design)`
returns the new exact resource version for offline installations.

New packages, copied components/assets and the browser ZIP contain `LICENSE`
as their license notice. The separate artwork document has been removed.
If your own packaging script explicitly copies that former document, remove
that copy step and retain `LICENSE`. Previously published versions remain
available and unchanged.
