import React, { useState, useRef, useMemo, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OrnamentFrame, OrnamentDivider, OrnamentImage } from '@ranx729/medieval-ornaments/react';
import { OrnamentDivider as BerryDivider } from '@ranx729/medieval-ornaments/react/red-berry-vine';
import { OrnamentImage as FlyingPig } from '@ranx729/medieval-ornaments/react/flying-pig';
import { findOrnaments } from '@ranx729/medieval-ornaments';
import '../site.css';
import '../playground.css';

// Published pages use the default CDN; the offline/self-hosted build sets data-assets-base,
// and ?assets=local previews a checkout's linked, not yet published artwork.
const assetsBase = document.documentElement.dataset.assetsBase
  || (new URLSearchParams(location.search).get('assets') === 'local' ? new URL('/', location.href).href : undefined);
if (assetsBase && !document.documentElement.dataset.assetsBase) for (const link of document.querySelectorAll('a[href$="/"], a[href$=".html"]')) link.search = '?assets=local';
const borders = findOrnaments({ use: 'divider' }), images = findOrnaments({ use: 'image' });
const readable = name => { const plate = /^plate-(\d+)-(.*)$/.exec(name), words = (plate ? plate[2] : name).replaceAll('-', ' '); const text = words[0].toUpperCase() + words.slice(1); return plate ? `Plate ${Number(plate[1])} · ${text}` : text; };
const capital = text => text[0].toUpperCase() + text.slice(1);

const typeNames = { border: 'Borders', decoration: 'Decorations', illustration: 'Illustrations' };

// Small published files only (pixelRatio 1); grid thumbnails load as they scroll into view.
function Thumb({ item, lazy }) {
  const shared = { design: item.name, pixelRatio: 1, format: 'webp', assetsBase, ...(lazy ? { loading: 'lazy' } : {}) };
  return item.kind === 'repeat-tile'
    ? <OrnamentDivider {...shared} size={24} orientation="horizontal" />
    : <OrnamentImage {...shared} size={Math.max(8, Math.floor(Math.min(88, 112 * item.height / item.width)))} decoding="async" />;
}

// A searchable picker: type tabs, category filter and text search over the catalog.
function DesignPicker({ id, label, items, search, value, onChange }) {
  const dialog = useRef(null);
  const [open, setOpen] = useState(false), [type, setType] = useState('all'), [category, setCategory] = useState(''), [query, setQuery] = useState('');
  const types = useMemo(() => [...new Set(items.map(item => item.asset_type))], [items]);
  const pool = items.filter(item => type === 'all' || item.asset_type === type);
  const counts = new Map();
  for (const item of pool) for (const name of item.categories) counts.set(name, (counts.get(name) || 0) + 1);
  const activeCategory = counts.has(category) ? category : '';
  const allowed = useMemo(() => new Set(search(query).map(item => item.name)), [search, query]);
  const results = pool.filter(item => allowed.has(item.name) && (!activeCategory || item.categories.includes(activeCategory)));
  const current = items.find(item => item.name === value);
  const close = () => dialog.current.close();
  return <>
    <button type="button" className="picker-trigger" id={id} data-value={value} aria-haspopup="dialog" onClick={() => { setQuery(''); setOpen(true); dialog.current.showModal(); }}>
      <span className="picker-thumb"><Thumb item={current} /></span>
      <span className="picker-label"><strong>{readable(value)}</strong><small>Change</small></span>
    </button>
    <dialog ref={dialog} className="picker" aria-label={`Choose ${label.toLowerCase()}`} onClose={() => setOpen(false)} onClick={event => event.target === dialog.current && close()}>
      <div className="picker-head"><h2>Choose {label.toLowerCase()}</h2><button type="button" className="btn btn-icon" aria-label="Close" onClick={close}>×</button></div>
      <div className="picker-tools">
        {types.length > 1 && <div className="segmented" role="group" aria-label="Type">
          {['all', ...types].map(name => <button key={name} type="button" aria-pressed={type === name} onClick={() => setType(name)}>{name === 'all' ? 'All' : typeNames[name]}</button>)}
        </div>}
        <input type="search" value={query} placeholder="Search names, subjects, colours…" aria-label={`Search ${label.toLowerCase()}`} onChange={event => setQuery(event.target.value)} />
        <select value={activeCategory} aria-label="Category" onChange={event => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {[...counts].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => <option key={name} value={name}>{capital(name)} ({count})</option>)}
        </select>
      </div>
      <p className="picker-count" aria-live="polite">{results.length ? `${results.length} design${results.length === 1 ? '' : 's'}` : 'No designs match. Try another word or category.'}</p>
      {open && <ul className="picker-grid">{results.map(item => <li key={item.name}>
        <button type="button" className="picker-tile" data-design={item.name} aria-pressed={item.name === value} onClick={() => { onChange(item.name); close(); }}>
          <span className="tile-art"><Thumb item={item} lazy /></span><span className="tile-name">{readable(item.name)}</span>
        </button>
      </li>)}</ul>}
    </dialog>
  </>;
}
const searchBorders = query => findOrnaments({ use: 'divider', query }), searchImages = query => findOrnaments({ use: 'image', query });

function Code({ children }) {
  const [label, setLabel] = useState('Copy');
  const copy = async () => { try { await navigator.clipboard.writeText(children); setLabel('Copied'); } catch { setLabel('Press Ctrl/⌘ C'); } setTimeout(() => setLabel('Copy'), 1800); };
  return <div className="code-panel">
    <div className="code-bar"><div className="code-tabs"><button type="button" aria-selected="true">React</button></div><button className="copy" type="button" onClick={copy}>{label}</button></div>
    <pre className="code">{children}</pre>
  </div>;
}

function App() {
  const [design, setDesign] = useState('red-berry-vine');
  const [orientation, setOrientation] = useState('original');
  const [size, setSize] = useState(24);
  const [image, setImage] = useState('floral-bird-panel-blue');
  const [imageSize, setImageSize] = useState(128);
  const [note, setNote] = useState('Notes from the garden');
  const [visible, setVisible] = useState(true);
  const snippet = `import { OrnamentFrame, OrnamentDivider, OrnamentImage }
  from '@ranx729/medieval-ornaments/react';

<OrnamentFrame design="${design}" size={${size}}>
  …
</OrnamentFrame>
<OrnamentDivider design="${design}" orientation="${orientation}" size={${size}} />
<OrnamentImage design="${image}" size={${imageSize}} loading="lazy" />`;
  return <>
    <div className="page-head">
      <p className="eyebrow">Integration</p>
      <h1>React</h1>
      <p className="lede">Declarative frames, dividers and images. Styles are included, server rendering works, and your own children and state are never replaced.</p>
      <div className="install"><code>npm i @ranx729/medieval-ornaments</code></div>
    </div>

    <section className="section" aria-labelledby="playTitle">
      <div className="section-head"><h2 id="playTitle">Try the components</h2><p className="muted">Change any option: React re-renders the same elements, and the note you type stays put.</p></div>
      <div className="playground">
        <form className="panel play-controls" onSubmit={event => event.preventDefault()}>
          <div className="field"><span>Border</span><DesignPicker id="design" label="Border" items={borders} search={searchBorders} value={design} onChange={setDesign} /></div>
          <label className="field">Divider direction <select id="orientation" value={orientation} onChange={event => setOrientation(event.target.value)}><option value="original">Original direction</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
          <label className="field"><span className="field-row">Thickness <output>{size}px</output></span><input id="size" type="range" min="12" max="64" value={size} onChange={event => setSize(Number(event.target.value))} /></label>
          <div className="field"><span>Image</span><DesignPicker id="wholeDesign" label="Image" items={images} search={searchImages} value={image} onChange={setImage} /></div>
          <label className="field">Image height <select id="imageSize" value={imageSize} onChange={event => setImageSize(Number(event.target.value))}><option value="96">96px</option><option value="128">128px</option><option value="192">192px</option></select></label>
        </form>
        <div className="play-output">
          <div className="stage">
            {visible && <OrnamentFrame id="frame" className="play-card" design={design} size={size} assetsBase={assetsBase}>
              <h2>A frame for your content</h2>
              <p>React owns these children. Changing the border keeps this text and the input below.</p>
              <label className="field">Your note <input id="note" type="text" value={note} onChange={event => setNote(event.target.value)} /></label>
            </OrnamentFrame>}
          </div>
          <div className="play-row">
            <div className="stage divider-stage"><OrnamentDivider id="divider" design={design} orientation={orientation} size={size} assetsBase={assetsBase} /></div>
            <div className="stage image-stage"><OrnamentImage id="whole" design={image} size={imageSize} loading="lazy" decoding="async" assetsBase={assetsBase} /></div>
          </div>
          <p className="play-actions"><button id="toggle" className="btn btn-sm" type="button" onClick={() => setVisible(value => !value)}>{visible ? 'Hide frame' : 'Show frame'}</button><span className="muted">Your note survives because its state lives above the frame.</span></p>
        </div>
      </div>
      <Code>{snippet}</Code>
    </section>

    <section className="section" aria-labelledby="oneTitle">
      <div className="section-head"><h2 id="oneTitle">Import a single design</h2><p className="muted">Each design has its own entry point. The bundle contains only its metadata, and the <code>design</code> prop is not needed.</p></div>
      <div className="split">
        <div className="stage"><BerryDivider id="selective-divider" assetsBase={assetsBase} /></div>
        <Code>{`import { OrnamentDivider }\n  from '@ranx729/medieval-ornaments/react/red-berry-vine';\n\n<OrnamentDivider />`}</Code>
        <div className="stage"><FlyingPig id="selective-illustration" assetsBase={assetsBase} size={128} loading="lazy" decoding="async" alt="A winged pig" /></div>
        <Code>{`import { OrnamentImage as FlyingPig }\n  from '@ranx729/medieval-ornaments/react/flying-pig';\n\n<FlyingPig size={128} loading="lazy" decoding="async" />`}</Code>
      </div>
    </section>

    <section className="section" aria-labelledby="moreTitle">
      <div className="section-head"><h2 id="moreTitle">Learn more</h2></div>
      <nav className="doc-links" aria-label="Guides">
        <a href="https://github.com/adrian729/medieval-ornaments/blob/main/docs/INTEGRATION.md">Integration guide</a>
        <a href="https://github.com/adrian729/medieval-ornaments/blob/main/docs/SELECTIVE.md">Individual imports and the CLI</a>
        <a href="https://github.com/adrian729/medieval-ornaments/blob/main/docs/ILLUSTRATIONS.md">Illustrations and metadata</a>
        <a href="../index.html">Find design names in the gallery</a>
      </nav>
    </section>
  </>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
document.body.dataset.reactVersion = React.version;
document.body.dataset.ready = 'true';
