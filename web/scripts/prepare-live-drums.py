"""Prepare a compact, natural live-fusion acoustic kit. Offline; FFmpeg required.
DRSKit by DrumGizmo/Jes Eiler, CC BY 4.0. No artist recordings are sampled.
"""
import array,concurrent.futures,hashlib,json,pathlib,subprocess,tempfile,urllib.request,urllib.parse,wave
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/live'
REV='b01448990a31f722542f1812e56159a97a6a2a82';BASE=f'https://raw.githubusercontent.com/sfzinstruments/DrumGizmo.DRSKit/{REV}/'
specs=[]
def add(name,art,mics,numbers,tail):
 for i,n in enumerate(numbers,1):specs.append((f'{name}{i}',art,mics,n,tail))
add('liveKick','Kdrum_with_contact',[('Kdrum_front',.7),('Kdrum_back',.3)],[11,12,13],.65)
add('liveKickSoft','Kdrum_with_contact',[('Kdrum_front',.7),('Kdrum_back',.3)],[4,5],.6)
add('liveSnare','Snare',[('Snare_top',1)],[32,33,34],.9)
add('liveSnareSoft','Snare',[('Snare_top',1)],[14,15],.7)
add('liveSnareGhost','Snare',[('Snare_top',1)],[1,2],.5)
add('liveHat','Hihat_closed',[('Hihat',1)],[7,8,9],.3)
add('liveHatOpen','Hihat_semi_open',[('Hihat',1)],[5,6],1)
add('liveHatPedal','Hihat_foot',[('OHL',.5),('OHR',.5)],[3,4],.45)
add('liveRide','Ride_tip',[('Ride',.6),('OHL',.2),('OHR',.2)],[5,6,7],2.8)
add('liveRideBell','Ride_tip_bell',[('Ride',1)],[5,6],2.2)
add('liveRim','Snare_rim',[('Snare_top',1)],[5,6],.4)
add('liveTomHigh','Tom1',[('Tom1',1)],[13,14],1)
add('liveTomLow','Tom2',[('Tom2',1)],[10,11],1.2)
add('liveCrash','Crash_left_tip',[('OHL',.5),('OHR',.5)],[5,6],2.8)
def prepare(spec):
 name,art,mics,number,tail=spec;channels=[];sources=[]
 with tempfile.TemporaryDirectory() as tmp:
  for mic,weight in mics:
   path=f'DrumGizmo/DRSKit/Samples/{art}/{number}-{art}-{mic}.flac';data=urllib.request.urlopen(BASE+urllib.parse.quote(path),timeout=60).read();src=pathlib.Path(tmp)/(mic+'.flac');src.write_bytes(data)
   high=32 if 'Kick' in name else 100 if 'Snare' in name else 250 if any(x in name for x in ['Hat','Ride','Crash']) else 50
   raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-ac','1','-ar','32000','-af',f'highpass=f={high},lowpass=f=14500','-f','f32le','-']);values=array.array('f');values.frombytes(raw);peak=max(map(abs,values));channels.append((values,weight/peak));sources.append({'path':path,'sha256':hashlib.sha256(data).hexdigest(),'weight':weight})
  length=max(len(a) for a,w in channels);values=array.array('f',(sum(a[i]*w for a,w in channels if i<len(a)) for i in range(length)));peak=max(map(abs,values));onset=next((i for i,x in enumerate(values) if abs(x)>peak*.003),0);start=max(0,onset-16);values=values[start:start+round(tail*32000)];peak=max(map(abs,values))
  pcm=array.array('h',(round(x*.85/peak*32767*min(1,i/16,(len(values)-1-i)/960)) for i,x in enumerate(values)));dest=ROOT/(name+'.wav')
  with wave.open(str(dest),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(32000);out.writeframes(pcm.tobytes())
  return {'id':name,'sources':sources,'onsetTrimFrames':start,'duration':len(values)/32000,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
ROOT.mkdir(exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
(ROOT/'LICENSE').write_bytes(urllib.request.urlopen(BASE+'LICENSE').read().rstrip()+b'\n')
(ROOT/'sources.json').write_text(json.dumps({'repository':'sfzinstruments/DrumGizmo.DRSKit','revision':REV,'license':'CC-BY-4.0','attribution':'DRSKit by Lars Muldjord, Bent Bisballe Nyeng and Jes Eiler / DRSDrums; SFZ/FLAC port by kinwie.','format':'mono 32000 Hz PCM16','processing':'Close/overhead microphone selection and mixing, gentle high/low pass, leading silence removal, peak normalization and edge fades. Original tuning and natural decay retained; no synthetic reinforcement or exponential gating.','files':files},indent=2)+'\n')
print(f'Prepared {len(files)} live acoustic hits, {sum(f["bytes"] for f in files)/1024/1024:.2f} MiB')
