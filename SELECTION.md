# Selection guidance

For agents integrating chosen designs, default to **individual npm imports and
CDN image delivery**. Leave `assetsBase` unset. Selecting a design does not
require copying images, running `add`/`copy-assets` or installing asset archives.
Choose local files for existing self-hosting, explicit editable/offline needs
or a measured delivery problem. Keep automatic format/resolution selection;
use lazy loading for offscreen art and eager loading for visible critical art.
See [workflow differences and performance tradeoffs](docs/SELECTIVE.md).

Use `images.json` as the source of truth. Selection fields are deliberately generic:

The npm package generates `/catalog.json` and immutable `ornaments` from this catalog, adding `uses` (`frame`, `divider`, or `image`) and available `formats`. Use `findOrnaments({ use, assetType, categories, subjects, colors, facing, composition, hasTransparency, query })` for alphabetical selection without a React dependency or image requests. `/catalog/borders`, `/catalog/decorations` and `/catalog/illustrations` import only their respective metadata. Library divider orientation can be `original`, `horizontal`, or `vertical`; it selects the matching original/rotated asset automatically. See [the integration guide](docs/INTEGRATION.md) and [the illustration/agent selection guide](docs/ILLUSTRATIONS.md).

| Field | Meaning |
| --- | --- |
| `description` | Factual visible appearance, pose, clothing, objects and distinctive details; preserve uncertain identities |
| `provenance` | Optional source institution, object/folio, date, artist when known, record/image links, source image terms and derivation method; absent for existing assets whose origins were not researched |
| `categories` | Broad overlapping themes, defined below |
| `subjects` | Depicted forms and objects, preferably singular: rabbit, human, lute, leaf, flower, ribbon or diamond |
| `facing` | left, right, front, mixed, or unclear; describes the main head relative to the viewer, not an instrument. Abstract ornaments normally use unclear |
| `colors` | Approximate main colors, excluding transparency: beige, black, blue, brown, cream, gold, gray, green, light-blue, orange, pink, purple, red, tan, white, yellow |
| `composition` | single-ornament, standalone, repeat-tile, single-figure, multiple-figures or framed-scene |

`asset_type` distinguishes `border`, `decoration` and `illustration`. This is
independent of subject categories: a bird border and a bird musician can both
match `animals`. `kind: standalone` includes decorations and illustrations;
it always renders as a whole image. `has_transparency` is measured from the main
PNG and means at least one pixel has alpha below 255. It does not promise that
all interior backgrounds are removed. Read `usage_notes` for retained scenes,
graph paper, original corner shapes, unverified repeats and extraction fidelity.
The machine-readable vocabulary and field descriptions live in [images.schema.json](images.schema.json).

| Category | Meaning |
| --- | --- |
| animals | Animal figures and recognizable animal features |
| botanical | Leaves, vines, stems and other plant forms |
| fantasy | Mythical/impossible figures and animals performing human activities |
| floral | Flowers, floral crosses, rosettes and palmettes |
| geometric | Angular or repeating geometric forms |
| humans | Human figures; human-like limbs alone do not make a creature human |
| hybrids | Figures visibly combining different kinds of bodies/features |
| knotwork | Interlaced or knotted bands |
| music | Figures playing or holding musical instruments; instruments are subjects |
| reading | Figures reading or holding open books |
| ribbons | Ribbon and woven band motifs |
| royalty | Visible royal imagery such as a crown, without asserting historical identity |
| scrollwork | Curled ornamental stems, bands or scrolls |

`single-figure` includes a figure's associated objects. `multiple-figures` is an
unframed group; `framed-scene` retains a scene or frame. Keep existing plural
ornament subject tags for compatibility; singular aliases have been added for
selection across both collections. All requested category/subject/color tags
must match. Search requires all case-insensitive whitespace-separated tokens and
includes usage notes and descriptive fields; results are not relevance-ranked.

Also inspect `kind`, `repeat_axis`, and `derivation` before using an asset. Choose `standalone` for complete panels, compositions, or original corner artwork. Choose `repeat-tile` for an extendable strip or frame and take its matching components. A reference crop is for its original appearance and must not be assumed seamless. Floral reconstructions and source-derived miter corners are adaptations. Numbered raster assets retain painted source pixels; their SVGs are approximate color traces.

Every repeat design offers both divider directions: the main tile follows its original `repeat_axis`, while `components.rotated_tile` provides the opposite axis. Choose the matching tile and set `data-axis="y"` for vertical dividers. Both use the same `repeat_ratio`; switching the CSS axis without switching the image would stretch the artwork.

For raster files, choose a listed variant rather than guessing a filename. `max_dimension` is a size-folder upper bound, not necessarily the rendered longest dimension. Use actual `width` and `height` to estimate resolution at the intended display size and pixel density. Never invent a missing larger size. Use SVG when scalable traced geometry is appropriate; use numbered PNG/WebP for the original painted appearance. Read `repeat_ratio` and `border_image_slice_percent`; do not assume a fixed geometry or rotate source miter corners independently. Frames require whole-unit fitting (`round`).

Prefer a restrained pattern for small corners or dense layouts. Use tall standalone panels beside content and repeat strips for separators. Check the preview at the intended size, especially for detailed ornament, mirrored designs, and dark backgrounds. Use an empty alt attribute for purely decorative images; describe meaningful imagery when it conveys content.
