#!/usr/bin/env python3
"""Validate asset files and refresh the README gallery from images.json."""

import argparse
import json
from collections import Counter
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image
from build_assets import verify_pair

ROOT=Path(__file__).resolve().parents[1]
START='<!-- gallery:start -->'
END='<!-- gallery:end -->'
CATEGORIES={'floral','botanical','animals','geometric','knotwork','ribbons','scrollwork'}


def entries(item):
    yield item
    yield from item['components'].values()


def validate(catalog):
    names=set();paths=set();vector_count=0
    for item in catalog:
        assert item['name'] not in names,item['name'];names.add(item['name'])
        assert item['description'].strip()
        assert set(item['categories'])<=CATEGORIES and item['categories']
        assert item['subjects'] and item['colors']
        assert item['facing'] in {'left','right','front','mixed','unclear'}
        assert item['repeat_axis'] in {'none','x','y'}
        if item['kind']=='standalone':assert item['repeat_axis']=='none'
        if 'master_longest_dimension_cap' in item:
            assert max(item['width'],item['height'])<=item['master_longest_dimension_cap']
            assert item['master_longest_dimension_cap']<=max(item['source_canvas'].values())
        for original in entries(item):
            with Image.open(ROOT/original['png']) as source:master=source.convert('RGBA')
            for asset in [original,*original['variants']]:
                expected=master.copy()
                if 'max_dimension' in asset:
                    limit=asset.get('rendered_max_dimension',asset['max_dimension']);assert max(master.size)>limit
                    assert limit<=asset['max_dimension']
                    expected.thumbnail((limit,limit),Image.Resampling.LANCZOS,reducing_gap=3)
                    assert max(expected.size)==limit
                assert expected.size==(asset['width'],asset['height'])
                assert expected.width<=master.width and expected.height<=master.height
                for fmt in ('png','webp'):
                    path=ROOT/asset[fmt]
                    assert path.resolve().is_relative_to(ROOT)
                    assert path.stat().st_size==asset[fmt+'_bytes'],path
                    paths.add(asset[fmt])
                verify_pair(expected,ROOT/asset['png'],ROOT/asset['webp'])
            if 'svg' in original:
                vector_count+=1;path=ROOT/original['svg'];root=ET.parse(path).getroot()
                assert [float(n) for n in root.attrib['viewBox'].split()]==original['viewbox']
                # SVG exports must be genuine, self-contained vectors.
                identifiers={node.attrib['id'] for node in root.iter() if 'id' in node.attrib}
                for node in root.iter():
                    assert node.tag.split('}')[-1] not in {'image','script','foreignObject'}
                    for key,value in node.attrib.items():
                        if key.endswith('href'):
                            assert node.tag.split('}')[-1]=='use' and value.startswith('#') and value[1:] in identifiers,'Only resolved local vector references are allowed'
                paths.add(original['svg'])
        limits=[v['max_dimension'] for v in item['variants']]
        assert limits==sorted(set(limits))
    numbered=[item['reference_design'] for item in catalog if item.get('reference')=='numbered-ornament-plate']
    assert sorted(numbered)==list(range(1,39)),'Missing or duplicate numbered plate design'
    actual={path.relative_to(ROOT).as_posix() for folder in ('svg','png','webp')
            for path in (ROOT/folder).rglob('*') if path.suffix in {'.svg','.png','.webp'}}
    assert actual==paths,f'Uncatalogued assets: {actual-paths}; missing: {paths-actual}'
    print(f'Validated {len(catalog)} designs, {vector_count} genuine SVG files, and {len(paths)} total asset files.')


def gallery(catalog):
    counts=Counter(tag for item in catalog for tag in item['categories'])
    lines=[START,'## Browse designs','','| Category | Designs |','| --- | --- |']
    lines.extend(f'| `{tag}` | {count} |' for tag,count in sorted(counts.items()))
    lines+=['','| Preview | Design | Type | Files |','| --- | --- | --- | --- |']
    for item in sorted(catalog,key=lambda item:item['name'].casefold()):
        preview=next((v['webp'] for v in item['variants'] if v['max_dimension']==128),item['webp'])
        links=[f"[PNG]({item['png']})",f"[WebP]({item['webp']})"]
        if item.get('svg'):links+=[f"[SVG]({item['svg']})"]
        if 'rotated_tile' in item['components']:links+=[f"[Rotated tile]({item['components']['rotated_tile']['svg']})"]
        if 'corner' in item['components']:links+=[f"[Corner]({item['components']['corner']['svg']})",f"[Border atlas]({item['components']['border_image']['svg']})"]
        if 'reference_crop' in item['components']:links+=[f"[Reference crop]({item['components']['reference_crop']['png']})"]
        lines.append(f"| <img src=\"{preview}\" height=\"72\" alt=\"{item['name']}\"> | `{item['name']}` | {item['kind']} | {' · '.join(links)} |")
    lines+=['',END]
    return '\n'.join(lines)


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
    catalog=json.loads((ROOT/'images.json').read_text());validate(catalog)
    readme=ROOT/'README.md';text=readme.read_text()
    assert text.count(START)==text.count(END)==1
    a=text.index(START);b=text.index(END)+len(END)
    updated=text[:a]+gallery(catalog)+text[b:]
    if args.check:assert updated==text,'README gallery is stale; run scripts/catalog.py'
    else:readme.write_text(updated)
    print('README gallery is current.')


if __name__=='__main__':main()
