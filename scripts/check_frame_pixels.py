#!/usr/bin/env python3
"""Check that rendered frames enclose their center; an open join fails this check."""
import json
from pathlib import Path

from PIL import Image

ROOT=Path(__file__).resolve().parents[1]


def enclosed(image):
    # A flood from the outside must not reach the empty center. Four-neighbor
    # background connectivity handles diagonal antialiased strokes correctly.
    pixels=image.convert('RGB');width,height=pixels.size
    threshold=12
    open_pixel=lambda x,y:sum(255-channel for channel in pixels.getpixel((x,y)))<=threshold
    stack=[(0,0)];seen={(0,0)}
    center=(width//2,height//2)
    while stack:
        x,y=stack.pop()
        if (x,y)==center:return False
        for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if 0<=xx<width and 0<=yy<height and (xx,yy) not in seen and open_pixel(xx,yy):
                seen.add((xx,yy));stack.append((xx,yy))
    return True


def main():
    report=json.loads((ROOT/'tmp/frame-matrix.json').read_text());failures=[];count=0
    for ratio in report['pixelRatios']:
        with Image.open(ROOT/f'tmp/frame-matrix-{ratio}.png') as sheet:
            for frame in report['frames']:
                # Include white exterior around all four sides.
                x=round(frame['x']*ratio)-2;y=round(frame['y']*ratio)-2
                right=round((frame['x']+frame['width'])*ratio)+2
                bottom=round((frame['y']+frame['height'])*ratio)+2
                if not enclosed(sheet.crop((x,y,right,bottom))):
                    failures.append(dict(name=frame['name'],thickness=frame['size'],pixel_ratio=ratio))
                count+=1
    (ROOT/'tmp/frame-pixel-verification.json').write_text(json.dumps(dict(cases=count,failures=failures),indent=2)+'\n')
    assert not failures,f'Open frame joins: {failures}'
    print(f'PASS {count} rendered frames enclose their center without an open join.')


if __name__=='__main__':main()
