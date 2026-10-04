from resource_paths import resource_file
"""Source-based plate geometry. Native crops/traces are checked-in build inputs."""
from pathlib import Path
import json,xml.etree.ElementTree as ET
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
B=96


def retouch_native(image,audit):
    """Apply an audited whole-panel border repair without repainting its interior."""
    repair=audit.get('bottom_border_repair')
    if not repair:return image
    assert audit['kind']=='standalone' and repair['method']=='reflect-top-band'
    band=repair['top_band_height_px'];start=repair['bottom_band_start_px']
    assert 0<band<=start and start+band==image.height-repair['trim_bottom_px']
    result=image.crop((0,0,image.width,start+band))
    result.paste(image.crop((0,0,image.width,band)).transpose(Image.Transpose.FLIP_TOP_BOTTOM),(0,start))
    return result


def retouch_vector(body,width,height,audit):
    """Reflect the existing traced top band; retain every floral path unchanged."""
    repair=audit.get('bottom_border_repair')
    if not repair:return body,height
    assert audit['kind']=='standalone' and repair['method']=='reflect-top-band'
    band=repair['top_band_height_px'];start=repair['bottom_band_start_px'];end=start+band
    assert 0<band<=start and end<=height
    key=audit['name']+'-retouch'
    definitions=(f'<defs><g id="{key}-art">{body}</g>'
                 f'<clipPath id="{key}-interior"><rect width="{width}" height="{start}"/></clipPath>'
                 f'<clipPath id="{key}-band"><rect width="{width}" height="{band}"/></clipPath></defs>')
    result=definitions+f'<use href="#{key}-art" clip-path="url(#{key}-interior)"/>'
    result+=f'<g transform="translate(0 {end}) scale(1 -1)"><use href="#{key}-art" clip-path="url(#{key}-band)"/></g>'
    return result,end


def load_spec(spec, audit=None):
    name=spec['name']
    if audit is None:audit=json.loads((ROOT/'source-patterns.json').read_text())[name]
    root=ET.parse(resource_file(audit.get('trace_path',f'sources/traces/{name}.svg'))).getroot()
    native_w=int(root.attrib['width']);native_h=int(root.attrib['height'])
    width=native_w
    children=''.join(ET.tostring(c,encoding='unicode').replace('ns0:','').replace(':ns0','') for c in root)
    offset=float(root.attrib['viewBox'].split()[0])
    view=list(map(float,root.attrib['viewBox'].split()))
    body=f'<g transform="scale({native_w/view[2]} {native_h/view[3]}) translate({-offset} 0)">{children}</g>'
    # Both ends have the same narrow source-color collar. Curves fitted in two
    # neighboring periods can otherwise differ slightly at the clipping line.
    image=Image.open(resource_file(audit.get('tile_path',f'sources/tiles/{name}.png'))).convert('RGB')
    collar='';scale=1;collar_width=.45
    if audit['kind']=='repeat-tile':
        for y in range(native_h):
            color='#'+bytes(image.getpixel((0,y))).hex()
            for x in (0,width-collar_width):
                collar+=f'<rect x="{x}" y="{y*scale}" width="{collar_width}" height="{scale+.01}" fill="{color}"/>'
        body+=collar
    if audit.get('clip_regions'):
        regions=''.join(f'<rect x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}"/>' for x0,y0,x1,y1 in audit['clip_regions'])
        key=name+'-source-mask'
        body=f'<defs><clipPath id="{key}">{regions}</clipPath></defs><g clip-path="url(#{key})">{body}</g>'
    body,native_h=retouch_vector(body,native_w,native_h,audit)
    assert image.size==(native_w,native_h),name+' native source/trace geometry mismatch'
    result=dict(spec,**audit)
    result.update(width=width,body=body,native_width=native_w,native_height=native_h,corner_size=native_h)
    return result


def svg(content,w,h,title):
    from html import escape
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(title)}</title>{content}</svg>\n'


def viewport(body,w,h):
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" overflow="hidden">{body}</svg>'


def documents(spec):
    w=spec['width'];B=spec['native_height'];body=spec['body'];name=spec['name'];size=w+2*B
    canonical=viewport(body,w,B)
    tile=svg(canonical,w,B,name)
    if spec['orientation']=='y':tile=svg(f'<g transform="translate({B} 0) rotate(90)">{canonical}</g>',B,w,name)
    if spec['kind']=='standalone':return tile,None,None
    # Mitered reflection of the SAME artwork. Every diagonal samples identical
    # source positions on both sides; no unrelated corner motifs are introduced.
    # Render one complete underlay then the clipped second half, avoiding an
    # antialiasing crack between two independently clipped opaque triangles.
    pattern_id=name+'-repeat'
    definition=f'<defs><pattern id="{pattern_id}" patternUnits="userSpaceOnUse" width="{w}" height="{B}">{canonical}</pattern></defs>'
    repeated=f'<rect x="{-3*w}" y="0" width="{7*w}" height="{B}" fill="url(#{pattern_id})"/>'
    def clipped(piece,points,key):
        return f'<defs><clipPath id="{key}"><polygon points="{points}"/></clipPath></defs><g clip-path="url(#{key})">{piece}</g>'
    def corner(which):
        horizontal,vertical,triangle={
            'tl':(f'translate({-B} 0)',f'matrix(0 1 1 0 0 {-B})',f'0,0 {B},{B} 0,{B}'),
            'tr':('translate(0 0)',f'matrix(0 -1 1 0 0 {B})',f'0,{B} {B},0 {B},{B}'),
            'br':(f'matrix(-1 0 0 -1 0 {B})',f'matrix(0 -1 -1 0 {B} 0)',f'0,0 {B},0 {B},{B}'),
            'bl':(f'matrix(-1 0 0 -1 {B} {B})','matrix(0 1 1 0 0 0)',f'0,0 {B},0 0,{B}'),
        }[which]
        result=f'<g transform="{horizontal}">{repeated}</g>'
        result+=clipped(f'<g transform="{vertical}">{repeated}</g>',triangle,f'{name}-{which}')
        return viewport(result,B,B)
    cdoc=svg(definition+corner('tl'),B,B,name+' source-derived miter corner')
    frame=''.join(f'<g transform="translate({x} {y})">{corner(which)}</g>' for which,x,y in
                  [('tl',0,0),('tr',B+w,0),('br',B+w,B+w),('bl',0,B+w)])
    # Each edge is its own explicit viewport, with a phase that matches the
    # adjacent source-derived corners. Bottom/right are reflected intentionally.
    strip=viewport(f'<rect width="{w}" height="{B}" fill="url(#{pattern_id})"/>',w,B)
    frame+=f'<g transform="translate({B} 0)">{strip}</g>'
    frame+=f'<g transform="translate({size} {B}) rotate(90)">{viewport(f"<g transform=\"translate({w} 0) scale(-1 1)\">{strip}</g>",w,B)}</g>'
    frame+=f'<g transform="translate({B+w} {size}) rotate(180)">{strip}</g>'
    frame+=f'<g transform="translate(0 {B+w}) rotate(270)">{viewport(f"<g transform=\"translate({w} 0) scale(-1 1)\">{strip}</g>",w,B)}</g>'
    return tile,cdoc,svg(definition+frame,size,size,name+' source-derived mitered frame')


def raster_documents(spec):
    """Assemble actual source pixels, without interpolation or enlargement.

    Mirrored halves sample identical pixels at their diagonal miter. The
    native atlas/corner exports preserve the painted appearance independently
    of the approximate color trace used for their SVG alternatives.
    """
    name=spec['name'];image=Image.open(resource_file(spec.get('tile_path',f'sources/tiles/{name}.png'))).convert('RGBA')
    w,b=image.size;size=w+2*b
    corner=Image.new('RGBA',(b,b));frame=Image.new('RGBA',(size,size))
    for y in range(size):
        for x in range(size):
            if b<=x<b+w and b<=y<b+w:continue
            if b<=x<b+w and y<b:p=image.getpixel(((x-b)%w,y))
            elif x>=b+w and b<=y<b+w:p=image.getpixel(((-(y-b)-1)%w,size-1-x))
            elif b<=x<b+w and y>=b+w:p=image.getpixel(((-(x-b)-1)%w,size-1-y))
            elif x<b and b<=y<b+w:p=image.getpixel(((y-b)%w,x))
            elif x<b and y<b:
                p=image.getpixel(((x-b)%w,y)) if y<=x else image.getpixel(((y-b)%w,x))
                corner.putpixel((x,y),p)
            elif x>=b+w and y<b:
                a=x-b-w
                p=image.getpixel((a%w,y)) if a+y<b else image.getpixel(((b-1-y)%w,b-1-a))
            elif x>=b+w and y>=b+w:
                a=x-b-w;c=y-b-w
                p=image.getpixel(((-1-a)%w,b-1-c)) if c>=a else image.getpixel(((-1-c)%w,b-1-a))
            else:
                c=y-b-w
                p=image.getpixel(((b-1-x)%w,b-1-c)) if x+c>=b else image.getpixel((c%w,x))
            frame.putpixel((x,y),p)
    return corner,frame
