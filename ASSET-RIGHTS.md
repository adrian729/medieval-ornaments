# Artwork provenance and rights

The integration library has a scoped MIT license in LICENSE. That grant does
not cover the ornament artwork. This collection has no established blanket
artwork license. Availability in a public repository or npm package does not
establish ownership or grant additional rights to the supplied references.

| Family | Method and known source information |
| --- | --- |
| Five painted panels | AI-assisted transparent extractions from a user-supplied five-panel reference; original artist/source rights have not been established. Prompts and limitations are recorded in EXTRACTION-PROMPTS.json in the repository. |
| Six floral styles | Editable geometric reconstructions inspired by a user-supplied six-style sheet. The watermarked sheet's pixels are not embedded or published as cleaned extractions. No blanket rights claim is made for the inspiration or exports. |
| 21 additional source designs | Native crops of five user-supplied sheets without stock watermarks, documented narrow repeat collars, reflected source miters, the sprawling floral panel’s user-requested bottom-border repair and approximate editable vectors. These use color tracing, except the gold bellflower decoration's source-fitted cubic contours and petal gradients. Digital sheet strips 2/4 only. Sources and hashes are recorded in additional-patterns.json; authorship and reuse rights are not established. Watermarked candidates were removed. Three grid-paper stencils retain their backgrounds and documented grid-phase limitations. |
| 38 numbered plate designs | Crops of a user-supplied ornament plate, narrow join adjustments, source-derived miter frames, and approximate color traces. Source scan rights/attribution have not been established. Original pixels, crop audit, and derivation records are retained in the repository. |
| 41 manuscript-style illustrations | Migrated byte-for-byte from medieval-cutouts, preserving descriptions and size variants. Most are AI-assisted cutouts; `animal-musicians-ensemble` preserves the supplied scene including its background and frame. The two documented correction sources/prompts are retained under `sources/medieval-cutouts/` and in EXTRACTION-PROMPTS.json. Import hashes and the source checkout revision are in illustration-import.json. Historical authorship and reuse rights have not been established; AI extraction can reinterpret fine details. |

The catalog identifies each design's derivation and reference family. PNG/WebP
preserve the painted source appearance where documented; SVG traces can lose
detail. Adapted corners are not recovered historical originals.

Source sheets, extraction prompts, and detailed audit records remain at
https://github.com/adrian729/medieval-ornaments . They are not part of the npm
runtime package. Both the runtime and optional `@ranx729/medieval-ornaments-assets` archive
include this notice and the design catalog so
integrators can retain the distinction between software and artwork rights.
