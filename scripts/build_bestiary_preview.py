#!/usr/bin/env python3
"""Review all sixteen retained bestiary masters against light and dark surfaces."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from resource_paths import ROOT, resource_file


def build(output):
    audit = json.loads((ROOT/'bestiary-additions.json').read_text())
    canvas = Image.new('RGB', (1800, 2560), '#ece9e2')
    draw = ImageDraw.Draw(canvas)
    font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    title, label, small = [ImageFont.truetype(font_path, size) for size in (38, 24, 18)]
    draw.text((45, 30), 'Shaggy bestiary creatures — all 16 native cutouts', fill='#292622', font=title)
    draw.text((45, 88), 'Eight dogs and eight cats • Exact approved drawings • Light / dark review', fill='#625d55', font=label)
    original = Image.open(ROOT/audit['sources']['reference-dog']['path']).convert('RGBA')
    original.thumbnail((440, 370), Image.Resampling.LANCZOS)
    canvas.paste(original, (45, 135), original)
    draw.text((530, 190), 'Original user-supplied dog reference', fill='#292622', font=label)
    draw.text((530, 240), 'Reference only; excluded from the sixteen new catalog entries.', fill='#625d55', font=small)
    draw.text((530, 285), 'Modern AI interpretations; historical source and artist unknown.', fill='#625d55', font=small)
    draw.text((530, 330), 'Native crop resolution retained; no upscaling or repainting.', fill='#625d55', font=small)
    for index, entry in enumerate(audit['assets']):
        x, y = 30 + index % 4 * 440, 550 + index // 4 * 495
        image = Image.open(resource_file(entry['master_path'])).convert('RGBA')
        for offset, background in [(0, '#fff9ef'), (220, '#242a32')]:
            draw.rectangle((x, y + offset, x + 420, y + offset + 210), fill=background)
            thumbnail = image.copy()
            thumbnail.thumbnail((400, 200), Image.Resampling.LANCZOS)
            canvas.paste(thumbnail, (x + (420-thumbnail.width)//2, y + offset + (210-thumbnail.height)//2), thumbnail)
        draw.text((x + 210, y + 450), f"{entry['label']} · {image.width} × {image.height}", font=label, fill='#292622', anchor='mm')
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, optimize=True)
    print(output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT/'tmp/bestiary-integration/native-review.png')
    build(parser.parse_args().output)
