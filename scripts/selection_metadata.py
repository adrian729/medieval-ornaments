"""Compose image-only illustrations and factual, shared selection metadata."""
import json
from pathlib import Path
from PIL import Image
from resource_paths import resource_file

ROOT = Path(__file__).resolve().parents[1]


def illustrations():
    path = ROOT / 'illustrations.json'
    if not path.exists():
        return []
    imported=set(json.loads((ROOT/'illustration-import.json').read_text())['designs'])
    return [dict(item, kind='standalone', repeat_axis='none', components={},
                 reference=item.get('reference', 'medieval-cutouts' if item['name'] in imported else 'supplied-illustration'), asset_type='illustration',
                 derivation=item.get('derivation', 'preserved-source-scene' if item['name'] == 'animal-musicians-ensemble' else 'ai-assisted-extraction' if item['name'] in imported else 'supplied-illustration'))
            for item in json.loads(path.read_text())]


def enrich(catalog, measure=None):
    previous={item['name']:item for item in json.loads((ROOT/'images.json').read_text())}
    overrides = json.loads((ROOT / 'selection-metadata.json').read_text())
    authored_notes = {}
    authored_origins = {}
    for filename in ['illustrations.json', 'raster-metadata.json', 'historical-border-patterns.json']:
        master = ROOT / filename
        if master.exists():
            items = json.loads(master.read_text())
            authored_notes.update({item['name']: item.get('usage_notes', []) for item in items})
            authored_origins.update({item['name']: item.get('provenance') for item in items})
    for item in catalog:
        if item['name'] in authored_origins:
            origin = authored_origins[item['name']]
            if origin is not None:
                item['provenance'] = origin
            else:
                item.pop('provenance', None)
        facts = overrides.get(item['name'], {})
        if facts.get('description'):
            item['description'] = facts['description']
        item['subjects'] = list(dict.fromkeys([*item['subjects'], *facts.get('subjects_add', [])]))
        item['asset_type'] = ('illustration' if item.get('asset_type') == 'illustration' or item.get('reference') == 'medieval-cutouts'
                              else 'border' if item['kind'] == 'repeat-tile' else 'decoration')
        prior=previous.get(item['name'], {})
        if 'has_transparency' not in prior or (measure is not None and item['name'] in measure):
            with Image.open(resource_file(item['png'])) as image:
                item['has_transparency'] = image.convert('RGBA').getchannel('A').getextrema()[0] < 255
        else:
            item['has_transparency'] = prior['has_transparency']
        # Read authored notes from the master, never yesterday's generated notes.
        notes = [*authored_notes.get(item['name'], []), *facts.get('usage_notes', [])]
        if item['kind'] == 'repeat-tile':
            notes.append(f"Repeats originally {'vertically' if item['repeat_axis'] == 'y' else 'horizontally'}; use the matching rotated tile for the other axis and the supplied atlas with round fitting for frames.")
        else:
            notes.append('Complete image; no verified repeating unit or frame atlas. Preserve its proportions.')
        if not item['has_transparency']:
            notes.append('Opaque background is part of this image; it will cover the surface behind it.')
        if item['derivation'] == 'source-crop-and-color-trace':
            notes.append('PNG/WebP preserve the painted source appearance; SVG is an approximate trace. Check the reference crop and repeat audit for source limitations.')
        elif item['derivation'] == 'ai-assisted-extraction':
            notes.append('AI-assisted extraction can reinterpret details; this is not a pixel-exact historical crop.')
        item['usage_notes'] = list(dict.fromkeys(notes))
    # Additions must not move or rewrite the established historical entries.
    order = {name: index for index, name in enumerate(previous)}
    catalog.sort(key=lambda item: order.get(item['name'], len(order)))
    return catalog


def refresh(measure=None):
    path = ROOT / 'images.json'
    ornaments = [item for item in json.loads(path.read_text()) if item.get('asset_type') != 'illustration' and item.get('reference') != 'medieval-cutouts']
    result = enrich([*ornaments, *illustrations()], measure=measure)
    path.write_text(json.dumps(result, indent=2) + '\n')
    print(f'Refreshed selection metadata for {len(result)} designs; artwork bytes unchanged.')


if __name__ == '__main__':
    refresh()
