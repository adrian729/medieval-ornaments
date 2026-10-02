#!/usr/bin/env python3
"""Check source preservation, repeat profiles, and raster frame join geometry."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,math
ROOT=Path(__file__).resolve().parents[1]


def check():
    source=Image.open(ROOT/'sources/numbered-ornament-plate.png').convert('RGBA')
    audit=json.loads((ROOT/'source-patterns.json').read_text())
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
        raw=source.crop(record['source_bounds'])
        if record['orientation']=='y':raw=raw.transpose(Image.Transpose.ROTATE_90)
        raw=raw.crop(record['unit_bounds'])
        with Image.open(ROOT/f'sources/tiles/{name}.png') as native:native=native.convert('RGBA')
        expected=native.transpose(Image.Transpose.ROTATE_270) if record['orientation']=='y' else native
        with Image.open(ROOT/item['png']) as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes(),name
        if record['kind']=='standalone':continue
        k=record['join_adjustment_px'];w,b=native.size
        assert native.crop((k,0,w-k,b)).tobytes()==raw.crop((k,0,w-k,b)).tobytes(),name+' source interior changed'
        assert native.crop((0,0,1,b)).tobytes()==native.crop((w-1,0,w,b)).tobytes(),name+' tile seam'
        atlas=item['components']['border_image'];im=Image.open(ROOT/atlas['png']).convert('RGBA');size=w+2*b
        assert im.size==(size,size),name
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
