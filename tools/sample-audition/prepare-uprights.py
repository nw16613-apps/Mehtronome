"""Prepare two new CC0 upright libraries for a source-only listening audition.
python3 tools/sample-audition/prepare-uprights.py /workspace/upright-candidates
"""
import concurrent.futures,hashlib,json,pathlib,re,subprocess,sys,urllib.request,urllib.parse
import numpy as np
from scipy.signal import correlate
OUT=pathlib.Path(sys.argv[1]);OUT.mkdir(parents=True,exist_ok=True)
SOURCES={'vsco':('sgossner/VSCO-2-CE','440300901dfe9275fd84e0b7763af1f8443ae62e'), 'smolken':('sfzinstruments/dsmolken.double-bass','c2985eb647109d2a8f30a70071e3e163339d7396')}
MAP_REV='6dd651d55dde97fd4028699be9d4481f26917891'
def fetch(repo,rev,path):return urllib.request.urlopen(f'https://raw.githubusercontent.com/{repo}/{rev}/'+urllib.parse.quote(path),timeout=45).read()
def number(text,key,default):
 m=re.search(r'\b'+key+r'=(-?[\d.]+)',text);return float(m[1])if m else default
specs=[]
for family,(repo,rev)in SOURCES.items():
 license=fetch(repo,rev,'LICENSE');assert b'CC0 1.0'in license;(OUT/('LICENSE-'+family+'.txt')).write_bytes(license)
 mapping=fetch(repo,MAP_REV if family=='vsco'else rev,'ContrabassPizz.sfz'if family=='vsco'else'd_smolken_rubner_bass_pizz.sfz').decode();(OUT/(family+'.sfz')).write_text(mapping)
 for group in mapping.split('<group>')[1:]:
  shared=group.split('<region>')[0]
  for region in group.split('<region>')[1:]:
   path=re.search(r'sample=([^\r\n]+)',region)
   if not path:continue
   path=path[1].strip().replace('\\','/');root=number(region,'pitch_keycenter',-1)
   if 'noises'in path or not 24<=root<=60:continue
   if family=='smolken'and not re.search(r'_[pmf][ab]\.wav$',path):continue
   low=number(region,'lovel',number(shared,'lovel',0));high=number(region,'hivel',number(shared,'hivel',127))
   layer=int(re.search(r'_v(\d+)',path)[1])if family=='vsco'else re.search(r'_([pmf])[ab]\.wav$',path)[1]
   if family=='vsco':path='Strings/Solo Contrabass/Pizz/'+path
   specs.append(dict(family=family,path=path,nominalMidi=root,velLow=low/128,velHigh=(high+1)/128,layer=layer))
unique={};
for s in specs:unique.setdefault((s['family'],s['path']),s)
specs=list(unique.values())
def pitch(x,nominal):
 period=32000/(440*2**((nominal-69)/12));estimates=[]
 for start in [.065,.13,.2]:
  part=x[int(start*32000):int((start+.35)*32000)];
  if len(part)<3200:continue
  part=part*np.hanning(len(part));ac=correlate(part,part,mode='full',method='fft')[len(part)-1:];lo=max(2,int(period*.94));hi=min(len(ac)-2,int(period*1.06)+1);i=lo+int(np.argmax(ac[lo:hi]));
  if i==lo or i==hi-1:continue
  den=ac[i-1]-2*ac[i]+ac[i+1];lag=i+(.5*(ac[i-1]-ac[i+1])/den if den else 0);midi=69+12*np.log2(32000/lag/440)
  if ac[i]/max(ac[0],1e-12)>.4:estimates.append(float(midi))
 if not estimates:raise ValueError('Unreliable pitch '+str(nominal))
 root=float(np.median(estimates));assert abs(root-nominal)<1.1
 return round(root,5)
def prepare(pair):
 index,s=pair;id=s['family']+'-'+str(index).zfill(3);dest=OUT/(id+'.f32');receipt=OUT/(id+'.json')
 if dest.exists()and receipt.exists():
  cached=json.loads(receipt.read_text())
  if cached['path']==s['path']and hashlib.sha256(dest.read_bytes()).hexdigest()==cached['sha256']:return cached
 repo,rev=SOURCES[s['family']];raw=fetch(repo,rev,s['path']);source=OUT/(id+'.wav');source.write_bytes(raw)
 decoded=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(source),'-ac','1','-ar','32000','-f','f32le','-']),dtype='<f4').copy();source.unlink();decoded-=np.mean(decoded);peak=float(np.max(abs(decoded)));assert peak>1e-5
 start=max(0,int(np.flatnonzero(abs(decoded)>peak*.002)[0])-16);x=decoded[start:start+32000*4];root=pitch(x,s['nominalMidi']);x*=.85/np.max(abs(x));x[:16]*=np.arange(16)/16;fade=min(384,len(x));x[-fade:]*=np.linspace(1,0,fade);dest.write_bytes(x.astype('<f4').tobytes())
 result=s|dict(id=id,rootMidi=root,repository=repo,revision=rev,license='CC0-1.0',sourceSha256=hashlib.sha256(raw).hexdigest(),sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),seconds=len(x)/32000,onsetTrimFrames=start);receipt.write_text(json.dumps(result));return result
print('Preparing',len(specs),'recordings',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:files=list(pool.map(prepare,enumerate(specs)))
(OUT/'sources.json').write_text(json.dumps(dict(sampleRate=32000,mapRevision={'vsco':MAP_REV,'smolken':SOURCES['smolken'][1]},processing='Mono 32 kHz float PCM, DC/onset trim, per-note peak .85 as in the existing source audition, natural tails up to 4s, short edge fades. Pitch centres measured from three autocorrelation windows; correction applied by sampler. Original SFZ velocity regions retained; two takes. No extra EQ, compressor or noise layer.',files=files),indent=2)+'\n');print('Prepared',len(files),'recordings',flush=True)
