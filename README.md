# Medieval ornaments

Reusable medieval borders, painted decorations and manuscript-style illustrations,
with PNG, lossless WebP, and smaller raster sizes. The 41 illustrations from
medieval-cutouts are now maintained here, with their original names, descriptive
metadata and image bytes preserved. [Browse illustrations](https://adrian729.github.io/medieval-ornaments/examples/?type=illustration) or read the [illustration and agent selection guide](docs/ILLUSTRATIONS.md).

The 24 additions from the authored backup include ivy and acanthus ornaments,
independent corner phases, complete frames, four gold rule components, a book and
a rabbit lutenist. They and Polyhymnia carry `author: "adrian729"`.
[Browse authored assets](https://adrian729.github.io/medieval-ornaments/examples/?q=adrian729).

## Install and integrate

```sh
npm install @ranx729/medieval-ornaments
```

**Recommended application setup: individual npm imports with default CDN delivery.**
This bundles only chosen designs and shared helpers; the browser fetches selected
image variants. It creates no local image files. Leave `assetsBase` unset and
use `add` or `copy-assets` only when you deliberately want local files.
No asset package is needed for this default workflow.

Dependency-free vanilla JavaScript, optional React components, TypeScript declarations, and categorized discovery use the same normalized contract. See the [integration guide](https://github.com/adrian729/medieval-ornaments/blob/main/docs/INTEGRATION.md), [plain JS example](https://adrian729.github.io/medieval-ornaments/examples/vanilla/), [React example](https://adrian729.github.io/medieval-ornaments/examples/react/), and [browser ZIP](https://github.com/adrian729/medieval-ornaments/releases/download/v0.10.1/medieval-ornaments-browser.zip).

Import an individual design to bundle only that design and the shared helpers:

```js
import { createDivider } from '@ranx729/medieval-ornaments/designs/plate-02-stepped-ribbon';
import '@ranx729/medieval-ornaments/styles.css';
const divider = createDivider(element, { orientation: 'horizontal', length: '100%' });
// divider.update({ orientation: 'vertical' });
// divider.destroy();
```

```jsx
import { OrnamentFrame, OrnamentDivider } from '@ranx729/medieval-ornaments/react/red-berry-vine';
import { OrnamentImage } from '@ranx729/medieval-ornaments/react/floral-bird-panel-blue';

<OrnamentFrame size={33}><YourContent /></OrnamentFrame>
<OrnamentDivider orientation="horizontal" />
<OrnamentImage size={128} />
```

React includes CSS automatically. Use `/react/unstyled/<name>` for plain Node SSR.
Individual exports are bound to their named design; omit `design`.
The root API and generic `/react` entry remain available for dynamic selection
with a required `design` option and all 161 designs' metadata. Scoped discovery
imports (`/catalog/borders`, `/catalog/decorations`, `/catalog/illustrations`)
include only that type's metadata.

To copy editable components and only their artwork into your own project:

```sh
npx @ranx729/medieval-ornaments@0.9.0 add red-berry-vine flying-pig
# Then import from ./ornaments/red-berry-vine.js in a component under src/.
```

See the [selective usage guide](docs/SELECTIVE.md) for runnable React/vanilla
examples, installer defaults, TypeScript, SSR, custom public URLs, offline use,
and how to preserve edits when adding or updating components.

The runtime contains no artwork or automatic artwork dependencies. Version 0.7.0
routes selected designs to independently pinned, numbered resource packages.
Border, decoration and illustration storage can each grow into additional
repositories while design names and component imports remain stable. See the
[resource guide](docs/RESOURCES.md), [migration steps](docs/RESOURCE-MIGRATION.md)
and [performance measurements](docs/PERFORMANCE.md).

Dividers default to the artwork's original direction; horizontal/vertical choose
matching assets. Geometry, formats and smaller raster sizes come from metadata.
Import discovery from `@ranx729/medieval-ornaments/catalog` for a picker; it
includes all 161 designs. Use `/catalog/borders`, `/catalog/decorations` or
`/catalog/illustrations` to discover only one type. Selection preserves detailed
descriptions and supports subjects, facing, composition and transparency;
see [SELECTION.md](SELECTION.md) and [the catalog schema](images.schema.json).

Images default to version-pinned CDN URLs and load only when selected. To self-host:

```sh
npx --no-install medieval-ornaments copy-assets public/ornaments --design red-berry-vine
```

For offline copying, install only the resource packages your designs need:

```sh
npm install --save-dev @ranx729/medieval-ornaments-assets-borders-001@0.1.3
npx --no-install medieval-ornaments copy-assets public/ornaments --design red-berry-vine --offline
```

Read each design's exact pin without importing the full catalog:

```js
import { getAssetSource } from '@ranx729/medieval-ornaments/resources';
const { package: assetPackage, version, base } = getAssetSource('red-berry-vine');
```

For this release, decorations and illustrations use the matching
`medieval-ornaments-assets-decorations-001@0.1.4` and
`medieval-ornaments-assets-illustrations-001@0.1.4` packages under `@ranx729`.
The old full and illustration archives remain compatible optional offline
sources; existing published versions remain available. Data packages provide
images, not components or the CLI. Selected installs request only chosen files.

For self-hosted copies, pass `assetsBase: '/ornaments/'` in vanilla or `assetsBase="/ornaments/"` in React. Keep it unset for the default CDN workflow. No artwork build or Python is needed by consumers. The integration code has a scoped [MIT license](LICENSE), which excludes the artwork.

## Artwork collection

- **6 floral border styles:** editable vectors inspired by the supplied sheet, with complete motifs and matching corners.
- **38 numbered plate designs:** original painted pixels cut into audited units, plus editable color traces and untouched reference crops. Alternating motifs/colors and native proportions are retained. Plate 11, 16, 36, and 37 are whole decorations because the supplied regions do not establish a usable repeating strip.
- **5 painted vertical ornaments:** transparent AI-assisted extractions; complete decorations rather than seamless tiles.
- **21 audited source additions:** blue borders and grid-paper stencils, the requested digital strips 2/4, painted panels, and the russet floral border. Sixteen are repeats; five remain whole decorations. See [ADDITIONS.md](ADDITIONS.md).
- **57 illustrations:** animal and human musicians, reading figures, hybrids, groups and retained scenes, including 41 preserved medieval-cutouts imports, 13 historical-source additions, the modern Polyhymnia scene, and the authored book and rabbit musician. Descriptive metadata, names, PNG/WebP masters and smaller variants are preserved. They render as complete images, with no invented repeat or SVG. See [ILLUSTRATIONS.md](docs/ILLUSTRATIONS.md).

The two Rosselli repeat borders and ten historical-source decorations retain their audited origins and modern extraction/adaptation notes.

The 58 repeating styles include matching corners and a frame atlas. Painted plate frames use source pixels with reflected miter corners; their SVG alternatives are color traces, not exact historical reproductions. The original sheet, crop choices, repeat rationale, and traces are preserved in the repository.

## Preview and use

The [overview](https://adrian729.github.io/medieval-ornaments/) shows three live uses with HTML, JavaScript and React snippets. The [gallery](https://adrian729.github.io/medieval-ornaments/examples/) filters every design by type, category or search; selecting one shows a full preview, its source, code and files. Links such as `?design=red-berry-vine` are shareable.

Use [ornaments.css](ornaments.css) for consistent classes: `ornament-frame`, `ornament-divider`, and `ornament-image`. Set `--ornament-image` and `--ornament-size`; the stylesheet handles the shared geometry. [Usage details and exceptions](USAGE.md#shared-usage-contract) explain the optional settings.

Run `python3 -m http.server 8765` in this folder and open [the gallery](http://localhost:8765/examples/) (`?assets=local` previews unpublished linked files). Divider sections remain complete and centered within the available length. Every repeat tile includes a rotated version for using it in either direction with the shared CSS.

The [artwork review page](https://adrian729.github.io/medieval-ornaments/examples/review.html) compares originals, extracted units, repeated strips, and frames at 33px. Switch between painted raster artwork and SVG traces.

The [source-additions review](https://adrian729.github.io/medieval-ornaments/examples/review.html?collection=additions) compares the 21 additions against their original crops. Grid-paper stencil backgrounds are retained; their grid lines have a different period and can show at joins. The temporary testing page has been removed, and watermarked candidates are excluded.

The overview is `examples/demo.html`; Pages serves bundled builds (`npm run build:examples`).

```html
<img src="https://cdn.jsdelivr.net/npm/@ranx729/medieval-ornaments-assets-decorations-001@0.1.5/webp/256/floral-bird-panel-blue.webp"
     alt="" height="256">
```

For a scalable frame:

```css
.ornament-frame {
  --ornament-image: url("https://cdn.jsdelivr.net/npm/@ranx729/medieval-ornaments-assets-borders-001@0.2.0/svg/red-berry-vine-border.svg");
  --ornament-size: 32px;
}
```

Include `ornaments.css` once and add `class="ornament-frame"` to your element.

Frames fit whole repeat units with `round`, so the edges end at the phase expected by their corners. Partial periods can cut motifs and are not an offered frame option. Use the supplied atlas rather than rotating source-derived corners yourself. See [usage details](USAGE.md) and [selection guidance for LLMs](SELECTION.md).

## Formats and sizes

`images.json` is the machine-readable catalog. `png/` and `webp/` contain masters; subfolders `128/`, `256/`, `512/`, and `768/` contain variants whose longest dimension is at most that size. A variant exists only when smaller than its master. Every size is made directly from the master; original raster artwork is never enlarged. SVGs are resolution-independent. Floral vector raster masters are at most 1024px. Numbered plate raster tiles, corners, and frames retain native source pixels. Atlas exports use integer slice boundaries; a size is omitted when it cannot meet that constraint without enlargement. Read actual dimensions from the catalog.

Painted ornament PNGs retain transparent backgrounds and are capped at the supplied image's 650px height. Exact reference crops retain their original paper/background; the two L-shaped corner crops mask neighboring designs. PNG and WebP pairs have identical dimensions, alpha, and visible pixels.

## Maintain the collection

Read [AGENTS.md](AGENTS.md) before editing. Install and regenerate:

```sh
python3 -m venv --system-site-packages .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python scripts/build_assets.py
.venv/bin/python scripts/catalog.py
.venv/bin/python scripts/catalog.py --check
```

Extraction prompts and methods are recorded in [EXTRACTION-PROMPTS.json](EXTRACTION-PROMPTS.json). Reference crop coordinates are in [reference-crops.json](reference-crops.json). Repeat/whole decisions and join adjustments are recorded in [source-patterns.json](source-patterns.json). Optional retracing uses Python 3.12 with `requirements-trace.txt`; normal builds use the checked-in traces. Asset metadata records whether artwork is an extraction, reconstruction, source crop/color trace, or reference crop. This repository does not establish ownership or a blanket license for the supplied reference artwork; no source attribution has been invented. The ornament vector code and exported artwork assets are provided without a blanket license until provenance is established. The npm integration software's grant is scoped separately in [LICENSE](LICENSE).

## Develop and release the library

```sh
npm ci
npm run build
npm test
npm run test:types
npm run test:integration
npm run build:browser
npm pack
```

The library build generates metadata/types from `images.json` without changing artwork. Consumer checks install a real archive and exercise native/bundled vanilla, React 18/19, production/development, SSR/hydration, types, and self-hosting. Chromium is required for browser checks. The Pages workflow builds the React example and browser download. Follow [the integration guide's release steps](docs/INTEGRATION.md#examples-and-development) and record results in [QA.md](QA.md).

[Quality checks](QA.md) cover every exported file and all formats in the browser preview.

<!-- gallery:start -->
## Browse designs

702 designs: 89 repeating borders, 281 whole decorations and 332 illustrations.

| Category | Designs |
| --- | --- |
| `animals` | 139 |
| `botanical` | 175 |
| `fantasy` | 105 |
| `floral` | 334 |
| `geometric` | 128 |
| `humans` | 152 |
| `hybrids` | 25 |
| `knotwork` | 7 |
| `music` | 49 |
| `reading` | 9 |
| `ribbons` | 8 |
| `royalty` | 9 |
| `scrollwork` | 164 |

[Open the asset browser for individual downloads, sizes and components](https://adrian729.github.io/medieval-ornaments/examples/).

| Preview | Design | Type | Formats |
| --- | --- | --- | --- |
| Pending publication | `abrotonum-foemina` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `acanthus-double-medallion-with-two-winged-figures` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `acanthus-panel-with-two-lovers-and-inhabiting-animals` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `acanthus-scroll-with-copper-vase-and-seated-wind-player` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/acanthus-tailpiece.webp" height="72" alt=""> | `acanthus-tailpiece` | decoration | PNG · WebP |
| Pending publication | `acanthus-tree-of-jesse-with-crowned-figures` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `acanthus-vase-between-two-female-chimeras` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/aldegrever-paired-tendrils.webp" height="72" alt=""> | `aldegrever-paired-tendrils` | decoration | PNG · WebP |
| Pending publication | `alsine-media` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `alternating-blue-cup-and-burst-flowers-on-green-stem` | border | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/anafiles.webp" height="72" alt=""> | `anafiles` | illustration | PNG · WebP |
| Pending publication | `anagallis-mas` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `angel-chasing-devil-in-gold-oval` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/animal-choir-landscape.webp" height="72" alt=""> | `animal-choir-landscape` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/animal-musicians-ensemble.webp" height="72" alt=""> | `animal-musicians-ensemble` | illustration | PNG · WebP |
| Pending publication | `animals-in-finite-leafy-frieze` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `announcing-angel-with-clouds-and-curled-blank-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `ape-gripping-leafy-stalk` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `ape-jouster-riding-ram` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `ape-rider-and-interacting-hounds` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-canopy-with-two-hanging-birdcages` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-checker-fans-and-square-star` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-compass-star-and-dense-small-petals` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-concentric-petal-rosette` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-crossed-stars-and-small-petals` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-eight-point-stars-and-small-roundels` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-four-floral-diamonds` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-large-petalled-flower` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `arched-lace-with-radiating-spokes-and-pointed-petals` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `armored-rhinoceros` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `battlefield-frieze-with-contacting-cavalry` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `bearded-mask-with-eagle-and-paired-fauns` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `bearded-mask-with-tritons-and-two-children` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `bearded-profile-head` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `bearded-winged-masks-with-curled-leaf-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `beaver` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/bird-wind-player.webp" height="72" alt=""> | `bird-wind-player` | illustration | PNG · WebP |
| Pending publication | `birds-on-flowering-scroll-frieze` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `black-horned-devil` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/blue-acanthus-and-seed-head-panel.webp" height="72" alt=""> | `blue-acanthus-and-seed-head-panel` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/blue-alternating-leaf-vine.webp" height="72" alt=""> | `blue-alternating-leaf-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/blue-alternating-stencil-scroll.webp" height="72" alt=""> | `blue-alternating-stencil-scroll` | border | PNG · WebP · SVG |
| Pending publication | `blue-and-pink-bud-with-two-green-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-brown-discs-and-diamonds-six-motif-repeat-cma-2005-206-a` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-brown-discs-and-diamonds-six-motif-repeat-cma-2005-206-b` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-clad-man-pulling-ornamental-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-curled-flower-with-rose-lobes-and-two-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/blue-diamond-leaf-stencil-band.webp" height="72" alt=""> | `blue-diamond-leaf-stencil-band` | border | PNG · WebP · SVG |
| Pending publication | `blue-dragon-head-with-orange-tongue` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-folded-flower-on-tall-green-stem` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/blue-four-petal-stencil-vine.webp" height="72" alt=""> | `blue-four-petal-stencil-vine` | border | PNG · WebP · SVG |
| Pending publication | `blue-gold-floral-frame` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-gold-floral-manuscript-frame` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-inlay-with-white-opposed-chevron-chain` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-line-filler-with-white-waves-hatching-and-curled-terminal` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/blue-looped-quatrefoils.webp" height="72" alt=""> | `blue-looped-quatrefoils` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/blue-paired-birds-and-palmettes.webp" height="72" alt=""> | `blue-paired-birds-and-palmettes` | border | PNG · WebP · SVG |
| Pending publication | `blue-pointed-flower-with-rose-petals-on-upright-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-red-and-gray-radial-flower` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-ringed-red-and-violet-acanthus-medallion` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-rose-and-gray-flower-on-long-green-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-serrated-floret-with-red-gold-center` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/blue-staggered-leaf-scrolls.webp" height="72" alt=""> | `blue-staggered-leaf-scrolls` | border | PNG · WebP · SVG |
| Pending publication | `blue-webbed-fan-leaf` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `blue-white-opposed-chevron-repeat` | border | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/boar-lute-player.webp" height="72" alt=""> | `boar-lute-player` | illustration | PNG · WebP |
| Pending publication | `bow-and-oval-chain-cycle` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `braided-diamond-knots-and-pointed-leaf-crosses` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `branching-elk-antler` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `branching-scroll-with-broad-lobed-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `branching-star-flowers-on-long-leaves` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/briar-divider.webp" height="72" alt=""> | `briar-divider` | decoration | PNG · WebP |
| Pending publication | `broad-green-leaf-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `broad-red-flower-with-blue-and-gray-crown` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `brown-bull-with-upturned-head` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `brown-fan-flower-with-curled-green-leaf-branch` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `bull-with-bent-legs` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/bunny-harp.webp" height="72" alt=""> | `bunny-harp` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/bunny-trumpet.webp" height="72" alt=""> | `bunny-trumpet` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/butterfly-panel-red.webp" height="72" alt=""> | `butterfly-panel-red` | decoration | PNG · WebP |
| Pending publication | `candelabra-supported-by-two-blindfolded-women` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/canine-fiddle-player.webp" height="72" alt=""> | `canine-fiddle-player` | illustration | PNG · WebP |
| Pending publication | `cat` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/cat-reading-book.webp" height="72" alt=""> | `cat-reading-book` | illustration | PNG · WebP |
| Pending publication | `centaur-archer-with-bow` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `chamaemelum-eranthemon` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `child-gripping-wide-foliate-scroll` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/choirbook-and-ivy.webp" height="72" alt=""> | `choirbook-and-ivy` | illustration | PNG · WebP |
| Pending publication | `christ-carrying-cross-with-contacting-procession` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `circular-acanthus-and-grotesque-ornament` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `clustered-small-flowers-with-long-sword-shaped-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `complete-annunciation-to-the-shepherds-with-angel-and-night-landscape` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `complete-apostle-city-scene-with-blue-vine-frame` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `complete-circular-wind-diagram-with-twelve-profile-heads` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `connected-gray-acanthus-network-with-three-curled-lobes` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `cook-with-ladle-dish-and-soup-cauldron` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `coronation-of-mary-with-six-angels-and-throne` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `couple-sharing-goblet-in-wooden-bathtub` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `courting-landscape-with-trees-flock-and-distant-town` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `courting-pair-clasping-hands-with-two-long-staffs` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `courting-pair-in-long-robes-right-of-centre` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `courting-pair-linked-by-long-hat-plume` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/creature-in-gold-shape.webp" height="72" alt=""> | `creature-in-gold-shape` | illustration | PNG · WebP |
| Pending publication | `crocodile` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-blue-leaf-pair` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-gray-blue-leaf-pair` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-horizontal-green-leaf-pair` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-knots-and-four-foliate-scroll-panel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-upright-blue-leaf-pair` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-upright-gray-leaf-pair` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-upright-green-leaf-pair` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `crossed-weapons-with-tied-ribbon` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crouching-ape-with-outstretched-hands` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crouching-gray-cat` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crouching-hairy-figure-with-long-bent-implement` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crouching-unicorn-with-gold-horn` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/crowned-cat.webp" height="72" alt=""> | `crowned-cat` | illustration | PNG · WebP |
| Pending publication | `crowned-david-seated-playing-harp` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crowned-david-with-book-pointing-to-eye` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crowned-seated-bell-ringer-with-bell-set-and-hammers` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `crowned-winged-figure-with-chalice` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `cupid-subduing-two-lions-in-acanthus-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `cupped-flowers-and-buds-on-leafy-stem` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/curled-cat.webp" height="72" alt=""> | `curled-cat` | illustration | PNG · WebP |
| Pending publication | `curling-leaf-ornament` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `curling-thistle-ornament` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `dancing-dog` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `dark-green-long-beaked-bird` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `dark-seed-pod-sprig` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `diagonal-leafy-scrolls-and-paired-rosettes` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `diving-long-beaked-waterbird` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/donkey-organist.webp" height="72" alt=""> | `donkey-organist` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/donkey-rooster-lute-player.webp" height="72" alt=""> | `donkey-rooster-lute-player` | illustration | PNG · WebP |
| Pending publication | `dragon-head-scroll-with-long-bearded-mask` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `drooping-flower-whorl-beneath-long-crown-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `drooping-rosebud-with-curved-stem-and-two-basal-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `eight-legged-zodiac-crab` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `elephant` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `elongated-red-gray-leaf-scroll-with-blue-center` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `embracing-nude-couple-with-raised-clasped-hands` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `embracing-zodiac-twins` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `figure-holding-balance-scales` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `figure-in-woven-basket-with-red-cord-and-crowned-face` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `fine-vertical-hatching-between-parallel-rules` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-blue-and-rose-band-with-gold-pips-and-white-curls` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-blue-gold-discs-and-diamonds-line-filler` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-blue-gold-discs-and-paired-diamonds-line-filler` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-blue-rose-white-foliate-waves-and-gold-roundels` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-blue-vine-and-red-gold-miniature-frame` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-four-white-loops-on-blue` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-foliate-wave-on-blue-line-filler` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-foliate-wave-on-blue-red-line-filler` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-pip-and-double-white-cross-on-rose` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-pip-and-white-double-ended-curl-on-rose` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-pip-and-white-wave-on-blue` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-roundels-and-white-wave-on-rose` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-wave-and-white-zigzag-over-blue-rose` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-gold-wave-over-blue-and-rose-ground` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-interlaced-arabesque-cartouche` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-paired-gold-roundels-and-foliate-white-wave-on-rose-blue` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-paired-gold-roundels-and-white-waves-on-blue-rose` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-paired-gold-roundels-on-rose-band` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-single-gold-roundel-and-looped-white-wave-on-rose-blue` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-three-gold-roundels-and-white-zigzag-on-blue-rose` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-white-crossed-strokes-and-gold-pip-on-blue` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `finite-white-zigzag-and-alternating-dots-on-rose` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fish-and-flower-candelabrum-scroll` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/fish-with-arms.webp" height="72" alt=""> | `fish-with-arms` | illustration | PNG · WebP |
| Pending publication | `five-tulips-with-broad-curled-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-blue-gold-foliate-left-and-bottom-margin-border` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-blue-gold-foliate-left-and-top-margin-border` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-floral-page-margin-with-acanthus-and-gold-ivy-walters-w186-285r` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-floral-page-margin-with-acanthus-and-gold-ivy-walters-w186-291v` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-floral-u-border-with-gold-and-black-ivy` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-gold-columned-pond-frame-with-scroll-capitals` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-polychrome-floral-frame-with-knotted-medallions` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-rectangular-gold-blue-and-red-foliate-panel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `fixed-twisted-column-arcade-with-scalloped-arch` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/floral-bird-panel-blue.webp" height="72" alt=""> | `floral-bird-panel-blue` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/floral-bird-panel-left.webp" height="72" alt=""> | `floral-bird-panel-left` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/floral-bird-panel-right.webp" height="72" alt=""> | `floral-bird-panel-right` | decoration | PNG · WebP |
| Pending publication | `flower-bouquet-from-decorated-initial` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `fluted-vase-with-horns-and-broad-leaf-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `flying-brown-bird-with-red-beak` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/flying-pig.webp" height="72" alt=""> | `flying-pig` | illustration | PNG · WebP |
| Pending publication | `foliate-face-with-paired-perching-birds` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `foliate-vine-with-hairy-grotesque-mask` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `foreground-grazing-animal-with-lowered-head` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `foreground-mounted-hunter-with-raised-arm` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `four-armed-green-feathered-floret-with-red-gold-center` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `four-contacting-shepherds-with-dog-and-two-sheep` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `four-rose-petals-with-green-calyx-and-two-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `four-season-heads-in-acanthus-frieze` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `four-tulips-with-folded-basal-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `fox` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `framed-mounted-figure-and-attendant-vignette` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `framed-reclining-figure-with-round-shield` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `framed-standing-statue-and-two-foreground-figures` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `framed-standing-statue-with-two-attending-figures` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `framed-two-figures-contesting-on-shared-ground` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `framed-two-figures-with-rectangular-props` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/frog.webp" height="72" alt=""> | `frog` | illustration | PNG · WebP |
| Pending publication | `fruit-tree-with-branching-trunk` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/funny-faced-lying-cat.webp" height="72" alt=""> | `funny-faced-lying-cat` | illustration | PNG · WebP |
| Pending publication | `garlanded-grotesque-with-birds-musicians-and-central-mask` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `girl-kneading-bread-at-table-with-basket` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `goat-headed-fish-tailed-capricorn` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/gold-cinquefoil-divider-center.webp" height="72" alt=""> | `gold-cinquefoil-divider-center` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/gold-cinquefoil-divider-end.webp" height="72" alt=""> | `gold-cinquefoil-divider-end` | decoration | PNG · WebP |
| Pending publication | `gold-curled-leaf-scroll-from-lower-initial` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-curled-leaf-vine-from-initial` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-curled-leaf-vine-from-round-initial` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-curled-pointed-leaf-from-initial-counter` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-five-petal-flower-from-initial-counter` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-ground-portrait-of-saint-paul-with-sword-and-book` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-hatched-fruit-on-green-leafy-stem` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/gold-leaf-scroll.webp" height="72" alt=""> | `gold-leaf-scroll` | border | PNG · WebP · SVG |
| Pending publication | `gold-lion-with-curled-tail` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/gold-lozenge-divider-center.webp" height="72" alt=""> | `gold-lozenge-divider-center` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/gold-lozenge-divider-end.webp" height="72" alt=""> | `gold-lozenge-divider-end` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/gold-quatrefoil-vine.webp" height="72" alt=""> | `gold-quatrefoil-vine` | border | PNG · WebP · SVG |
| Pending publication | `gold-s-shaped-leaf-on-red-repeat` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-scales-with-two-blue-pans` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/gold-scroll-with-blue-bellflowers.webp" height="72" alt=""> | `gold-scroll-with-blue-bellflowers` | decoration | PNG · WebP · SVG |
| Pending publication | `gold-seed-pod-sprig` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `gold-three-lobed-leaf-from-initial-counter` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gothic-tiered-fountain-with-water-jets` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `grape-and-lobed-leaf-scroll-with-central-tie` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `grape-bunch-with-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `grapevine-with-two-purple-clusters-and-lobed-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-acanthus-s-scroll-with-curled-leaf-terminals` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-bird-among-grapes-on-long-floral-vine` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-blue-flower-with-red-center-and-green-leaf-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-curled-horn-ram` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-folded-bud-with-rose-petals-and-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-long-horned-goat` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-metal-water-jug-with-small-foot` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `gray-red-blue-lobed-leaves-in-gold-medallions-cycle` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `green-gold-leaf-and-flower-flourish` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `green-lobed-leaf-with-pointed-tip` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `green-winged-bird-on-orange-foliate-support` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `grotesque-architecture-with-bird-canopies-and-framed-scenes` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `grotesque-candelabrum-with-satyrs-griffins-and-music` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `grotesque-canopy-with-birds-and-suspended-miniature` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `grotesque-vines-with-winged-hybrids-and-figure-canopies` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `grotesque-with-paired-curled-hybrids-and-framed-scene` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `hairy-hunter-and-diving-bird-in-columned-pond-scene` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-bearded-bust-holding-lettered-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-bust-with-cross-marked-orb-and-raised-hand` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-eagle-head-with-pale-blue-wings` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-frontal-lion-head-with-pale-gold-wings` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-frontal-ox-head-with-rose-wings` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-god-with-orb-pointing-from-clouds` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-human-head-with-gold-wings` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-man-gesturing-in-blue-and-green-robes` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `haloed-man-in-blue-and-orange-robes` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `hanging-grapes-with-two-broad-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `hanging-pear` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `hanging-pear-with-short-curved-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `hanging-red-bud-on-long-horizontal-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `hanging-rosette-and-bell-finial` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `hare-and-hound-in-contact` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/hoefnagel-cut-apple.webp" height="72" alt=""> | `hoefnagel-cut-apple` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/hoefnagel-rose-lower.webp" height="72" alt=""> | `hoefnagel-rose-lower` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/hoefnagel-rose-upper.webp" height="72" alt=""> | `hoefnagel-rose-upper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/hoefnagel-strapwork-frame.webp" height="72" alt=""> | `hoefnagel-strapwork-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/hooded-bagpiper.webp" height="72" alt=""> | `hooded-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/hooded-harp-player.webp" height="72" alt=""> | `hooded-harp-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/hopfer-thistle-panel.webp" height="72" alt=""> | `hopfer-thistle-panel` | decoration | PNG · WebP |
| Pending publication | `horizontal-brown-flower-with-long-green-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `horizontal-floral-spray-with-blue-flowers-and-green-curled-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `horizontal-palmettes-and-four-lobed-scroll-cycle` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `horizontal-pea-pod-with-two-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `horizontal-red-and-blue-bud-with-two-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `horned-dragon-with-flowering-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `horned-helmet-with-leafy-mantling-and-shield` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `horned-hybrids-and-bears-in-foliate-cartouche-frame` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `horse` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `hound-seizing-long-eared-animal` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `human-headed-bird` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `human-headed-bird-with-curved-gold-neck-and-brown-wings` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `human-headed-fleecy-quadruped-with-gold-spiral` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `hunter-spearing-boar` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/illuminated-acanthus-corner.webp" height="72" alt=""> | `illuminated-acanthus-corner` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/illuminated-acanthus-corner-bottom-left.webp" height="72" alt=""> | `illuminated-acanthus-corner-bottom-left` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/illuminated-acanthus-corner-bottom-right.webp" height="72" alt=""> | `illuminated-acanthus-corner-bottom-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/illuminated-acanthus-corner-top-right.webp" height="72" alt=""> | `illuminated-acanthus-corner-top-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/illuminated-acanthus-frame.webp" height="72" alt=""> | `illuminated-acanthus-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/illuminated-acanthus-headpiece.webp" height="72" alt=""> | `illuminated-acanthus-headpiece` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/illuminated-acanthus-tailpiece.webp" height="72" alt=""> | `illuminated-acanthus-tailpiece` | decoration | PNG · WebP |
| Pending publication | `inner-red-and-blue-leaf-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `interacting-centaurs-and-riders-in-foliate-frieze` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `interlaced-blue-red-foliage` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `interlaced-chevron-knots-and-eight-point-flowers` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `interlaced-diamonds-and-floral-rosettes` | border | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/interlocking-ribbon.webp" height="72" alt=""> | `interlocking-ribbon` | border | PNG · WebP · SVG |
| Pending publication | `intertwined-hop-vine-and-lobed-leaf-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `inverted-lattice-floral-triangle` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/isabella-blue-cornflower.webp" height="72" alt=""> | `isabella-blue-cornflower` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/isabella-gold-floral-frame.webp" height="72" alt=""> | `isabella-gold-floral-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/isabella-gray-butterfly.webp" height="72" alt=""> | `isabella-gray-butterfly` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/isabella-orange-butterfly.webp" height="72" alt=""> | `isabella-orange-butterfly` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/isabella-pink-rose.webp" height="72" alt=""> | `isabella-pink-rose` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/isabella-small-bird.webp" height="72" alt=""> | `isabella-small-bird` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-corner.webp" height="72" alt=""> | `ivy-corner` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-corner-bottom-left.webp" height="72" alt=""> | `ivy-corner-bottom-left` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-corner-bottom-right.webp" height="72" alt=""> | `ivy-corner-bottom-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-corner-top-right.webp" height="72" alt=""> | `ivy-corner-top-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-fleuron.webp" height="72" alt=""> | `ivy-fleuron` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-line-filler.webp" height="72" alt=""> | `ivy-line-filler` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-manuscript-frame.webp" height="72" alt=""> | `ivy-manuscript-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/ivy-marginal-vine.webp" height="72" alt=""> | `ivy-marginal-vine` | decoration | PNG · WebP |
| Pending publication | `jousting-ape-with-shield-and-lance` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `kneeling-blue-robed-angel-with-long-green-wings` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `kneeling-green-robed-angel-with-long-green-wings` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `lamb-with-cross-and-ribbon` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-bearded-mask-with-paired-leafy-heads` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-hanging-blue-flower-with-long-green-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-knotted-ribbons-with-flowers-and-curled-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-left-tulip-with-long-folded-leaf` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-red-brown-butterfly-with-cream-wing-bars` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-red-flower-and-small-bud-on-branching-green-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-red-tulip-with-blue-sepals-and-side-bud` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-right-tulip-with-bare-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `large-side-facing-rose-with-curved-leafy-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `leafy-tree-on-mound-with-contacting-figures` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `leaping-antlered-stag-with-contacting-hound` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-and-lower-floral-margin-with-acanthus-and-gold-ivy` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-blue-robed-angel-musician` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-dark-leafy-tree` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-facing-brown-quadruped-with-gold-trefoil-in-curled-tail` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-gray-blue-acanthus-scroll-with-green-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-green-robed-angel-with-small-stringed-instrument` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-mounted-hunter-on-running-horse` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-running-hound` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-tan-robed-man-visible-half-figure` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-tree-and-connected-foliage-cluster` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `left-two-flower-black-twig-with-gold-berry` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lion` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `lion-shield-with-helmet-and-feathered-crest` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `lion-with-curled-tail` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/lizard-lute-player.webp" height="72" alt=""> | `lizard-lute-player` | illustration | PNG · WebP |
| Pending publication | `lobed-floral-blue-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `long-beaked-orange-winged-bird` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `long-blue-and-gold-line-end-scroll-bar` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `long-brown-foliate-vine-with-blue-green-and-gold-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `long-left-blue-and-gold-rod-with-two-profile-heads` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `long-snouted-running-quadruped` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `looped-lattice-knots-and-curled-palmettes` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `looped-straps-and-geometric-flower-crosses` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-black-foliate-curl` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-curving-ivy-trail-with-gold-flower` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-flying-day-bird` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-gold-rod-with-red-blue-and-gold-foliate-branch-walters-w171-19v` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-gold-rod-with-red-blue-and-gold-foliate-branch-walters-w171-74r` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-grotesque-face-mask` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-left-gold-and-pink-rod-with-ivy-flourish-walters-w171-10r` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-left-gold-and-pink-rod-with-ivy-flourish-walters-w171-12r` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-left-green-leaf-branch-with-pink-flowers` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-left-knotted-red-and-blue-leaf` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-left-pair-of-contacting-figures` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-oval-red-cream-flower-and-two-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-profile-head-on-long-blue-and-gold-rod` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-red-gold-and-blue-leaf-spray` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-right-foliate-trophy-with-tied-ribbon` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-right-green-leaf-branch-with-blue-flowers` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-right-pair-of-contacting-figures` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `lower-silver-fish-with-red-fins` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `mail-clad-twins-with-shared-shield` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `man-carrying-horse` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `man-carrying-suspended-tub` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `matthew-writing-at-lectern-with-seat-and-footstool` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `may-calendar-fixed-floral-frame-with-paired-forest-arches` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `michael-and-angels-battling-winged-demons` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `middle-running-hound` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `middle-two-green-leaf-curved-twig` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `mirrored-figure-eight-loops-and-floral-diamonds-panel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `mirrored-floral-wave-with-central-interlace` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `mitred-owl-and-ape-with-shared-staff` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `mixed-oval-chain-and-floral-printer-frame` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `monkeys-playing-chess` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `monkeys-singing-at-lectern` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `mounted-couple-on-white-horse` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r1-c1-organ-player.webp" height="72" alt=""> | `musician-r1-c1-organ-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r1-c2-shawm-player.webp" height="72" alt=""> | `musician-r1-c2-shawm-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r1-c3-horn-player.webp" height="72" alt=""> | `musician-r1-c3-horn-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r1-c4-horn-player.webp" height="72" alt=""> | `musician-r1-c4-horn-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r2-c1-bagpiper.webp" height="72" alt=""> | `musician-r2-c1-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r2-c2-bagpiper.webp" height="72" alt=""> | `musician-r2-c2-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r2-c3-horn-player.webp" height="72" alt=""> | `musician-r2-c3-horn-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r2-c4-psaltery-player.webp" height="72" alt=""> | `musician-r2-c4-psaltery-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r3-c1-bagpiper.webp" height="72" alt=""> | `musician-r3-c1-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r3-c2-lute-player.webp" height="72" alt=""> | `musician-r3-c2-lute-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r3-c3-lute-player.webp" height="72" alt=""> | `musician-r3-c3-lute-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/musician-r3-c4-pipe-player.webp" height="72" alt=""> | `musician-r3-c4-pipe-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/musicians-and-dancers.webp" height="72" alt=""> | `musicians-and-dancers` | illustration | PNG · WebP |
| Pending publication | `oak-leaf-corner-flourish` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/olive-leaf-and-red-berry-vine.webp" height="72" alt=""> | `olive-leaf-and-red-berry-vine` | border | PNG · WebP · SVG |
| Pending publication | `opposed-blue-red-leaves-with-gray-interlace-cycle` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `orange-clad-floating-figure-with-green-cloak-and-crossed-implement` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `orange-clad-trumpeter-with-green-staff` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `orange-maned-hybrid-with-blue-wing-and-green-claws` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `orange-robed-human-headed-winged-figure` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `orange-trefoil-flower-with-white-painted-outline` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `ornate-double-cup-with-two-children` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `oval-blue-celestial-scene-with-gold-stars-and-crescent` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `owl-and-perching-birds-in-leafy-scroll` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-004/1c0280b3205fdb540720e1897e2583de93d9eb02/webp/128/painted-opposed-serrated-flower-vine.webp" height="72" alt=""> | `painted-opposed-serrated-flower-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-004/1c0280b3205fdb540720e1897e2583de93d9eb02/webp/128/painted-rosette-and-fan-vine.webp" height="72" alt=""> | `painted-rosette-and-fan-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/painted-sprawling-floral-panel.webp" height="72" alt=""> | `painted-sprawling-floral-panel` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/painted-symmetric-leaf-and-flower-panel.webp" height="72" alt=""> | `painted-symmetric-leaf-and-flower-panel` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/painted-three-band-floral-panel.webp" height="72" alt=""> | `painted-three-band-floral-panel` | decoration | PNG · WebP · SVG |
| Pending publication | `paired-bearded-heads-with-horns-and-flowers` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-bulbous-pendants-with-curling-stems` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-horned-creatures-and-twin-flower-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-horns-griffins-and-children-in-candelabrum` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-horns-sprouting-broad-leafy-tendrils` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-human-headed-birds-with-tied-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-leaf-scrolls-and-interlaced-figure-eights` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-pale-yellow-flowers-on-green-leaf-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-roses-on-connected-leafy-branch` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-winged-beasts-with-central-face` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `paired-winged-putti-holding-bowl-in-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `pale-pleated-fan-flower-on-curved-green-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `pale-yellow-daisy-on-lobed-green-leaf-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `pale-yellow-flower-with-long-green-leaf-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `palmette-scroll-printer-frame` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `palmette-with-paired-dolphin-heads-and-leaf-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `peasant-carrying-large-wicker-basket` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `pink-and-blue-upright-flower-on-curving-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `pink-and-red-lobed-leaves-on-blue-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `pink-flower-and-green-scroll-flourish` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `pink-inlay-with-white-opposed-chevron-chain` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `pink-white-opposed-chevron-repeat` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `plantago-maior` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-01-linked-scrolls.webp" height="72" alt=""> | `plate-01-linked-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-02-stepped-ribbon.webp" height="72" alt=""> | `plate-02-stepped-ribbon` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-03-spiral-bands.webp" height="72" alt=""> | `plate-03-spiral-bands` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-04-heart-and-diamond.webp" height="72" alt=""> | `plate-04-heart-and-diamond` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-05-blue-curls.webp" height="72" alt=""> | `plate-05-blue-curls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/plate-06-paired-red-scrolls.webp" height="72" alt=""> | `plate-06-paired-red-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-07-blue-heart-leaves.webp" height="72" alt=""> | `plate-07-blue-heart-leaves` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-08-diagonal-cross.webp" height="72" alt=""> | `plate-08-diagonal-cross` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-09-interlaced-knot.webp" height="72" alt=""> | `plate-09-interlaced-knot` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/plate-10-blue-palmettes.webp" height="72" alt=""> | `plate-10-blue-palmettes` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/plate-11-acanthus-scroll.webp" height="72" alt=""> | `plate-11-acanthus-scroll` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-12-arched-diamonds.webp" height="72" alt=""> | `plate-12-arched-diamonds` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/plate-13-leaf-and-flower-vine.webp" height="72" alt=""> | `plate-13-leaf-and-flower-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-14-crossed-diamonds.webp" height="72" alt=""> | `plate-14-crossed-diamonds` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-15-diamond-square.webp" height="72" alt=""> | `plate-15-diamond-square` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/plate-16-stepped-corner.webp" height="72" alt=""> | `plate-16-stepped-corner` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-17-stepped-arches.webp" height="72" alt=""> | `plate-17-stepped-arches` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-18-fan-palmettes.webp" height="72" alt=""> | `plate-18-fan-palmettes` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-19-cream-scrolls.webp" height="72" alt=""> | `plate-19-cream-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-20-segmented-medallions.webp" height="72" alt=""> | `plate-20-segmented-medallions` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-21-green-flower-medallions.webp" height="72" alt=""> | `plate-21-green-flower-medallions` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-22-white-petal-grid.webp" height="72" alt=""> | `plate-22-white-petal-grid` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-23-crossed-ribbon-knots.webp" height="72" alt=""> | `plate-23-crossed-ribbon-knots` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-24-gold-ring-scrolls.webp" height="72" alt=""> | `plate-24-gold-ring-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-25-greek-crosses.webp" height="72" alt=""> | `plate-25-greek-crosses` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-26-eight-petal-rosette.webp" height="72" alt=""> | `plate-26-eight-petal-rosette` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-27-blue-flower-medallions.webp" height="72" alt=""> | `plate-27-blue-flower-medallions` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-28-angular-blue-meander.webp" height="72" alt=""> | `plate-28-angular-blue-meander` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/plate-29-red-acanthus.webp" height="72" alt=""> | `plate-29-red-acanthus` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/plate-30-layered-palmettes.webp" height="72" alt=""> | `plate-30-layered-palmettes` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/plate-31-alternating-florets.webp" height="72" alt=""> | `plate-31-alternating-florets` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-32-linked-ovals.webp" height="72" alt=""> | `plate-32-linked-ovals` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-33-leaf-scrolls.webp" height="72" alt=""> | `plate-33-leaf-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-34-nested-fans.webp" height="72" alt=""> | `plate-34-nested-fans` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-35-crossed-white-stems.webp" height="72" alt=""> | `plate-35-crossed-white-stems` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/plate-36-greek-key.webp" height="72" alt=""> | `plate-36-greek-key` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/plate-37-diamond-scroll.webp" height="72" alt=""> | `plate-37-diamond-scroll` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/plate-38-diagonal-meander.webp" height="72" alt=""> | `plate-38-diagonal-meander` | border | PNG · WebP · SVG |
| Pending publication | `pointed-blue-red-flower-with-long-green-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `pointed-rose-flower-with-gray-sepals-on-green-twig` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/polyhymnia.webp" height="72" alt=""> | `polyhymnia` | illustration | PNG · WebP |
| Pending publication | `praying-figure-emerging-from-undulating-water` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/purple-fine-scroll-lattice.webp" height="72" alt=""> | `purple-fine-scroll-lattice` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/purple-opposed-scroll-vine.webp" height="72" alt=""> | `purple-opposed-scroll-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/purple-oval-rosette-vine.webp" height="72" alt=""> | `purple-oval-rosette-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/rabbit-bagpiper.webp" height="72" alt=""> | `rabbit-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/rabbit-horn-hound-rider.webp" height="72" alt=""> | `rabbit-horn-hound-rider` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/rabbit-lutenist-painted.webp" height="72" alt=""> | `rabbit-lutenist-painted` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/rabbit-reading-book.webp" height="72" alt=""> | `rabbit-reading-book` | illustration | PNG · WebP |
| Pending publication | `ram-with-curled-horns` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `reclining-foreground-figure-group` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `reclining-green-dragon-biting-gold-bar` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `reclining-green-robed-figure-with-patterned-object` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `red-and-blue-round-flower-with-two-leaves` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/red-berry-vine.webp" height="72" alt=""> | `red-berry-vine` | border | PNG · WebP · SVG |
| Pending publication | `red-blue-gold-acanthus-and-green-leaf-l-border` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `red-crab-with-raised-claws` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `red-flower-and-blue-leaf-on-pale-forked-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `red-four-lobed-quatrefoil-from-wind-wheel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `red-four-petaled-flower-on-curved-stem-with-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `red-gray-radial-flower-on-green-leaf-spray` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/red-rosette-vine.webp" height="72" alt=""> | `red-rosette-vine` | border | PNG · WebP · SVG |
| Pending publication | `red-scalloped-flower-on-long-green-leaves` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/red-trefoil-vine.webp" height="72" alt=""> | `red-trefoil-vine` | border | PNG · WebP · SVG |
| Pending publication | `red-umbrella-flower-on-two-leaved-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `resurrection-with-tomb-and-four-soldiers` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-black-leaf-curl-on-blue-and-gold-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-blue-red-robed-man-visible-half-figure` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-blue-robed-angel-with-harp` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-blue-robed-angel-with-lute` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-dark-leafy-tree` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-facing-brown-quadruped-with-gold-trefoil-in-curled-tail` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-facing-gray-and-cream-profile-head` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-leafy-shrub-cluster` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-low-running-hound` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `right-pointed-blue-and-gold-leaf-swash` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `rightmost-walking-courting-pair` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `robed-water-bearer-pouring-round-jar` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `robed-woman-with-outstretched-arms` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `rooster-shield-and-helmet-with-leafy-mantling` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `rose-and-blue-bud-on-curved-stem-with-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `rose-blue-and-gold-layered-flower-with-two-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `rose-fan-flower-with-small-red-bud-and-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/rosselli-foliate-border.webp" height="72" alt=""> | `rosselli-foliate-border` | border | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/rosselli-foliate-strip.webp" height="72" alt=""> | `rosselli-foliate-strip` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/128/rosselli-mask-border.webp" height="72" alt=""> | `rosselli-mask-border` | border | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/rosselli-mask-strip.webp" height="72" alt=""> | `rosselli-mask-strip` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/rosselli-roundel-bottom.webp" height="72" alt=""> | `rosselli-roundel-bottom` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/rosselli-roundel-second.webp" height="72" alt=""> | `rosselli-roundel-second` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/rosselli-roundel-third.webp" height="72" alt=""> | `rosselli-roundel-third` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/rosselli-roundel-top.webp" height="72" alt=""> | `rosselli-roundel-top` | decoration | PNG · WebP |
| Pending publication | `running-long-snouted-quadruped-with-curled-tail` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `running-spotted-hound` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-002/19f0ef5c7eb4d9879f2dd1850456b2d3fd831753/webp/128/russet-floral-vine-with-bud-borders.webp" height="72" alt=""> | `russet-floral-vine-with-bud-borders` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-003/4ca2f7d5a02429c3b77fc0fbd1038e0cfe86bd3c/webp/128/russet-opposed-flowers-and-sage-leaves.webp" height="72" alt=""> | `russet-opposed-flowers-and-sage-leaves` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/9b9d195492814c2a6226aa80f5f1cde4fafd7bbf/webp/sage-leaf-and-russet-bud-vine.webp" height="72" alt=""> | `sage-leaf-and-russet-bud-vine` | border | PNG · WebP · SVG |
| Pending publication | `saint-adrian-with-lion-sword-and-anvil` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `saint-margaret-emerging-from-winged-dragon` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `saint-paul-visible-bust-with-sword-and-book` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `saint-paul-with-long-sword-and-book` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `saint-peter-with-large-key` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `salvator-mundi-with-book-and-gold-orb` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `seated-archer-with-hoofed-legs` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `seated-child-holding-tall-leafy-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `seated-embracing-couple-in-blue-red-and-green-clothes` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `seated-harp-player` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `seated-long-eared-rabbit-above-top-vine` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `seated-maiden-holding-small-flowers` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `seated-man-pulling-looped-cord` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/seated-rabbit.webp" height="72" alt=""> | `seated-rabbit` | illustration | PNG · WebP |
| Pending publication | `seated-red-squirrel-with-bushy-tail` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `sedum-maius` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `seriphium-absinthium` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `short-blue-and-gold-curled-leaf-terminal` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `short-blue-and-gold-line-end-scroll-bar` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `sideways-flower-on-bent-stem-with-long-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `sideways-red-blue-gray-flower-on-green-leaf-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `six-leaf-blue-vine` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-bird-flying-left` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-blue-and-gold-four-point-line-end-floret` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-brown-round-flower-on-leafy-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-contacting-courting-pair-at-right` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-contacting-pair-beside-central-tree` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-curled-tailed-dog` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-faded-gray-flower-on-green-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-five-petalled-flower-on-sparse-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-folded-blue-bud-on-green-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-foreground-shrub-on-hatched-mound` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-gray-bird-with-long-tail` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-irregular-gold-star` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-lace-roundel-with-eight-point-star` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-left-red-and-blue-leaf-terminal` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-left-tulip-with-bent-leaf` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-middle-mounted-hunter` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-oval-loops-and-three-star-knots-panel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-reclining-curled-tailed-animal` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-red-and-gray-hanging-flower-on-curved-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-red-bud-on-long-horizontal-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-red-gold-painted-roundel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-right-red-and-blue-leaf-terminal` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-right-tulip-with-pointed-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-rose-cap-flower-on-upright-green-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-spotted-butterfly` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-standing-courting-pair-left-of-centre` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-triangular-fleur-finial` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-upright-red-bud-with-long-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `small-upright-rosebud-with-one-leaf` | illustration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/snail.webp" height="72" alt=""> | `snail` | illustration | PNG · WebP |
| Pending publication | `soldier-profile-in-fruiting-dagger-sheath` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/songbirds-headpiece.webp" height="72" alt=""> | `songbirds-headpiece` | decoration | PNG · WebP |
| Pending publication | `sphinxes-and-cornucopias-in-tall-candelabrum` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `spiny-green-thistle-with-rose-petals` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/c018127952b4d334ebaa306dea0d588fe42aa540/webp/128/spiral-ribbon-column.webp" height="72" alt=""> | `spiral-ribbon-column` | decoration | PNG · WebP |
| Pending publication | `square-floral-ornament-with-circular-medallion` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `square-four-pointed-star-lace-cell` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `square-lace-with-concentric-cross-and-star-corners` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `square-lace-with-radiating-petals-and-triangle-fans` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `square-lace-with-six-looped-petal-medallion` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `square-lace-with-triangle-star-and-small-oval-petals` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `stacked-star-loops-and-knotted-floral-diamonds` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `stag-hunting-landscape-with-three-mounted-hunters` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `standing-ape-archer-with-red-bow-and-long-arrow` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `standing-ape-holding-long-gold-rod` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `standing-ape-trumpeter` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `standing-apostle-with-rolled-scroll` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `standing-contacting-couple-with-small-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `standing-robed-man-holding-long-tailed-bird-on-foliated-support` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `sunburst-rays-with-open-center` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `suspended-foliate-roundel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-canopy-with-framed-figure-and-winged-mask` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-floral-bar-with-knotted-red-blue-ribbons` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-flowering-stem-with-serrated-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-foliate-grotesque-with-female-and-animal-heads` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-foliate-shaft-with-paired-masks-and-dolphins` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-grotesque-candelabrum-with-paired-satyrs` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-grotesque-with-dragons-and-paired-griffins` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-leafy-shaft-with-horned-and-bearded-masks` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-satyr-with-violin-candelabrum` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `tall-silver-acanthus-scroll-with-red-and-blue-flowers` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `thin-red-and-gold-fixed-miniature-frame` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `three-couples-in-garden-under-painted-arcade` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `three-gold-trefoils-on-connected-serpentine-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `three-undulations-between-fine-rules` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `tilted-rose-on-straight-stem-with-three-side-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-boys-with-connected-acanthus-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-children-in-tall-fruiting-leaf-scroll` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-dancing-black-horned-figures-with-touching-feet` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-dancing-devils-in-gold-landscape-oval` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-dancing-monkeys` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-faced-alchemical-figure-and-dragon-scene` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-facing-men-on-gold-with-central-tan-band` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-flower-vases-and-braided-diamonds-panel` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-gold-pointed-leaves-on-fine-curled-stem` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-linked-zodiac-fish` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-open-flowers-on-pointed-basal-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-satyr-couples-on-foliate-candelabrum` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-seated-musicians-with-shared-fountain` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-star-flowers-on-curving-leafy-stem` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `two-touching-rose-stalks-with-drooping-side-bud` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-blue-and-gold-margin-with-three-grotesque-heads` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-blue-and-rust-ivy-sprig` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-flying-day-bird` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-gold-rod-with-red-blue-and-gold-foliate-branch-walters-w171-19v` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-gold-rod-with-red-blue-and-gold-foliate-branch-walters-w171-74r` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-grotesque-face-mask` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-hooded-head-on-bent-gold-rod` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-left-angel-with-musical-instrument-visible-bust` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-left-gray-curled-ivy-with-gold-and-blue-trefoils` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-left-paired-green-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-left-pink-ivy-flourish` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-left-red-and-blue-acanthus-branch` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-red-gold-and-blue-leaf-spray` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-red-trefoil-flower-and-two-green-leaves` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-right-angel-with-trumpet-visible-bust` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-right-pink-flowers-on-green-leaf-sprays` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-right-red-lobed-leaf-terminal` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-row-palmettes-and-paired-scroll-cycle` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-silver-fish-with-red-fins` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-trail-of-pointed-ivy-and-gold-flower` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upper-two-flower-black-twig-with-gold-berry` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upright-crossed-green-leaf-pair` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upright-paired-green-leaves` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `upright-palmettes-and-four-lobed-scroll-cycle` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `upright-pea-vine-with-six-long-pods` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `upright-pointed-red-bud-with-gray-sepals` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `urn-with-tall-curling-plume` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `urn-with-three-tiers-of-foliate-scrolls` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/walters-centaur-archer.webp" height="72" alt=""> | `walters-centaur-archer` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/walters-elephant-castle.webp" height="72" alt=""> | `walters-elephant-castle` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/walters-horse-flute-drum.webp" height="72" alt=""> | `walters-horse-flute-drum` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-002/df62ee450aec78f8a860afa3263ceeb5384199e1/webp/128/walters-rabbit-church-bells.webp" height="72" alt=""> | `walters-rabbit-church-bells` | illustration | PNG · WebP |
| Pending publication | `war-candelabrum-with-dragons-masks-and-weapons` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/weird-dog.webp" height="72" alt=""> | `weird-dog` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/white-animal-bagpiper.webp" height="72" alt=""> | `white-animal-bagpiper` | illustration | PNG · WebP |
| Pending publication | `white-curled-stroke-pattern-on-blue` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-curled-wave-strokes-on-rose` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-curling-vine-on-blue-repeat` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-droplet-loop-on-blue` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-foliate-wave-on-blue` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-foliate-wave-on-rose` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-looped-wave-on-blue` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-robed-winged-angel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `white-wave-and-alternating-dots-on-blue` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `white-zigzag-and-alternating-dots-on-rose` | border | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-01-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-02-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-03-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-04-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-05-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-06-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-07-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-08-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-09-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-10-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-11-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `wind-head-12-from-reverse-wheel` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `winged-child-with-bow-on-clouds` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `winged-child-with-cross-on-clouds` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `winged-dragon-with-curling-red-body-and-foliage` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `winged-haloed-angel-holding-closed-book` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `winged-putto-with-contacted-animal-headed-finial` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `winged-putto-with-shield-and-braided-scroll` | decoration | Review in the local browser (`?assets=local`) |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/cba6e5a3ff98e49370e0edeb24d33ba5ecbc2ed8/webp/128/winged-rabbit.webp" height="72" alt=""> | `winged-rabbit` | illustration | PNG · WebP |
| Pending publication | `winged-two-necked-zodiac-creature` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `woman-leading-harrow-horse` | illustration | Review in the local browser (`?assets=local`) |
| Pending publication | `worn-gold-crescent-moon` | decoration | Review in the local browser (`?assets=local`) |
| Pending publication | `worn-gold-curled-celestial-roundel` | illustration | Review in the local browser (`?assets=local`) |

<!-- gallery:end -->
