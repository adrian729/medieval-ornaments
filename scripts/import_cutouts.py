#!/usr/bin/env python3
"""One-time, allowlisted migration of a reviewed medieval-cutouts checkout."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def migrate(source):
    source = source.resolve()
    raw = (source / 'images.json').read_bytes()
    items = json.loads(raw)
    original = json.loads((ROOT / 'images.json').read_text())
    existing = {item['name'] for item in original if item.get('reference') != 'medieval-cutouts'}
    assert not existing.intersection(item['name'] for item in items), 'Design name collision'
    records = {}

    def copy(relative, target):
        src, dst = source / relative, ROOT / target
        assert src.resolve().is_relative_to(source) and dst.resolve().is_relative_to(ROOT)
        assert src.is_file() and not src.is_symlink(), relative
        data = src.read_bytes()
        if dst.exists():
            assert dst.read_bytes() == data, f'Existing file differs: {target}'
        else:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
        records[target] = {'source': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

    for item in items:
        for asset in [item, *item['variants']]:
            for fmt in ('png', 'webp'):
                relative = asset[fmt]
                assert relative == f"{fmt}/{str(asset['max_dimension']) + '/' if 'max_dimension' in asset else ''}{item['name']}.{fmt}"
                copy(relative, relative)
    for name in ['images.json', 'SELECTION.md', 'EXTRACTION-PROMPTS.json']:
        copy(name, 'sources/medieval-cutouts/' + name)
    prompts = json.loads((source / 'EXTRACTION-PROMPTS.json').read_text())
    for prompt in prompts:
        copy(prompt['source'], 'sources/medieval-cutouts/' + prompt['source'])
    copy('images.json', 'illustrations.json')
    destination = ROOT / 'EXTRACTION-PROMPTS.json'
    merged = json.loads(destination.read_text())
    ids = {item.get('id', item.get('name')) for item in merged}
    for prompt in prompts:
        if prompt['id'] not in ids:
            merged.append(dict(prompt, source='sources/medieval-cutouts/' + prompt['source']))
    destination.write_text(json.dumps(merged, indent=2) + '\n')
    audit = {
        'repository': 'https://github.com/adrian729/medieval-cutouts',
        'head': subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip(),
        'date': '2026-10-04',
        'note': 'Imported reviewed working tree, including uncommitted musicians-and-dancers; source checkout unchanged. Git history remains in the original repository.',
        'designs': [item['name'] for item in items],
        'files': dict(sorted(records.items()))
    }
    (ROOT / 'illustration-import.json').write_text(json.dumps(audit, indent=2) + '\n')
    print(f'Imported {len(items)} illustrations / {len(records)} byte-identical allowlisted files.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--from', dest='source', type=Path, required=True)
    migrate(parser.parse_args().source)
