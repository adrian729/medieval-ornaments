#!/usr/bin/env python3
"""Verify rebuild retention in an isolated fixture without touching real artwork."""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check():
    before=json.loads((ROOT/'images.json').read_text())
    illustration_items=[item for item in before if item['asset_type']=='illustration']
    paths={asset[fmt] for item in illustration_items for asset in [item,*item['variants']] for fmt in ['png','webp']}
    with tempfile.TemporaryDirectory(prefix='ornaments-rebuild-') as directory:
        fixture=Path(directory)
        shutil.copytree(ROOT/'scripts',fixture/'scripts',ignore=shutil.ignore_patterns('__pycache__'))
        shutil.copytree(ROOT/'sources',fixture/'sources')
        for name in ['images.json','raster-metadata.json','source-patterns.json','additional-patterns.json',
                     'reference-crops.json','illustrations.json','illustration-import.json','selection-metadata.json']:
            shutil.copy2(ROOT/name,fixture/name)
        for relative in paths|{path.relative_to(ROOT).as_posix() for path in (ROOT/'png').glob('*.png')}:
            target=fixture/relative;target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(ROOT/relative,target)
        hashes={relative:digest(fixture/relative) for relative in paths}
        subprocess.run([sys.executable,str(fixture/'scripts/build_assets.py'),'--name','red-berry-vine'],check=True,capture_output=True,text=True)
        after=json.loads((fixture/'images.json').read_text())
        assert [item['name'] for item in after]==[item['name'] for item in before]
        assert [item for item in after if item['asset_type']=='illustration']==illustration_items
        assert all(digest(fixture/relative)==expected for relative,expected in hashes.items()),'Border rebuild changed illustration files'
        masters={item['png']:digest(fixture/item['png']) for item in illustration_items}
        subprocess.run([sys.executable,str(fixture/'scripts/build_illustrations.py'),'--name','creature-in-gold-shape'],check=True,capture_output=True,text=True)
        assert all(digest(fixture/relative)==expected for relative,expected in masters.items()),'Illustration rebuild changed a PNG master'
        updated=json.loads((fixture/'images.json').read_text())
        expected=next(item for item in updated if item['name']=='creature-in-gold-shape')
        assert all(variant['max_dimension']<max(expected['width'],expected['height']) for variant in expected['variants'])
        assert not any(variant['max_dimension']==768 for variant in expected['variants'])
        for item in illustration_items:
            if item['name']=='creature-in-gold-shape':continue
            assert next(current for current in updated if current['name']==item['name'])==item
    print(f'Isolated border rebuild retained all {len(paths)} illustration files and metadata; selected illustration resizing preserved every PNG master and skipped upscaling.')


if __name__=='__main__':check()
