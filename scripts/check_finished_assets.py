#!/usr/bin/env python3
"""Verify the finished import's native bytes, ownership, rotations and corners."""
import hashlib,json
from pathlib import Path
from PIL import Image
from resource_paths import ROOT,resource_file,configuration

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def check():
 audit=json.loads((ROOT/'finished-additions.json').read_text());catalog=json.loads((ROOT/'images.json').read_text());by={a['name']:a for a in catalog};config=configuration();checked=0;corners=0
 assert len(audit['assets'])==audit['imported_count']
 assert len({a['name'] for a in audit['assets']})==len(audit['assets'])
 excluded={d['exclude'] for d in audit['duplicates']};assert not excluded&{a['id'] for a in audit['assets']}
 for source in audit['sources'].values():assert sha(ROOT/source['audit'])==source['sha256']
 for a in audit['assets']:
  item=by[a['name']];assert config['assignments'][a['name']]==a['source'];assert sha(resource_file(item['png']))==a['master_sha256'];checked+=1
  assert item['provenance']['source_sha256']==audit['sources'][item['reference']]['original']['source_sha256']
  if item['kind']!='repeat-tile':continue
  with Image.open(resource_file(item['png'])) as im:
   main=im.convert('RGBA');native=main.transpose(Image.Transpose.ROTATE_90) if item['repeat_axis']=='y' else main.copy()
  w,b=native.size
  assert native.crop((0,0,2,b)).tobytes()==native.crop((w-2,0,w,b)).tobytes(),a['name']+' repeat boundary'
  bar=item['components']['bar']
  with Image.open(resource_file(bar['png'])) as im:
   assert im.size==(5*w,b)
   for n in range(5):assert im.crop((n*w,0,(n+1)*w,b)).tobytes()==native.tobytes(),a['name']+' complete cycle'
  if 'border_image' not in item['components']:
   assert 'border_image_slice_percent' not in item
   continue
  atlas=item['components']['border_image']
  with Image.open(resource_file(atlas['png'])) as im:
   assert im.size==(w+2*b,w+2*b);assert im.crop((b,b,b+w,b+w)).getbbox() is None
   for role,x,y in [('top-left',0,0),('top-right',b+w,0),('bottom-left',0,b+w),('bottom-right',b+w,b+w)]:
    with Image.open(resource_file(item['components']['corner-'+role]['png'])) as corner:assert corner.convert('RGBA').tobytes()==im.crop((x,y,x+b,y+b)).convert('RGBA').tobytes(),a['name']+' '+role
    corners+=1
   # These reviewed units average matching two-column collars, preserving
   # variation within that collar; adjacent single pixels need not be equal.
   for index,(left,right) in enumerate([((b-2,0,b,b),(b,0,b+2,b)),((0,b-2,b,b),(0,b,b,b+2)),((b+w-2,0,b+w,b),(b+w,0,b+w+2,b)),((b+w,b-2,w+2*b,b),(b+w,b,w+2*b,b+2)),((b+w,b+w-2,w+2*b,b+w),(b+w,b+w,w+2*b,b+w+2)),((b+w-2,b+w,b+w,w+2*b),(b+w,b+w,b+w+2,w+2*b)),((b-2,b+w,b,w+2*b),(b,b+w,b+2,w+2*b)),((0,b+w-2,b,b+w),(0,b+w,b,b+w+2))]):
    # The inner-most sample belongs to the diagonal miter, not the
    # straight collar; its pixels are covered by the retained-corner check.
    first,second=im.crop(left),im.crop(right);cw,ch=first.size
    bounds=([(0,0,cw,ch-1),(0,0,cw-1,ch),(0,0,cw,ch-1),(1,0,cw,ch),
             (1,0,cw,ch),(0,1,cw,ch),(0,1,cw,ch),(0,0,cw-1,ch)])[index]
    assert first.crop(bounds).tobytes()==second.crop(bounds).tobytes(),a['name']+' corner seam'
 preserved=audit.get('preserved_existing')
 if preserved:
  old=[i for i in catalog if i['name'] in set(preserved['names'])];assert hashlib.sha256(canonical(old)).hexdigest()==preserved['catalog_sha256'],'Existing descriptive catalog changed'
  files=json.loads((ROOT/preserved['files_audit']).read_text());assert sha(ROOT/preserved['files_audit'])==preserved['files_audit_sha256']
  for relative,record in files.items():
   file=ROOT/'tmp/resource-checkouts'/record['source']/relative;assert file.stat().st_size==record['bytes'] and sha(file)==record['sha256'],'Existing artwork changed: '+relative
 print(f'Verified {checked} imported native masters, {corners} retained corner phases, complete repeat bars and all preserved existing artwork.')
if __name__=='__main__':check()
