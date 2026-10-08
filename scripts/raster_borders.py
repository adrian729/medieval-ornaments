"""Audited native repeats with optional retained, AI-assisted corner adaptations.

Repeat interiors and references stay untouched; adapted corners retain exact
connecting collars from the source-derived miter geometry.
"""
import hashlib
import json
from math import gcd
from PIL import Image
from resource_paths import ROOT, resource_file
from source_patterns import raster_documents


def records():
    path = ROOT / 'historical-border-patterns.json'
    return json.loads(path.read_text()) if path.exists() else []


def prepare(record):
    """Explicit authoring only; ordinary builds read the retained native inputs."""
    name = record['name']
    source_path = resource_file(record['source_path'])
    assert hashlib.sha256(source_path.read_bytes()).hexdigest() == record['source_sha256']
    original = Image.open(source_path).convert('RGBA')
    reference = original.crop(record['source_bounds'])
    canonical = reference.transpose(Image.Transpose.ROTATE_90).crop(record['unit_bounds'])
    assert record['orientation'] == 'y'
    width, thickness = canonical.size
    assert record['join_adjustment_px'] == 2
    # The same narrow symmetric collar used by the source tracing pipeline.
    raw = canonical.copy()
    for y in range(thickness):
        a, b = raw.getpixel((0, y)), raw.getpixel((width-1, y))
        mid = tuple(round((x+z)/2) for x, z in zip(a, b))
        for k in range(2):
            weight = (2-k)/2
            for x in (k, width-1-k):
                old = raw.getpixel((x, y))
                canonical.putpixel((x, y), tuple(round(c*(1-weight)+m*weight) for c, m in zip(old, mid)))
    native = resource_file(record['tile_path'], write=True)
    native.parent.mkdir(parents=True, exist_ok=True)
    canonical.save(native, optimize=True)
    ref_path = resource_file(record['reference_path'], write=True)
    ref_path.parent.mkdir(parents=True, exist_ok=True)
    reference.save(ref_path, optimize=True)
    record.update(tile_sha256=hashlib.sha256(native.read_bytes()).hexdigest(),
                  reference_sha256=hashlib.sha256(ref_path.read_bytes()).hexdigest(),
                  source_canvas={'width': original.width, 'height': original.height})


def build(record):
    from build_assets import save_pair, variants, existing_export, rotated_tile
    name = record['name']
    native = resource_file(record['tile_path'])
    reference = resource_file(record['reference_path'])
    assert hashlib.sha256(native.read_bytes()).hexdigest() == record['tile_sha256']
    assert hashlib.sha256(reference.read_bytes()).hexdigest() == record['reference_sha256']
    with Image.open(native) as image:
        canonical = image.convert('RGBA')
    width, thickness = canonical.size
    tile = canonical.transpose(Image.Transpose.ROTATE_270)
    corner, atlas = raster_documents(record)
    if record.get('corner_edit'):
        corner, atlas = adapted_corners(record, atlas, width, thickness)
    size = width + 2*thickness
    entry = {key: record[key] for key in ['name', 'description', 'categories', 'subjects', 'colors', 'facing', 'provenance']}
    entry.update(**save_pair(tile, name), variants=variants(tile, name),
                 kind='repeat-tile', composition='repeat-tile', repeat_axis='y',
                 derivation='ai-assisted-extraction', reference=record['reference'],
                 source_pattern=record['repeat_note'],
                 source_canvas=record['source_canvas'],
                 master_longest_dimension_cap=max(tile.size), repeat_ratio=width/thickness,
                 frame_edge_ratio=width/thickness, border_image_slice_percent=100*thickness/size,
                 frame_fit='round', corner_method=record.get('corner_method', 'source-derived-miter'), components={})
    entry['components']['corner'] = dict(**save_pair(corner, name+'-corner'), variants=variants(corner, name+'-corner'))
    entry['components']['border_image'] = dict(**save_pair(atlas, name+'-border'),
        variants=variants(atlas, name+'-border', size//gcd(size, thickness)), slice_pixels=thickness)
    entry['components']['rotated_tile'] = rotated_tile(entry)
    entry['components']['reference_crop'] = existing_export(dict(png=record['reference_path']), name+'-reference')
    print('Built', name, 'native repeat and phase-matched corner atlas', flush=True)
    return entry


def adapted_corners(record, atlas, width, thickness):
    """Assemble four separately edited phases; never rotate a single corner."""
    edit = record['corner_edit']
    source = resource_file(edit['sheet_path'])
    assert hashlib.sha256(source.read_bytes()).hexdigest() == edit['sheet_sha256']
    with Image.open(source) as image:
        sheet = image.convert('RGBA')
    b = thickness
    assert sheet.size == (2*b, 2*b)
    collar, feather = edit['connecting_collar_px'], edit['feather_px']
    result = atlas.copy()
    for sx, sy, ax, ay, side_x, side_y in [
            (0, 0, 0, 0, 'right', 'bottom'),
            (b, 0, b+width, 0, 'left', 'bottom'),
            (0, b, 0, b+width, 'right', 'top'),
            (b, b, b+width, b+width, 'left', 'top')]:
        old = atlas.crop((ax, ay, ax+b, ay+b))
        new = sheet.crop((sx, sy, sx+b, sy+b))
        mask = Image.new('L', (b, b))
        mask.putdata([round(255*min(1, max(0, (min(
            b-1-x if side_x == 'right' else x,
            b-1-y if side_y == 'bottom' else y)-collar+1)/feather)))
            for y in range(b) for x in range(b)])
        # Premultiplied alpha avoids colored fringes from invisible source RGB.
        merged = Image.composite(new.convert('RGBa'), old.convert('RGBa'), mask).convert('RGBA')
        # Preserve the zero-weight collar byte-for-byte, including invisible RGB.
        merged.paste(old, (0, 0), mask.point(lambda v: 255 if v == 0 else 0))
        result.paste(merged, (ax, ay))
    return result.crop((0, 0, b, b)), result


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare', action='store_true', required=True)
    parser.add_argument('--name', action='append', required=True)
    args = parser.parse_args()
    items = records()
    assert set(args.name) <= {item['name'] for item in items}, 'Unknown audited border'
    for item in items:
        if item['name'] in args.name:
            prepare(item)
    (ROOT / 'historical-border-patterns.json').write_text(json.dumps(items, indent=2)+'\n')
