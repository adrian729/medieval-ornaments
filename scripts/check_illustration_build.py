#!/usr/bin/env python3
"""Verify rebuild retention in an isolated fixture without touching real artwork."""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

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
                     'reference-crops.json','illustrations.json','illustration-import.json','selection-metadata.json','images.schema.json']:
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
        # Removing metadata must not give the border builder ownership of masters.
        master_path=fixture/'illustrations.json'
        master=json.loads(master_path.read_text())
        master_path.write_text(json.dumps(master[1:],indent=2)+'\n')
        subprocess.run([sys.executable,str(fixture/'scripts/build_assets.py'),'--name','red-berry-vine'],check=True,capture_output=True,text=True)
        removed=illustration_items[0]
        for asset in [removed,*removed['variants']]:
            for fmt in ['png','webp']:
                assert digest(fixture/asset[fmt])==hashes[asset[fmt]],'Border cleanup deleted removed illustration artwork'
        master_path.write_text(json.dumps(master,indent=2)+'\n')
        # A new entry needs only factual metadata and canonical master paths.
        new=dict(name='fixture-illustration',description='A green test image.',categories=['botanical'],
                 subjects=['leaf'],facing='unclear',colors=['green'],composition='single-ornament',
                 png='png/fixture-illustration.png',webp='webp/fixture-illustration.webp',
                 usage_notes=['Retain this authored selection note.'])
        Image.new('RGBA',(300,150),(20,100,40,128)).save(fixture/new['png'])
        native_hash=digest(fixture/new['png'])
        master_path.write_text(json.dumps([*master,new],indent=2)+'\n')
        subprocess.run([sys.executable,str(fixture/'scripts/build_illustrations.py'),'--name',new['name']],check=True,capture_output=True,text=True)
        generated=json.loads((fixture/'images.json').read_text())
        entry=next(item for item in generated if item['name']==new['name'])
        assert entry['reference']==entry['derivation']=='supplied-illustration'
        assert [asset['max_dimension'] for asset in entry['variants']]==[128,256]
        assert new['usage_notes'][0] in entry['usage_notes']
        assert digest(fixture/new['png'])==native_hash
        first=(fixture/'images.json').read_bytes()
        subprocess.run([sys.executable,str(fixture/'scripts/selection_metadata.py')],check=True,capture_output=True,text=True)
        assert (fixture/'images.json').read_bytes()==first,'Metadata refresh is not idempotent'
        # Reject component-name collisions and unsafe stale variant paths before writes.
        for collision, expected_error in [
            (dict(new,name='red-berry-vine-corner',png='png/red-berry-vine-corner.png',webp='webp/red-berry-vine-corner.webp'),'already belong'),
            (dict(new,variants=[dict(png='../outside.png',webp='webp/128/fixture-illustration.webp')]),'Invalid variant path'),
            (dict(new,facing='north'),'Invalid facing')
        ]:
            master_path.write_text(json.dumps([*master,collision],indent=2)+'\n')
            protected={relative:digest(fixture/relative) for relative in ['webp/red-berry-vine-corner.webp',new['png'],new['webp']]}
            before_catalog=(fixture/'images.json').read_bytes()
            result=subprocess.run([sys.executable,str(fixture/'scripts/build_illustrations.py'),'--name',collision['name']],capture_output=True,text=True)
            assert result.returncode and expected_error in result.stderr,result.stderr
            assert (fixture/'images.json').read_bytes()==before_catalog
            assert all(digest(fixture/relative)==expected for relative,expected in protected.items()),'Failed preflight changed artwork'
    print(f'Isolated rebuilds preserved {len(paths)} imported files and every PNG master, retained removed illustration files, generated a new entry without upscaling, preserved authored notes idempotently, and rejected metadata/path collisions before writes.')


if __name__=='__main__':
    try:check()
    except subprocess.CalledProcessError as error:
        print(error.stderr,file=sys.stderr);raise
