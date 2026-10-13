"""Build retained, reviewed source repeats without re-extracting their artwork."""
import hashlib
import json
import shutil
from pathlib import Path
from math import gcd
from PIL import Image
from resource_paths import ROOT, resource_file


def border_records():
    path = ROOT / 'finished-border-patterns.json'
    return json.loads(path.read_text()) if path.exists() else []


def build_border(record):
    from build_assets import existing_export, variants, verify_pair
    entry = {key: value for key, value in record.items() if key != 'retained_inputs'}
    inputs = record['retained_inputs']
    for role, asset in [('master', entry), *entry['components'].items()]:
        retained = inputs[role]
        source = resource_file(retained['png'])
        assert hashlib.sha256(source.read_bytes()).hexdigest() == retained['sha256'], source
        target = resource_file(asset['png'], write=True)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            assert target.read_bytes() == source.read_bytes(), 'Reviewed master changed: ' + str(target)
        else:
            shutil.copyfile(source, target)
        stem = Path(asset['png']).stem
        # Preserve every native master; only encode delivery variants.
        if role == 'border_image':
            with Image.open(source) as image:
                image = image.convert('RGBA')
                step = image.width // gcd(image.width, asset['slice_pixels'])
                webp = resource_file(asset['webp'], write=True)
                webp.parent.mkdir(parents=True, exist_ok=True)
                image.save(webp, format='WEBP', lossless=True, method=6, exact=True)
                verify_pair(image, target, webp)
                updated = dict(asset, width=image.width, height=image.height,
                               png_bytes=target.stat().st_size, webp_bytes=webp.stat().st_size,
                               variants=variants(image, stem, step))
        else:
            updated = existing_export(asset, stem)
        if role == 'master':
            entry.update(updated)
        else:
            entry['components'][role] = updated
    return entry
