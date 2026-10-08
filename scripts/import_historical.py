#!/usr/bin/env python3
"""Import explicitly selected, audited historical extractions; never edit old assets.

The built-in image editor supplies each result and its exact prompt in an
ignored result JSON. This importer retains its original PNG, trims outer
canvas, and only downsamples. It does not clean pixels or synthesize repeats.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from PIL import Image
from resource_paths import ROOT, resource_file, configuration


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(names, results_directory):
    audit_path = ROOT / 'historical-additions.json'
    audit = json.loads(audit_path.read_text())
    entries = {entry['name']: entry for entry in audit['assets']}
    assert names and set(names) <= entries.keys(), 'Select known audited additions'
    candidates = {item['id']: item for item in json.loads((ROOT / 'docs/source-candidates.json').read_text())['candidates']}
    masters = {filename: json.loads((ROOT / filename).read_text()) for filename in ['illustrations.json', 'raster-metadata.json']}
    old_names = {item['name'] for item in json.loads((ROOT / 'images.json').read_text())}
    prepared = []
    # Preflight the whole requested batch before any output writes.
    for name in names:
        entry = entries[name]
        collection = 'illustrations' if entry['asset_type'] == 'illustration' else 'decorations'
        identity = configuration()['assignments'][name]
        assert configuration()['sources'][identity]['collection'] == collection
        assert name not in old_names, 'Importer adds new designs only; use selected normal builds for corrections'
        assert entry['candidate'] in candidates, 'Unknown historical object'
        for relative in [f'sources/tiles/{name}.png', f'png/{name}.png']:
            assert not resource_file(relative, write=True).exists(), 'Do not replace an existing input or master'
        result = json.loads((results_directory / (name + '.json')).read_text())
        generated = Path(result['path'])
        assert generated.is_file() and result['prompt'].strip()
        source = audit['sources'].get(entry['source'])
        if source:
            assert digest(ROOT / source['path']) == source['sha256'], 'Historical source changed'
            assert entry['max_dimension'] <= max(source['width'], source['height'])
        with Image.open(generated) as original:
            assert original.mode == 'RGBA', 'Editor must supply real transparent alpha'
            assert original.getchannel('A').getextrema()[0] == 0
            image = original.copy()
        # Bound visible artwork with a margin. Low-alpha RGB outside it is a
        # common image-editor artifact; no pixels inside the crop are retouched.
        visible = image.getchannel('A').point(lambda value: 255 if value > 16 else 0).getbbox()
        assert visible, 'Empty extraction'
        padding = 8
        bounds = (max(0, visible[0]-padding), max(0, visible[1]-padding),
                  min(image.width, visible[2]+padding), min(image.height, visible[3]+padding))
        image = image.crop(bounds)
        image.thumbnail((entry['max_dimension'], entry['max_dimension']), Image.Resampling.LANCZOS)
        prepared.append((entry, result, generated, source, image, bounds))
    for entry, result, generated, source, image, bounds in prepared:
        name = entry['name']
        native_relative = f'sources/tiles/{name}.png'
        native = resource_file(native_relative, write=True)
        native.parent.mkdir(parents=True, exist_ok=True)
        assert not native.exists(), 'Do not replace an existing native result'
        shutil.copyfile(generated, native)
        target = resource_file(f'png/{name}.png', write=True)
        target.parent.mkdir(parents=True, exist_ok=True)
        assert not target.exists(), 'Do not replace an existing master'
        image.save(target, format='PNG')
        candidate = candidates[entry['candidate']]
        method = 'ai-assisted-extraction' if source else 'independent-ai-interpretation'
        origin = {key: candidate[key] for key in ['institution', 'title', 'object_identifier', 'date', 'record_url']}
        if candidate.get('artist'):
            origin['artist'] = candidate['artist']
        origin.update(image_rights='CC0 1.0' if candidate['id'].startswith(('walters-', 'cleveland-', 'getty-')) else 'Public Domain' if source else 'Restricted reference image; no scan used',
                      rights_url=candidate['rights_evidence_urls'][-1] if candidate['id'].startswith(('getty-', 'cleveland-')) else candidate['rights_evidence_urls'][0], method=method, audit='historical-additions.json')
        if source:
            origin.update(image_url=source['download_url'], source_sha256=source['sha256'])
        fields = ['name', 'description', 'categories', 'subjects', 'facing', 'colors', 'composition']
        item = {key: entry[key] for key in fields}
        item.update(png=f'png/{name}.png', webp=f'webp/{name}.webp', reference=entry['candidate'],
                    derivation=method, provenance=origin,
                    source_canvas={'width': source['width'] if source else image.width, 'height': source['height'] if source else image.height},
                    master_longest_dimension_cap=entry['max_dimension'])
        notes = []
        if source:
            notes.append('Extracted from the historical object linked in provenance; see the source and exact edit prompt in historical-additions.json.')
        else:
            notes.append('New AI illustration independently composed from a documented medieval motif. This is a modern interpretation; no restricted museum image was used.')
        if name in ['aldegrever-paired-tendrils', 'hopfer-thistle-panel', 'walters-elephant-castle']:
            notes.append('The original panel ground is intentionally retained; only the surrounding page was removed.')
        if name.startswith('rosselli-'):
            notes.append('Pale engraved motif interiors are retained; openings and the surrounding sheet are transparent.')
        if 'strip' in name:
            notes.append('Whole historical strip with its original end phases. A seamless join has not been established; do not use as a repeating background.')
        if 'frame' in name:
            notes.append('Fixed complete frame with a transparent center. Resize proportionally as one image; this has no tile or adaptable frame atlas.')
        if name.startswith('walters-'):
            notes.append('Small museum source detail; exports are capped at its useful native region size. Larger display cannot recover detail.')
        item['usage_notes'] = notes
        filename = 'illustrations.json' if entry['asset_type'] == 'illustration' else 'raster-metadata.json'
        if filename == 'illustrations.json':
            item['asset_type'] = 'illustration'
        masters[filename].append(item)
        entry.update(prompt=result['prompt'], generated_input=native_relative,
                     generated_sha256=digest(native), export_crop=list(bounds), alpha_crop_threshold=16,
                     crop_padding=8, master_sha256=digest(target),
                     review={'status': 'awaiting-final-export-review'})
    for filename, items in masters.items():
        (ROOT / filename).write_text(json.dumps(items, indent=2)+'\n')
    audit_path.write_text(json.dumps(audit, indent=2)+'\n')
    print(f'Imported {len(names)} masters. Run selected normal builds, inspect the exports, then record each review.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--name', action='append', required=True)
    parser.add_argument('--results-dir', type=Path, required=True)
    args = parser.parse_args()
    build(args.name, args.results_dir)
