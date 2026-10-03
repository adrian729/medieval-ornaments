import { createFrame, createDivider, createOrnamentImage, findOrnaments } from '@ranx729/medieval-ornaments';
import { createDivider as createBerryDivider } from '@ranx729/medieval-ornaments/designs/red-berry-vine';

// This checkout demo self-hosts images. Installed projects can omit assetsBase
// for version-pinned CDN images, or use their own copied public asset root.
const assetsBase = document.documentElement.dataset.assetsBase || new URL('../../', import.meta.url).href;
const byId = id => document.getElementById(id);
function populate(id, use, selected) {
  const select = byId(id), groups = new Map();
  for (const item of findOrnaments({ use })) {
    const category = item.categories[0];
    if (!groups.has(category)) {
      const group = document.createElement('optgroup'); group.label = category;
      groups.set(category, group);
    }
    const option = document.createElement('option'); option.value = item.name;
    option.textContent = item.name; option.selected = item.name === selected;
    groups.get(category).append(option);
  }
  for (const key of [...groups.keys()].sort()) select.append(groups.get(key));
}
populate('design', 'divider', 'red-berry-vine');
populate('wholeDesign', 'image', 'floral-bird-panel-blue');
let frame = createFrame(byId('frame'), { design: 'red-berry-vine', size: 33, assetsBase });
const divider = createDivider(byId('divider'), { design: 'red-berry-vine', length: 420, assetsBase });
const whole = createOrnamentImage(byId('whole'), { design: 'floral-bird-panel-blue', size: 128, loading: 'lazy', decoding: 'async', assetsBase });
function update() {
  const design = byId('design').value, orientation = byId('orientation').value;
  const size = Number(byId('size').value), length = Number(byId('length').value);
  frame?.update({ design });
  divider.update({ design, orientation, size, length });
  whole.update({ design: byId('wholeDesign').value });
  byId('details').textContent = `${size}px thick · ${length}px available · ${divider.configuration.axis === 'x' ? 'horizontal' : 'vertical'} · ${divider.configuration.asset.path}`;
  byId('code').textContent = `import { createDivider } from '@ranx729/medieval-ornaments';\nimport '@ranx729/medieval-ornaments/styles.css';\n\nconst divider = createDivider(element, {\n  design: '${design}',\n  orientation: '${orientation}',\n  size: ${size}, length: ${length}\n});\n// divider.update({ orientation: 'vertical' });\n// divider.destroy();`;
}
for (const id of ['design', 'orientation', 'size', 'length', 'wholeDesign']) byId(id).addEventListener('input', update);
byId('toggle').addEventListener('click', () => {
  if (frame) { frame.destroy(); frame = null; byId('toggle').textContent = 'Attach frame'; }
  else { frame = createFrame(byId('frame'), { design: byId('design').value, size: 33, assetsBase }); byId('toggle').textContent = 'Detach frame'; }
});
update();
createBerryDivider(byId('selective-divider'), { assetsBase });
document.body.dataset.ready = 'true';
