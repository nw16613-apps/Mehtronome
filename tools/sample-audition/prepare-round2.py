"""Pinned DI guitar and clean bass sources for the second offline audition.
Usage: python3 tools/sample-audition/prepare-round2.py CACHE
"""
import concurrent.futures, hashlib, json, pathlib, re, subprocess, sys, urllib.parse, urllib.request
import numpy as np
OUT=pathlib.Path(sys.argv[1]);OUT.mkdir(parents=True,exist_ok=True)
REPOS={
 'emily':('sfzinstruments/karoryfer.emilyguitar','b4920dc662fd9cad6dcaccdeecffdd91c8725d8c','LICENSE','emily_basic.sfz'),
 'swag':('sfzinstruments/karoryfer.swagbass','9d10fcae71af1975988ddecd5af1c95d372c7355','LICENSE','swagbass.sfz'),
 'yr':('freepats/electric-bass-YR','8dcb7ea9116f417273ef8c030d15e7b3aa654301','LICENSE.txt','FingerBassYR 20190930.sfz'),
 'direct':('freepats/electric-guitar-FSBS-direct','4c1d54601836c3e1a262b0bb0f3dea0c0a881ad3','LICENSE.txt','EGuitarFSBS-direct bridge 20220911.sfz')}
def fetch(repo,rev,path):
 return urllib.request.urlopen(f'https://raw.githubusercontent.com/{repo}/{rev}/'+urllib.parse.quote(path),timeout=60).read()
def number(text,key,default):
 m=re.search(r'(?<!\w)'+key+r'=(-?[\d.]+)',text);return float(m[1]) if m else default
specs=[]
for family,(repo,rev,lic,mapfile) in REPOS.items():
 licence=fetch(repo,rev,lic);assert b'CC0' in licence
 (OUT/('LICENSE-'+family)).write_bytes(licence)
 mapping=fetch(repo,rev,mapfile);(OUT/(family+'.sfz')).write_bytes(mapping)
 for group in mapping.decode().split('<group>')[1:]:
  shared=group.split('<region>')[0]
  for region in group.split('<region>')[1:]:
   m=re.search(r'sample=([^\r\n]+)',region)
   if not m:continue
   path=m[1].strip().replace('\\','/')
   if family in ['emily','swag'] and not path.startswith('notes/'):continue
   root=number(region,'pitch_keycenter',number(region,'key',number(shared,'pitch_keycenter',None)))
   if root is None or not (24<=root<=66 if family in ['swag','yr'] else 37<=root<=85):continue
   take=re.search(r'_rr(\d+)',path)
   if take and int(take[1])>2:continue
   lo=number(region,'lovel',number(shared,'lovel',0))/128
   hi=(number(region,'hivel',number(shared,'hivel',127))+1)/128
   tune=number(region,'tune',number(shared,'tune',0))
   specs.append(dict(family=family,path=path,nominalMidi=root,rootMidi=root-tune/100,
    velLow=lo,velHigh=hi,layer=lo,repository=repo,revision=rev,license='CC0-1.0'))
def prepare(s):
 name=s['family']+'-'+hashlib.sha256(s['path'].encode()).hexdigest()[:14];target=OUT/(name+'.f32');receipt=OUT/(name+'.json')
 if target.exists() and receipt.exists():
  r=json.loads(receipt.read_text())
  if r['revision']==s['revision'] and hashlib.sha256(target.read_bytes()).hexdigest()==r['sha256']:return r
 raw=fetch(s['repository'],s['revision'],s['path']);src=OUT/(name+'.source');src.write_bytes(raw)
 data=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-ac','1','-ar','32000','-f','f32le','-']);src.unlink()
 x=np.frombuffer(data,dtype='<f4').copy();x-=np.mean(x);start=max(0,int(np.flatnonzero(abs(x)>max(abs(x))*.002)[0])-16)
 x=x[start:start+32000*6];x*=.85/max(abs(x));x[:16]*=np.arange(16)/16;x[-384:]*=np.linspace(1,0,384)
 target.write_bytes(x.astype('<f4').tobytes());r=s|dict(id=name,seconds=len(x)/32000,onsetTrimFrames=start,
  sourceSha256=hashlib.sha256(raw).hexdigest(),sha256=hashlib.sha256(target.read_bytes()).hexdigest())
 receipt.write_text(json.dumps(r));return r
print('Preparing',len(specs),'recordings',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
cabRepo='jfsantos/guitar-fx';cabRev='f692d2357010a2cb7636c8dbfe7497ae43b04bcf'
ir=fetch(cabRepo,cabRev,'data/ir.wav');(OUT/'cabinet.wav').write_bytes(ir)
credit=fetch(cabRepo,cabRev,'README.md');assert b'public domain' in credit;(OUT/'cabinet-source.md').write_bytes(credit)
(OUT/'sources.json').write_text(json.dumps(dict(sampleRate=32000,processing='Mono 32 kHz float PCM; DC/onset trim, peak .85, natural decay up to six seconds; edge fades; source-map pitch/tuning. Available dynamics and up to two independent takes retained.',files=files,
 cabinet=dict(repository=cabRepo,revision=cabRev,path='data/ir.wav',sha256=hashlib.sha256(ir).hexdigest(),license='Public domain per repository README',description='Fender Deluxe Reverb speaker response originally from Soundwoofer; a linear cabinet response, not an amplifier model.')),indent=2)+'\n')
print('Prepared',len(files),'recordings and cabinet IR',flush=True)
