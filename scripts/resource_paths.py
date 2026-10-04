"""Authoring paths for registered external resources; no implicit downloads."""
import json
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@lru_cache(maxsize=1)
def configuration():
    path = ROOT / 'resource-registry.json'
    return json.loads(path.read_text()) if path.exists() else None


@lru_cache(maxsize=1)
def owners():
    config = configuration()
    if config is None:
        return {}
    result = {}
    for identity in config['sources']:
        manifest = json.loads((ROOT / f'resources/manifests/{identity}.json').read_text())
        retained=[name for name in manifest['designs'] if config['assignments'].get(name)!=identity]
        def belongs(relative):
            stem=Path(relative).stem
            return not any(stem==name or any(stem==name+suffix for suffix in ['-border','-corner','-rotated','-reference']) for name in retained)
        for relative in filter(belongs,[*manifest['files'], *manifest.get('inputs', {})]):
            assert relative not in result, f'Two resource owners: {relative}'
            result[relative] = identity
    return result


def resource_file(relative, *, write=False):
    relative = str(relative)
    assert not Path(relative).is_absolute() and '..' not in Path(relative).parts
    config = configuration()
    if config is None:
        return ROOT / relative
    identity = owners().get(relative)
    if write and identity is not None:
        stem = Path(relative).stem
        candidates = [name for name in config['assignments'] if stem == name or any(stem == name + suffix for suffix in ['-border', '-corner', '-rotated', '-reference'])]
        assert len(candidates) == 1 and config['assignments'][candidates[0]] == identity, f'Conflicting resource write ownership: {relative}'
    if identity is None and relative.startswith(('png/', 'webp/', 'svg/', 'sources/tiles/', 'sources/traces/')):
        stem = Path(relative).stem
        candidates = [name for name in config['assignments'] if stem == name or any(stem == name + suffix for suffix in ['-border', '-corner', '-rotated', '-reference'])]
        assert len(candidates) == 1, f'Register an unambiguous resource before writing {relative}'
        identity = config['assignments'][candidates[0]]
    if identity is None:
        return ROOT / relative
    target = ROOT / 'tmp/resource-checkouts' / identity / relative
    return target if write or target.exists() else ROOT / relative


def asset_relative(path):
    path = Path(path)
    config = configuration()
    if config is not None:
        for identity in config['sources']:
            base = ROOT / 'tmp/resource-checkouts' / identity
            if path.is_relative_to(base):
                return path.relative_to(base).as_posix()
    return path.relative_to(ROOT).as_posix()
