#!/usr/bin/env python3
"""Check source preservation, repeat profiles, and raster frame join geometry."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,math
ROOT=Path(__file__).resolve().parents[1]


def check():
    source=Image.open(ROOT/'sources/numbered-ornament-plate.png').convert('RGBA')
    audit=json.loads((ROOT/'source-patterns.json').read_text())
    extra=ROOT/'additional-patterns.json'
    if extra.exists():audit.update({item['name']:item for item in json.loads(extra.read_text())})
    historical=ROOT/'historical-border-patterns.json'
    if historical.exists():audit.update({item['name']:item for item in json.loads(historical.read_text())})
    catalog=json.loads((ROOT/'images.json').read_text())
    refs=json.loads((ROOT/'reference-crops.json').read_text())
    joins=0
    for name,r in refs.items():
        original=source.crop(r['source_bounds'])
        mask=Image.new('L',original.size,255)
        if r.get('clip_regions'):
            mask=Image.new('L',original.size);draw=ImageDraw.Draw(mask)
            for x0,y0,x1,y1 in r['clip_regions']:draw.rectangle((x0,y0,x1-1,y1-1),fill=255)
        with Image.open(ROOT/r['png']) as reference:reference=reference.convert('RGBA')
        assert reference.getchannel('A').tobytes()==mask.tobytes(),name
        assert all(a[:3]==b[:3] for a,b,m in zip(list(original.get_flattened_data()),list(reference.get_flattened_data()),list(mask.get_flattened_data())) if m),name
    for item in catalog:
        if item['name'] not in audit:continue
        name=item['name'];record=audit[name]
        original=Image.open(ROOT/record['source_path']).convert('RGBA') if 'source_path' in record else source
        raw=original.crop(record['source_bounds'])
        if record['orientation']=='y':raw=raw.transpose(Image.Transpose.ROTATE_90)
        raw=raw.crop(record['unit_bounds'])
        with Image.open(ROOT/record.get('tile_path',f'sources/tiles/{name}.png')) as native:native=native.convert('RGBA')
        if 'source_path' in record:
            reference=item['components']['reference_crop']
            with Image.open(ROOT/reference['png']) as actual:
                assert actual.convert('RGBA').tobytes()==original.crop(record['source_bounds']).tobytes(),name+' reference pixels changed'
            import hashlib
            assert hashlib.sha256((ROOT/record['source_path']).read_bytes()).hexdigest()==record['source_sha256'],name+' source changed'
        expected=native.transpose(Image.Transpose.ROTATE_270) if record['orientation']=='y' else native
        with Image.open(ROOT/item['png']) as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes(),name
        if record['kind']=='standalone':
            repair=record.get('bottom_border_repair')
            if repair:
                assert repair['method']=='reflect-top-band',name
                band=repair['top_band_height_px'];start=repair['bottom_band_start_px']
                assert native.size==(raw.width,raw.height-repair['trim_bottom_px'])==(raw.width,start+band),name+' repair dimensions'
                assert native.crop((0,0,raw.width,start)).tobytes()==raw.crop((0,0,raw.width,start)).tobytes(),name+' untouched floral pixels changed'
                assert native.crop((0,start,raw.width,start+band)).tobytes()==raw.crop((0,0,raw.width,band)).transpose(Image.Transpose.FLIP_TOP_BOTTOM).tobytes(),name+' lower band differs from reflected top'
            continue
        k=record['join_adjustment_px'];w,b=native.size
        assert native.crop((k,0,w-k,b)).tobytes()==raw.crop((k,0,w-k,b)).tobytes(),name+' source interior changed'
        assert native.crop((0,0,1,b)).tobytes()==native.crop((w-1,0,w,b)).tobytes(),name+' tile seam'
        atlas=item['components']['border_image'];im=Image.open(ROOT/atlas['png']).convert('RGBA');size=w+2*b
        assert im.size==(size,size),name
        if record.get('corner_edit'):
            from source_patterns import raster_documents
            from raster_borders import adapted_corners
            import hashlib
            edit=record['corner_edit']
            for key in ['raw','sheet']:
                assert hashlib.sha256((ROOT/edit[key+'_path']).read_bytes()).hexdigest()==edit[key+'_sha256'],name+' corner input changed'
            _,base=raster_documents(record)
            expected_corner,expected_atlas=adapted_corners(record,base,w,b)
            assert im.tobytes()==expected_atlas.tobytes(),name+' adapted atlas differs from retained inputs'
            with Image.open(ROOT/item['components']['corner']['png']) as standalone:
                assert standalone.convert('RGBA').tobytes()==expected_corner.tobytes(),name+' standalone corner differs'
            for bounds in [(b,0,b+w,b),(b+w,b,size,b+w),(b,b+w,b+w,size),(0,b,b,b+w)]:
                assert im.crop(bounds).tobytes()==base.crop(bounds).tobytes(),name+' straight edge changed'
        comparisons=[((b-1,0,b,b),(b,0,b+1,b)),
            ((0,b-1,b,b),(0,b,b,b+1)),
            ((b+w-1,0,b+w,b),(b+w,0,b+w+1,b)),
            ((b+w,b-1,size,b),(b+w,b,size,b+1)),
            ((b+w,b+w-1,size,b+w),(b+w,b+w,size,b+w+1)),
            ((b+w-1,b+w,b+w,size),(b+w,b+w,b+w+1,size)),
            ((b-1,b+w,b,size),(b,b+w,b+1,size)),
            ((0,b+w-1,b,b+w),(0,b+w,b,b+w+1))]
        for a,c in comparisons:
            assert im.crop(a).tobytes()==im.crop(c).tobytes(),name+' corner/side profile mismatch '+str((a,c))
            joins+=1
        assert im.crop((b,b,b+w,b+w)).getbbox() is None,name+' nontransparent center'
    # Floral leaves/flowers must not cross the repeat/corner clipping line.
    for item in catalog:
        if item.get('reference')!='six-border-styles' or item['name']=='interlocking-ribbon':continue
        im=Image.open(ROOT/item['png']).convert('RGBA');scale=im.height/96
        bands=[(43,53)]+([(53,62)] if item['name']=='gold-leaf-scroll' else [])
        edge_width=round(4*scale)
        for x in list(range(edge_width))+list(range(im.width-edge_width,im.width)):
            for y in range(im.height):
                if im.getpixel((x,y))[3] and not any(low<=y/scale<=high for low,high in bands):
                    raise AssertionError(item['name']+' motif crosses the corner join')
    aligned=0
    rotated=0
    for item in catalog:
        if 'border_image' not in item['components']:continue
        tile=item['components']['rotated_tile']
        with Image.open(ROOT/item['png']) as original,Image.open(ROOT/tile['png']) as turned:
            expected=original.transpose(Image.Transpose.ROTATE_270 if item['repeat_axis']=='x' else Image.Transpose.ROTATE_90).convert('RGBA')
            assert turned.size==expected.size and turned.convert('RGBA').tobytes()==expected.tobytes(),item['name']+' rotated pixels'
        assert tile['repeat_axis']==('y' if item['repeat_axis']=='x' else 'x')
        assert tile['repeat_ratio']==item['repeat_ratio']
        rotated+=1
        atlas=item['components']['border_image']
        for asset in [atlas,*atlas['variants']]:
            cut=asset['width']*item['border_image_slice_percent']/100
            assert math.isclose(cut,round(cut),abs_tol=1e-9),item['name']+' fractional raster slice'
            aligned+=1
    print(f'Original reference pixels preserved; {joins} exact source-frame joins; {aligned} raster atlases with integer slice boundaries; {rotated} pixel-exact rotated tiles.')

if __name__=='__main__':check()
