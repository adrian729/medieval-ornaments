"""Editable SVG reconstructions of the supplied border references.

The six floral tiles use a 256 x 96 coordinate system; plate designs retain
their audited native repeat proportions and source geometry. Motifs crossing an edge are
translated by a whole period, and continuous stems meet with horizontal
tangents. Vertical exports rotate this same geometry without distortion.
"""

from html import escape
from math import cos, sin, pi

W, H, B = 256, 96, 96
MODERN = dict(ink='#43132f', red='#db0034', gold='#c7a154', cream='#fff5df',
              blue='#235878', green='#49694b', dark='#2b3530')
PLATE = dict(ink='#493523', red='#943e2e', gold='#c19a50', cream='#eee3bc',
             blue='#285574', green='#496341', dark='#293c33')


def path(d, fill='none', stroke='none', width=1):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"/>'


def circle(x, y, r, fill, stroke='none', width=1):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def rect(x, y, w, h, fill, stroke='none', width=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def group(content, transform):
    return f'<g transform="{transform}">{content}</g>'


def flower(p, x, y, size=18, petals=4, fill=None, rotation=0):
    fill = fill or p['red']
    pieces = []
    for i in range(petals):
        angle = rotation + i * 360 / petals
        pieces.append(group(path(f'M0 0 C{-size} {-size*.3} {-size*.75} {-size*1.3} 0 {-size} C{size*.75} {-size*1.3} {size} {-size*.3} 0 0Z', fill, p['ink'], 2), f'rotate({angle})'))
    pieces.append(circle(0, 0, size*.25, p['gold'], p['ink'], 1.5))
    return group(''.join(pieces), f'translate({x} {y})')


def leaf(p, x, y, angle=0, size=25, fill=None):
    shape = path(f'M0 0 C{-size*.7} {-size*.3} {-size*.55} {-size} 0 {-size*1.5} C{size*.2} {-size*.5} {size*.65} {-size*.2} 0 0Z', fill or p['gold'], p['ink'], 1.8)
    shape += path(f'M0 0 Q{-size*.18} {-size*.6} 0 {-size*1.3}', stroke=p['cream'], width=1)
    return group(shape, f'translate({x} {y}) rotate({angle})')


def stem(p, color=None, width=3):
    return path('M0 48 C32 48 32 16 64 16 C96 16 96 48 128 48 C160 48 160 80 192 80 C224 80 224 48 256 48', stroke=color or p['ink'], width=width)


def periodic(piece, period=W):
    return ''.join(group(piece, f'translate({x} 0)') for x in (-period, 0, period))


def modern_body(number, p):
    body = stem(p)
    if number == 1:
        for x, y in ((64, 46), (192, 50)):
            body += flower(p, x, y, 26, 4, p['gold'], 45)
            for a in (45,135,225,315):
                body += circle(round(x+23*cos(a*pi/180),2),round(y+23*sin(a*pi/180),2),7,p['red'],p['ink'],1.5)
        body += leaf(p, 126, 47, 45, 16)
    elif number == 2:
        for x,y,r in ((30,45,5),(47,30,7),(68,32,11),(86,37,8),(102,50,7),(112,62,5),(159,53,5),(174,63,7),(194,63,11),(215,59,8),(231,47,7)):
            body += path(f'M{x} {y} Q{x-4} 48 {x-12} 48',stroke=p['ink'],width=2)
            body += circle(x,y,r,p['red'],p['ink'],2)
    elif number == 3:
        body = stem(p, p['ink'], 4)
        for x,y,a in ((66,32,60),(184,64,240)):
            body += leaf(p,x,y,a,32)
        body += path('M66 25 V32',stroke=p['gold'],width=2)
        body += path('M184 79 V64',stroke=p['ink'],width=2)
        # Gold leaf scroll intentionally contains only complete leaves and vines.
        body += path('M0 57 C32 57 32 25 64 25 C96 25 96 57 128 57 C160 57 160 25 192 25 C224 25 224 57 256 57',stroke=p['gold'],width=4)
    elif number == 4:
        for x,y,a in ((44,52,20),(70,35,10),(88,56,35),(172,43,0),(193,62,10),(216,38,30)):
            body += flower(p,x,y,11,3,p['red'],a)
        body += leaf(p,121,48,48,17)+leaf(p,230,48,230,17)
    elif number == 5:
        body += flower(p,55,48,20,6,p['red'])+flower(p,182,48,20,6,p['red'])
        for x,y,a in ((45,46,-70),(105,45,55),(153,51,-120),(211,47,60)):
            body += leaf(p,x,y,a,26)
    else:
        body = rect(0,15,W,66,p['red'])
        upper='M0 18 C32 18 32 66 64 66 C96 66 96 18 128 18 C160 18 160 66 192 66 C224 66 224 18 256 18'
        lower='M0 40 C32 40 32 80 64 80 C96 80 96 40 128 40 C160 40 160 80 192 80 C224 80 224 40 256 40'
        body += path(upper+' L256 40 C224 40 224 80 192 80 C160 80 160 40 128 40 C96 40 96 80 64 80 C32 80 32 40 0 40Z',p['gold'])
        # Stroke only the two flowing edges: closing caps would show at each repeat.
        body += path(upper,stroke=p['ink'],width=3)+path(lower,stroke=p['ink'],width=3)
        body += path('M0 15 H256 M0 81 H256',stroke=p['ink'],width=3)
    return body


PLATE_NAMES = [
    'linked-scrolls','stepped-ribbon','spiral-bands','heart-and-diamond','blue-curls',
    'paired-red-scrolls','blue-heart-leaves','diagonal-cross','interlaced-knot','blue-palmettes',
    'acanthus-scroll','arched-diamonds','leaf-and-flower-vine','crossed-diamonds','diamond-square',
    'stepped-corner','stepped-arches','fan-palmettes','cream-scrolls','segmented-medallions',
    'green-flower-medallions','white-petal-grid','crossed-ribbon-knots','gold-ring-scrolls',
    'greek-crosses','eight-petal-rosette','blue-flower-medallions','angular-blue-meander',
    'red-acanthus','layered-palmettes','alternating-florets','linked-ovals','leaf-scrolls',
    'nested-fans','crossed-white-stems','greek-key','diamond-scroll','diagonal-meander',
]
VERTICAL = {2,3,7,10,18,29,30,33,34,37}
GEOMETRIC = {1,2,8,9,12,14,15,16,17,20,23,25,26,28,31,32,35,36,37,38}
MODERN_NAMES = ['gold-quatrefoil-vine','red-berry-vine','gold-leaf-scroll',
                'red-trefoil-vine','red-rosette-vine','interlocking-ribbon']


def specs():
    for n,name in enumerate(MODERN_NAMES,1):
        yield dict(name=name,number=n,reference='six-border-styles',orientation='x',
                   categories=['ribbons'] if n==6 else ['floral','scrollwork'],
                   subjects=['ribbon'] if n==6 else (['berry','vine'] if n==2 else (['leaf','vine'] if n==3 else ['flower','leaf','vine'])),
                   palette=MODERN,body=modern_body(n,MODERN),background=None if n!=6 else MODERN['red'])
    from source_patterns import load_spec
    for n,name in enumerate(PLATE_NAMES,1):
        yield load_spec(dict(name=f'plate-{n:02d}-{name}',number=n,
                   reference='numbered-ornament-plate',orientation='y' if n in VERTICAL else 'x',
                   categories=['geometric'] if n in GEOMETRIC else ['botanical','scrollwork'],
                   subjects=name.split('-'),palette=PLATE,background=None))


def corner_body(spec):
    p=spec['palette'];bg=spec['background']
    if spec['reference']=='six-border-styles' and spec['number']==6:
        # The ribbon occupies y=15..81, so its corner must use the same band.
        result=path('M96 15 A81 81 0 0 0 15 96 H81 A15 15 0 0 1 96 81Z',p['red'])
        result+=path('M96 18 A78 78 0 0 0 18 96 H40 A56 56 0 0 1 96 40Z',p['gold'])
        for edge in ('M96 15 A81 81 0 0 0 15 96','M96 81 A15 15 0 0 0 81 96',
                     'M96 18 A78 78 0 0 0 18 96','M96 40 A56 56 0 0 0 40 96'):
            result+=path(edge,stroke=p['ink'],width=3)
        return result
    result=rect(0,0,B,B,bg) if bg else ''
    if spec['reference']=='six-border-styles' and spec['number']!=6:
        result+=path('M96 48 A48 48 0 0 0 48 96',stroke=p['ink'],width=3)
        if spec['number']==2:
            for x,y,r in ((70,59,8),(62,69,6),(54,82,4)):
                result+=circle(x,y,r,p['red'],p['ink'],2)
        elif spec['number']==3:
            result+=path('M96 57 A39 39 0 0 0 57 96',stroke=p['gold'],width=4)+leaf(p,67,67,45,21)
        else:
            result+=flower(p,66,66,15,4 if spec['number']!=5 else 6,
                           p['gold'] if spec['number']==1 else p['red'],45)
    return result


def svg(content,width,height,title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><title>{escape(title)}</title>{content}</svg>\n'


STEM_CURVES=((32,48,32,16,64,16),(96,16,96,48,128,48),
             (160,48,160,80,192,80),(224,80,224,48,256,48))
GOLD_CURVES=((32,57,32,25,64,25),(96,25,96,57,128,57),
             (160,57,160,25,192,25),(224,25,224,57,256,57))


def frame_curve(curves,offset):
    """One closed path, with tangent-matched turns; no separately capped joins."""
    size=W+2*B
    transforms=(lambda x,y:(B+x,y),lambda x,y:(size-y,B+x),
                lambda x,y:(size-B-x,size-y),lambda x,y:(y,size-B-x))
    result=f'M{B} {offset}'
    for i,transform in enumerate(transforms):
        for curve in curves:
            points=[transform(*curve[j:j+2]) for j in (0,2,4)]
            result+=' C'+' '.join(f'{x} {y}' for x,y in points)
        x,y=transforms[(i+1)%4](0,offset)
        radius=B-offset
        result+=f' A{radius} {radius} 0 0 1 {x} {y}'
    return result+' Z'


def flat_frame(offset):
    return frame_curve(((W/3,offset,2*W/3,offset,W,offset),),offset)


def ring(outer,inner,fill,p):
    # Both outlines run clockwise; evenodd keeps the middle transparent.
    return path(outer+' '+inner,fill,p['ink'],3).replace('<path ','<path fill-rule="evenodd" ',1)


def documents(spec):
    if spec['reference']=='numbered-ornament-plate':
        from source_patterns import documents as source_documents
        return source_documents(spec)
    foreground=spec['body'];background=''
    if spec['background']:
        full_background=rect(0,0,W,H,spec['background'])
        if foreground.startswith(full_background):
            background=full_background
            foreground=foreground[len(full_background):]
    # A nested viewport clips each complete period independently, also in atlases.
    body=f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" overflow="hidden">{background}{periodic(foreground)}</svg>'
    corner=corner_body(spec);title=spec['name']
    if spec['orientation']=='y':
        tile=svg(group(body,'translate(96 0) rotate(90)'),H,W,title)
    else:
        tile=svg(body,W,H,title)
    cdoc=svg(corner,B,B,title+' adapted corner')
    size=W+2*B
    frame_corner=corner;frame_foreground=foreground;underlay='';overlay=''
    p=spec['palette']
    if spec['number']!=6:
        width=4 if spec['number']==3 else 3
        frame_foreground=frame_foreground.replace(stem(p,p['ink'],width),'',1)
        frame_corner=frame_corner.replace(path('M96 48 A48 48 0 0 0 48 96',stroke=p['ink'],width=3),'',1)
        underlay=path(frame_curve(STEM_CURVES,48),stroke=p['ink'],width=width)
        if spec['number']==3:
            gold=path('M0 57 C32 57 32 25 64 25 C96 25 96 57 128 57 C160 57 160 25 192 25 C224 25 224 57 256 57',stroke=p['gold'],width=4)
            frame_foreground=frame_foreground.replace(gold,'',1)
            underlay+=path(frame_curve(GOLD_CURVES,57),stroke=p['gold'],width=4)
            frame_corner=frame_corner.replace(path('M96 57 A39 39 0 0 0 57 96',stroke=p['gold'],width=4),'',1)
    else:
        # The ribbon is a pair of continuous rings, including the corner turns.
        upper=((32,18,32,66,64,66),(96,66,96,18,128,18),(160,18,160,66,192,66),(224,66,224,18,256,18))
        lower=((32,40,32,80,64,80),(96,80,96,40,128,40),(160,40,160,80,192,80),(224,80,224,40,256,40))
        ribbon=ring(flat_frame(15),flat_frame(81),p['red'],p)
        ribbon+=ring(frame_curve(upper,18),frame_curve(lower,40),p['gold'],p)
        return tile,cdoc,svg(ribbon,size,size,title+' nine-slice border')
    frame_body=f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" overflow="hidden">{periodic(frame_foreground)}</svg>'
    frame=underlay+''.join(group(frame_corner,transform) for transform in
                  ('translate(0 0)',f'translate({size} 0) rotate(90)',
                   f'translate({size} {size}) rotate(180)',f'translate(0 {size}) rotate(270)'))
    frame+=''.join(group(frame_body,transform) for transform in
                   (f'translate({B} 0)',f'translate({size} {B}) rotate(90)',
                    f'translate({size-B} {size}) rotate(180)',f'translate(0 {size-B}) rotate(270)'))
    return tile,cdoc,svg(frame+overlay,size,size,title+' nine-slice border')
