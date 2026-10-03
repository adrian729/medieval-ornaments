# Performance audit · 2026-10-03

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
  These small per-call costs do not justify broad memoization or splitting a
  stable public catalog during this change. No CPU-speedup claim is made from
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
