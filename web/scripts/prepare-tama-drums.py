"""Prepare an alternative Tama Superstar acoustic kit and additional DRS dynamics.
Pinned DrumGizmo recordings, CC BY 4.0. FFmpeg/NumPy required at build time only.
"""
import concurrent.futures,hashlib,json,pathlib,subprocess,tempfile,urllib.request,urllib.parse,wave
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/tama';ROOT.mkdir(exist_ok=True)
REPOS={'tama':('sfzinstruments/DrumGizmo.MuldjordKit','fc165714974aa843125ce88597f341b31376e1d5','DrumGizmo/MuldjordKit/Samples/'),'live':('sfzinstruments/DrumGizmo.DRSKit','b01448990a31f722542f1812e56159a97a6a2a82','DrumGizmo/DRSKit/Samples/')}
cache={f['id']:f for f in json.loads((ROOT/'sources.json').read_text()).get('files',[])} if (ROOT/'sources.json').exists() else {};specs=[];groups={'tama':{},'live':{}}
def add(bank,group,art,mic,ns,tail):
 ids=[]
 for rr,n in enumerate(ns,1):
  id=('tama' if bank=='tama' else 'liveDynamic')+group[0].upper()+group[1:]+str(rr);ids.append(id);specs.append(dict(id=id,bank=bank,group=group,art=art,mic=mic,take=n,seconds=tail))
 groups[bank][group]=ids
for group,art,mic,ns,tail in [
 ('kickSoft','KdrumL','KdrumL',[3,4],.25),('kick','KdrumL','KdrumL',[12,13],.25),('kickAccent','KdrumL','KdrumL',[20,21],.25),
 ('snareGhost','Snare','Snare_top',[2,3],.45),('snareSoft','Snare','Snare_top',[14,15],.65),('snare','Snare','Snare_top',[28,29],.8),('snareAccent','Snare','Snare_top',[45,46],.85),
 ('hatSoft','HihatClosed','Hihat',[2,3],.2),('hat','HihatClosed','Hihat',[9,10],.25),('hatAccent','HihatClosed','Hihat',[17,18],.3),('hatOpen','HihatOpen','Hihat',[5,6],1.1),
 ('rideSoft','RideR','RideR',[1,2],2.8),('ride','RideR','RideR',[4,5],2.8),('rideAccent','RideR','RideR',[7,8],2.8),('rideBell','RideRBell','RideR',[3,4],2.2),
 ('tomHighSoft','Tom1','Tom1',[1,2],.8),('tomHigh','Tom1','Tom1',[5,6],.9),('tomLowSoft','Tom4','Tom4',[1,2],.95),('tomLow','Tom4','Tom4',[6,7],1.1),('crash','CrashR','OHR',[3,4],2.8)]:add('tama',group,art,mic,ns,tail)
for group,art,mic,ns,tail in [
 ('kickGhost','Kdrum_with_contact','Kdrum_front',[1,2],.235),('kickAccent','Kdrum_with_contact','Kdrum_front',[20,21],.235),('snareMid','Snare','Snare_top',[22,23],.75),('snareAccent','Snare','Snare_top',[46,47],.85),('hatAccent','Hihat_closed','Hihat',[16,17],.3),('tomHighSoft','Tom1','Tom1',[3,4],.8),('tomLowSoft','Tom2','Tom2',[3,4],1),('rideBellSoft','Ride_tip_bell','Ride',[1,2],2.2),('crashSoft','Crash_left_tip','OHR',[1,2],2.8)]:add('live',group,art,mic,ns,tail)
def prepare(s):
 dest=ROOT/(s['id']+'.wav');repo,rev,prefix=REPOS[s['bank']];path=f'{prefix}{s["art"]}/{s["take"]}-{s["art"]}-{s["mic"]}.flac'
 if s['id'] in cache and dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()==cache[s['id']]['sha256']:return cache[s['id']]
 raw=urllib.request.urlopen(f'https://raw.githubusercontent.com/{repo}/{rev}/'+urllib.parse.quote(path),timeout=60).read()
 with tempfile.TemporaryDirectory() as tmp:
  source=pathlib.Path(tmp)/'source.flac';source.write_bytes(raw);kick='kick' in s['group'];high=44 if kick else 80 if 'snare' in s['group'] else 220 if any(w in s['group'] for w in ['hat','ride','crash']) else 45
  filters=f'highpass=f={high},lowpass=f=14000'+(',equalizer=f=85:t=q:w=1:g=-4' if kick else '')
  audio=subprocess.check_output(['ffmpeg','-v','error','-i',str(source),'-ac','1','-ar','32000','-af',filters,'-f','f32le','-']);values=np.frombuffer(audio,dtype='<f4').astype(float);peak=np.max(np.abs(values));onsets=np.flatnonzero(np.abs(values)>peak*.003);start=max(0,int(onsets[0])-16);values=values[start:start+round(s['seconds']*32000)];fade=np.minimum(1,np.minimum(np.arange(len(values))/16,(len(values)-1-np.arange(len(values)))/960))
  if kick:fade*=np.clip((.235-np.arange(len(values))/32000)/.18,0,1)
  values*=fade;peak=np.max(np.abs(values));pcm=np.round(values/peak*.85*32767).astype('<i2')
  with wave.open(str(dest),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(32000);out.writeframes(pcm.tobytes())
 return {**s,'repository':repo,'revision':rev,'license':'CC-BY-4.0','source':path,'sourceSha256':hashlib.sha256(raw).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
for name,(repo,rev,_) in REPOS.items():(ROOT/(name+'-LICENSE.txt')).write_bytes(urllib.request.urlopen(f'https://raw.githubusercontent.com/{repo}/{rev}/LICENSE').read())
(ROOT/'sources.json').write_text(json.dumps({'attribution':'MuldjordKit by Lars Muldjord / DrumGizmo, Tama Superstar acoustic drum kit recorded in 2010; SFZ/FLAC port by kinwie. DRSKit by Lars Muldjord, Bent Bisballe Nyeng and Jes Eiler / DRSDrums; SFZ/FLAC port by kinwie.','processing':'Selected distinct recorded dynamic layers/takes and direct/overhead microphones, mono 32 kHz PCM16, gentle filtering, onset trim, edge fades and peak normalization. Kicks have a 44 Hz high-pass, 85 Hz cut and short smooth release. Original tuning retained.','files':files},indent=2)+'\n')
groups['tama']['rim']=['jazzRim1','jazzRim2'];groups['tama']['hatPedal']=['liveHatPedal1','liveHatPedal2'];groups['tama']['flatRide']=groups['tama']['rideSoft']
(ROOT.parent.parent/'tama-groups.js').write_text('// Worklet-safe recorded dynamic groups; generated by prepare-tama-drums.py.\nexport const TAMA_DRUM_GROUPS='+json.dumps(groups['tama'])+';\nexport const LIVE_DYNAMIC_GROUPS='+json.dumps(groups['live'])+';\n')
(ROOT.parent.parent/'tama-samples.js').write_text('// Literal URLs for Vite; separate from worklet-safe group metadata.\nexport const TAMA_SAMPLE_FILES={\n'+''.join(f' {f["id"]}:new URL("./samples/tama/{f["id"]}.wav",import.meta.url),\n' for f in files)+'};\n')
print(f'Prepared {len(files)} genuine acoustic hits from two pinned recording sessions, {sum(f["bytes"] for f in files)/1048576:.2f} MiB',flush=True)
