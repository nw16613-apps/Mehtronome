"""Rebuild the small CC0 Virtuosity bank. Offline only; requires FFmpeg."""
import array, concurrent.futures, hashlib, json, pathlib, subprocess, tempfile, urllib.request, wave
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/jazz'
REV='9f04cf9a734527edfbb0a4eee1f674e45bbf71bc'
BASE=f'https://raw.githubusercontent.com/sfzinstruments/virtuosity_drums/{REV}/'
specs=[]
def add(name,mic,instrument,articulation,velocities,tail):
 for i,v in enumerate(velocities,1):
  layer,rr=v if isinstance(v,tuple) else (v,None)
  path=f'Samples/{mic}/{instrument}/{mic}_{instrument}_{articulation}_vl{layer}'+(f'_rr{rr}' if rr else '')+'.flac'
  specs.append((f'{name}{i}',path,tail))
add('jazzKickSoft','kickmic','kick','snon',[(1,1),(1,2)],.65)
add('jazzKick','kickmic','kick','snon',[(2,1),(2,2)],.65)
add('jazzSnareGhost','snaremic','snare','center',[4,6],.55)
add('jazzSnareSoft','snaremic','snare','center',[10,12,14],.8)
add('jazzSnare','snaremic','snare','center',[20,22,24],.9)
add('jazzRide','oh','ride','ride',[(1,i) for i in range(1,5)],3.8)
add('jazzRideAccent','oh','ride','ride',[(2,i) for i in range(1,5)],3.8)
add('jazzFlatRide','oh','flatride','ride',[(1,i) for i in range(1,3)],3.8)
add('jazzRideBell','oh','ride','bell',[(1,1),(1,2)],2.8)
add('jazzHat','oh','hh','closed',[(1,1),(1,2),(1,3)],.35)
add('jazzHatOpen','oh','hh','open',[(1,1),(1,2)],1.5)
add('jazzHatPedal','oh','hh','pedal',[(1,1),(1,2)],.6)
add('jazzRim','snaremic','snare','crossstick',[12,16],.65)
add('jazzTomHigh','oh','htom','center',[10,14],1.15)
add('jazzTomLow','oh','ltom','center',[10,14],1.4)
add('jazzCrash','oh','crash','crash',[(1,1)],4)
def prepare(spec):
 name,path,tail=spec
 data=urllib.request.urlopen(BASE+path,timeout=60).read()
 with tempfile.TemporaryDirectory() as tmp:
  src=pathlib.Path(tmp)/'source.flac';src.write_bytes(data)
  high=30 if 'Kick' in name else 200 if any(x in name for x in ['Ride','Hat','Crash']) else 65
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-ac','1','-ar','32000','-af',f'highpass=f={high},lowpass=f=14000','-f','f32le','-'])
  values=array.array('f');values.frombytes(raw);peak=max(map(abs,values));onset=next((i for i,v in enumerate(values) if abs(v)>peak*.004),0);start=max(0,onset-16);values=values[start:start+int(tail*32000)];peak=max(map(abs,values));pcm=array.array('h',(round(max(-1,min(1,v*.85/peak))*32767*min(1,i/16,(len(values)-1-i)/640)) for i,v in enumerate(values)))
  dest=ROOT/(name+'.wav')
  with wave.open(str(dest),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(32000);out.writeframes(pcm.tobytes())
  return {'id':name,'source':path,'sourceSha256':hashlib.sha256(data).hexdigest(),'onsetTrimFrames':start,'duration':len(values)/32000,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size}
ROOT.mkdir(parents=True,exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
(ROOT/'LICENSE').write_bytes(urllib.request.urlopen(BASE+'LICENSE').read())
(ROOT/'sources.json').write_text(json.dumps({'repository':'sfzinstruments/virtuosity_drums','revision':REV,'license':'CC0-1.0','format':'mono 32000 Hz PCM16','processing':'Onset silence trimmed; gentle high/low pass; peak normalization; 20ms tail fade.','files':files},indent=2)+'\n')
print(f'Prepared {len(files)} samples, {sum(f["bytes"] for f in files)/1024/1024:.2f} MiB')
