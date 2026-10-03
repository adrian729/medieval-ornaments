#!/usr/bin/env python3
"""Trace audited source repeat units; run with Python 3.12 (VTracer 0.6.15).

The checked-in native PNG units and editable traces are build inputs. This
optional step is separate from ordinary export regeneration. Never infer a
period solely from autocorrelation: edit source-patterns.json after inspection.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import json, xml.etree.ElementTree as ET
import argparse
import re
from PIL import ImageDraw
from source_patterns import retouch_native
import vtracer

ROOT=Path(__file__).resolve().parents[1]

def match_edges(image, width=2):
    """A narrow, symmetric join correction; the untouched reference stays separate."""
    image=image.copy();original=image.copy()
    for y in range(image.height):
        a=original.getpixel((0,y));b=original.getpixel((image.width-1,y))
        mid=tuple(round((x+z)/2) for x,z in zip(a,b))
        for k in range(width):
            weight=(width-k)/width
            for x in (k,image.width-1-k):
                old=original.getpixel((x,y))
                image.putpixel((x,y),tuple(round(c*(1-weight)+m*weight) for c,m in zip(old,mid)))
    return image


def run(names=None):
    audit=json.loads((ROOT/'source-patterns.json').read_text())
    extra=ROOT/'additional-patterns.json'
    if extra.exists():audit.update({item['name']:item for item in json.loads(extra.read_text())})
    if names:
        unknown=set(names)-audit.keys()
        if unknown:raise ValueError('Unknown audited source names: '+', '.join(sorted(unknown)))
    tile_dir=ROOT/'sources/tiles';trace_dir=ROOT/'sources/traces'
    tile_dir.mkdir(parents=True,exist_ok=True);trace_dir.mkdir(parents=True,exist_ok=True)
    for name,item in audit.items():
        if names and name not in names:continue
        if item.get('vector_method')=='source-fitted-cubic':
            # These editable curves and gradients were fitted to the source
            # structure. A palette retrace would replace them with color noise.
            trace=ROOT/item['trace_path']
            ET.parse(trace)
            print(name,'preserved source-fitted cubic master',flush=True)
            continue
        source=Image.open(ROOT/item.get('source_path','sources/numbered-ornament-plate.png')).convert('RGB')
        image=source.crop(item['source_bounds'])
        if item['orientation']=='y':image=image.transpose(Image.Transpose.ROTATE_90)
        box=item['unit_bounds'];image=image.crop(box)
        if item['kind']=='repeat-tile':image=match_edges(image,item['join_adjustment_px'])
        image=retouch_native(image,item)
        if item.get('clip_regions'):
            mask=Image.new('L',image.size);draw=ImageDraw.Draw(mask)
            for x0,y0,x1,y1 in item['clip_regions']:draw.rectangle((x0,y0,x1-1,y1-1),fill=255)
            image=image.convert('RGBA');image.putalpha(mask)
        image.save(ROOT/item.get('tile_path',f'sources/tiles/{name}.png'),optimize=True)
        # Supersampling is only contour fitting. Native raster exports remain
        # source-sized, and no claim of recovered source detail is made.
        count=3 if item['kind']=='repeat-tile' else 1
        options=item.get('trace_options',{})
        supersample=options.get('supersample',4)
        repeated=Image.new('RGB',(image.width*count,image.height))
        for x in range(count):repeated.paste(image,(x*image.width,0))
        scaled=repeated.resize((repeated.width*supersample,repeated.height*supersample),Image.Resampling.BICUBIC)
        method=options.get('quantize_method_name',options.get('quantize_method','MEDIANCUT'))
        if isinstance(method,str):method=getattr(Image.Quantize,method)
        palette=image.convert('RGB').filter(ImageFilter.GaussianBlur(options.get('palette_blur',.25))).quantize(colors=options.get('colors',12),method=method,kmeans=options.get('kmeans',0))
        cleaned=scaled.filter(ImageFilter.GaussianBlur(options.get('trace_blur',options.get('scaled_blur',.6)))).quantize(palette=palette,dither=Image.Dither.NONE).convert('RGB')
        temporary=ROOT/f'tmp/trace-{name}-input.png';temporary.parent.mkdir(exist_ok=True);cleaned.save(temporary)
        output=ROOT/f'tmp/trace-{name}-output.svg'
        vtracer.convert_image_to_svg_py(str(temporary),str(output),filter_speckle=options.get('filter_speckle',16),
            color_precision=8,layer_difference=8,mode='spline',length_threshold=options.get('length_threshold',6),path_precision=3)
        root=ET.fromstring(output.read_text())
        # Preserve a whole neighboring period on either side, so boundary curves
        # are fitted as continuous geometry rather than capped cropped shapes.
        offset=image.width*supersample if count==3 else 0
        kept=[]
        for c in root:
            if c.tag.endswith('path') and not options.get('retain_context_paths',False):
                values=[float(v) for v in re.findall(r'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?',c.attrib['d'])]
                shift=re.findall(r'[-+]?(?:\d*\.\d+|\d+)',c.attrib.get('transform','translate(0,0)'))
                xs=[x+float(shift[0]) for x in values[::2]]
                if max(xs)<offset-.1 or min(xs)>offset+image.width*supersample+.1:continue
            kept.append(c)
        children=''.join(ET.tostring(c,encoding='unicode').replace('ns0:','').replace(':ns0','') for c in kept)
        doc=f'<svg xmlns="http://www.w3.org/2000/svg" width="{image.width}" height="{image.height}" viewBox="{offset} 0 {image.width*supersample} {image.height*supersample}">{children}</svg>\n'
        (ROOT/item.get('trace_path',f'sources/traces/{name}.svg')).write_text(doc)
        print(name,image.size,item['repeat_note'],flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--name',action='append');args=parser.parse_args();run(args.name)
