"""Build tight modern hybrid one-shots from the bundled CC0 acoustic recordings.
Offline only; FFmpeg required. No runtime effects or new download dependency.
"""
import array, hashlib, json, math, pathlib, subprocess, wave
BASE=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples'
ROOT=BASE/'modern';ROOT.mkdir(exist_ok=True)
source=json.loads((BASE/'studio/sources.json').read_text());files=[];rate=32000
for item in source['files']:
 old=item['id'];name=old.replace('studio','modern',1);src=BASE/'studio'/(old+'.wav')
 if 'Kick' in old:duration,tau,pitch=.24,.04,1;filters='highpass=f=38,lowpass=f=10000,equalizer=f=75:t=q:w=1:g=3,equalizer=f=350:t=q:w=1:g=-5,equalizer=f=3200:t=q:w=1:g=4'
 elif 'Snare' in old:duration,tau,pitch=.18,.032,1.16;filters='highpass=f=130,lowpass=f=14500,equalizer=f=500:t=q:w=1:g=-5,equalizer=f=2800:t=q:w=1:g=4'
 elif 'HatOpen' in old:duration,tau,pitch=.28,.055,1;filters='highpass=f=1300,lowpass=f=14500'
 elif 'Hat' in old:duration,tau,pitch=.12,.02,1;filters='highpass=f=1500,lowpass=f=14500'
 elif 'Tom' in old:duration,tau,pitch=.3,.055,1.1;filters='highpass=f=65,lowpass=f=9000,equalizer=f=450:t=q:w=1:g=-4'
 elif 'Rim' in old:duration,tau,pitch=.13,.023,1.08;filters='highpass=f=200,lowpass=f=12500'
 elif 'Crash' in old:duration,tau,pitch=1.1,.24,1;filters='highpass=f=700,lowpass=f=14000'
 else:duration,tau,pitch=.8,.17,1;filters='highpass=f=700,lowpass=f=14000'
 if pitch!=1:filters=f'asetrate={round(rate*pitch)},aresample={rate},'+filters
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-af',filters,'-ac','1','-ar',str(rate),'-f','f32le','-'])
 values=array.array('f');values.frombytes(raw);values=values[:round(duration*rate)]
 peak=max(map(abs,values))
 for i in range(len(values)):
  t=i/rate;hold=.012 if 'Snare' in old else .006
  envelope=math.exp(-max(0,t-hold)/tau)
  v=values[i]/peak
  # Short, deterministic body reinforcement; recorded attacks retain their character.
  if 'Kick' in old:v=v*1.15+.16*math.sin(2*math.pi*(53*t+.28*(1-math.exp(-t/.009))))*math.exp(-t/.035)
  elif 'Snare' in old:v=v*1.18+.075*math.sin(2*math.pi*210*t)*math.exp(-t/.023)
  values[i]=math.tanh(v*1.15)*envelope*min(1,i/12,(len(values)-1-i)/320)
 peak=max(map(abs,values));pcm=array.array('h',(round(v*.85/peak*32767) for v in values));dest=ROOT/(name+'.wav')
 with wave.open(str(dest),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate);out.writeframes(pcm.tobytes())
 files.append({'id':name,'sourceId':old,'sourceSha256':item['sha256'],'upstreamSource':item['source'],'upstreamSha256':item['sourceSha256'],'duration':len(values)/rate,'decaySeconds':tau,'pitchRatio':pitch,'filters':filters,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size})
(ROOT/'LICENSE').write_bytes((BASE/'studio/LICENSE').read_bytes())
(ROOT/'sources.json').write_text(json.dumps({'license':'CC0-1.0','sourceRepository':source['repository'],'sourceRevision':source['revision'],'format':'mono 32000 Hz PCM16','processing':'Short shaped envelopes, surgical EQ, snare/tom tuning, soft saturation and original synthetic kick/snare body reinforcement. Derived from the bundled CC0 acoustic takes; not a new recording session.','files':files},indent=2)+'\n')
print(f'Built {len(files)} modern one-shots, {sum(f["bytes"] for f in files)/1024/1024:.2f} MiB')
