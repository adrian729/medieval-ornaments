#!/usr/bin/env python3
"""Import a frozen, reviewed selection; measure bytes, assign, then write resources.

No extraction or artwork cleanup occurs here. Unselected staged files cannot be
imported. Native masters are copied byte-for-byte; the only geometric operation
is an exact quarter-turn to preserve a repeat's original axis. Parallel workers
prepare delivery bytes in memory; the coordinator assigns ownership before any
resource file is written. A resumable ignored journal records completed designs.
"""
import argparse, collections, concurrent.futures, hashlib, io, json, math, shutil, subprocess
from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image
from resource_paths import ROOT, COMPONENT_SUFFIXES

LIMITS=(128,256,512,768)
SUFFIX={'bar':'-bar','rotated_bar':'-bar-rotated','rotated_tile':'-rotated','frame':'-border',
        **{f'corner-{v}':f'-corner-{v}' for v in ['top-left','top-right','bottom-left','bottom-right']}}
PUBLIC_METHODS={
 'ai-assisted-historical-image-extraction':'ai-assisted-extraction',
 'native-source-continuous-edge-matting':'native-source-extraction',
 'native-continuous-ink-matting':'native-ink-extraction',
 'native-interior-repeat-with-source-derived-miter-corners':'native-source-repeat',
 'source-pixel-extraction-with-ai-assisted-selection-mask':'ai-assisted-source-mask',
 'native-ink-matting-and-editable-source-contour-trace':'native-ink-extraction',
 'native-ink-matting':'native-ink-extraction','native-interior-repeat-for-bars':'native-source-repeat',
 'native-source-paint-and-measured-sunburst-ink-matting':'mixed-source-extraction',
 'native-continuous-ink-matting-with-local-ai-rule-repair':'mixed-source-extraction',
 'ai-assisted-extraction-with-native-source-paint-recovery':'mixed-source-extraction'}
def sha(data):return hashlib.sha256(data).hexdigest()
def dump(path,value):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
def encoded(image,fmt):
 buf=io.BytesIO();image.save(buf,format=fmt,**({'lossless':True,'method':6,'exact':True} if fmt=='WEBP' else {'optimize':True}));return buf.getvalue()
def prepare(args):
 selected,a,staging=args;name=selected['name'];files={};inputs={};retained={}
 repeat=a.get('repeat') if a['asset_type']=='border' else None;axis='y' if repeat and repeat.get('original_direction',repeat.get('orientation'))=='vertical' else 'x'
 def export(role,source,turn=0,step=1):
  stem=name+('' if role=='master' else SUFFIX[role]);data=(staging/source['png']).read_bytes();assert sha(data)==source['png_sha256']
  image=Image.open(io.BytesIO(data)).convert('RGBA')
  if turn:image=image.transpose(Image.Transpose.ROTATE_270 if turn==90 else Image.Transpose.ROTATE_90);data=encoded(image,'PNG')
  native=f'sources/tiles/{stem}.png';inputs[native]=data;retained['border_image' if role=='frame' else role]={'png':native,'sha256':sha(data)}
  def pair(im,png,folder=''):
   pp=f'png/{folder}{stem}.png';wp=f'webp/{folder}{stem}.webp';webp=encoded(im,'WEBP');files[pp]=png;files[wp]=webp
   # Check the actual encoded delivery bytes, including alpha and visible RGB.
   with Image.open(io.BytesIO(webp)) as w:
    assert w.convert('RGBA').getchannel('A').tobytes()==im.getchannel('A').tobytes()
    import numpy as np
    wanted=np.asarray(im);actual=np.asarray(w.convert('RGBA'));assert np.array_equal(wanted[wanted[:,:,3]>0],actual[wanted[:,:,3]>0])
   return {'png':pp,'webp':wp,'width':im.width,'height':im.height,'png_bytes':len(png),'webp_bytes':len(webp)}
  asset=pair(image,data);asset['variants']=[]
  for limit in LIMITS:
   if max(image.size)<=limit:continue
   target=(limit//step)*step
   if target<1:continue
   small=image.copy();small.thumbnail((target,target),Image.Resampling.LANCZOS,reducing_gap=3)
   asset['variants'].append({'max_dimension':limit,'rendered_max_dimension':target,**pair(small,encoded(small,'PNG'),f'{limit}/')})
  if source.get('svg'):
   svg=(staging/source['svg']).read_bytes();assert sha(svg)==source['svg_sha256'];root=ET.fromstring(svg)
   if 'viewBox' not in root.attrib:
    width=float(root.attrib['width'].removesuffix('px'));height=float(root.attrib['height'].removesuffix('px'))
    root.set('viewBox',f'0 0 {width:g} {height:g}');svg=ET.tostring(root,encoding='utf-8')+b'\n'
   if turn:
    w,h=map(float,root.attrib['viewBox'].split()[2:]);root.attrib.update(x='0',y='0')
    transform=f'matrix(0 1 -1 0 {h:g} 0)' if turn==90 else f'matrix(0 -1 1 0 0 {w:g})'
    svg=(f'<svg xmlns="http://www.w3.org/2000/svg" width="{h:g}" height="{w:g}" viewBox="0 0 {h:g} {w:g}"><g transform="{transform}">'+ET.tostring(root,encoding='unicode')+'</g></svg>\n').encode();root=ET.fromstring(svg)
   asset['svg']=f'svg/{stem}.svg';asset['viewbox']=[float(v) for v in root.attrib['viewBox'].split()];files[asset['svg']]=svg;inputs[f'sources/traces/{stem}.svg']=svg
  return asset
 entry={key:a[key] for key in ['description','categories','subjects','facing','colors','composition']}
 entry.update(name=name,asset_type='border' if repeat else 'illustration' if a['asset_type']=='illustration' else 'decoration',
              kind='repeat-tile' if repeat else 'standalone',repeat_axis=axis if repeat else 'none',components={},reference=a['source_id'])
 entry.update(export('master',a,90 if repeat and axis=='y' else 0))
 for role,c in a.get('components',{}).items():
  if role in ['rotated_tile','rotated_bar']:continue
  step=1
  if role=='frame':step=c['width']//math.gcd(c['width'],repeat['slice_pixels'])
  entry['components']['border_image' if role=='frame' else role]=export(role,c,step=step)
  if role=='frame':entry['components']['border_image']['slice_pixels']=repeat['slice_pixels']
 if repeat:
  # Staging tiles are canonical horizontal cycles; keep the source axis in the
  # main public entry and supply its exact opposite-axis turn separately.
  entry['components']['rotated_tile']=export('rotated_tile',a,0 if axis=='y' else 90)
  entry['components']['rotated_tile'].update(repeat_axis='x' if axis=='y' else 'y',repeat_ratio=repeat['repeat_ratio'])
  bar=a['components'].get('bar')
  if bar:entry['components']['rotated_bar']=export('rotated_bar',bar,90)
  entry.update(repeat_ratio=repeat['repeat_ratio'],source_pattern=repeat['rationale'])
  if 'frame' in a['components']:entry.update(border_image_slice_percent=repeat['slice_percent'],frame_edge_ratio=repeat['repeat_ratio'],frame_fit='round',corner_method='source-derived-miter')
 method=PUBLIC_METHODS[a['provenance']['method']];entry['derivation']=method
 provenance={k:v for k,v in a['provenance'].items() if k in ['institution','title','object_identifier','date','artist','record_url','image_url','image_rights','rights_url','source_sha256'] and isinstance(v,str) and v.strip()}
 for key in ['institution','title','object_identifier','date','record_url','image_rights','rights_url']:assert provenance.get(key),(a['id'],key)
 provenance.update(method=method,audit='finished-additions.json');entry['provenance']=provenance
 notes=a.get('usage_notes',[]);entry['usage_notes']=[notes] if isinstance(notes,str) and notes else notes or ['Retained reviewed extraction; preserve its original proportions.']
 entry['usage_notes']=[note.replace('PNG-only','PNG/WebP').replace('PNG only','PNG/WebP') for note in entry['usage_notes']]
 if a.get('sets'):entry['sets']=[{k:s[k] for k in ['id','name']} for s in a['sets']]
 with Image.open(staging/a['png']) as im:entry['has_transparency']=im.getchannel('A').getextrema()[0]<255
 with Image.open(ROOT/a['provenance']['source_file']) as im:entry['source_canvas']={'width':im.width,'height':im.height}
 entry['master_longest_dimension_cap']=max(entry['width'],entry['height'])
 assert entry['master_longest_dimension_cap']<=max(entry['source_canvas'].values())
 return selected,entry,files,inputs,retained

def preserve_existing_audit(baseline):
 """Retain a permanent byte inventory, independent of ignored working files."""
 audit_path=ROOT/'finished-additions.json';audit=json.loads(audit_path.read_text())
 old=json.loads((baseline/'images.json').read_text());files={}
 for p in sorted((baseline/'manifests').glob('*.json')):
  manifest=json.loads(p.read_text())
  for relative,record in {**manifest['files'],**manifest['inputs']}.items():
   assert relative not in files
   files[relative]=dict(record,source=p.stem)
 destination=ROOT/'audits/finished-assets/preserved-existing-files.json';dump(destination,files)
 audit['preserved_existing']={'names':[i['name'] for i in old],
  'catalog_sha256':sha(json.dumps(old,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()),
  'files_audit':destination.relative_to(ROOT).as_posix(),'files_audit_sha256':sha(destination.read_bytes()),
  'previous_resource_lock':json.loads((baseline/'resource-lock.json').read_text())}
 audit['svg_normalization']='SVGs without viewBox receive a matching native width/height viewBox; drawing paths are unchanged.'
 dump(audit_path,audit)

def run(selection,staging,workers):
 selected=json.loads(selection.read_text())
 completed=ROOT/'finished-additions.json'
 if completed.exists():
  audit=json.loads(completed.read_text())
  if audit.get('preserved_existing'):
   assert [a['id'] for a in audit['assets']]==[a['id'] for a in selected['assets']], 'A different batch requires its own import audit and journal.'
   print('This finished selection is already integrated. Use selected artwork builders for subsequent corrections.');return
 m=json.loads((staging/'metadata.json').read_text());by={a['id']:a for a in m['assets']}
 journal_path=ROOT/'tmp/finished-integration/import-journal.json';journal=json.loads(journal_path.read_text()) if journal_path.exists() else {'selection_sha256':sha(selection.read_bytes()),'designs':{}}
 assert journal['selection_sha256']==sha(selection.read_bytes()),'Selection changed during import'
 baseline=ROOT/'tmp/finished-integration/baseline';old=json.loads((baseline/'images.json').read_text());oldnames={a['name'] for a in old};names={a['name'] for a in selected['assets']};assert not names&oldnames
 assert not [(n,n+s) for n in names|oldnames for s in COMPONENT_SUFFIXES if n+s in names|oldnames]
 for s in selected['assets']:
  a=by[s['id']];assert a['review']['status']=='accepted' and a['png_sha256']==s['sha256'];assert a['id'] in {x['id'] for x in m['assets']}
 def command(*args):
  result=subprocess.run(['node','scripts/resources.mjs',*args],cwd=ROOT,text=True,capture_output=True);assert result.returncode==0,result.stderr;return result.stdout
 def current():return json.loads((ROOT/'resource-registry.json').read_text())
 def reserved(identity):
  manifest=json.loads((ROOT/f'resources/manifests/{identity}.json').read_text());public=sum(v['bytes'] for v in manifest['files'].values());total=public+sum(v['bytes'] for v in manifest['inputs'].values())
  for data in journal['designs'].values():
   if data['source']==identity and data['entry']['name'] not in manifest['designs']:public+=data['public_bytes'];total+=data['total_bytes']
  return public,total
 pending=[s for s in selected['assets'] if s['name'] not in journal['designs']]
 with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as pool:
  # Bound both the number of decoded source images and prepared byte buffers.
  for start in range(0,len(pending),workers):
   batch=pending[start:start+workers]
   for s,entry,files,inputs,retained in pool.map(prepare,[(s,by[s['id']],staging) for s in batch]):
    config=current();identity=config['collections'][s['collection']]['activeSource'];public=sum(map(len,files.values()));total=public+sum(map(len,inputs.values()));existing_public,existing_total=reserved(identity)
    assert max(map(len,[*files.values(),*inputs.values()]))<=config['policy']['maxFileBytes']
    # Reserve 12 MB of the 140 MB public package for notices/catalogs/corrections.
    if existing_public+public>128_000_000 or existing_total+total>config['policy']['newDesignTrackedBytes']:
     command('new','--collection',s['collection']);config=current();identity=config['collections'][s['collection']]['activeSource']
    assert public<=128_000_000 and total<=config['policy']['newDesignTrackedBytes']
    # The stock planner conservatively treats all bytes as public. A measured
    # public+input audit is stricter about both actual independent limits.
    if reserved(identity)[0]+total>140_000_000:
     # Make the complete-footprint stock assignment pass without weakening it.
     command('new','--collection',s['collection']);config=current();identity=config['collections'][s['collection']]['activeSource']
    assert s['name'] not in config['assignments'],'Unexpected pre-existing assignment'
    command('assign','--design',s['name'],'--collection',s['collection'],'--bytes',str(total))
    target=ROOT/'tmp/resource-checkouts'/identity
    for relative,data in {**files,**inputs}.items():
     p=target/relative;assert not p.exists(),'Refuse to overwrite '+str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
    journal['designs'][s['name']]={'id':s['id'],'source':identity,'public_bytes':public,'total_bytes':total,'retained_inputs':retained,'entry':entry};dump(journal_path,journal)
    print(f"Imported {len(journal['designs'])}/{len(selected['assets'])}: {s['name']} -> {identity} ({public/1e6:.2f} MB public)",flush=True)
 entries=[journal['designs'][s['name']]['entry'] for s in selected['assets']]
 illustration=json.loads((baseline/'illustrations.json').read_text());raster=json.loads((baseline/'raster-metadata.json').read_text());borders=[]
 for entry in entries:
  if entry['asset_type']=='border':borders.append(dict(entry,retained_inputs=journal['designs'][entry['name']]['retained_inputs']))
  elif entry['asset_type']=='illustration':illustration.append(entry)
  else:raster.append(entry)
 dump(ROOT/'illustrations.json',illustration);dump(ROOT/'raster-metadata.json',raster);dump(ROOT/'finished-border-patterns.json',borders);dump(ROOT/'images.json',old+entries)
 # Keep the immutable extraction/review history separately from the compact
 # runtime catalog. Every local evidence path is repository-relative.
 def sanitize(value):
  if isinstance(value,str):return value.replace(str(ROOT)+'/', '').replace('/home/ranx729/.codex/generated_images/','retained-tool-output/')
  if isinstance(value,list):return [sanitize(v) for v in value]
  if isinstance(value,dict):return {k:sanitize(v) for k,v in value.items()}
  return value
 grouped=collections.defaultdict(list)
 for a in m['assets']:grouped[a['source_id']].append(a)
 audit_sources={}
 for sid,assets in grouped.items():
  p=ROOT/f'audits/finished-assets/{sid}.json';dump(p,{'source_id':sid,'assets':sanitize(assets)});audit_sources[sid]={'audit':p.relative_to(ROOT).as_posix(),'sha256':sha(p.read_bytes()),'original':sanitize(assets[0]['provenance'])}
 audit={'schema_version':1,'status':'integrated-locally-pending-resource-publication','staged_count':len(m['assets']),'imported_count':len(entries),'unfinished_extraction':'docs/HISTORICAL-ASSET-HANDOFF.md','sources':audit_sources,'duplicates':selected['duplicates'],'retained_overlap':selected['retained_overlap'],'assets':[dict(s,source=journal['designs'][s['name']]['source'],master_png=journal['designs'][s['name']]['entry']['png'],master_sha256=sha((ROOT/'tmp/resource-checkouts'/journal['designs'][s['name']]['source']/journal['designs'][s['name']]['entry']['png']).read_bytes())) for s in selected['assets']]}
 dump(ROOT/'finished-additions.json',audit)
 from selection_metadata import enrich
 catalog=enrich(old+entries,measure=set());assert catalog[:len(old)]==old,'Existing public metadata changed';dump(ROOT/'images.json',catalog)
 # Approve local manifests only; locks follow the pushed resource commits and
 # publication follows the maintainer's batch. No remote writes occur here.
 # A pending (unpublished) version is re-approved; a published one is bumped.
 pins=json.loads((ROOT/'resource-lock.json').read_text())['sources']
 packages={k:v['package'] for k,v in json.loads((ROOT/'resource-registry.json').read_text())['sources'].items()}
 for identity in sorted({d['source'] for d in journal['designs'].values()}):
  pin=pins[identity];parts=list(map(int,pin['version'].split('.')))
  if npm_published(packages[identity],pin['version']):parts[2]+=1
  print(command('approve','--source',identity,'--version','.'.join(map(str,parts))),flush=True)
 preserve_existing_audit(baseline)
 print('Imported and approved local resources; commit, push and lock them, then leave them pending until the maintainer says publish.',flush=True)

def npm_published(name,version):
 import urllib.request,urllib.error
 try:
  with urllib.request.urlopen(f"https://registry.npmjs.org/{name.replace('/','%2F')}/{version}",timeout=30) as response:return json.load(response).get('version')==version
 except urllib.error.HTTPError as error:
  if error.code==404:return False
  raise

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--selection',type=Path,required=True);parser.add_argument('--staging',type=Path,default=ROOT/'tmp/new-crops');parser.add_argument('--workers',type=int,default=4);args=parser.parse_args();run(args.selection.resolve(),args.staging.resolve(),args.workers)
