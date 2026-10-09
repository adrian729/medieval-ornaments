# Medieval ornaments

Reusable medieval borders, painted decorations and manuscript-style illustrations,
with PNG, lossless WebP, and smaller raster sizes. The 41 illustrations from
medieval-cutouts are now maintained here, with their original names, descriptive
metadata and image bytes preserved. [Browse illustrations](https://adrian729.github.io/medieval-ornaments/examples/?type=illustration) or read the [illustration and agent selection guide](docs/ILLUSTRATIONS.md).

The 24 additions from the authored backup include ivy and acanthus ornaments,
independent corner phases, complete frames, four gold rule components, a book and
a rabbit lutenist. They and Polyhymnia carry `author: "adrian729"`.
[Browse authored assets](https://adrian729.github.io/medieval-ornaments/examples/?purpose=whole&type=all&search=adrian729).

## Install and integrate

```sh
npm install @ranx729/medieval-ornaments
```

**Recommended application setup: individual npm imports with default CDN delivery.**
This bundles only chosen designs and shared helpers; the browser fetches selected
image variants. It creates no local image files. Leave `assetsBase` unset and
use `add` or `copy-assets` only when you deliberately want local files.
No asset package is needed for this default workflow.

Dependency-free vanilla JavaScript, optional React components, TypeScript declarations, and categorized discovery use the same normalized contract. See the [integration guide](https://github.com/adrian729/medieval-ornaments/blob/main/docs/INTEGRATION.md), [plain JS example](https://adrian729.github.io/medieval-ornaments/examples/vanilla/), [React example](https://adrian729.github.io/medieval-ornaments/examples/react/), and [browser ZIP](https://github.com/adrian729/medieval-ornaments/releases/download/v0.9.0/medieval-ornaments-browser.zip).

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

Open the [small usage demo](https://adrian729.github.io/medieval-ornaments/) for a decorated card, repeating divider, and decoration or illustration, with copyable HTML/CSS. It includes a dark background, frame choices, and border thickness controls. The [design browser](https://adrian729.github.io/medieval-ornaments/examples/) groups designs by use: frames, repeating dividers, or whole images. Filter by content type, category, facing, composition or transparency, search subjects or colors, and choose a visual preview card. Preview controls apply to the selected use.

Use [ornaments.css](ornaments.css) for consistent classes: `ornament-frame`, `ornament-divider`, and `ornament-image`. Set `--ornament-image` and `--ornament-size`; the stylesheet handles the shared geometry. [Usage details and exceptions](USAGE.md#shared-usage-contract) explain the optional settings.

Run `python3 -m http.server 8765` in this folder and open [the interactive preview](http://localhost:8765/examples/). Frames offer width, height, and thickness; dividers offer orientation, available length, and thickness; decorations and illustrations offer image height. Divider sections remain complete and centered within the available length. Switch between available formats and inspect the original reference where available. Every repeat tile includes a rotated version for using it in either direction with the shared CSS.

The [artwork review page](https://adrian729.github.io/medieval-ornaments/examples/review.html) compares originals, extracted units, repeated strips, and frames at 33px. Switch between painted raster artwork and SVG traces.

The [source-additions review](https://adrian729.github.io/medieval-ornaments/examples/review.html?collection=additions) compares the 21 additions against their original crops. Grid-paper stencil backgrounds are retained; their grid lines have a different period and can show at joins. The temporary testing page has been removed, and watermarked candidates are excluded.

The demo is also at `examples/demo.html`; serve the local checkout as described above so it can load the catalog.

```html
<img src="https://unpkg.com/@ranx729/medieval-ornaments-assets-decorations-001@0.1.4/webp/256/floral-bird-panel-blue.webp"
     alt="" height="256">
```

For a scalable frame:

```css
.ornament-frame {
  --ornament-image: url("https://unpkg.com/@ranx729/medieval-ornaments-assets-borders-001@0.1.3/svg/red-berry-vine-border.svg");
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

161 designs: 58 repeating borders, 46 whole decorations and 57 illustrations.

| Category | Designs |
| --- | --- |
| `animals` | 42 |
| `botanical` | 84 |
| `fantasy` | 26 |
| `floral` | 53 |
| `geometric` | 25 |
| `humans` | 21 |
| `hybrids` | 8 |
| `knotwork` | 2 |
| `music` | 33 |
| `reading` | 3 |
| `ribbons` | 3 |
| `royalty` | 1 |
| `scrollwork` | 75 |

[Open the asset browser for individual downloads, sizes and components](https://adrian729.github.io/medieval-ornaments/examples/).

| Preview | Design | Type | Formats |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/acanthus-tailpiece.webp" height="72" alt=""> | `acanthus-tailpiece` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/aldegrever-paired-tendrils.webp" height="72" alt=""> | `aldegrever-paired-tendrils` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/anafiles.webp" height="72" alt=""> | `anafiles` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/animal-choir-landscape.webp" height="72" alt=""> | `animal-choir-landscape` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/animal-musicians-ensemble.webp" height="72" alt=""> | `animal-musicians-ensemble` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/bird-wind-player.webp" height="72" alt=""> | `bird-wind-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/blue-acanthus-and-seed-head-panel.webp" height="72" alt=""> | `blue-acanthus-and-seed-head-panel` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/blue-alternating-leaf-vine.webp" height="72" alt=""> | `blue-alternating-leaf-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/blue-alternating-stencil-scroll.webp" height="72" alt=""> | `blue-alternating-stencil-scroll` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/blue-diamond-leaf-stencil-band.webp" height="72" alt=""> | `blue-diamond-leaf-stencil-band` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/blue-four-petal-stencil-vine.webp" height="72" alt=""> | `blue-four-petal-stencil-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/blue-looped-quatrefoils.webp" height="72" alt=""> | `blue-looped-quatrefoils` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/blue-paired-birds-and-palmettes.webp" height="72" alt=""> | `blue-paired-birds-and-palmettes` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/blue-staggered-leaf-scrolls.webp" height="72" alt=""> | `blue-staggered-leaf-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/boar-lute-player.webp" height="72" alt=""> | `boar-lute-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/briar-divider.webp" height="72" alt=""> | `briar-divider` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/bunny-harp.webp" height="72" alt=""> | `bunny-harp` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/bunny-trumpet.webp" height="72" alt=""> | `bunny-trumpet` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/butterfly-panel-red.webp" height="72" alt=""> | `butterfly-panel-red` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/canine-fiddle-player.webp" height="72" alt=""> | `canine-fiddle-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/cat-reading-book.webp" height="72" alt=""> | `cat-reading-book` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/choirbook-and-ivy.webp" height="72" alt=""> | `choirbook-and-ivy` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/creature-in-gold-shape.webp" height="72" alt=""> | `creature-in-gold-shape` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/crowned-cat.webp" height="72" alt=""> | `crowned-cat` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/curled-cat.webp" height="72" alt=""> | `curled-cat` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/donkey-organist.webp" height="72" alt=""> | `donkey-organist` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/donkey-rooster-lute-player.webp" height="72" alt=""> | `donkey-rooster-lute-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/fish-with-arms.webp" height="72" alt=""> | `fish-with-arms` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/floral-bird-panel-blue.webp" height="72" alt=""> | `floral-bird-panel-blue` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/floral-bird-panel-left.webp" height="72" alt=""> | `floral-bird-panel-left` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/floral-bird-panel-right.webp" height="72" alt=""> | `floral-bird-panel-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/flying-pig.webp" height="72" alt=""> | `flying-pig` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/frog.webp" height="72" alt=""> | `frog` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/funny-faced-lying-cat.webp" height="72" alt=""> | `funny-faced-lying-cat` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/gold-cinquefoil-divider-center.webp" height="72" alt=""> | `gold-cinquefoil-divider-center` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/gold-cinquefoil-divider-end.webp" height="72" alt=""> | `gold-cinquefoil-divider-end` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/gold-leaf-scroll.webp" height="72" alt=""> | `gold-leaf-scroll` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/gold-lozenge-divider-center.webp" height="72" alt=""> | `gold-lozenge-divider-center` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/gold-lozenge-divider-end.webp" height="72" alt=""> | `gold-lozenge-divider-end` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/gold-quatrefoil-vine.webp" height="72" alt=""> | `gold-quatrefoil-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/gold-scroll-with-blue-bellflowers.webp" height="72" alt=""> | `gold-scroll-with-blue-bellflowers` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/hoefnagel-cut-apple.webp" height="72" alt=""> | `hoefnagel-cut-apple` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/hoefnagel-rose-lower.webp" height="72" alt=""> | `hoefnagel-rose-lower` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/hoefnagel-rose-upper.webp" height="72" alt=""> | `hoefnagel-rose-upper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/hoefnagel-strapwork-frame.webp" height="72" alt=""> | `hoefnagel-strapwork-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/hooded-bagpiper.webp" height="72" alt=""> | `hooded-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/hooded-harp-player.webp" height="72" alt=""> | `hooded-harp-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/hopfer-thistle-panel.webp" height="72" alt=""> | `hopfer-thistle-panel` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/illuminated-acanthus-corner.webp" height="72" alt=""> | `illuminated-acanthus-corner` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/illuminated-acanthus-corner-bottom-left.webp" height="72" alt=""> | `illuminated-acanthus-corner-bottom-left` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/illuminated-acanthus-corner-bottom-right.webp" height="72" alt=""> | `illuminated-acanthus-corner-bottom-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/illuminated-acanthus-corner-top-right.webp" height="72" alt=""> | `illuminated-acanthus-corner-top-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/illuminated-acanthus-frame.webp" height="72" alt=""> | `illuminated-acanthus-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/illuminated-acanthus-headpiece.webp" height="72" alt=""> | `illuminated-acanthus-headpiece` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/illuminated-acanthus-tailpiece.webp" height="72" alt=""> | `illuminated-acanthus-tailpiece` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/interlocking-ribbon.webp" height="72" alt=""> | `interlocking-ribbon` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/isabella-blue-cornflower.webp" height="72" alt=""> | `isabella-blue-cornflower` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/isabella-gold-floral-frame.webp" height="72" alt=""> | `isabella-gold-floral-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/isabella-gray-butterfly.webp" height="72" alt=""> | `isabella-gray-butterfly` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/isabella-orange-butterfly.webp" height="72" alt=""> | `isabella-orange-butterfly` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/isabella-pink-rose.webp" height="72" alt=""> | `isabella-pink-rose` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/isabella-small-bird.webp" height="72" alt=""> | `isabella-small-bird` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-corner.webp" height="72" alt=""> | `ivy-corner` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-corner-bottom-left.webp" height="72" alt=""> | `ivy-corner-bottom-left` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-corner-bottom-right.webp" height="72" alt=""> | `ivy-corner-bottom-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-corner-top-right.webp" height="72" alt=""> | `ivy-corner-top-right` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-fleuron.webp" height="72" alt=""> | `ivy-fleuron` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-line-filler.webp" height="72" alt=""> | `ivy-line-filler` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-manuscript-frame.webp" height="72" alt=""> | `ivy-manuscript-frame` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/ivy-marginal-vine.webp" height="72" alt=""> | `ivy-marginal-vine` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/lizard-lute-player.webp" height="72" alt=""> | `lizard-lute-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r1-c1-organ-player.webp" height="72" alt=""> | `musician-r1-c1-organ-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r1-c2-shawm-player.webp" height="72" alt=""> | `musician-r1-c2-shawm-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r1-c3-horn-player.webp" height="72" alt=""> | `musician-r1-c3-horn-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r1-c4-horn-player.webp" height="72" alt=""> | `musician-r1-c4-horn-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r2-c1-bagpiper.webp" height="72" alt=""> | `musician-r2-c1-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r2-c2-bagpiper.webp" height="72" alt=""> | `musician-r2-c2-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r2-c3-horn-player.webp" height="72" alt=""> | `musician-r2-c3-horn-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r2-c4-psaltery-player.webp" height="72" alt=""> | `musician-r2-c4-psaltery-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r3-c1-bagpiper.webp" height="72" alt=""> | `musician-r3-c1-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r3-c2-lute-player.webp" height="72" alt=""> | `musician-r3-c2-lute-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r3-c3-lute-player.webp" height="72" alt=""> | `musician-r3-c3-lute-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musician-r3-c4-pipe-player.webp" height="72" alt=""> | `musician-r3-c4-pipe-player` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/musicians-and-dancers.webp" height="72" alt=""> | `musicians-and-dancers` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/olive-leaf-and-red-berry-vine.webp" height="72" alt=""> | `olive-leaf-and-red-berry-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/painted-opposed-serrated-flower-vine.webp" height="72" alt=""> | `painted-opposed-serrated-flower-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/painted-rosette-and-fan-vine.webp" height="72" alt=""> | `painted-rosette-and-fan-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/painted-sprawling-floral-panel.webp" height="72" alt=""> | `painted-sprawling-floral-panel` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/painted-symmetric-leaf-and-flower-panel.webp" height="72" alt=""> | `painted-symmetric-leaf-and-flower-panel` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/painted-three-band-floral-panel.webp" height="72" alt=""> | `painted-three-band-floral-panel` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-01-linked-scrolls.webp" height="72" alt=""> | `plate-01-linked-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-02-stepped-ribbon.webp" height="72" alt=""> | `plate-02-stepped-ribbon` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-03-spiral-bands.webp" height="72" alt=""> | `plate-03-spiral-bands` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-04-heart-and-diamond.webp" height="72" alt=""> | `plate-04-heart-and-diamond` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-05-blue-curls.webp" height="72" alt=""> | `plate-05-blue-curls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/plate-06-paired-red-scrolls.webp" height="72" alt=""> | `plate-06-paired-red-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-07-blue-heart-leaves.webp" height="72" alt=""> | `plate-07-blue-heart-leaves` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-08-diagonal-cross.webp" height="72" alt=""> | `plate-08-diagonal-cross` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-09-interlaced-knot.webp" height="72" alt=""> | `plate-09-interlaced-knot` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/plate-10-blue-palmettes.webp" height="72" alt=""> | `plate-10-blue-palmettes` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/plate-11-acanthus-scroll.webp" height="72" alt=""> | `plate-11-acanthus-scroll` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-12-arched-diamonds.webp" height="72" alt=""> | `plate-12-arched-diamonds` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/plate-13-leaf-and-flower-vine.webp" height="72" alt=""> | `plate-13-leaf-and-flower-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-14-crossed-diamonds.webp" height="72" alt=""> | `plate-14-crossed-diamonds` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-15-diamond-square.webp" height="72" alt=""> | `plate-15-diamond-square` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/plate-16-stepped-corner.webp" height="72" alt=""> | `plate-16-stepped-corner` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-17-stepped-arches.webp" height="72" alt=""> | `plate-17-stepped-arches` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-18-fan-palmettes.webp" height="72" alt=""> | `plate-18-fan-palmettes` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-19-cream-scrolls.webp" height="72" alt=""> | `plate-19-cream-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-20-segmented-medallions.webp" height="72" alt=""> | `plate-20-segmented-medallions` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-21-green-flower-medallions.webp" height="72" alt=""> | `plate-21-green-flower-medallions` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-22-white-petal-grid.webp" height="72" alt=""> | `plate-22-white-petal-grid` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-23-crossed-ribbon-knots.webp" height="72" alt=""> | `plate-23-crossed-ribbon-knots` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-24-gold-ring-scrolls.webp" height="72" alt=""> | `plate-24-gold-ring-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-25-greek-crosses.webp" height="72" alt=""> | `plate-25-greek-crosses` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-26-eight-petal-rosette.webp" height="72" alt=""> | `plate-26-eight-petal-rosette` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-27-blue-flower-medallions.webp" height="72" alt=""> | `plate-27-blue-flower-medallions` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-28-angular-blue-meander.webp" height="72" alt=""> | `plate-28-angular-blue-meander` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/plate-29-red-acanthus.webp" height="72" alt=""> | `plate-29-red-acanthus` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/plate-30-layered-palmettes.webp" height="72" alt=""> | `plate-30-layered-palmettes` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/plate-31-alternating-florets.webp" height="72" alt=""> | `plate-31-alternating-florets` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-32-linked-ovals.webp" height="72" alt=""> | `plate-32-linked-ovals` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-33-leaf-scrolls.webp" height="72" alt=""> | `plate-33-leaf-scrolls` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-34-nested-fans.webp" height="72" alt=""> | `plate-34-nested-fans` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-35-crossed-white-stems.webp" height="72" alt=""> | `plate-35-crossed-white-stems` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/plate-36-greek-key.webp" height="72" alt=""> | `plate-36-greek-key` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/plate-37-diamond-scroll.webp" height="72" alt=""> | `plate-37-diamond-scroll` | decoration | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/plate-38-diagonal-meander.webp" height="72" alt=""> | `plate-38-diagonal-meander` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/polyhymnia.webp" height="72" alt=""> | `polyhymnia` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/purple-fine-scroll-lattice.webp" height="72" alt=""> | `purple-fine-scroll-lattice` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/purple-opposed-scroll-vine.webp" height="72" alt=""> | `purple-opposed-scroll-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/purple-oval-rosette-vine.webp" height="72" alt=""> | `purple-oval-rosette-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/rabbit-bagpiper.webp" height="72" alt=""> | `rabbit-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/rabbit-horn-hound-rider.webp" height="72" alt=""> | `rabbit-horn-hound-rider` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/rabbit-lutenist-painted.webp" height="72" alt=""> | `rabbit-lutenist-painted` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/rabbit-reading-book.webp" height="72" alt=""> | `rabbit-reading-book` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/red-berry-vine.webp" height="72" alt=""> | `red-berry-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/red-rosette-vine.webp" height="72" alt=""> | `red-rosette-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/red-trefoil-vine.webp" height="72" alt=""> | `red-trefoil-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/rosselli-foliate-border.webp" height="72" alt=""> | `rosselli-foliate-border` | border | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/rosselli-foliate-strip.webp" height="72" alt=""> | `rosselli-foliate-strip` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/rosselli-mask-border.webp" height="72" alt=""> | `rosselli-mask-border` | border | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/rosselli-mask-strip.webp" height="72" alt=""> | `rosselli-mask-strip` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/rosselli-roundel-bottom.webp" height="72" alt=""> | `rosselli-roundel-bottom` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/rosselli-roundel-second.webp" height="72" alt=""> | `rosselli-roundel-second` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/rosselli-roundel-third.webp" height="72" alt=""> | `rosselli-roundel-third` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/rosselli-roundel-top.webp" height="72" alt=""> | `rosselli-roundel-top` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/russet-floral-vine-with-bud-borders.webp" height="72" alt=""> | `russet-floral-vine-with-bud-borders` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/128/russet-opposed-flowers-and-sage-leaves.webp" height="72" alt=""> | `russet-opposed-flowers-and-sage-leaves` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-borders-001/b7b43e5e4aa40b4526940bc172a6f2d1bcbd67c9/webp/sage-leaf-and-russet-bud-vine.webp" height="72" alt=""> | `sage-leaf-and-russet-bud-vine` | border | PNG · WebP · SVG |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/seated-rabbit.webp" height="72" alt=""> | `seated-rabbit` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/snail.webp" height="72" alt=""> | `snail` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/songbirds-headpiece.webp" height="72" alt=""> | `songbirds-headpiece` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-decorations-001/cadf00605fb05e1a96669b7a9792e22679736a2e/webp/128/spiral-ribbon-column.webp" height="72" alt=""> | `spiral-ribbon-column` | decoration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/walters-centaur-archer.webp" height="72" alt=""> | `walters-centaur-archer` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/walters-elephant-castle.webp" height="72" alt=""> | `walters-elephant-castle` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/walters-horse-flute-drum.webp" height="72" alt=""> | `walters-horse-flute-drum` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/walters-rabbit-church-bells.webp" height="72" alt=""> | `walters-rabbit-church-bells` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/weird-dog.webp" height="72" alt=""> | `weird-dog` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/white-animal-bagpiper.webp" height="72" alt=""> | `white-animal-bagpiper` | illustration | PNG · WebP |
| <img src="https://raw.githubusercontent.com/adrian729/medieval-ornaments-assets-illustrations-001/1aaf383b70fbad7f5ddb714f5c411878b6a2f893/webp/128/winged-rabbit.webp" height="72" alt=""> | `winged-rabbit` | illustration | PNG · WebP |

<!-- gallery:end -->
