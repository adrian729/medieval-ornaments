#!/usr/bin/env python3
"""Resize explicitly selected illustration masters, then refresh the catalog."""
import argparse
import hashlib
import json
import re
from PIL import Image
from build_assets import verify_pair, variants, ROOT, LIMITS
from selection_metadata import refresh


def preflight(items, selected):
    """Check metadata and asset ownership before writing or deleting any files."""
    names = [item['name'] for item in items]
    assert len(names) == len(set(names)), 'Duplicate illustration name'
    assert selected <= set(names), 'Unknown illustration name'
    vocabulary = json.loads((ROOT/'images.schema.json').read_text())['$defs']
    protected = set()
    borders = set()
    for item in json.loads((ROOT/'images.json').read_text()):
        if item.get('asset_type') == 'illustration' or item.get('reference') == 'medieval-cutouts':continue
        borders.add(item['name'])
        for component in [item, *item.get('components', {}).values()]:
            for asset in [component, *component.get('variants', [])]:
                protected.update(asset[fmt] for fmt in ['png', 'webp'] if fmt in asset)
    for item in items:
        name = item['name']
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name), f'Invalid illustration name: {name}'
        assert name not in borders, f'Name already belongs to an ornament: {name}'
        assert isinstance(item.get('description'), str) and item['description'].strip(), f'Missing description: {name}'
        for field, definition in [('categories', 'category'), ('colors', 'color'), ('subjects', None)]:
            values = item.get(field)
            assert isinstance(values, list) and values and all(isinstance(value, str) for value in values), f'Invalid {field}: {name}'
            assert len(values) == len(set(values)), f'Duplicate {field}: {name}'
            assert all(value in vocabulary[definition]['enum'] if definition else re.fullmatch(r'[a-z]+(?:-[a-z]+)*', value) for value in values), f'Invalid {field}: {name}'
        for field in ['facing', 'composition']:
            assert item.get(field) in vocabulary[field]['enum'], f'Invalid {field}: {name}'
        notes = item.get('usage_notes', [])
        assert isinstance(notes, list) and all(isinstance(note, str) and note.strip() for note in notes), f'Invalid usage_notes: {name}'
        for field in ['reference', 'derivation']:
            assert field not in item or isinstance(item[field], str) and item[field].strip(), f'Invalid {field}: {name}'
        for fmt in ['png', 'webp']:
            assert item.get(fmt) == f'{fmt}/{name}.{fmt}', f'Invalid master {fmt} path: {name}'
        assert isinstance(item.get('variants', []), list), f'Invalid variants: {name}'
        owned = {item[fmt] for fmt in ['png', 'webp']}
        for asset in item.get('variants', []):
            for fmt in ['png', 'webp']:
                relative = asset[fmt]
                assert re.fullmatch(rf'{fmt}/[0-9]+/{re.escape(name)}\.{fmt}', relative), f'Invalid variant path: {relative}'
                owned.add(relative)
        owned.update(f'{fmt}/{limit}/{name}.{fmt}' for fmt in ['png', 'webp'] for limit in LIMITS)
        assert not owned & protected, f'Artwork paths already belong to an ornament: {name}'
        assert all((ROOT/relative).resolve().is_relative_to(ROOT) for relative in owned), f'Artwork path escapes checkout: {name}'


def build(names):
    path=ROOT/'illustrations.json'
    items=json.loads(path.read_text())
    selected=set(names)
    preflight(items, selected)
    hashes={item['png']:hashlib.sha256((ROOT/item['png']).read_bytes()).hexdigest() for item in items}
    for item in items:
        if item['name'] not in selected:continue
        with Image.open(ROOT/item['png']) as source:image=source.convert('RGBA')
        webp=ROOT/item['webp']
        webp.parent.mkdir(parents=True, exist_ok=True)
        image.save(webp,format='WEBP',lossless=True,method=6,exact=True)
        verify_pair(image,ROOT/item['png'],webp)
        old_paths={asset[fmt] for asset in item.get('variants', []) for fmt in ['png','webp']}
        item.update(width=image.width,height=image.height,png_bytes=(ROOT/item['png']).stat().st_size,
                    webp_bytes=webp.stat().st_size,variants=variants(image,item['name']))
        new_paths={asset[fmt] for asset in item['variants'] for fmt in ['png','webp']}
        for relative in old_paths-new_paths:
            target=ROOT/relative
            assert target.resolve().is_relative_to(ROOT) and target.stem==item['name']
            target.unlink(missing_ok=True)
    assert all(hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest for name,digest in hashes.items())
    path.write_text(json.dumps(items,indent=2)+'\n')
    refresh()


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--name',action='append',required=True,help='Regenerate only this illustration; repeat to select more.')
    build(parser.parse_args().name)
