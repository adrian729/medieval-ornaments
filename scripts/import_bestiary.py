#!/usr/bin/env python3
"""Extract selected approved bestiary figures without redrawing or upscaling.

The audit fixes the source hash, crop bounds and matte parameters. Native crops
retain every source RGB pixel; only the delivery master's background and narrow
antialiased boundary change. Existing masters are never overwritten by import.
"""
import argparse
from collections import deque
import hashlib
import io
import json
from PIL import Image, ImageFilter
from resource_paths import ROOT, configuration, resource_file


def digest(data):
    return hashlib.sha256(data).hexdigest()


def components(mask, width, height):
    seen = bytearray(width * height)
    for start, value in enumerate(mask):
        if not value or seen[start]:
            continue
        queue, group = deque([start]), []
        seen[start] = 1
        while queue:
            index = queue.popleft()
            group.append(index)
            x, y = index % width, index // width
            for yy in range(max(0, y - 1), min(height, y + 2)):
                for xx in range(max(0, x - 1), min(width, x + 2)):
                    other = yy * width + xx
                    if mask[other] and not seen[other]:
                        seen[other] = 1
                        queue.append(other)
        yield group


def extract(native, parameters):
    width, height = native.size
    pixels = list(native.convert('RGB').get_flattened_data())
    threshold = parameters['background_min_channel']
    chroma = parameters['background_max_chroma']
    foreground = [min(p) < threshold or max(p) - min(p) > chroma for p in pixels]
    groups = sorted(components(foreground, width, height), key=len, reverse=True)
    assert groups and len(groups[0]) > 500, 'Missing complete creature'
    mask = Image.new('L', native.size)
    values = bytearray(width * height)
    for index in groups[0]:
        values[index] = 255
    mask.putdata(values)
    nearby = list(mask.filter(ImageFilter.MaxFilter(5)).get_flattened_data())
    # Retain tiny disconnected hair tips; captions are separate components.
    for group in groups[1:]:
        if len(group) <= 32 and any(nearby[index] for index in group):
            for index in group:
                values[index] = 255
    # Preserve small enclosed white highlights in the fur, while opening genuine
    # negative space within curled tails and between limbs.
    for group in components([not value for value in values], width, height):
        border = any(i % width in (0, width - 1) or i // width in (0, height - 1) for i in group)
        if not border and len(group) < parameters['minimum_hole_pixels']:
            for index in group:
                values[index] = 255
    mask.putdata(values)
    core = list(mask.filter(ImageFilter.MinFilter(3)).get_flattened_data())
    expanded = list(mask.filter(ImageFilter.MaxFilter(3)).get_flattened_data())
    background = parameters['matte_rgb']
    output, changed, opaque = [], 0, 0
    for index, rgb in enumerate(pixels):
        if core[index]:
            output.append((*rgb, 255))
            opaque += 1
            continue
        if not expanded[index] or (not values[index] and min(rgb) >= 250):
            output.append((0, 0, 0, 0))
            continue
        x, y = index % width, index // width
        neighbors = []
        for yy in range(max(0, y - 3), min(height, y + 4)):
            for xx in range(max(0, x - 3), min(width, x + 4)):
                other = yy * width + xx
                if core[other]:
                    neighbors.append(((xx - x) ** 2 + (yy - y) ** 2, other))
        if not neighbors:
            output.append((*rgb, 255) if values[index] else (0, 0, 0, 0))
            continue
        _, nearest = min(neighbors)
        delta = [pixels[nearest][c] - background[c] for c in range(3)]
        denominator = sum(value * value for value in delta)
        alpha = max(0, min(1, sum((rgb[c] - background[c]) * delta[c] for c in range(3)) / denominator)) if denominator else 1
        if alpha < parameters['minimum_edge_alpha']:
            output.append((0, 0, 0, 0))
        elif alpha >= .98:
            output.append((*rgb, 255))
            opaque += 1
        else:
            a = max(1, round(alpha * 255))
            corrected = [max(0, min(255, round((rgb[c] - background[c] * (1 - a / 255)) / (a / 255)))) for c in range(3)]
            output.append((*corrected, a))
            changed += 1
    result = Image.new('RGBA', native.size)
    result.putdata(output)
    bbox = result.getchannel('A').getbbox()
    assert bbox and bbox[0] > 0 and bbox[1] > 0 and bbox[2] < width and bbox[3] < height, 'Crop clips artwork'
    assert all(out[:3] == source for out, source in zip(output, pixels) if out[3] == 255)
    return result, {'opaque_pixels_preserved': opaque, 'antialiased_boundary_pixels': changed, 'artwork_bounds': list(bbox)}


def png_bytes(image):
    output = io.BytesIO()
    image.save(output, format='PNG', optimize=True)
    return output.getvalue()


def build(names, check=False):
    audit_path = ROOT / 'bestiary-additions.json'
    audit = json.loads(audit_path.read_text())
    entries = {entry['name']: entry for entry in audit['assets']}
    assert names and len(names) == len(set(names)) and set(names) <= entries.keys()
    source_info = audit['sources']['approved-sheet']
    source_path = ROOT / source_info['path']
    assert digest(source_path.read_bytes()) == source_info['sha256'], 'Approved source changed'
    with Image.open(source_path) as source:
        sheet = source.convert('RGB')
    masters_path = ROOT / 'illustrations.json'
    masters = json.loads(masters_path.read_text())
    existing = {item['name'] for item in masters}
    prepared = []
    for name in names:
        entry = entries[name]
        assert configuration()['assignments'].get(name) == entry['resource'], 'Assign before import'
        assert configuration()['sources'][entry['resource']]['collection'] == 'illustrations'
        assert entry['native_input'] == f'sources/tiles/{name}.png'
        assert entry['master_path'] == f'png/{name}.png'
        native = sheet.crop(entry['crop_bounds'])
        image, statistics = extract(native, audit['extraction'])
        native_bytes, master_bytes = png_bytes(native), png_bytes(image)
        paths = [resource_file(entry[key], write=True) for key in ['native_input', 'master_path']]
        if check:
            assert digest(paths[0].read_bytes()) == entry['native_sha256'] == digest(native_bytes), name+' native'
            assert digest(paths[1].read_bytes()) == entry['master_sha256'] == digest(master_bytes), name+' master'
            continue
        assert name not in existing and all(not path.exists() for path in paths), 'Import never overwrites existing artwork'
        prepared.append((entry, paths, native_bytes, master_bytes, image.size, statistics))
    if check:
        print(f'Verified deterministic extraction for {len(names)} bestiary figures.')
        return
    # Preflight the entire selected batch before writing any resource masters.
    for entry, paths, native_bytes, master_bytes, size, statistics in prepared:
        for path, data in zip(paths, [native_bytes, master_bytes]):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        entry.update(native_sha256=digest(native_bytes), master_sha256=digest(master_bytes),
                     native_dimensions=list(size), extraction_statistics=statistics)
        fields = ['name', 'author', 'description', 'categories', 'subjects', 'facing', 'colors', 'composition', 'sets', 'usage_notes']
        item = {key: entry[key] for key in fields}
        item.update(png=entry['master_path'], webp=f"webp/{entry['name']}.webp", reference='bestiary-additions',
                    derivation=entry['method'], asset_type='illustration')
        masters.append(item)
    masters_path.write_text(json.dumps(masters, indent=2, ensure_ascii=False)+'\n')
    audit_path.write_text(json.dumps(audit, indent=2)+'\n')
    print(f'Imported {len(prepared)} native bestiary cutouts; run selected illustration builds.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--name', action='append', required=True)
    parser.add_argument('--check', action='store_true', help='Verify retained crops and extraction without writes')
    args = parser.parse_args()
    build(args.name, args.check)
