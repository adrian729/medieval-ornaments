# Performance audit · 2026-10-03

The historical measurements below cover the earlier artwork collection.
The 2026-10-04 illustration merge is measured separately at the end of this guide.

The expensive part of this collection is artwork delivery and detailed SVG
parsing, rather than component configuration. Runtime 0.4.0 includes the
improvements below and separates the full artwork archive into an optional
asset package with an independent version pin.
No artwork, source, geometry, lossless encoding, or raster variant changed.

## Measured first-load changes

Cold-cache local Chromium, production React bundle, gzip text assets,
1200×900 viewport, DPR 1 and 4× CPU slowdown. Results were sampled two seconds
after page setup. Bytes are response bodies, excluding HTML and HTTP headers.
These are bounded laboratory observations, not field Core Web Vitals or a
claim about a particular mobile connection. Timing samples vary with host load.

| Page | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Design browser | 5,067,690 B / 60 requests | 292,143 B / 20 requests | 94.2% |
| Gold whole-decoration selection | 504,269 B / 19 requests | 338,674 B / 18 requests | 32.8% |
| Original/unit/frame comparison | 11,946,012 B / 188 requests | 54,139 B / 8 requests | 99.5% |
| All-frame previews | 28,005,606 B / 59 requests | 1,058,908 B / 19 requests | 96.2% |

At mobile width (375px, DPR 2), the updated browser requested **158,583 B**,
the comparison page **72,685 B**, and the all-frame page **244,864 B**. Observed
shift was **0.015** in the browser and **0.006** in the comparison page as text
and responsive content settled; the frame page remained at zero. These are
after-only observations, rather than a mobile before/after comparison.

The browser's observed cumulative layout shift fell from **0.443 to 0**;
the whole-decoration selection fell from **0.247 to 0**. The comparison and
frame pages retain zero observed shift in the final sample. Comparison image
slots and browser controls reserve space before asynchronous loading.

The all-frame page previously loaded all SVG traces eagerly. It now uses the
same automatic format policy as the library and activates visible frames.
Its observed long tasks fell from 31 to 2 in these samples. SVG remains a
selectable format. Scrolling still loads and renders the remaining artwork;
lazy loading defers that work rather than eliminating it.

A production React fixture with the complete collection below a 10,000px
spacer requested **7,495,859 B / 128 resources** eagerly. With lazy loading it
requested **97,254 B / 2 resources**, both application JS/CSS, and **zero
artwork requests** initially. Initial component rendering still happens.

## Library startup, computation and updates

- Full minified core, including the public catalog and vanilla API: **32,993 B
  gzipped**, versus **32,440 B** before. The new behavior adds **553 B** gzipped.
  React's peer runtime is additional; artwork is not embedded in application JS.
- Catalog module: **204,862 B raw / 25,795 B gzip**. Consumers share one frozen
  catalog and use a name map. Importing it performs no artwork requests.
- Across the five-run Node samples, 10,000 resolutions took about **16–126ms**,
  1,000 searches about **61–315ms**, and SSR of 1,000 frames about **45–171ms**.
  These small per-call costs do not justify broad memoization. Version 0.5.0
  adds selective imports to reduce bundle transfer and metadata initialization. No CPU-speedup claim is made from
  these variable samples. React rendering and image decoding are separate costs.
- Vanilla previously rewrote every owned class/style/attribute, including
  unchanged image `src`. It now compares actual DOM values before writing.
  The packed browser test verifies **zero attribute mutations** for 20 repeated
  unchanged updates across frame, divider and whole-image controllers.
- Lazy frames/dividers share one observer per window, with a 200px viewport
  margin. Loaded/cancelled elements are removed; idle observers disconnect.
  Teardown cancels pending callbacks. Whole images use native lazy loading.
- Whole images reserve source proportions before decoding. Native `decoding`
  and `fetchPriority` are available through both APIs, with eager/auto defaults.
  Server/client output stays deterministic; pending CSS artwork has no URL in
  lazy SSR markup. Children and refs remain attached to their ordinary nodes.

## Asset resolution, formats and caching

Existing resolution selection already chooses the smallest adequate variant
using actual dimensions, slice geometry/repeat ratio, target size, and density.
PNG/WebP are pre-generated; requesting a size does not generate artwork.
The DPR default of 2 and native master limit remain unchanged.

The browser thumbnails previously requested a 240px longest edge regardless
of their 72px-high container. They now account for the actual contained image
dimensions and DPR, and a viewport observer respects the nested scrolling grid.
The comparison page also selects sufficient existing variants, including for
reference images, and activates one visible card at a time. Original downloads
and comparison masters remain intact. Query initialization selects the intended
design directly rather than first requesting an intermediate decoration.

The largest trace, `russet-floral-vine-with-bud-borders.svg`, is **30,128,662 B
raw / 10,335,602 B gzip** and contains **37,846 paths**. Its native lossless
WebP is **337,814 B**. The sprawling panel's trace is **11,450,818 B raw /
4,242,519 B gzip**, versus **239,168 B** for native WebP. Compact hand-fitted
vectors differ: the gold bellflower SVG is **17,689 B raw / 6,277 B gzip**.
Vector format alone is not a guarantee of smaller downloads or faster rendering.
Generic curve simplification would change detail; it was not applied.

Native cataloged SVGs together occupy about **364 MB** (decimal bytes),
including corner/atlas/rotated alternatives. The old 0.3.2 runtime archive was
**180.45 MB compressed / 420.29 MB unpacked**; even single-design applications
installed the full collection. In 0.4.0 the runtime omits all artwork and does
not depend on the companion. Components still request only selected CDN images.
The new runtime is approximately **93 KB compressed / 637 KB unpacked**, a
**99.95% reduction** in compressed installation bytes. No React or artwork
package is installed for vanilla users.
The copy command streams selected files, or uses an explicitly installed asset
package for offline work. The optional companion and full browser ZIP retain
the complete artwork. See the [migration guide](INTEGRATION.md#migrating-from-03x).

Actual HEAD checks on the published version returned:

- UNPKG version-pinned catalog and WebP: HTTP 200 and
  `Cache-Control: public, max-age=31536000`; catalog text is gzip encoded.
- GitHub Pages catalog: HTTP 200, gzip and `Cache-Control: max-age=600`.

Self-hosting selected designs/formats cuts deployment size and avoids a separate
image CDN connection. Keep text compression enabled. Use long cache lifetimes
for **versioned** paths; the unversioned Pages paths need update-aware caching.
Do not globally preload or preconnect to every possible asset host. Preload
only an actually critical, known selected image if application profiling calls
for it. See the [integration guide](INTEGRATION.md#performance-options).

## Remaining opportunities

1. **Selectively replace exceptionally large traces with source-fitted vectors**
   only where visual review can prove adequate fidelity. This is artwork work,
   not lossless bundle optimization, and must follow the source audit process.
2. **Profile an actual consuming application** before adding React memoization,
   route code splitting, container-responsive `srcSet`, automatic browser DPR,
   virtualization or image preloads. Responsive image selection must consider
   the current height-based contract and SSR. The 70-card demos already retain
   usable DOM size; deferred artwork resolves their measured delivery issue.

No claim of total process/image-memory reduction is made from the recorded JS
heap samples: native SVG structures and decoded image buffers are separate.
Observer lifecycle tests check retained targets instead. No Safari/Firefox
performance claim is made from Chromium measurements.

## Repeat the audit

```sh
npm run audit:performance
# Mobile-width, high-density observation:
ORNAMENTS_AUDIT_WIDTH=375 ORNAMENTS_AUDIT_DPR=2 npm run audit:performance
# Save to a specific ignored report:
node scripts/performance_audit.mjs tmp/performance/my-audit.json
```

In a repository checkout with development dependencies installed, Node 22+
and Chromium are required; `CHROME_BIN` overrides the executable.
The script builds production fixtures under ignored `tmp/performance/`, starts
its own gzip-enabled server and Chrome on free ports, disables the cache,
measures transfer/layout/long-task/heap samples, measures the production core,
and records raw asset sizes and Node computation/SSR samples. It uses no
external image requests or new runtime dependency. For a pre-change baseline,
`ORNAMENTS_AUDIT_LAZY=0` disables the new-option fixture.

Reports for this audit: `tmp/performance/before.json`,
`tmp/performance/final.json`, and `tmp/performance/mobile.json`; scratch iterations also stay in `tmp/`.
Unit/type and actual packed React 18/19 consumer checks cover loading,
hydration, pending updates, unchanged DOM writes, image proportions and teardown.
The artwork/browser checks remain the source of geometry and fidelity coverage.

Browser mechanisms: [native image attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img),
[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver),
[React effect lifecycle and SSR](https://react.dev/reference/react/useEffect),
[React memoization guidance](https://react.dev/reference/react/useMemo).


## Selective imports · 0.5.0

Run `npm run audit:selective` for the production comparison; the JSON report is
written to `tmp/selective-audit/report.json`. Vite minifies a single red berry
vine divider; React is an external peer in both React fixtures. Image bytes and
application/React runtime bytes are excluded.

| Entry | Design metadata modules | JavaScript raw | JavaScript gzip | CSS gzip |
| --- | ---: | ---: | ---: | ---: |
| Full vanilla API | 70 | 254,580 B | 32,825 B | 473 B |
| Individual vanilla | 1 | 15,007 B | 4,662 B | 473 B |
| Full React API | 70 | 254,432 B | 32,792 B | 473 B |
| Individual React | 1 | 14,760 B | 4,589 B | 473 B |

This is about 86% less gzipped library JavaScript for this particular design.
Metadata varies by design. Shared rendering/geometry/visibility helpers are
bundled once when importing multiple designs. The actual packed two-design
React/vanilla consumers verify their module graphs contain two metadata modules,
one resolver, no aggregate catalog/discovery, and retained production CSS.

The `add` installer copies selected metadata/helpers and only the requested
artwork formats, components and variants. Copied code does not import the npm
runtime. It retains existing resolution limits and lossless native artwork.
The runtime npm installation still contains every small module; only installing
the optional companion downloads the complete artwork archive. See
[selective usage](SELECTIVE.md) for both workflows and their costs.

## Illustration consolidation · 0.6.0

The merged collection contains 111 designs. Existing artwork bytes, shared CSS,
resolver, React/vanilla renderers and visibility observer remain unchanged.
Illustrations use the existing native-image loading, reserved proportions,
deterministic size/density selection, lossless WebP default and selective installer.
No SVG trace or upscaled raster was introduced.

`npm run audit:selective` now measures both a border and an illustration, and
asserts scoped discovery module graphs. React is external; CSS remains 473 B gzip.

| Fixture | Metadata entries | JavaScript raw | JavaScript gzip |
| --- | ---: | ---: | ---: |
| Full React API, red berry divider | 111 | 359,898 B | 47,145 B |
| Individual React red berry divider | 1 | 15,160 B | 4,763 B |
| Individual vanilla red berry divider | 1 | 15,407 B | 4,833 B |
| Individual React flying pig image | 1 | 10,749 B | 4,072 B |
| Individual vanilla flying pig image | 1 | 10,992 B | 4,148 B |
| Illustration-only discovery | 41 | 77,350 B | 10,284 B |
| Decoration-only discovery | 14 | 38,601 B | 6,107 B |
| Border-only discovery | 56 | 240,405 B | 28,381 B |

Adding 41 illustrations does not add their metadata to an individual border
import. The prior 4,589 B React border fixture is now 4,763 B: the 174 B increase
covers richer selection metadata and a family-specific CDN default. Full dynamic imports grow with the catalog;
use individual imports when the chosen design is known, and scoped discovery
when a picker needs only one content type. Discovery caches lowercased searchable
text once rather than rebuilding it for each query.

The runtime remains artwork-free with no automatic artwork dependency. Its
compressed package is about 165 KB; the previous 70-design version was 122 KB.
The richer 111-design catalog and declarations use about 1.13 MB installed.
The runtime JSON export is compact to reduce duplicated indentation. The new
budgets are 200 KB compressed / 1.25 MB installed, alongside strict per-design
and scoped-catalog module graph checks. The optional complete archive is about
341 MB compressed / 581 MB installed across two archives. npm rejected the
unified upload with HTTP 413, so the optional full package pins a separate
illustration archive; illustration-only projects can install that archive alone.
Runtime installs still include neither archive. Installing artwork is explicit; `add` downloads
only the requested designs/formats. Image byte fidelity takes priority over
making that optional archive artificially small.

A 128px flying pig at the default 2× density requests a **45,056 B** 256px
WebP instead of the **832,078 B** master. The selected installer retains all
five WebP sizes for later use, but a mounted image requests only the chosen size.
Three-design production consumers contain exactly three metadata modules and one
resolver; copied components have no runtime-package import.

Cold-cache production-browser observations (1200×900, DPR 1, 4× CPU slowdown,
local gzip server, two-second sample; HTML/headers excluded):

| Page | Requests | Response bytes | CLS |
| --- | ---: | ---: | ---: |
| Main frame browser | 20 | 304,276 B | 0 |
| Illustration browser, flying pig at 128px | 16 | 219,524 B | 0.0082 |
| Initial artwork review | 8 | 66,272 B | 0 |
| All 111 designs offscreen, eager React | 169 | 9,724,981 B | 0 |
| All 111 designs offscreen, lazy React | 2 | 109,260 B | 0 |

The illustration browser loads only nearby thumbnails and the selected variant,
not all illustration masters. The small gallery shift occurs during initial
catalog/control setup. Lazy native images preserve their reserved proportions;
the consumer checks verify unchanged geometry after decode. Timings remain
observations, not fixed test thresholds. Reports: `tmp/selective-audit/report.json`
and `tmp/merge-review/performance-final.json`.

Site storage was also audited. Public exports, original reference sources and
the full browser ZIP would approach the [GitHub Pages 1 GB published-site limit](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
`npm run build:site` excludes only the redundant editable `sources/traces/`
directory from deployment, preserves it in Git, and enforces a 950 MB budget.
Public SVG/PNG/WebP paths and original reference sources remain available.

## Resource repository delivery · 0.7.0

The 935,825,529 B site previously included every image and a 341,919,489 B ZIP.
Pages now contains code, catalogs, documentation, demos and shared references;
images load from exact npm CDN pins and the full offline ZIP lives in GitHub
Releases. The assembled site's final measured size is recorded in QA.md. Its
new 50 MB project guard catches accidental resource bundling; GitHub's published
site limit remains 1 GB. Future artwork adds no image bytes to Pages.

Three numbered Git repositories/npm packages own border, decoration and
illustration files. The main registry can add further sources per collection.
The runtime installs no artwork packages automatically, renderers fetch no
routing manifests, and individual imports include one assigned URL constant.
Catalog-free `/resources` exposes pins for explicit offline/direct image use.

| Individual fixture | JS gzip before | JS gzip after |
| --- | ---: | ---: |
| React red berry divider | 4,763 B | 4,773 B |
| Vanilla red berry divider | 4,833 B | 4,850 B |
| React flying pig image | 4,072 B | 4,086 B |
| Vanilla flying pig image | 4,148 B | 4,167 B |

Each fixture still includes exactly one design and shared helpers. The few extra
bytes come from longer numbered package URLs. All scoped discovery bundle sizes
remain unchanged. The generic API includes the complete catalog and source
routing, as expected; choose individual entries for selected designs. Cache
behavior, format/density selection, lazy rendering and lossless source bytes
are preserved. Raw main/Pages image URLs change as documented in
[RESOURCE-MIGRATION.md](RESOURCE-MIGRATION.md); old immutable npm releases remain
available. `npm run audit:selective` checks actual production module graphs.
