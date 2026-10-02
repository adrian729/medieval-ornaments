"""Editable SVG reconstructions of the supplied border references.

All tiles use a 256 x 96 coordinate system. Motifs crossing an edge are
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


def curls(p, x=64, y=48, color=None, flip=False):
    shape = path('M-44 0 C-32 -35 10 -39 20 -14 C30 10 -4 21 -9 3 C-12 -8 3 -14 6 -3 M-44 0 C-32 35 10 39 20 14 C30 -10 -4 -21 -9 -3 C-12 8 3 14 6 3', stroke=color or p['gold'], width=4)
    return group(shape, f'translate({x} {y}) scale({-1 if flip else 1} 1)')


def periodic(piece, period=W):
    return ''.join(group(piece, f'translate({x} 0)') for x in (-period, 0, period))


def rails(p):
    return path('M0 5 H256 M0 91 H256', stroke=p['gold'], width=3)


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
        for x,y,a in ((66,20,60),(184,76,240)):
            body += leaf(p,x,y,a,32)
        body += curls(p,98,51,p['red']) + curls(p,227,45,p['red'],True)
        body += path('M0 57 C32 57 32 25 64 25 C96 25 96 57 128 57 C160 57 160 25 192 25 C224 25 224 57 256 57',stroke=p['gold'],width=4)
    elif number == 4:
        for x,y,a in ((44,52,20),(70,35,10),(88,56,35),(172,43,0),(193,62,10),(216,38,30)):
            body += flower(p,x,y,11,3,p['red'],a)
        body += leaf(p,121,48,48,17)+leaf(p,250,48,230,17)
    elif number == 5:
        body += flower(p,55,48,20,6,p['red'])+flower(p,182,48,20,6,p['red'])
        for x,y,a in ((22,46,-70),(105,45,55),(153,51,-120),(232,47,80)):
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


def palmette(p, x, y, size=35, mode=0):
    result = ''
    for i,a in enumerate((-65,-42,-20,0,20,42,65)):
        color = (p['blue'],p['green'],p['cream'],p['gold'])[((i+mode)//2)%4]
        result += leaf(p,0,0,a,size*(1-abs(a)/190),color)
    result += path('M0 0 V12',stroke=p['cream'],width=3)
    return group(result,f'translate({x} {y})')


def diamond(p,x,y,size=28,fill=None):
    return path(f'M{x} {y-size} L{x+size} {y} L{x} {y+size} L{x-size} {y}Z',fill or p['green'],p['cream'],3)


def cross(p,x,y,size=17,color=None,outline=None):
    z=size; b=size*.35
    d=f'M{x-b} {y-z} H{x+b} V{y-b} H{x+z} V{y+b} H{x+b} V{y+z} H{x-b} V{y+b} H{x-z} V{y-b} H{x-b}Z'
    return path(d,color or p['red'],outline or p['cream'],2)


def plate_body(n,p):
    body=rect(0,0,W,H,p['red'])+rails(p)
    if n==1:
        for x in (32,96,160,224):
            glyph=path('M-22 -24 H2 C27 -24 27 24 2 24 H-22 M-12 -13 H0 C11 -13 11 13 0 13 H-12 M-22 0 H21 M-9 -24 V24',stroke=p['cream'],width=6)
            body+=group(glyph,f'translate({x} 48)')
    elif n in (2,17,28,38):
        if n==2:
            for x in range(-64,320,64):
                d=f'M{x} 14 H{x+37} V37 H{x+57} V79 H{x+20} V56 H{x}Z'
                body+=path(d,p['dark'],p['cream'],4)
                for y in (24,65):
                    for dx in (8,16,24):body+=circle(x+dx,y,1.8,p['gold'])
        elif n==17:
            for x in range(-64,320,128):
                d=f'M{x} 80 V55 H{x+20} V33 H{x+43} V13 H{x+65} V33 H{x+86} V55 H{x+106} V80'
                body+=path(d,stroke=p['dark'],width=18)+path(d,stroke=p['blue'],width=10)+path(d,stroke=p['gold'],width=2)
                body+=circle(x+43,17,9,p['gold'],p['cream'],2)
        elif n==28:
            for x in range(-64,320,128):
                d=f'M{x} 74 L{x+26} 30 L{x+45} 60 L{x+70} 17 L{x+100} 64 L{x+128} 23'
                body+=path(d,stroke=p['gold'],width=12)+path(d,stroke=p['blue'],width=7)+path(d,stroke=p['dark'],width=2)
        else:
            for x in range(0,256,64):
                for inset in (3,11,19):
                    body+=path(f'M{x+inset} {18+inset/2} H{x+61-inset} V{78-inset/2} H{x+inset}Z M{x+inset} {18+inset/2} L{x+61-inset} {78-inset/2}',stroke=p['gold'],width=1.7)
    elif n==3:
        body=rect(0,0,W,H,p['blue'])+rails(p)
        for x in (-64,64,192):
            d=f'M{x} 4 C{x+58} 4 {x+58} 92 {x+128} 92 L{x+156} 92 C{x+86} 92 {x+86} 4 {x+28} 4Z'
            body+=path(d,p['gold'],p['cream'],2)
            body+=curls(p,x+57,48,p['cream'])
    elif n in (4,7,10,18,30,34):
        if n==34:body=rect(0,0,W,H,p['cream'])+rails(p)
        for x in (64,192):
            if n==4:
                body+=path(f'M{x} 78 C{x-58} 40 {x-20} 0 {x} 27 C{x+20} 0 {x+58} 40 {x} 78Z',p['dark'],p['gold'],3)
                body+=path(f'M{x} 63 C{x-23} 35 {x-3} 20 {x} 39 C{x+3} 20 {x+23} 35 {x} 63Z',stroke=p['gold'],width=4)
                body+=diamond(p,x+64,48,15,p['dark'])
            elif n==7:
                body+=path(f'M{x} 82 C{x-50} 47 {x-40} 6 {x} 27 C{x+40} 6 {x+50} 47 {x} 82Z',p['blue'],p['cream'],4)
                body+=flower(p,x,42,12,3,p['red'])
                body+=path(f'M{x-46} 75 Q{x-29} 54 {x} 82 Q{x+29} 54 {x+46} 75',stroke=p['cream'],width=3)
            elif n==34:
                for size in (34,26,18,10):
                    body+=path(f'M{x} 85 C{x-size*1.8} 45 {x-size} 10 {x} 13 C{x+size} 10 {x+size*1.8} 45 {x} 85Z',stroke=p['ink'],width=2)
            elif n==10:
                for z in (0,22,44):
                    body+=path(f'M{x} {85-z} C{x-45} {56-z} {x-35} {13-z} {x} {40-z} C{x+35} {13-z} {x+45} {56-z} {x} {85-z}Z',p['blue'],p['cream'],3)
            else:
                body+=palmette(p,x,82,43,0 if n==18 else 2)
                if n==30:body+=circle(x,83,5,p['blue'],p['cream'],2)
    elif n in (5,6,13,19,24,29,33):
        if n in (5,6,13,29):body=rect(0,0,W,H,p['dark'])+rails(p)
        if n==33:body=rect(0,0,W,H,p['cream'])+rails(p)
        for x in (64,192):
            if n==5:
                body+=curls(p,x,48,p['blue'])
                for dx,dy in ((-37,-25),(0,-30),(25,-14),(-30,28),(15,25)):
                    body+=circle(x+dx,48+dy,4,p['cream'],p['blue'],2)
            elif n==6:
                body+=curls(p,x,48,p['red'])+curls(p,x+41,48,p['red'],True)
                body+=circle(x+31,48,5,p['green'],p['gold'],2)
            elif n==19:
                body+=curls(p,x,48,p['cream'])+path(f'M{x-45} 11 Q{x-18} 48 {x-45} 85',stroke=p['gold'],width=6)
            elif n==24:
                body+=circle(x,48,29,p['dark'],p['gold'],5)+circle(x,48,21,p['red'],p['cream'],2)
                body+=curls(p,x+49,48,p['gold'])
            elif n==13:
                body+=curls(p,x,48,p['red'])
                body+=leaf(p,x-7,63,65,27,p['green'])+leaf(p,x+47,34,-120,23,p['green'])
                body+=flower(p,x-35,30,8,5,p['gold'])
            elif n==29:
                body+=path(f'M{x-54} 88 C{x+57} 73 {x-55} 6 {x+43} 7',stroke=p['gold'],width=4)
                for dx,dy,a in ((-24,67,-55),(2,43,-55),(19,24,-55)):
                    body+=leaf(p,x+dx,dy,a,27,p['red'])
                body+=flower(p,x+43,20,18,5,p['blue'])
            else:
                body+=curls(p,x,48,p['dark'])
                body+=leaf(p,x-32,76,-25,23,p['blue'])+leaf(p,x+28,25,140,23,p['green'])
                body+=circle(x+37,48,4,p['red'])
    elif n in (8,9,15,16,23,25,35,36,37):
        if n in (9,16,37):body=rect(0,0,W,H,p['blue'])+rails(p)
        if n in (35,36):body=rect(0,0,W,H,p['dark'])+rails(p)
        for x in (64,192):
            if n in (8,15):
                body+=rect(x-35,13,70,70,p['red'],p['gold'],3)
                body+=diamond(p,x,48,31,p['red'])
                body+=path(f'M{x-25} 23 L{x+25} 73 M{x+25} 23 L{x-25} 73',stroke=p['gold'],width=4)
                if n==8:
                    for dx,dy in ((0,-20),(20,0),(0,20),(-20,0)):body+=circle(x+dx,48+dy,3,p['cream'])
            elif n in (9,23):
                body+=path(f'M{x-29} 19 L{x+29} 77 L{x+14} 77 L{x-29} 34Z',p['green'] if n==23 else p['red'],p['gold'],4)
                body+=path(f'M{x+29} 19 L{x-29} 77 L{x-14} 77 L{x+29} 34Z',p['red'],p['cream'],3)
                body+=circle(x,48,8,p['gold'],p['ink'],2)
            elif n==16:
                for d in (0,9,18):
                    body+=path(f'M{x-29+d} 19 V{77-d} H{x+29-d} V{38+d} H{x-10+d} V{19+d}',stroke=p['gold'] if d!=9 else p['red'],width=5)
                body+=flower(p,x+24,70,7,4,p['blue'])
            elif n==25:
                body+=cross(p,x,48,37,p['dark'],p['cream'])+cross(p,x,48,27,p['dark'],p['gold'])
                body+=path(f'M{x-64} 17 H{x-32} V32 H{x-18} M{x+64} 79 H{x+32} V64 H{x+18}',stroke=p['gold'],width=4)
            elif n==35:
                body+=path(f'M{x-31} 17 L{x+31} 79 M{x+31} 17 L{x-31} 79 M{x-43} 48 H{x+43} M{x} 5 V91',stroke=p['cream'],width=5)
                for dx,dy in ((-31,-31),(31,-31),(-31,31),(31,31)):
                    body+=path(f'M{x+dx-6} {48+dy-2} L{x+dx} {48+dy+4} L{x+dx+6} {48+dy-2}',stroke=p['cream'],width=3)
            elif n==36:
                for dy in (20,48,76):
                    body+=path(f'M{x-51} {dy-8} H{x-28} V{dy+8} H{x-7} V{dy-8} H{x+15} V{dy+8} H{x+43}',stroke=p['gold'],width=3)
            else:
                body+=diamond(p,x,48,35,p['blue'])+curls(p,x,48,p['gold'])
                body+=path(f'M{x-28} 12 L{x+28} 84',stroke=p['cream'],width=2)
    elif n==11:
        body=rect(0,0,W,H,p['dark'])+rails(p)
        body+=stem(p,p['gold'],4)
        for x in (26,66,110,155,204):
            body+=leaf(p,x,72,55,37,p['green'])+leaf(p,x+17,48,60,26,p['red'])
        body+=curls(p,219,48,p['gold'])
        for x,y in ((76,57),(125,31),(182,69),(235,28)):body+=circle(x,y,3,p['cream'])
    elif n in (12,14,20,21,22,26,27,31,32):
        if n in (12,14,27,31):body=rect(0,0,W,H,p['dark'])+rails(p)
        for x in (64,192):
            if n==12:
                body+=path(f'M{x-48} 7 Q{x-10} 48 {x-48} 89 M{x+48} 7 Q{x+10} 48 {x+48} 89',stroke=p['cream'],width=8)
                body+=diamond(p,x,48,29,p['gold'])
                for y in (17,79):body+=circle(x,y,3,p['cream'])
            elif n==14:
                body+=diamond(p,x,48,43,p['green'])+cross(p,x,48,12,p['red'])
                body+=path(f'M{x-64} 22 H{x-27} M{x-64} 74 H{x-27} M{x+27} 22 H{x+64} M{x+27} 74 H{x+64}',stroke=p['cream'],width=4)
            elif n==20:
                for i in range(8):
                    a=i*pi/4;z=(i+1)*pi/4
                    body+=path(f'M{x} 48 L{x+32*cos(a)} {48+32*sin(a)} A32 32 0 0 1 {x+32*cos(z)} {48+32*sin(z)}Z',(p['green'],p['cream'],p['gold'],p['cream'])[i%4])
                body+=circle(x,48,33,'none',p['cream'],3)
                body+=path(f'M{x-53} 6 Q{x-3} 48 {x-53} 90 M{x+53} 6 Q{x+3} 48 {x+53} 90',stroke=p['cream'],width=3)
            elif n==21:
                body+=flower(p,x,48,29,4,p['green'],45)+flower(p,x,48,16,4,p['cream'],0)+circle(x,48,8,p['red'],p['gold'],2)
                for dx,dy in ((-42,0),(42,0),(0,-38),(0,38)):body+=circle(x+dx,48+dy,5,p['gold'],p['cream'],2)
            elif n==22:
                body+=flower(p,x,48,32,4,p['cream'],45)
                body+=cross(p,x,48,7,p['red'],p['red'])
                for dx,dy in ((-40,0),(40,0),(0,-40),(0,40)):body+=circle(x+dx,48+dy,3,p['cream'])
            elif n==26:
                for i in range(8):
                    a=i*pi/4;body+=circle(round(x+25*cos(a),2),round(48+25*sin(a),2),9,p['blue'],p['cream'],2)
                body+=circle(x,48,9,p['gold'],p['cream'],2)
            elif n==27:
                body+=flower(p,x,48,27,4,p['blue'])+flower(p,x,48,14,4,p['gold'])
                for dx,dy in ((-40,-25),(40,-25),(-40,25),(40,25)):body+=circle(x+dx,48+dy,4,p['red'],p['gold'],1)
            elif n==31:
                body+=rect(x-59,8,118,80,p['red'],p['gold'],2)
                body+=flower(p,x-31,48,22,4,p['blue'],45)+flower(p,x+31,48,22,4,p['cream'],0)
            else:
                body+=path(f'M{x-21} 18 C{x-52} 18 {x-52} 78 {x-21} 78 M{x+21} 18 C{x+52} 18 {x+52} 78 {x+21} 78 M{x-21} 29 C{x-36} 29 {x-36} 67 {x-21} 67 M{x+21} 29 C{x+36} 29 {x+36} 67 {x+21} 67 M{x-63} 48 H{x-25} M{x+25} 48 H{x+63}',stroke=p['cream'],width=5)
                body+=path(f'M{x-19} 21 H{x+19} M{x-19} 75 H{x+19}',stroke=p['green'],width=5)
    else:
        raise ValueError(n)
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
VERTICAL = {2,3,7,10,18,29,30,33,34}
GEOMETRIC = {1,2,8,9,12,14,15,16,17,20,23,25,26,28,31,32,35,36,37,38}
MODERN_NAMES = ['gold-quatrefoil-vine','red-berry-vine','gold-leaf-scroll',
                'red-trefoil-vine','red-rosette-vine','interlocking-ribbon']


def specs():
    for n,name in enumerate(MODERN_NAMES,1):
        yield dict(name=name,number=n,reference='six-border-styles',orientation='x',
                   categories=['ribbons'] if n==6 else ['floral','scrollwork'],
                   subjects=['ribbon'] if n==6 else (['berry','vine'] if n==2 else ['flower','leaf','vine']),
                   palette=MODERN,body=modern_body(n,MODERN),background=None if n!=6 else MODERN['red'])
    for n,name in enumerate(PLATE_NAMES,1):
        yield dict(name=f'plate-{n:02d}-{name}',number=n,reference='numbered-ornament-plate',
                   orientation='y' if n in VERTICAL else 'x',
                   categories=['geometric'] if n in GEOMETRIC else ['botanical','scrollwork'],
                   subjects=name.split('-'),palette=PLATE,body=plate_body(n,PLATE),
                   background=PLATE['cream'] if n in (33,34) else
                   (PLATE['blue'] if n in (3,9,16,37) else
                    (PLATE['dark'] if n in (5,6,11,12,13,14,27,29,31,35,36) else PLATE['red'])))


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
            result+=leaf(p,67,67,45,21)+curls(p,70,61,p['red'])
        else:
            result+=flower(p,66,66,15,4 if spec['number']!=5 else 6,
                           p['gold'] if spec['number']==1 else p['red'],45)
    else:
        # Deliberately adapted corner: rails connect at exactly the edge coordinates.
        # The turn's motif takes its palette/family from the corresponding tile.
        result+=path('M96 5 H5 V96 M96 91 H91 V96',stroke=p['gold'] if spec['reference']!='six-border-styles' else p['ink'],width=3)
        if 'geometric' in spec['categories']:
            result+=diamond(p,48,48,29,p['blue'])+cross(p,48,48,14,p['red'])
        elif spec['number']==6 and spec['reference']=='six-border-styles':
            result+=path('M96 18 C45 18 18 45 18 96 L40 96 C40 63 63 40 96 40Z',p['gold'],p['ink'],3)
        else:
            result+=palmette(p,57,69,27,1)+curls(p,54,50,p['gold'])
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
    if spec['reference']=='numbered-ornament-plate':
        # Draw the background and rails once, across every side and corner.
        # Adjacent clipped rectangles/capped rail segments can leave hairlines.
        frame_corner=frame_corner.replace(rect(0,0,B,B,spec['background']),'',1)
        frame_corner=frame_corner.replace(path('M96 5 H5 V96 M96 91 H91 V96',stroke=p['gold'],width=3),'',1)
        frame_foreground=frame_foreground.replace(rails(p),'')
        underlay=path(f'M0 0 H{size} V{size} H0Z M{B} {B} V{size-B} H{size-B} V{B}Z',spec['background'])
        overlay=path(f'M5 5 H{size-5} V{size-5} H5Z M91 91 H{size-91} V{size-91} H91Z',stroke=p['gold'],width=3)
    elif spec['number']!=6:
        width=4 if spec['number']==3 else 3
        frame_foreground=frame_foreground.replace(stem(p,p['ink'],width),'',1)
        frame_corner=frame_corner.replace(path('M96 48 A48 48 0 0 0 48 96',stroke=p['ink'],width=3),'',1)
        underlay=path(frame_curve(STEM_CURVES,48),stroke=p['ink'],width=width)
        if spec['number']==3:
            gold=path('M0 57 C32 57 32 25 64 25 C96 25 96 57 128 57 C160 57 160 25 192 25 C224 25 224 57 256 57',stroke=p['gold'],width=4)
            frame_foreground=frame_foreground.replace(gold,'',1)
            underlay+=path(frame_curve(GOLD_CURVES,57),stroke=p['gold'],width=4)
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
