#!/usr/bin/env python3
"""Resize explicitly selected illustration masters, then refresh the catalog."""
import argparse
import hashlib
import json
from PIL import Image
from build_assets import verify_pair, variants, ROOT
from selection_metadata import refresh


def build(names):
    path=ROOT/'illustrations.json'
    items=json.loads(path.read_text())
    selected=set(names)
    assert selected<={item['name'] for item in items}, 'Unknown illustration name'
    hashes={item['png']:hashlib.sha256((ROOT/item['png']).read_bytes()).hexdigest() for item in items}
    for item in items:
        if item['name'] not in selected:continue
        with Image.open(ROOT/item['png']) as source:image=source.convert('RGBA')
        webp=ROOT/item['webp']
        image.save(webp,format='WEBP',lossless=True,method=6,exact=True)
        verify_pair(image,ROOT/item['png'],webp)
        old_paths={asset[fmt] for asset in item['variants'] for fmt in ['png','webp']}
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
