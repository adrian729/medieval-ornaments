# Selection guidance

Use `images.json` as the source of truth. Selection fields are deliberately generic:

| Field | Meaning |
| --- | --- |
| `description` | Plain-language appearance, source family, and adaptation |
| `categories` | Broad themes: floral, botanical, animals, geometric, knotwork, ribbons, scrollwork |
| `subjects` | Depicted forms, such as bird, butterfly, leaf, flower, ribbon, or diamond |
| `facing` | left, right, front, mixed, or unclear; unclear is normal for abstract ornaments |
| `colors` | Main named colors present in the asset and its adapted corner |
| `composition` | single-ornament or repeat-tile |

Also inspect `kind`, `repeat_axis`, and `derivation` before using an asset. Choose `standalone` for a full painted panel. Choose `repeat-tile` for an extendable strip or frame and take its matching components. A reference crop is for its original appearance and must not be assumed seamless. A vector reconstruction is an adaptation, not an exact historical tracing.

For raster files, choose a listed variant rather than guessing a filename. `max_dimension` is the longest dimension, not always width. Use actual `width` and `height` to estimate resolution at the intended display size and pixel density. Never invent a missing larger size. Use SVG when freely scalable decoration is needed.

Prefer a restrained pattern for small corners or dense layouts. Use tall standalone panels beside content and repeat strips for separators. Check the preview at the intended size, especially for detailed ornament, mirrored designs, and dark backgrounds. Use an empty alt attribute for purely decorative images; describe meaningful imagery when it conveys content.
