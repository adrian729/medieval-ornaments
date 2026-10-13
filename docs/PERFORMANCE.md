# Performance and delivery

Use individual imports with default version-pinned CDN delivery for a fixed
selection. Each entry imports only its metadata, its assigned resource URL and
shared helpers. Import `/catalog/borders`, `/catalog/decorations` or
`/catalog/illustrations` for scoped discovery; the full catalog includes every
design. Selection and rendering make no registry or manifest requests.

The runtime contains no artwork and has no automatic artwork dependencies.
Large PNG, lossless WebP and vector files remain in independently versioned
resource packages. Descriptive metadata does not require artwork publication.
Installation and bundle sizes are different measurements; audit both.

## Resolution, formats and loading

Keep automatic format and resolution selection unless application profiling
justifies an override. Resolution uses actual dimensions, target size and pixel
ratio; smaller variants come directly from masters. SVG traces can be much
larger than lossless raster artwork. A trace does not recover source detail.
Do not simplify artwork or lower raster fidelity to reduce delivery bytes.

Whole images reserve source proportions, use native lazy loading and accept
`decoding` and `fetchPriority`. Frames and repeating dividers support opt-in lazy
CSS artwork through one observer per window, with a 200px viewport margin.
SSR remains deterministic; lazy artwork has no requested URL until activation.
Controllers skip unchanged DOM writes and release observer targets on teardown.

Self-hosting chosen files avoids a separate image host connection. Enable text
compression and long caching for versioned URLs. Profile an actual application
before adding preloads, automatic DPR changes, memoization or virtualization.
The optional browser ZIP includes all artwork for complete offline use.

## Repeat the audit

The JavaScript and React playgrounds start with their initial designs rather
than the entire collection. `examples/shared/playground-catalog.js` downloads the full discovery
catalog on the first picker opening; the stable library controllers/components
keep existing DOM and user input intact when discovery arrives. Pickers show a
loading placeholder, render 48 results at a time, and retain full-catalog search.
Thumbnails use the existing lazy artwork loading. A failed module download has
an explicit reload action, since browsers retain module failures for the current
document. React's heading and styles are in HTML, with a placeholder for the
interactive section; JavaScript's controls have disabled initial placeholders.

Use `npm run preview:local` for the production-built demos with unpublished
local artwork. The loopback preview compresses JavaScript/CSS and caches hashed
bundles across page navigation; HTML and mutable artwork remain uncached.
Vite development mode also defers discovery, but includes React's development
runtime and separate source modules. Compare production builds for delivery
measurements. The 2026-10-13 local and throttled checks are recorded in `QA.md`.

Run in a repository checkout with development dependencies, Node 22+ and
Chromium (`CHROME_BIN` can select its executable):

```sh
npm run audit:selective
npm run audit:performance
ORNAMENTS_AUDIT_WIDTH=375 ORNAMENTS_AUDIT_DPR=2 npm run audit:performance
node scripts/performance_audit.mjs tmp/performance/my-audit.json
```

The performance script builds production fixtures, runs a gzip-enabled local
server and cold-cache Chromium, and records transfers, requests, layout shifts,
long tasks and timing samples. Reports stay under ignored `tmp/performance/`.
The selective audit verifies actual included design modules, resource constants
and production CSS retention. Packed consumers test the real npm archive,
optional React, individual imports, copied components and artwork hashes.

The runtime budget is **210,000 B packed / 1,250,000 B unpacked**; each numbered resource adds about 0.4 KB of pins. Resource
uploads have separate capacity limits. Timings are observations, not fixed test
thresholds or field Core Web Vitals. Chromium results do not establish
Safari/Firefox performance, and JS heap observations do not measure decoded
image or native SVG memory.

All previous measurements and version-specific reports are preserved in the
[historical performance audit](https://github.com/adrian729/medieval-ornaments/blob/main/docs/PERFORMANCE-HISTORY.md).
See the [integration guide](INTEGRATION.md#performance-options) for usage.
