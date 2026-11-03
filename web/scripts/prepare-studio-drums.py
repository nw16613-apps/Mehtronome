"""Rebuild the warm CC0 Big Rusty bank. Offline only; requires FFmpeg."""
import array, concurrent.futures, hashlib, json, pathlib, subprocess, tempfile, urllib.request, wave
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/studio'
REV='f07ce00df34a46b6b08375be56fe116cf15782bc'
BASE=f'https://raw.githubusercontent.com/sfzinstruments/karoryfer.big-rusty-drums/{REV}/'
specs=[]
def add(name,directory,stem,layer,count,tail):
 for i in range(1,count+1):specs.append((f'{name}{i}',f'Samples/{directory}/{stem}_vl{layer}_rr{i}.flac',tail))
add('studioKick','kick_24/kick/kick','k',8,3,.65)
add('studioKickSoft','kick_24/kick/kick','k',4,2,.6)
add('studioSnare','snare_14/center/top','sn_center',8,3,.65)
add('studioSnareSoft','snare_14/center/top','sn_center',4,2,.5)
add('studioSnareGhost','snare_14/center/top','sn_center',1,2,.38)
add('studioHat','hihat_14/cl/cl','ht_cl',3,3,.24)
add('studioHatOpen','hihat_14/ho/cl','ht_ho',2,2,.8)
add('studioHatPedal','hihat_14/chik/cl','ht_chik',2,2,.35)
add('studioRide','ride_22/rd/cl','rd',2,3,2.7)
add('studioRideBell','ride_22/bl/cl','rd_bl',2,2,2)
add('studioRim','snare_14/sc/top','sn_sc',2,2,.35)
add('studioTomHigh','tom_15/center/cl','t15',4,2,.75)
add('studioTomLow','tom_18/center/cl','t18',4,2,.95)
add('studioCrash','crash_17/cr/cl','cr',2,2,2.6)
def prepare(spec):
 name,path,tail=spec
 data=urllib.request.urlopen(BASE+path,timeout=60).read()
 with tempfile.TemporaryDirectory() as tmp:
  src=pathlib.Path(tmp)/'source.flac';src.write_bytes(data)
  high=30 if 'Kick' in name else 200 if any(x in name for x in ['Ride','Hat','Crash']) else 65
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-ac','1','-ar','32000','-af',f'highpass=f={high},lowpass=f=12500','-f','f32le','-'])
  values=array.array('f');values.frombytes(raw);peak=max(map(abs,values));onset=next((i for i,v in enumerate(values) if abs(v)>peak*.004),0);start=max(0,onset-16);values=values[start:start+int(tail*32000)];peak=max(map(abs,values));pcm=array.array('h',(round(max(-1,min(1,v*.85/peak))*32767*min(1,i/16,(len(values)-1-i)/640)) for i,v in enumerate(values)))
  dest=ROOT/(name+'.wav')
  with wave.open(str(dest),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(32000);out.writeframes(pcm.tobytes())
  return {'id':name,'source':path,'sourceSha256':hashlib.sha256(data).hexdigest(),'onsetTrimFrames':start,'duration':len(values)/32000,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size}
ROOT.mkdir(parents=True,exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
(ROOT/'LICENSE').write_bytes(urllib.request.urlopen(BASE+'LICENSE').read())
(ROOT/'sources.json').write_text(json.dumps({'repository':'sfzinstruments/karoryfer.big-rusty-drums','revision':REV,'license':'CC0-1.0','format':'mono 32000 Hz PCM16','processing':'Onset silence trimmed; gentle high/low pass; peak normalization; 20ms tail fade.','files':files},indent=2)+'\n')
print(f'Prepared {len(files)} samples, {sum(f["bytes"] for f in files)/1024/1024:.2f} MiB')
