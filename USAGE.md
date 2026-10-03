# Choosing and assembling ornaments

For normalized vanilla JS and React components with automatic orientation, geometry, format, and size selection, use the npm package. React's `/react` entry includes the shared CSS automatically; vanilla and `/react/unstyled` load it separately. See [docs/INTEGRATION.md](docs/INTEGRATION.md). The CSS contract below remains available for direct HTML/CSS use.

## Shared usage contract

Include [ornaments.css](ornaments.css) once:

```html
<link rel="stylesheet" href="https://adrian729.github.io/medieval-ornaments/ornaments.css">
```

| Class | Asset | Size means |
| --- | --- | --- |
| `ornament-divider` | Main or `components.rotated_tile` repeat tile | Strip thickness |
| `ornament-frame` | `components.border_image` | Border thickness |
| `ornament-image` | Whole decoration | Image height |

Set `--ornament-image` to an absolute asset URL for frames/dividers, and `--ornament-size` to the display size. Relative URLs in this variable resolve against the shared stylesheet; local assets therefore use `url('svg/design.svg')` or `url('webp/design.webp')`. Resolve catalog paths in JavaScript with `new URL(path, collectionBaseUrl).href`.

Use the catalog's `border_image_slice_percent` for `--ornament-slice`, and its `repeat_ratio` for `--ornament-ratio`. Plate designs retain their native proportions, so these values differ between designs. The six floral vectors retain the defaults of 256/96 and 21.42857142857143%.

```html
<article class="ornament-frame" style="
  --ornament-image: url('https://adrian729.github.io/medieval-ornaments/svg/red-berry-vine-border.svg');
  --ornament-slice: 21.42857142857143%;
  --ornament-size: 33px; padding: 24px;">
  Your content
</article>
```

## Frames

Frames always use `round`, fitting complete units into each side. A partial unit from `repeat` cannot meet the corner's expected phase and can cut petals or leaves. Whole-unit fitting can slightly adjust the length of a motif, so inspect narrow frames and thick borders.

Use the complete supplied atlas. Floral corners are adapted turns. Painted plate corners are mitered reflections of the same pattern; the atlas has four correctly phased corners and reflected edge directions. The separate `components.corner` export is the top-left piece, not a universal piece to rotate blindly. Diagonal miter reflections are adaptations, not recovered historical corners.

Slice with the catalog percentage, without `fill`. The center remains transparent. Set a real CSS border width through `--ornament-size`; no `border-radius` clipping is promised.

The demo uses SVG for its floral frame and source WebP for its painted plate frames. The browser offers the corresponding SVG color traces for comparison.

## Dividers

Use the main tile as a repeating background. For a horizontal divider:

```html
<div class="ornament-divider" style="
  --ornament-image: url('https://adrian729.github.io/medieval-ornaments/svg/red-berry-vine.svg');
  --ornament-size: 24px; --ornament-ratio: 2.6666666666666665;
  --ornament-length: 100%;" aria-hidden="true"></div>
```

Every repeat design also supplies `components.rotated_tile`: the same artwork turned 90 degrees, in SVG, PNG, WebP, and smaller sizes. Its `repeat_axis` is opposite to the main tile's, and its `repeat_ratio` is unchanged. Choose the asset whose axis matches the direction you want. PNG/WebP rotations rearrange existing pixels without interpolation or enlargement.

Vertical dividers add `data-axis="y"`; the available length then sets height and the thickness sets width. Setting that attribute alone does not rotate a horizontal image: use the matching vertical asset too. For example:

```html
<div class="ornament-divider" data-axis="y" style="
  --ornament-image: url('https://adrian729.github.io/medieval-ornaments/svg/red-berry-vine-rotated.svg');
  --ornament-size: 24px; --ornament-ratio: 2.6666666666666665;
  --ornament-length: 240px;" aria-hidden="true"></div>
```

The browser's Orientation selector offers Horizontal, Vertical, and Original direction; asset links follow your choice. `--ornament-length` sets the available space. The shared CSS fits as many complete, contiguous sections as possible and centers them within that space, leaving equal empty space at both ends. The artwork retains its thickness and proportions. If even one section is too long, nothing is painted: increase the available length or reduce the thickness.

This works responsively with `--ornament-length:100%` and requires no JavaScript. The painted background lives on `::before`; leave that pseudo-element available. Whole-section fitting uses [CSS round()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/round). Older browsers without that function fit complete tiles by slightly adjusting their length instead. Frames keep their separate `round` fitting around corners.

## Whole decorations

The five extracted panels, plate 11, 16, 36, and 37, and five new source decorations have `kind=standalone` and `repeat_axis=none`. They have no frame atlas. Use `ornament-image` or a normal `<img>` and preserve proportions. The plate exceptions retain complete acanthus/corner artwork rather than pretending their supplied regions form seamless strips.

```html
<img class="ornament-image"
     src="https://adrian729.github.io/medieval-ornaments/webp/256/floral-bird-panel-blue.webp"
     style="--ornament-size: 256px" alt="">
```

Use empty alt text for purely decorative art; describe an image when its subject conveys meaning.

## Source artwork and vectors

The 38 reference crops reproduce the supplied pixels without enlargement; two L-shaped crops mask neighboring regions. The full original sheet is in `sources/`. [source-patterns.json](source-patterns.json) records crop bounds, direction, unit choice, whole-art exceptions, and repeat rationale.

Numbered PNG/WebP tiles retain painted pixels. Their repeating units have a two-pixel adjustment at both ends to reconcile print/scanning differences; the interior is unchanged. Their native corners/atlases rearrange and reflect these pixels without interpolation or enlargement. Some entries deliberately repeat one complete square/medallion cell instead of claiming an unavailable full color cycle. These choices are explicit in the catalog.

The numbered SVGs trace those actual shapes with an adaptive color palette. They approximate print tones and curves, and can lose subtle detail; choose PNG/WebP when the painted appearance matters. They contain real vector paths, not embedded raster images. The six floral designs are geometric redraws; the watermarked sheet's pixels are not embedded or published as cleaned artwork.

The five transparent panels are AI-assisted extractions and can reinterpret detail. Their master dimensions are capped at the supplied source's 650px height.

The 21 source additions are audited in `additional-patterns.json`; native PNG/WebP preserve source backgrounds and pixels apart from documented narrow repeat collars. Whole-ended or irregular decorations have no frame/divider capability. The three blue stencil designs retain their grid-paper backgrounds, whose grid lines have a different period and can show at joins. Use the main design browser or artwork review page for comparisons. Watermarked candidates and the temporary additions page were removed. Version 0.3.0 includes all 70 designs and uses version-pinned UNPKG asset URLs.

## Raster size selection

Choose listed variants by actual width/height and the display size times pixel density; do not guess filenames. Every smaller export comes directly from its master. Source pixels are never exported enlarged.

Size folders are upper bounds. Frame variants use dimensions that keep slice boundaries on integer pixels, so a `128/` atlas might be 126px and some smaller atlas sizes are absent. Native plate assets are already small. SVG can scale its traced shapes, but does not recover missing source detail.

The [design browser](https://adrian729.github.io/medieval-ornaments/examples/) filters by use, category, subjects, and colors. The [artwork comparison page](https://adrian729.github.io/medieval-ornaments/examples/review.html) shows originals, units, repetitions, and frames, with format/background/thickness controls.

## Technical references

Frame fitting follows [CSS border-image-repeat](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-image-repeat); slice geometry follows [border-image-slice](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-image-slice). Source color tracing uses [VTracer](https://github.com/visioncortex/vtracer); ordinary SVG rendering uses [CairoSVG](https://cairosvg.org/documentation/).
