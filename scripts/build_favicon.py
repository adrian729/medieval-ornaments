#!/usr/bin/env python3
"""Build tab icons from the collection's red rosette vector motif."""
from pathlib import Path
import io

import cairosvg
from PIL import Image

from designs import MODERN,flower,svg

ROOT=Path(__file__).resolve().parents[1]


def build():
    document=svg(flower(MODERN,32,32,24,6,MODERN['red']),64,64,'Medieval ornaments red rosette')
    (ROOT/'favicon.svg').write_text(document)
    images={size:Image.open(io.BytesIO(cairosvg.svg2png(bytestring=document.encode(),output_width=size,output_height=size))).convert('RGBA') for size in (16,32,48)}
    images[32].save(ROOT/'favicon-32.png',optimize=True)
    images[48].save(ROOT/'favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48)],append_images=[images[16],images[32]])
    with Image.open(ROOT/'favicon.ico') as icon:
        assert icon.ico.sizes()=={(16,16),(32,32),(48,48)}
        for size,image in images.items():assert icon.ico.getimage((size,size)).convert('RGBA').tobytes()==image.tobytes()
    print('Built red rosette SVG, 32px PNG, and 16/32/48px ICO favicon.')


if __name__=='__main__':build()
