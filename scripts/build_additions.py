#!/usr/bin/env python3
"""Build the local-only artwork review catalog without changing release assets.

Audits beneath tmp/additions/*/audit.json use the same native geometry, checked
traces, mitered corners and lossless/downscaled exports as the public pipeline.
Watermarked sources are excluded at the user's request. Grid-bearing drafts
stay here, outside npm and Pages assets.
"""
from pathlib import Path
import argparse
import hashlib
import json
from math import gcd
from PIL import Image
import build_assets as exports
from source_patterns import load_spec, documents, raster_documents

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tmp/additions/build'
# These four inspected sheets carry stock watermarks. Preserve the originals
# and audit records, but do not recreate their discarded review ornaments.
EXCLUDED_SOURCES={'scroll-sheet','fruit-sheet','fruit-animal-sheet','geometric-sheet'}


def asset_paths(entry):
    for component in [entry,*entry.get('components',{}).values()]:
        for asset in [component,*component.get('variants',[])]:
            for fmt in ('svg','png','webp'):
                if fmt in asset:yield ROOT/asset[fmt]


def build(batches=None):
    OUTPUT.mkdir(parents=True,exist_ok=True)
    exports.ROOT=OUTPUT
    registered_path=ROOT/'additional-patterns.json'
    registered={item['name']:item for item in json.loads(registered_path.read_text())} if registered_path.exists() else {}
    public={item['name']:item for item in json.loads((ROOT/'images.json').read_text())}
    audits=[]
    for path in sorted((ROOT/'tmp/additions').glob('*/audit.json')):
        if batches and path.parent.name not in batches:continue
        audits.extend(json.loads(path.read_text()))
    # Delete only generated exports belonging to excluded sources. Never remove
    # supplied originals, audit inputs, public assets or other review batches.
    catalog_path=ROOT/'tmp/additions/catalog.json'
    previous=json.loads(catalog_path.read_text()) if catalog_path.exists() else []
    for entry in previous:
        if entry.get('reference') not in EXCLUDED_SOURCES:continue
        for path in asset_paths(entry):
            if path.resolve().is_relative_to(OUTPUT.resolve()):path.unlink(missing_ok=True)
    catalog=[]
    names=set()
    for audit in audits:
        audit=dict(audit)
        if 'reference' not in audit:audit['reference']=audit['reference_source']
        if audit['reference'] in EXCLUDED_SOURCES:continue
        name=audit['name'];assert name not in names,name;names.add(name)
        source=ROOT/audit['source_path']
        digest=hashlib.sha256(source.read_bytes()).hexdigest()
        assert digest==audit.get('source_sha256',digest),name+' source changed'
        with Image.open(source) as original:
            reference=original.crop(audit['source_bounds']).convert('RGBA')
        raw=reference.transpose(Image.Transpose.ROTATE_90) if audit['orientation']=='y' else reference
        raw=raw.crop(audit['unit_bounds'])
        with Image.open(ROOT/audit['tile_path']) as image:canonical=image.convert('RGBA')
        assert raw.size==canonical.size,name+' source bounds mismatch'
        k=audit['join_adjustment_px']
        assert 0<=k<=2,name+' excessive join correction'
        assert raw.crop((k,0,raw.width-k,raw.height)).tobytes()==canonical.crop((k,0,raw.width-k,raw.height)).tobytes(),name+' source interior changed'
        if name in registered and name in public:
            entry=dict(audit,**public[name])
            entry.update(status='integrated',source_path=registered[name]['source_path'])
            catalog.append(entry)
            print('Integrated review:',name,flush=True)
            continue
        spec=load_spec(dict(name=name,source_based=True),audit)
        tile,corner,atlas=documents(spec)
        native=canonical.transpose(Image.Transpose.ROTATE_270) if audit['orientation']=='y' else canonical
        entry=dict(audit,**exports.vector_export(tile,name,native_source=native),
                   repeat_axis=audit['orientation'] if atlas else 'none',components={})
        reference_asset=dict(**exports.save_pair(reference,name+'-reference'),variants=exports.variants(reference,name+'-reference'))
        entry['components']['reference_crop']=reference_asset
        if atlas:
            w,b=canonical.size;s=w+2*b
            assert canonical.crop((0,0,1,b)).tobytes()==canonical.crop((w-1,0,w,b)).tobytes(),name+' repeat seam'
            cn,fr=raster_documents(spec)
            entry['components'].update(corner=exports.vector_export(corner,name+'-corner',native_source=cn),
                border_image=exports.vector_export(atlas,name+'-border',native_source=fr,alignment_step=s//gcd(s,b)))
            entry.update(repeat_ratio=w/b,frame_edge_ratio=w/b,border_image_slice_percent=100*b/s,
                         frame_fit='round',corner_method='source-derived-miter')
            entry['components']['border_image']['slice_pixels']=b
            entry['components']['rotated_tile']=exports.rotated_tile(entry)
        # Exports are relative to OUTPUT; previews resolve every URL explicitly.
        for component in [entry,*entry['components'].values()]:
            for asset in [component,*component.get('variants',[])]:
                for fmt in ('svg','png','webp'):
                    if fmt in asset:asset[fmt]=(OUTPUT.relative_to(ROOT)/asset[fmt]).as_posix()
        catalog.append(entry)
        print('Review:',name,audit['kind'],flush=True)
    catalog.sort(key=lambda item:(item['reference'],item['reference_design']))
    catalog_path.write_text(json.dumps(catalog,indent=2)+'\n')
    print(f'Built {len(catalog)} local review designs. Public assets/catalog unchanged.')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--batch',action='append',help='Limit review generation to named audit directories.')
    args=parser.parse_args();build(args.batch)
