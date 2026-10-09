#!/usr/bin/env python3
"""Import selected audited authored PNGs after resource assignment.

Retain the supplied native bytes and complete canvas. Normal selected builds
generate lossless WebP and smaller sizes; this command never redraws artwork.
"""
import argparse
import hashlib
import io
import json
import tarfile
from pathlib import Path
from PIL import Image
from resource_paths import ROOT, configuration, resource_file


def digest(data):
    return hashlib.sha256(data).hexdigest()


def build(archive, names):
    audit_path = ROOT / 'authored-additions.json'
    audit = json.loads(audit_path.read_text())
    entries = {item['name']: item for item in audit['assets']}
    assert names and len(names) == len(set(names)) and set(names) <= entries.keys()
    assert archive.stat().st_size == audit['source_archive']['bytes']
    assert digest(archive.read_bytes()) == audit['source_archive']['sha256'], 'Archive changed'
    masters = {file: json.loads((ROOT / file).read_text()) for file in ['illustrations.json', 'raster-metadata.json']}
    existing = {item['name'] for items in masters.values() for item in items}
    prepared = []
    with tarfile.open(archive, 'r:gz') as source:
        for name in names:
            entry = entries[name]
            assert name not in existing, 'Use selected normal builds for existing designs'
            assert isinstance(entry['author'], str) and entry['author'].strip()
            assert entry['native_input'] == f'sources/tiles/{name}.png'
            assert entry['master_path'] == f'png/{name}.png'
            identity = configuration()['assignments'][name]
            collection = 'illustrations' if entry['asset_type'] == 'illustration' else 'decorations'
            assert configuration()['sources'][identity]['collection'] == collection
            member = source.getmember(entry['source'])
            assert member.isfile() and not member.issym() and not member.islnk()
            native_bytes = source.extractfile(member).read()
            assert digest(native_bytes) == entry['source_sha256'], name+' input hash'
            with Image.open(io.BytesIO(native_bytes)) as original:
                assert original.format == 'PNG'
                image = original.convert('RGBA')
            assert list(image.size) == entry['native_dimensions']
            output = io.BytesIO()
            image.save(output, format='PNG', optimize=True)
            master_bytes = output.getvalue()
            with Image.open(io.BytesIO(master_bytes)) as master:
                assert master.convert('RGBA').tobytes() == image.tobytes()
            paths = [resource_file(entry[key], write=True) for key in ['native_input', 'master_path']]
            assert all(not path.exists() for path in paths), 'Never overwrite artwork during import'
            prepared.append((entry, native_bytes, master_bytes, paths))
    # Validate the complete batch before writing to its assigned resources.
    for entry, native_bytes, master_bytes, paths in prepared:
        for path, data in zip(paths, [native_bytes, master_bytes]):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        fields = ['name', 'author', 'description', 'categories', 'subjects', 'facing', 'colors', 'composition', 'usage_notes']
        item = {key: entry[key] for key in fields}
        item.update(png=entry['master_path'], webp=f"webp/{entry['name']}.webp",
                    reference='authored-additions', derivation=entry['method'])
        file = 'illustrations.json' if entry['asset_type'] == 'illustration' else 'raster-metadata.json'
        if file == 'illustrations.json':
            item['asset_type'] = 'illustration'
        masters[file].append(item)
        entry['master_sha256'] = digest(master_bytes)
    for file, items in masters.items():
        (ROOT / file).write_text(json.dumps(items, indent=2)+'\n')
    audit_path.write_text(json.dumps(audit, indent=2)+'\n')
    print(f'Imported {len(prepared)} authored masters; run selected artwork builds and review.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--name', action='append', required=True)
    args = parser.parse_args()
    build(args.archive, args.name)
