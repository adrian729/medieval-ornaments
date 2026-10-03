#!/usr/bin/env python3
"""Register audited clean artwork inputs in the ordinary asset pipeline.

This copies originals and checked trace/native inputs, never publishes or
retraces. Watermarked drafts cannot enter the release catalog. Grid-paper
backgrounds may be retained when their limitations are explicitly audited.
"""
from pathlib import Path
import argparse,hashlib,json,shutil,re,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]


def prune_context(path):
    """Drop invisible neighbor paths; keep all curves crossing the unit edges.

    VTracer emits absolute M/L/C/Q coordinate pairs with translate transforms.
    Their control-point bounds conservatively enclose the entire curve. Unknown
    commands/transforms are retained. This changes no visible traced artwork.
    """
    root=ET.parse(path).getroot()
    x,_,width,_=map(float,root.attrib['viewBox'].split())
    if not x:return
    number=r'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?'
    for node in list(root):
        d=node.get('d','')
        commands=set(re.findall(r'[A-DF-Za-df-z]',d))
        if not d or not commands<={'M','L','C','Q','Z'}:continue
        transform=node.get('transform','translate(0,0)')
        if not re.fullmatch(r'translate\([^()]+\)',transform):continue
        shift=list(map(float,re.findall(number,transform)))
        values=list(map(float,re.findall(number,d)))
        if len(shift)!=2 or len(values)%2:continue
        xs=[v+shift[0] for v in values[::2]]
        if xs and (max(xs)<x-.1 or min(xs)>x+width+.1):root.remove(node)
    ET.register_namespace('','http://www.w3.org/2000/svg')
    path.write_text(ET.tostring(root,encoding='unicode')+'\n')


def register(paths):
    target=ROOT/'additional-patterns.json'
    existing=json.loads(target.read_text()) if target.exists() else []
    by_name={item['name']:item for item in existing}
    original_names={item['name'] for item in json.loads((ROOT/'images.json').read_text())}-by_name.keys()
    for path in paths:
        for audit in json.loads((ROOT/path).read_text()):
            assert audit['status']=='clean-candidate','Only audited clean candidates can be registered: '+audit['name']
            name=audit['name'];assert name not in original_names,'Existing design: '+name
            record=dict(audit)
            for field,destination in [
                ('source_path',f"sources/additions/{audit['reference']}.png"),
                ('tile_path',f'sources/tiles/{name}.png'),
                ('trace_path',f'sources/traces/{name}.svg'),
                ('reference_path',f'png/{name}-reference.png')]:
                src=ROOT/audit[field];dst=ROOT/destination
                dst.parent.mkdir(parents=True,exist_ok=True)
                if dst.exists() and field=='source_path':assert dst.read_bytes()==src.read_bytes(),'Source must be preserved: '+destination
                if src!=dst:shutil.copyfile(src,dst)
                record[field]=destination
                if field=='trace_path':prune_context(dst)
            record.setdefault('trace_options',{})['retain_context_paths']=False
            record['source_sha256']=hashlib.sha256((ROOT/record['source_path']).read_bytes()).hexdigest()
            record['status']='integrated';by_name[name]=record
            print(name,flush=True)
    target.write_text(json.dumps(sorted(by_name.values(),key=lambda i:(i['reference'],i['reference_design'])),indent=2)+'\n')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audit',action='append',required=True,help='Repository-relative clean audit JSON.')
    register(parser.parse_args().audit)
