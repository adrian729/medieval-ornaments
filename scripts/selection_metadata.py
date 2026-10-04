"""Compose image-only illustrations and factual, shared selection metadata."""
import json
from pathlib import Path
from PIL import Image

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


def enrich(catalog):
    overrides = json.loads((ROOT / 'selection-metadata.json').read_text())
    for item in catalog:
        facts = overrides.get(item['name'], {})
        if facts.get('description'):
            item['description'] = facts['description']
        item['subjects'] = list(dict.fromkeys([*item['subjects'], *facts.get('subjects_add', [])]))
        item['asset_type'] = ('illustration' if item.get('asset_type') == 'illustration' or item.get('reference') == 'medieval-cutouts'
                              else 'border' if item['kind'] == 'repeat-tile' else 'decoration')
        with Image.open(ROOT / item['png']) as image:
            item['has_transparency'] = image.convert('RGBA').getchannel('A').getextrema()[0] < 255
        notes = list(facts.get('usage_notes', []))
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
        item['usage_notes'] = notes
    return catalog


def refresh():
    path = ROOT / 'images.json'
    ornaments = [item for item in json.loads(path.read_text()) if item.get('asset_type') != 'illustration' and item.get('reference') != 'medieval-cutouts']
    result = enrich([*ornaments, *illustrations()])
    path.write_text(json.dumps(result, indent=2) + '\n')
    print(f'Refreshed selection metadata for {len(result)} designs; artwork bytes unchanged.')


if __name__ == '__main__':
    refresh()
