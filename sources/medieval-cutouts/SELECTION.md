# Choosing an image

Read [`images.json`](images.json) to select an illustration and its size. Each entry contains the original paths, dimensions, byte sizes, smaller variants, and six selection fields. An image can match several categories.

## Selection fields

| Field | Meaning |
| --- | --- |
| `description` | A concise description of visible subjects, objects, clothing, pose, and distinctive features. Search this for details such as wings, a hood, or a particular instrument. |
| `categories` | Broad subject and theme tags from the vocabulary below. |
| `subjects` | Specific depicted subjects and key objects, using singular lowercase names such as `rabbit`, `human`, `crown`, `harp`, or `bagpipes`. |
| `facing` | Direction of the main face or head: `left`, `right`, `front`, `mixed`, or `unclear`. This is relative to the viewer, not the direction of an instrument or tail. |
| `colors` | Main visible colors, excluding transparent pixels: `black`, `blue`, `brown`, `cream`, `gold`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `white`, or `yellow`. These are approximate visual labels, not sampled color codes. |
| `composition` | `single-figure` for one figure with any associated objects; `multiple-figures` for an unframed group; `framed-scene` when a visible scene or frame remains. |

## Category vocabulary

| Category | Meaning |
| --- | --- |
| `animals` | Animal figures and creatures with recognizable animal features. |
| `humans` | Human figures. Human-like limbs on a creature do not by themselves add this category. |
| `hybrids` | Figures visibly combining different kinds of bodies or features, such as a donkey head with rooster legs. |
| `music` | Figures playing or holding musical instruments. Specific instruments appear in `subjects` and descriptions. |
| `reading` | Figures reading or holding open books. |
| `fantasy` | Mythical creatures, impossible anatomy, or animals performing human activities such as playing music. |
| `royalty` | Visible royal imagery, currently a crown. This describes the motif, not a verified historical identity. |

These tags describe the published cutouts. When a subject is identified or corrected, update its filename, catalog name, paths, metadata, and documentation together. Use descriptions for details and uncertainty; `donkey-rooster-lute-player`, for example, combines a donkey head with rooster legs and a feathered tail while playing a lute. Ambiguous creatures use names such as `animal-like-creature`, `bird-like-creature`, `canine-like-creature`, and `dog-like-creature`; do not infer a definite species from those tags.

## Selection workflow

1. Match the requested broad categories and specific subjects. Use descriptions for details that have no dedicated field. For example, a rabbit musician matches category `music` and subject `rabbit`; a winged animal matches `animals` and a description mentioning wings.
2. Compare facing, colors, composition, and width/height against the intended layout. A corner illustration can face toward the page content. Do not assume a square canvas means the visible figure is square: transparent padding may remain.
3. Inspect candidate previews before choosing. Metadata supports selection but does not describe every visual detail. Check legibility at the intended display size and against the intended background. Some framed scenes intentionally retain an opaque background; check before treating an image as a transparent decoration.
4. Choose an existing variant whose width **and** height meet the displayed dimensions multiplied by the display's pixel density. Prefer the smallest sufficient variant. Use the original if no smaller version suffices. If even the original is too small, choose another image or reduce the display size; never generate an enlarged asset.
5. Use the exact catalog path. Prefer WebP for its smaller file size, or PNG when needed. For remote use, prepend `https://raw.githubusercontent.com/adrian729/medieval-cutouts/main/`. Replace `main` with a commit SHA to pin a version.

For example, `flying-pig` displayed at 128 × 128 CSS pixels needs the 128-pixel variant at 1× density or the 256-pixel variant at 2× density. Other figures have different proportions; check both dimensions in the catalog.

## Maintaining the catalog

Keep descriptions factual and category meanings consistent. Reuse existing subject terms for the same depicted subject. New subjects can be added without introducing new fields. Only add broad categories or color labels when needed, updating this guide and the validator's vocabulary together.

The resize generator preserves selection fields. After editing metadata, refresh the README category index and validate the catalog:

```sh
python3 scripts/update_category_index.py
python3 scripts/update_category_index.py --check
```

The check verifies selection fields, vocabulary, catalog paths and variant ordering, and that the README index matches the catalog. It does not judge the visual accuracy of descriptions.
