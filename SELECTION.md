# Selection guidance

Use `images.json` as the source of truth. Selection fields are deliberately generic:

The npm package generates `/catalog.json` and immutable `ornaments` from this catalog, adding `uses` (`frame`, `divider`, or `image`) and available `formats`. Use `findOrnaments({ use, categories, subjects, colors, query })` for alphabetical selection without a React dependency or image requests. Library divider orientation can be `original`, `horizontal`, or `vertical`; it selects the matching original/rotated asset automatically. See [the integration guide](docs/INTEGRATION.md).

| Field | Meaning |
| --- | --- |
| `description` | Plain-language appearance, source family, and adaptation |
| `categories` | Broad themes: floral, botanical, animals, geometric, knotwork, ribbons, scrollwork |
| `subjects` | Depicted forms, such as bird, butterfly, leaf, flower, ribbon, or diamond |
| `facing` | left, right, front, mixed, or unclear; unclear is normal for abstract ornaments |
| `colors` | Main named colors present in the asset and its adapted corner |
| `composition` | single-ornament, standalone, or repeat-tile |

Also inspect `kind`, `repeat_axis`, and `derivation` before using an asset. Choose `standalone` for complete panels, compositions, or original corner artwork. Choose `repeat-tile` for an extendable strip or frame and take its matching components. A reference crop is for its original appearance and must not be assumed seamless. Floral reconstructions and source-derived miter corners are adaptations. Numbered raster assets retain painted source pixels; their SVGs are approximate color traces.

Every repeat design offers both divider directions: the main tile follows its original `repeat_axis`, while `components.rotated_tile` provides the opposite axis. Choose the matching tile and set `data-axis="y"` for vertical dividers. Both use the same `repeat_ratio`; switching the CSS axis without switching the image would stretch the artwork.

For raster files, choose a listed variant rather than guessing a filename. `max_dimension` is a size-folder upper bound, not necessarily the rendered longest dimension. Use actual `width` and `height` to estimate resolution at the intended display size and pixel density. Never invent a missing larger size. Use SVG when scalable traced geometry is appropriate; use numbered PNG/WebP for the original painted appearance. Read `repeat_ratio` and `border_image_slice_percent`; do not assume a fixed geometry or rotate source miter corners independently. Frames require whole-unit fitting (`round`).

Prefer a restrained pattern for small corners or dense layouts. Use tall standalone panels beside content and repeat strips for separators. Check the preview at the intended size, especially for detailed ornament, mirrored designs, and dark backgrounds. Use an empty alt attribute for purely decorative images; describe meaningful imagery when it conveys content.
