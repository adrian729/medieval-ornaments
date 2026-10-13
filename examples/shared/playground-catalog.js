// Start the playground with its visible designs. Discovery is a separate,
// on-demand download; rendering still uses the library's shared controllers.
import * as berry from '../../lib/designs/red-berry-vine.js';
import * as panel from '../../lib/designs/floral-bird-panel-blue.js';
import * as pig from '../../lib/designs/flying-pig.js';
import { createSelection } from '../../lib/selection-core.js';

const initial = [berry, panel, pig];
const resolvers = new Map(initial.map(item => [item.ornament.name, item.resolveOrnament]));
let selection = createSelection(initial.map(item => item.ornament));
let fullCatalog, pending;
export const getOrnament = name => selection.getOrnament(name);
export const findOrnaments = options => selection.findOrnaments(options);
export const resolveOrnament = (use, options) => {
  const resolve = fullCatalog?.resolveOrnament || resolvers.get(options.design);
  if (!resolve) throw new RangeError(`Load the picker before selecting ${options.design}.`);
  return resolve(use, options);
};
export function loadCatalog() {
  if (!pending) pending = import('../../lib/resolve.js').then(catalog => {
    fullCatalog = selection = catalog;
  }).catch(error => { pending = undefined; throw error; });
  return pending;
}
