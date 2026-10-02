#!/usr/bin/env python3
"""Build vector tiles, corners, border atlases, and lossless raster exports."""

import argparse
import hashlib
import io
import json
from math import gcd
from pathlib import Path

import cairosvg
from PIL import Image, ImageChops

from designs import B, H, W, documents, specs

ROOT=Path(__file__).resolve().parents[1]
LIMITS=(128,256,512,768)
MASTER_LIMIT=1024


def selection(spec):
    """Describe the actual vector design, including its adapted corner."""
    import re
    labels=dict(ink='purple' if spec['reference']=='six-border-styles' else 'brown',
                red='red',gold='gold',cream='cream',blue='blue',green='green',dark='black')
    markup=spec['body']+(documents(spec)[1] or '')
    used=set(re.findall(r'#[0-9a-fA-F]{6}',markup))
    colors=list(dict.fromkeys(labels[key] for key,value in spec['palette'].items() if value in used))
    if spec['reference']=='numbered-ornament-plate':
        # Source traces retain their own colors, rather than the old redraw palette.
        colors=spec['colors']
    subjects=[word for word in spec['subjects'] if word not in
              {'and','paired','linked','stepped','blue','red','gold','green','white','cream',
               'diagonal','crossed','interlaced','nested','eight','petal','layered','alternating','angular'}]
    categories=list(spec['categories'])
    if 'knot' in spec['name']:categories.append('knotwork')
    if any(word in spec['name'] for word in ('flower','floret','rosette','petal','palmette')):
        if 'floral' not in categories:categories.append('floral')
    return dict(colors=colors,subjects=subjects,categories=categories)


def verify_pair(expected,png,webp):
    with Image.open(png) as p, Image.open(webp) as w:
        p=p.convert('RGBA');w=w.convert('RGBA')
    assert p.size==w.size==expected.size,png
    assert p.tobytes()==expected.tobytes(),png
    alpha=expected.getchannel('A')
    assert w.getchannel('A').tobytes()==alpha.tobytes(),webp
    mask=alpha.point(lambda a:255 if a else 0).convert('RGB')
    diff=ImageChops.difference(w.convert('RGB'),expected.convert('RGB'))
    assert ImageChops.multiply(diff,mask).getbbox() is None,webp


def save_pair(image,name,folder=None):
    png=ROOT/'png';webp=ROOT/'webp'
    if folder is not None:png/=str(folder);webp/=str(folder)
    png.mkdir(parents=True,exist_ok=True);webp.mkdir(parents=True,exist_ok=True)
    png/=name+'.png';webp/=name+'.webp'
    image.save(png,format='PNG',optimize=True)
    image.save(webp,format='WEBP',lossless=True,method=6,exact=True)
    verify_pair(image,png,webp)
    return dict(png=png.relative_to(ROOT).as_posix(),webp=webp.relative_to(ROOT).as_posix(),
                width=image.width,height=image.height,png_bytes=png.stat().st_size,
                webp_bytes=webp.stat().st_size)


def variants(image,name,alignment_step=1):
    result=[]
    for limit in LIMITS:
        if max(image.size)<=limit:continue
        target=(limit//alignment_step)*alignment_step
        if not target:continue
        resized=image.copy();resized.thumbnail((target,target),Image.Resampling.LANCZOS,reducing_gap=3)
        assert max(resized.size)==target
        assert resized.width<=image.width and resized.height<=image.height
        result.append(dict(max_dimension=limit,rendered_max_dimension=target,**save_pair(resized,name,limit)))
    return result


def vector_export(document,name,native_source=None,alignment_step=1):
    target=ROOT/'svg'/f'{name}.svg';target.parent.mkdir(exist_ok=True)
    target.write_text(document)
    # Render a single 1024px master from SVG. Only downscale that raster master.
    import xml.etree.ElementTree as ET
    element=ET.fromstring(document)
    width=float(element.attrib['width']);height=float(element.attrib['height'])
    if native_source is not None:
        image=native_source.convert('RGBA')
    else:
        limit=(MASTER_LIMIT//alignment_step)*alignment_step
        scale=limit/max(width,height)
        pixels=cairosvg.svg2png(bytestring=document.encode(),output_width=round(width*scale),output_height=round(height*scale))
        image=Image.open(io.BytesIO(pixels)).convert('RGBA')
    return dict(svg=target.relative_to(ROOT).as_posix(),viewbox=[0,0,int(width),int(height)],
                **save_pair(image,name),variants=variants(image,name,alignment_step))


def existing_export(item,name):
    with Image.open(ROOT/item['png']) as source:image=source.convert('RGBA')
    webp=ROOT/'webp'/f'{name}.webp'
    image.save(webp,format='WEBP',lossless=True,method=6,exact=True)
    verify_pair(image,ROOT/item['png'],webp)
    return dict(item,webp=webp.relative_to(ROOT).as_posix(),width=image.width,height=image.height,
                png_bytes=(ROOT/item['png']).stat().st_size,webp_bytes=webp.stat().st_size,
                variants=variants(image,name))


def build(names=None):
    old_catalog=json.loads((ROOT/'images.json').read_text())
    raster_path=ROOT/'raster-metadata.json'
    raster=json.loads(raster_path.read_text()) if raster_path.exists() else []
    before={item['png']:hashlib.sha256((ROOT/item['png']).read_bytes()).hexdigest() for item in raster}
    selected=set(names or [])
    known={item['name'] for item in old_catalog}
    assert selected<=known,'Unknown design name'
    catalog=[]
    reference_path=ROOT/'reference-crops.json'
    references=json.loads(reference_path.read_text()) if reference_path.exists() else {}
    for item in raster:
        if selected and item['name'] not in selected:
            catalog.append(next(old for old in old_catalog if old['name']==item['name']));continue
        with Image.open(ROOT/item['png']) as source:image=source.convert('RGBA')
        # Keep the source PNG byte-for-byte; encode only its WebP and smaller variants.
        webp=ROOT/'webp'/f"{item['name']}.webp"
        image.save(webp,format='WEBP',lossless=True,method=6,exact=True)
        verify_pair(image,ROOT/item['png'],webp)
        entry=dict(item,webp=webp.relative_to(ROOT).as_posix(),width=image.width,height=image.height,
                   png_bytes=(ROOT/item['png']).stat().st_size,webp_bytes=webp.stat().st_size,
                   variants=variants(image,item['name']),kind='standalone',repeat_axis='none',
                   derivation='ai-assisted-extraction',components={})
        catalog.append(entry)
    for spec in specs():
        name=spec['name']
        if selected and name not in selected:
            catalog.append(next(old for old in old_catalog if old['name']==name));continue
        tile,corner,atlas=documents(spec)
        plate=spec['reference']=='numbered-ornament-plate'
        native=None
        if plate:
            with Image.open(ROOT/f'sources/tiles/{name}.png') as source:native=source.copy()
            if spec['orientation']=='y':native=native.transpose(Image.Transpose.ROTATE_270)
        entry=dict(name=name,**vector_export(tile,name,native_source=native),
                   description=(f"Source artwork from numbered plate design {spec['number']}, with an editable color trace. "+spec['repeat_note'] if plate else f"Editable vector border: {name.replace('-',' ')}. Matching adapted corner pieces."),
                   **selection(spec),facing='unclear',
                   composition=spec.get('kind','repeat-tile'),kind=spec.get('kind','repeat-tile'),
                   repeat_axis='none' if spec.get('kind')=='standalone' else spec['orientation'],
                   derivation='source-crop-and-color-trace' if plate else 'vector-reconstruction',
                   reference=spec['reference'],reference_design=spec['number'],components={})
        if atlas:
            length=spec.get('width',W);corner_size=spec.get('corner_size',B);size=length+2*corner_size
            step=size//gcd(size,corner_size)
            native_corner=native_frame=None
            if plate:
                from source_patterns import raster_documents
                native_corner,native_frame=raster_documents(spec)
            entry['components']=dict(corner=vector_export(corner,name+'-corner',native_source=native_corner),
                border_image=vector_export(atlas,name+'-border',native_source=native_frame,alignment_step=step))
            entry['border_image_slice_percent']=100*corner_size/size
            entry['frame_edge_ratio']=length/corner_size
            entry['repeat_ratio']=length/corner_size
            entry['frame_fit']='round'
            entry['corner_method']='source-derived-miter' if plate else 'adapted-motif'
            entry['components']['border_image']['slice_pixels']=round(corner_size/size*entry['components']['border_image']['width'])
        if plate:
            entry['source_pattern']=spec['repeat_note']
            entry['source_canvas']={'width':native.width,'height':native.height}
            entry['master_longest_dimension_cap']=max(native.size)
        if name in references:
            entry['components']['reference_crop']=existing_export(references[name],name+'-reference')
        catalog.append(entry)
        print('Built',name,flush=True)
    assert all(hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest for name,digest in before.items())
    (ROOT/'images.json').write_text(json.dumps(catalog,indent=2)+'\n')
    # Remove only superseded GENERATED assets previously named in the catalog.
    # Preserved references, source files, and unrelated files are never touched.
    def paths(items):
        result=set()
        for item in items:
            for component in [item,*item['components'].values()]:
                for asset in [component,*component.get('variants',[])]:
                    result.update(asset[fmt] for fmt in ('png','webp','svg') if fmt in asset)
        return result
    for relative in sorted(paths(old_catalog)-paths(catalog)):
        target=ROOT/relative
        assert target.resolve().is_relative_to(ROOT) and relative.split('/')[0] in {'png','webp','svg'}
        target.unlink()
    print(f'Built {len(catalog)} designs; raster source PNGs unchanged.')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--name',action='append');args=parser.parse_args();build(args.name)
