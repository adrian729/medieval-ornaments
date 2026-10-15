#!/usr/bin/env python3
"""Render a labeled comparison PNG from the retained acanthus artwork."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from resource_paths import ROOT, resource_file

PREFIX = 'illuminated-acanthus-'
FONT = Path('/usr/share/fonts/truetype/dejavu')
PAPER = '#f6f1e7'
INK = '#302d28'
MUTED = '#766e60'


def font(size, bold=False):
    return ImageFont.truetype(str(FONT / ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')), size)


def artwork(suffix):
    with Image.open(resource_file(f'png/{PREFIX}{suffix}.png')) as image:
        return image.convert('RGBA')


def contained(canvas, suffix, box):
    image = artwork(suffix)
    # Crop only this review thumbnail's clear margins, never the retained master.
    bounds = image.getchannel('A').point(lambda alpha: 255 if alpha > 20 else 0).getbbox()
    image = image.crop(bounds)
    x, y, width, height = box
    image.thumbnail((width, height), Image.Resampling.LANCZOS)
    canvas.alpha_composite(image, (round(x + (width - image.width) / 2), round(y + (height - image.height) / 2)))


def divider(canvas, box):
    x, y, width, height = box
    terminal, center = 154, 231
    rule_y = y + height * .57
    drawing = ImageDraw.Draw(canvas)
    # The same anchor proportions as examples/acanthus-dividers.css.
    ranges = [(x + terminal * .735, x + width / 2 - center * .36),
              (x + width / 2 + center * .36, x + width - terminal * .705)]
    thickness = terminal * .058
    bands = [(0, .12, '#705124'), (.12, .32, '#d6b16a'), (.32, .68, '#a94437'), (.68, .88, '#d6b16a'), (.88, 1, '#705124')]
    for left, right in ranges:
        for low, high, color in bands:
            drawing.rectangle((round(left), round(rule_y - thickness / 2 + low * thickness), round(right), round(rule_y - thickness / 2 + high * thickness)), fill=color)
    for suffix, left, output_width, anchor in [('divider-start', x, terminal, .584), ('divider-center', x + (width - center) / 2, center, .63), ('divider-end', x + width - terminal, terminal, .584)]:
        image = artwork(suffix)
        image = image.resize((output_width, round(image.height * output_width / image.width)), Image.Resampling.LANCZOS)
        canvas.alpha_composite(image, (round(left), round(rule_y - image.height * anchor)))


def build(output):
    canvas = Image.new('RGBA', (2400, 3160), PAPER)
    draw = ImageDraw.Draw(canvas)
    draw.text((80, 54), 'Illuminated acanthus', font=font(66, True), fill=INK)
    draw.text((82, 143), 'Eight additions, shown with the seven existing originals', font=font(29), fill=MUTED)
    draw.line((80, 204, 2320, 204), fill='#c4ad7f', width=2)
    for x, bg, fg, label in [(80, '#fffcf5', INK, 'ASSEMBLED DIVIDER  /  LIGHT'), (1220, '#242b30', '#eee5d5', 'ASSEMBLED DIVIDER  /  DARK')]:
        draw.rounded_rectangle((x, 237, x + 1100, 448), radius=18, fill=bg)
        draw.text((x + 30, 263), label, font=font(22, True), fill=fg)
        divider(canvas, (x + 30, 294, 1040, 142))
    draw.text((80, 492), 'NEW ADDITIONS', font=font(31, True), fill='#7b392e')
    draw.text((2320, 500), 'All files use the prefix illuminated-acanthus-', font=font(22), anchor='ra', fill=MUTED)

    def card(suffix, title, box, status):
        x, y, w, h = box
        draw.rounded_rectangle((x, y, x + w, y + h), radius=16, fill='#fffcf5', outline='#dfd5c3', width=2)
        draw.text((x + 24, y + 20), status, font=font(18, True), fill='#8d4839' if status == 'NEW' else MUTED)
        contained(canvas, suffix, (x + 28, y + 61, w - 56, h - 151))
        draw.text((x + w / 2, y + h - 71), title, font=font(25, True), anchor='ma', fill=INK)
        draw.text((x + w / 2, y + h - 34), suffix + '.png', font=font(20), anchor='ma', fill=MUTED)

    for i, (suffix, title) in enumerate([('divider-start', 'Divider start / left'), ('divider-center', 'Divider centerpiece'), ('divider-end', 'Divider end / right')]):
        card(suffix, title, (80 + i * 760, 553, 720, 372), 'NEW')
    for i, (suffix, title) in enumerate([('section-fleuron', 'Section fleuron'), ('leaf-sprig', 'Leaf sprig')]):
        card(suffix, title, (80 + i * 1140, 963, 1100, 392), 'NEW')

    for i, (suffix, title) in enumerate([('rosette', 'Rosette'), ('horizontal-flourish', 'Horizontal flourish'), ('vertical-sprig', 'Vertical sprig')]):
        card(suffix, title, (80 + i * 760, 1395, 720, 500), 'NEW')

    draw.text((80, 1947), 'EXISTING SET', font=font(31, True), fill=INK)
    draw.text((2320, 1955), 'Original artwork retained unchanged', font=font(22), anchor='ra', fill=MUTED)
    for i, (suffix, title) in enumerate([('headpiece', 'Headpiece'), ('tailpiece', 'Tailpiece'), ('frame', 'Complete frame')]):
        card(suffix, title, (80 + i * 760, 2008, 720, 460), 'EXISTING')
    for i, (suffix, title) in enumerate([('corner', 'Top-left corner'), ('corner-top-right', 'Top-right corner'), ('corner-bottom-left', 'Bottom-left corner'), ('corner-bottom-right', 'Bottom-right corner')]):
        card(suffix, title, (80 + i * 570, 2508, 530, 500), 'EXISTING')
    draw.line((80, 3050, 2320, 3050), fill='#c4ad7f', width=2)
    draw.text((80, 3081), 'Actual PNG artwork composited for review.  •  Individual files retain transparency.', font=font(24), fill=MUTED)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(output, optimize=True)
    print(output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'tmp/acanthus-preview/illuminated-acanthus-labeled-preview.png')
    build(parser.parse_args().output)
