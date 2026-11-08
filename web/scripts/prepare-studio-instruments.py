"""Free, redistributable comping and melody recordings. Offline preparation.
Use original FLAC/WAV sources where available; Meta web recordings are OGG.
No runtime network sources. Keep each source's licence and pinned provenance.
"""
import concurrent.futures,hashlib,json,pathlib,re,subprocess,tempfile,urllib.parse,urllib.request,wave
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/studio-instruments';ROOT.mkdir(exist_ok=True)
REPOS={
 'meta':('facebookincubator/Meta-open-sound','251c0be57d5d1b3242b91f53e0cde62ab1cb42d9','CC0-1.0','LICENSE'),
 'fsbs':('freepats/electric-guitar-FSBS-clean','192cf0d9bf2c4ba6ead8e3524ba3f78818e4fe91','CC0-1.0','LICENSE.txt'),
 'flute':('sfzinstruments/Ixox.Flute','0cc54468bb0d2d9b32921958585caad65ba8df21','CC-BY-4.0','LICENSE'),
 'organ':('adewale/keyboardia','90ecc152330cabc33060788f14c67795307d4bba','CC0-1.0','app/public/instruments/LICENSE.md'),
 'wurl':('sfzinstruments/GregSullivan.E-Pianos','8c3e581acda3594b553948ff0222d4f84a698376','CC-BY-3.0','LICENSE'),
 'vcsl':('sgossner/VCSL','c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e','CC0-1.0','LICENSE')}
def read(repo,path):
 project,rev,*_=REPOS[repo];return urllib.request.urlopen(f'https://raw.githubusercontent.com/{project}/{rev}/'+urllib.parse.quote(path),timeout=50).read()
specs=[]
def add(bank,repo,path,midi,layer=0,low=0,high=1.01,tail=4,take=1,**extra):
 id='q'+bank[0].upper()+bank[1:]+str(midi)+'v'+str(layer)+'r'+str(take);specs.append(dict(id=id,bank=bank,repo=repo,path=path,nominalMidi=midi,rootMidi=midi,layer=layer,velLow=low,velHigh=high,tail=tail,take=take)|extra)
notes=['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B'];note=lambda m:notes[m%12]+str(m//12-1)
for midi in range(42,85,3):
 for layer in range(1,5):add('piano','meta',f'systems/instruments/meta-piano/ogg/INSPiano_Vel{layer:02}_{note(midi)}_01.ogg',midi,layer,(layer-1)/4,layer/4 if layer<4 else 1.01,4.5)
manifest=json.loads(read('meta','systems/instruments/meta-nylon-guitar/manifest.json'))
for midi in range(42,85,3):
 for layer,tech in [(1,'Finger'),(2,'Pick'),(3,'Pick')]:
  candidates=[v['file'] for v in manifest['samples'] if f'_Vel{layer:02}{tech}_{note(midi)}_' in v['file']]
  if not candidates:continue
  # The highest available string at that note avoids unnecessarily thick bass strings.
  order=['StringLowE','StringA','StringD','StringG','StringB','StringHighE'];name=max(candidates,key=lambda f:next(i for i,s in enumerate(order) if s+'_' in f))
  add('nylonGuitar','meta','systems/instruments/meta-nylon-guitar/ogg/'+name.replace('.wav','.ogg'),midi,layer,(layer-1)/3,layer/3 if layer<3 else 1.01,4.5)
maptext=read('fsbs','EGuitarFSBS-clean bridge 20260807.sfz').decode()
seen=set()
for group in maptext.split('<group>')[1:]:
 match=re.search(r'pitch_keycenter=(\d+)',group)
 if not match:continue
 root=int(match[1]);files=re.findall(r'sample=([^\r\n]+)',group)
 if not 40<=root<=85:continue
 for take,path in enumerate(files[:2],1):
  soft='_soft_' in path;key=(root,soft,take)
  if key in seen:continue
  seen.add(key);add('electricGuitar','fsbs',path,root,0 if soft else 1,0 if soft else .73,.73 if soft else 1.01,4.5,take)
flutemap=read('flute','Data/region/nor.txt').decode()
for line in flutemap.splitlines():
 m=re.search(r'pitch_keycenter=(\d+).*sample=([^ ]+) ',line)
 if not m:continue
 root=int(m[1]);name=m[2].strip().replace('.$EXT','.flac');tune=re.search(r'tune=(-?\d+)',line);layer={'p':0,'m':1,'f':2}[name.split('_')[1]]
 if not 60<=root<=87:continue
 tune=re.search(r'tune=(-?\d+)',line);cents=int(tune[1]) if tune else 0
 add('flute','flute','Samples/'+name,root,layer,layer/3,(layer+1)/3 if layer<2 else 1.01,4.5,rootMidi=root-cents/100,legatoStart=.07)
organ=json.loads(read('organ','app/public/instruments/hammond-organ/manifest.json'))
for s in organ['samples']:
 if not 48<=s['note']<=84:continue
 add('organ','organ','app/public/instruments/hammond-organ/'+s['file'],s['note'],tail=s['loopEnd']+.06,loopStartSeconds=s['loopStart'],loopEndSeconds=s['loopEnd'])
wurlmap=read('wurl','Wurlitzer EP200/Wurlitzer EP200.sfz').decode();layer=-1
for part in wurlmap.split('<group>')[1:]:
 layer+=1
 if layer>3:continue
 seen=set()
 for line in part.splitlines():
  m=re.search(r'pitch_keycenter=(\d+).*sample=([^ ]+)' ,line)
  if not m:continue
  root=int(m[1]);name=m[2].strip().replace('.$EXT','.flac');tune=re.search(r'tune=(-?\d+)',line)
  if not 48<=root<=85 or root in seen:continue
  seen.add(root);add('wurlitzer','wurl','Wurlitzer EP200/Samples/'+name,root,layer,layer/4,(layer+1)/4 if layer<3 else 1.01,5,rootMidi=root-(int(tune[1]) if tune else 0)/100)
# Retain the honestly labelled recorded FM clav patch, with its missing middle dynamic layer.
for midi,n in [(48,'C1'),(56,'G#1'),(60,'C2'),(68,'G#2'),(72,'C3'),(80,'G#3')]:
 for layer in [1,2,3]:add('clav','vcsl',f'Electrophones/TX81Z/Clavisynth/Clavisynth_{n}_vl{layer}.wav',midi,layer,(layer-1)/3,layer/3 if layer<3 else 1.01,2.2)
META=pathlib.Path('/workspace/free-studio-build-cache');META.mkdir(exist_ok=True)
cache={f['id']:f for f in json.loads((ROOT/'sources.json').read_text()).get('files',[])} if (ROOT/'sources.json').exists() else {}
def prepare(s):
 dest=ROOT/(s['id']+'.wav');meta=META/(s['id']+'.json')
 if dest.exists() and meta.exists():return json.loads(meta.read_text())
 if s['id'] in cache and cache[s['id']]['path']==s['path'] and dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()==cache[s['id']]['sha256']:return cache[s['id']]|s
 raw=read(s['repo'],s['path'])
 with tempfile.TemporaryDirectory() as tmp:
  src=pathlib.Path(tmp)/'source';src.write_bytes(raw);data=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-ac','1','-ar','32000','-f','f32le','-'])
 x=np.frombuffer(data,dtype='<f4').copy();x-=np.mean(x)
 # Organ loop points remain relative to the original sample start.
 start=0 if s['bank']=='organ' else max(0,int(np.flatnonzero(abs(x)>max(abs(x))*.002)[0])-16)
 x=x[start:start+round(s['tail']*32000)];peak=max(abs(x));x*=.75/peak
 edge=min(640,len(x)//4);x[:16]*=np.arange(16)/16;x[-edge:]*=np.linspace(1,0,edge)
 pcm=np.round(np.clip(x,-.98,.98)*32767).astype('<i2')
 with wave.open(str(dest),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(32000);w.writeframes(pcm.tobytes())
 project,revision,license,_=REPOS[s['repo']]
 result=dict(**s,repository=project,revision=revision,license=license,sourceSha256=hashlib.sha256(raw).hexdigest(),sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),onsetTrimFrames=start,seconds=len(x)/32000,bytes=dest.stat().st_size)
 meta.write_text(json.dumps(result));return result
print('Preparing',len(specs),'recordings',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
for repo,(_,_,_,licensepath) in REPOS.items():(ROOT/('LICENSE-'+repo)).write_bytes(read(repo,licensepath).rstrip()+b'\n')
(ROOT/'sources.json').write_text(json.dumps(dict(processing='Pinned free sources, mono 32 kHz PCM16; leading silence trimmed except organ looped sources; DC removal, normalized peaks and short edge fades. Natural recorded decays retained, no baked reverb. Meta sources are official OGG web recordings, other sources FLAC/WAV. Organ source is the CC0 FreePats setBfree recording, mirrored by keyboardia.',files=files),indent=2)+'\n')
zones={}
for f in files:
 z={k:f[k] for k in ['id','nominalMidi','rootMidi','layer','velLow','velHigh','take']}
 for key in ['loopStartSeconds','loopEndSeconds','legatoStart']:
  if key in f:z[key]=f[key]
 zones.setdefault(f['bank'],[]).append(z)
(ROOT.parent.parent/'studio-zones.js').write_text('// Worklet-safe free instrument metadata; generated by prepare-studio-instruments.py.\nexport const STUDIO_SAMPLE_ZONES='+json.dumps(zones,indent=2)+';\n')
(ROOT.parent.parent/'studio-manifest.js').write_text('// Literal bundled URLs, generated by prepare-studio-instruments.py.\nexport const STUDIO_SAMPLE_FILES={\n'+''.join(f' {f["id"]}:new URL("./samples/studio-instruments/{f["id"]}.wav",import.meta.url),\n' for f in files)+'};\n')
print('Prepared',len(files),'recordings,',round(sum(f['bytes'] for f in files)/1048576,2),'MiB',flush=True)
