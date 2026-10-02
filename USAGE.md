# Choosing and assembling ornaments

## Whole painted decorations

The five narrow panels are complete ornaments. Preserve their aspect ratio. Use an `<img>` with one dimension set and the other automatic; do not stretch them to fill a frame or repeat them as a seamless strip. Select the smallest available PNG/WebP that meets the displayed size times the device pixel ratio. If the required resolution exceeds the master, use the master and reduce the display size rather than creating an enlarged raster export.

## Repeatable vector borders

Each vector entry provides:

| Asset | Purpose |
| --- | --- |
| Main SVG | One repeat period; `repeat_axis` says whether it is horizontal or vertical |
| `components.corner` | A top-left corner that can be rotated for other corners |
| `components.border_image` | Square atlas with four corners, four edge periods, and a transparent center |
| `components.reference_crop` | Original plate region, where supplied; not a seamless tile |

The atlas has a 448 × 448 viewBox and corner regions of 96 × 96. Slice at **21.42857142857143%** on all four sides, without `fill`. Percentage slices work for both SVG and all raster atlas sizes. Set a real CSS border width; the image does not create layout width on its own. No `border-radius` clipping is promised.

```css
.frame {
  box-sizing: border-box;
  border: 40px solid transparent;
  border-image: url("../svg/plate-13-leaf-and-flower-vine-border.svg")
                21.42857142857143% / 1 / 0 round;
  padding: 24px;
}
```

For a horizontal strip use the main tile as a repeating background. At a height of 24px, a horizontal 256 × 96 tile has a natural displayed width of 64px:

```css
.strip {
  height: 24px;
  background: url("../svg/red-berry-vine.svg") repeat-x;
  background-size: 64px 24px;
}
```

For vertical originals the viewBox is 96 × 256. Repeat along `y`, with a natural displayed height of `width × 256 / 96`. Frame atlases already handle both orientations. Use CSS `scaleX(-1)` or `scaleY(-1)` to mirror a decoration; rotate a corner in multiples of 90 degrees. Do not mirror text or directional subjects without inspecting the result.

Choose `round` to fit complete periods across an edge (the browser adjusts their length), or `repeat` for fixed proportions with possible clipped periods. Both keep the corners fixed. Extremely small frames or thick borders can crowd the decoration; inspect those combinations in the preview.

## Original versus adapted artwork

The 38 numbered raster reference crops reproduce their supplied pixels without enlargement. The two L-shaped corner crops mask empty regions to exclude neighboring designs; their visible pixels are unchanged. The SVGs are intentionally simplified interpretations, and square/corner designs from the plate have been adapted into repeat strips. Their corner motifs are designed for the same palette/family, but are not historical reproductions. The six floral borders are redrawn from geometry; no watermarked reference pixels are embedded in those SVGs.

The five transparent panel extractions use built-in imagegen and can reinterpret fine details. Generated extracts were reduced to a 650px longest dimension, the supplied source image's height. They are not presented as higher-resolution reproductions of the original photograph.

## Technical references

SVG patterns support repeated vector artwork; see [MDN SVG patterns](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Patterns). The supplied files are plain vector tiles usable as CSS backgrounds or inside an SVG pattern. Frame atlases use [CSS border-image](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-image); the fit behavior is described in [border-image-repeat](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-image-repeat). Raster vector exports use [CairoSVG](https://cairosvg.org/documentation/).
