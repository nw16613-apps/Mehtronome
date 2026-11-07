"""Reproduce the optional expanded library. Python/NumPy/SciPy and FFmpeg; build time only.
Pinned redistribution-friendly sources; no runtime dependency or third-party API.
"""
import concurrent.futures,hashlib,json,pathlib,re,subprocess,tempfile,urllib.request,urllib.parse,wave
import numpy as np
from scipy.signal import correlate
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/expanded';ROOT.mkdir(exist_ok=True)
CACHE={f['id']:f for f in json.loads((ROOT/'sources.json').read_text()).get('files',[])} if (ROOT/'sources.json').exists() else {}
REPOS={
 'guitar':('sfzinstruments/karoryfer.black-and-green-guitars','b3b3249d37dc977a1a297bd2dc053e6d9b6b805c','CC0-1.0','LICENSE'),
 'bass':('sfzinstruments/karoryfer.black-and-blue-basses','6e7d674cdb41be7a54dbccb15472401ad01099b9','CC0-1.0','license'),
 'tone':('nbrosowsky/tonejs-instruments','622c2f1c32c8cfce4158ddc3eb26e518ddef37e5','CC-BY-3.0','LICENSE.md'),
 'vcsl':('sgossner/VCSL','c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e','CC0-1.0','LICENSE'),
 'wurl':('sfzinstruments/GregSullivan.E-Pianos','8c3e581acda3594b553948ff0222d4f84a698376','CC-BY-3.0','LICENSE'),
 'live':('sfzinstruments/DrumGizmo.DRSKit','b01448990a31f722542f1812e56159a97a6a2a82','CC-BY-4.0','LICENSE'),
 'upright':('sfzinstruments/karoryfer.meatbass','ac9e859564bda286ab5ec672d00ff1aa2fef2895','CC0-1.0','LICENSE'),
}
def read(repo,path):
 project,rev,_,_=REPOS[repo];return urllib.request.urlopen('https://raw.githubusercontent.com/'+project+'/'+rev+'/'+urllib.parse.quote(path),timeout=60).read()
notes=['c','db','d','eb','e','f','gb','g','ab','a','bb','b']
def note(midi,offset=0):return notes[midi%12]+str(midi//12-1+offset)
specs=[]
def add(id,bank,repo,path,midi,tail=4,**extra):specs.append(dict(id=id,bank=bank,repo=repo,source=path,nominalMidi=midi,tail=tail,**extra))
for midi in [48,52,55,59,62,65,69,74,79]:
 for layer in ['p','mf']:
  for rr in [1,2]:add(f'xGuitar{midi}{layer}{rr}','electricGuitar','guitar',f'Samples/green/ord/twang_{note(midi,1)}_{layer}_rr{rr}.wav',midi,4,layer=layer)
for midi in [48,55,62,69,76]:
 for rr in [1,2]:add(f'xGuitarMute{midi}r{rr}','guitarMuted','guitar',f'Samples/green/stac/staccato_{note(midi,1)}_rr{rr}.wav',midi,.85,layer='mute')
for midi in [28,33,38,43,48,52]:
 for layer in ['p','f']:
  for rr in [1,2]:add(f'xBass{midi}{layer}{rr}','electricBass','bass',f'Samples/darkblack/reg/darkblack_{note(midi,1)}_{layer}_rr{rr}.wav',midi,3.2,layer=layer)
for midi,n in [(48,'C3'),(52,'E3'),(60,'C4'),(64,'E4'),(67,'G4'),(72,'C5'),(79,'G5'),(84,'C6')]:add(f'xPiano{midi}','piano','tone',f'samples/piano/{n}.mp3',midi,4)
for midi,n in [(47,'B2'),(57,'A3'),(64,'E4'),(69,'A4'),(73,'Cs5'),(81,'A5')]:add(f'xNylon{midi}','nylonGuitar','tone',f'samples/guitar-nylon/{n}.mp3',midi,4)
for midi,n in [(60,'C4'),(64,'E4'),(69,'A4'),(72,'C5'),(76,'E5'),(81,'A5'),(84,'C6')]:add(f'xFlute{midi}','flute','tone',f'samples/flute/{n}.mp3',midi,4.5)
for layer,ns in [('mp',[(51,'eb3mp',-9),(56,'ab3mp',-8),(61,'db4mp',4),(66,'gb4mp',7),(73,'db5mp',3),(79,'g5mp',-8),(85,'db6mp',6)]),('f',[(52,'e3f',-4),(56,'ab3f',-11),(61,'db4f',-2),(68,'ab4f',0),(73,'db5f',3),(79,'g5f',-7),(85,'db6f',0)])]:
 for midi,n,tune in ns:add(f'xWurl{midi}{layer}','wurlitzer','wurl',f'Wurlitzer EP200/Samples/{n}.flac',midi,4,layer='soft' if layer=='mp' else 'hard',rootMidi=midi-tune/100)
# VCSL Clavisynth filenames plus its documented 8va patch sound two
# octaves above scientific filename pitch. Verified by measured fundamentals.
for midi,n in [(48,'C1'),(56,'G#1'),(60,'C2'),(68,'G#2'),(72,'C3'),(80,'G#3')]:
 for layer in [1,3]:add(f'xClav{midi}v{layer}','clav','vcsl',f'Electrophones/TX81Z/Clavisynth/Clavisynth_{n}_vl{layer}.wav',midi,1.8,layer='soft' if layer==1 else 'hard')
for midi,n in [(36,'c2'),(39,'eb2'),(45,'a2'),(48,'c3'),(54,'gb3')]:add(f'xUpright{midi}r2','upright','upright',f'Samples/pizz/{n}_vl1_rr2.wav',midi,3.2)
for kind,art,mic,tail in [('Hat','Hihat_closed','Hihat',.3),('Ride','Ride_tip','Ride',2.8)]:
 for rr in [1,2]:add(f'xLive{kind}Soft{rr}','drums','live',f'DrumGizmo/DRSKit/Samples/{art}/{rr}-{art}-{mic}.flac',None,tail)
def prepare(spec):
 id=spec['id'];dest=ROOT/(id+'.wav');meta=ROOT/(id+'.json')
 if dest.exists() and meta.exists():return json.loads(meta.read_text())
 if dest.exists() and id in CACHE and CACHE[id]['source']==spec['source'] and hashlib.sha256(dest.read_bytes()).hexdigest()==CACHE[id]['sha256']:return CACHE[id]
 data=read(spec['repo'],spec['source'])
 with tempfile.TemporaryDirectory() as tmp:
  src=pathlib.Path(tmp)/'input';src.write_bytes(data)
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-ac','1','-ar','32000','-f','f32le','-']);values=np.frombuffer(raw,dtype='<f4').astype(float);values-=np.mean(values);peak=np.max(np.abs(values));onset=np.flatnonzero(np.abs(values)>peak*.003);start=max(0,int(onset[0])-16) if len(onset) else 0;values=values[start:start+round(spec['tail']*32000)]
  root=spec.get('rootMidi',spec['nominalMidi'])
  if root is not None and 'rootMidi' not in spec:
   # Autocorrelation near the documented fundamental avoids octave errors.
   part=values[1600:min(len(values),16000)];part=part*np.hanning(len(part));ac=correlate(part,part,mode='full',method='fft')[len(part)-1:];period=32000/(440*2**((root-69)/12));lo=max(2,int(period*.97));hi=min(len(ac)-2,int(period*1.03)+2);i=lo+int(np.argmax(ac[lo:hi]));den=ac[i-1]-2*ac[i]+ac[i+1];lag=i+(.5*(ac[i-1]-ac[i+1])/den if den else 0);measured=69+12*np.log2(32000/lag/440)
   if abs(measured-root)<.48:root=round(float(measured),5)
  # Warm double-bass fundamental treatment matches the existing soft plucks.
  filters='highpass=f=24,lowpass=f=13500'
  if spec['bank']=='upright':filters=f'highpass=f=20,lowpass=f={440*2**((root-69)/12)*3}:p=2'
  shaped=subprocess.check_output(['ffmpeg','-v','error','-f','f32le','-ar','32000','-ac','1','-i','pipe:0','-af',filters,'-f','f32le','-'],input=values.astype('<f4').tobytes());values=np.frombuffer(shaped,dtype='<f4').astype(float)
  peak=np.max(np.abs(values));fade=np.minimum(1,np.minimum(np.arange(len(values))/24,(len(values)-1-np.arange(len(values)))/960));pcm=np.round(values/peak*.85*32767*fade).astype('<i2')
  with wave.open(str(dest),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(32000);out.writeframes(pcm.tobytes())
 project,rev,license,_=REPOS[spec['repo']];result={**spec,'rootMidi':root,'repository':project,'revision':rev,'license':license,'sourceSha256':hashlib.sha256(data).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'seconds':len(pcm)/32000};meta.write_text(json.dumps(result));return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
for name,(_,_,_,license) in REPOS.items():(ROOT/(name+'-LICENSE.txt')).write_bytes(read(name,license))
(ROOT/'tone-SAMPLES-NOTICE.txt').write_text('Tone.js instruments samples, Nicolas Brosowsky; samples licensed CC BY 3.0: https://creativecommons.org/licenses/by/3.0/ . Repository README states Samples: CC-by 3.0. The separate MIT licence applies to code. Source: https://github.com/nbrosowsky/tonejs-instruments/tree/622c2f1c32c8cfce4158ddc3eb26e518ddef37e5 . Derivative processing and exact source paths are in sources.json.\n')
(ROOT/'sources.json').write_text(json.dumps({'format':'mono 32000 Hz PCM16','processing':'Downmixed, onset trimmed, gentle high/low pass, peak normalized with edge fades; measured or source-mapped pitch centres. Upright plucks gently low-passed at 3x fundamental.','files':files},indent=2)+'\n')
zones={}
for f in files:
 if f['bank']!='drums':zones.setdefault(f['bank'],[]).append({k:f[k] for k in ['id','rootMidi','nominalMidi','layer'] if k in f})
(ROOT.parent.parent/'expanded-samples.js').write_text('// Pinned recorded source zones; generated by prepare-expanded-instruments.py.\nexport const EXPANDED_SAMPLE_ZONES='+json.dumps(zones,indent=2)+';\nexport const EXPANDED_DRUM_GROUPS={hatSoft:["xLiveHatSoft1","xLiveHatSoft2"],rideSoft:["xLiveRideSoft1","xLiveRideSoft2"]};\n')
(ROOT.parent.parent/'expanded-manifest.js').write_text('// Literal asset URLs for Vite; only audible selected banks are downloaded.\nexport const EXPANDED_SAMPLE_FILES={\n'+''.join(f' {f["id"]}:new URL("./samples/expanded/{f["id"]}.wav",import.meta.url),\n' for f in files)+'};\n')
for p in ROOT.glob('x*.json'):p.unlink()
print(f'Prepared {len(files)} recordings, {sum(f["bytes"] for f in files)/1048576:.2f} MiB',flush=True)
