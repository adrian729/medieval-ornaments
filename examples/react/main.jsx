import React, { useState, useRef, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OrnamentFrame, OrnamentDivider, OrnamentImage } from '@ranx729/medieval-ornaments/react';
import { findOrnaments } from '@ranx729/medieval-ornaments';
import '../integration.css';

const assetsBase = document.documentElement.dataset.assetsBase || undefined;
const repeats = findOrnaments({ use: 'divider' }), whole = findOrnaments({ use: 'image' });
function Options({ items }) {
  return [...new Set(items.map(item => item.categories[0]))].sort().map(category =>
    <optgroup key={category} label={category}>{items.filter(item => item.categories[0] === category).map(item => <option key={item.name}>{item.name}</option>)}</optgroup>);
}
function App() {
  const [design, setDesign] = useState('red-berry-vine');
  const [orientation, setOrientation] = useState('original');
  const [size, setSize] = useState(24), [length, setLength] = useState(420);
  const [image, setImage] = useState('floral-bird-panel-blue');
  const [note, setNote] = useState('Notes from the garden');
  const [visible, setVisible] = useState(true);
  const frameRef = useRef(null);
  return <main>
    <h1>Ornaments with React</h1>
    <p>Declarative components with styles included and the same defaults and sizing as plain JavaScript.</p>
    <nav><a href="https://github.com/adrian729/medieval-ornaments/blob/main/docs/INTEGRATION.md">Integration guide</a><a href="../vanilla/">Plain JS example</a><a href="../">Design browser</a></nav>
    <div className="controls">
      <label>Repeat design <select id="design" value={design} onChange={e => setDesign(e.target.value)}><Options items={repeats}/></select></label>
      <label>Divider direction <select id="orientation" value={orientation} onChange={e => setOrientation(e.target.value)}><option value="original">Original direction</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
      <label>Divider thickness <input id="size" type="range" min="12" max="64" value={size} onChange={e => setSize(Number(e.target.value))}/></label>
      <label>Available length <input id="length" type="range" min="80" max="600" value={length} onChange={e => setLength(Number(e.target.value))}/></label>
      <label>Whole decoration <select id="wholeDesign" value={image} onChange={e => setImage(e.target.value)}><Options items={whole}/></select></label>
    </div>
    <div className="grid">
      <div>
        {visible && <OrnamentFrame id="frame" className="card" design={design} size={33} assetsBase={assetsBase} ref={frameRef}>
          <h2>A frame for your content</h2><p>React owns this content. Changing the ornament keeps the note and its input element.</p>
          <label>Your note <input id="note" value={note} onChange={e => setNote(e.target.value)}/></label>
        </OrnamentFrame>}
        <div className="divider-slot"><OrnamentDivider id="divider" design={design} orientation={orientation} size={size} length={length} assetsBase={assetsBase}/></div>
        <button id="toggle" onClick={() => setVisible(value => !value)}>{visible ? 'Hide frame' : 'Show frame'}</button>
      </div>
      <div className="whole"><OrnamentImage decoding="async" id="whole" design={image} size={128} assetsBase={assetsBase} loading="lazy"/><p>A whole decoration using a small, suitable asset.</p></div>
    </div>
    <h2>Use it in your project</h2>
    <pre>{`import { OrnamentDivider } from '@ranx729/medieval-ornaments/react';\n\n<OrnamentDivider design="${design}"\n  orientation="${orientation}" size={${size}} length={${length}} />`}</pre>
    <p>Omit orientation to retain the chosen design's original direction. Swapping axes selects the appropriate rotated artwork automatically.</p>
  </main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);
document.body.dataset.reactVersion = React.version;
