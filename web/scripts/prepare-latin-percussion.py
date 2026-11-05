"""Build compact acoustic Latin percussion from the CC0 Versilian Community Sample Library.
Offline preparation only; playback uses bundled mono PCM, with no runtime DSP cost.
"""
import array,concurrent.futures,hashlib,json,pathlib,subprocess,tempfile,urllib.parse,urllib.request,wave
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/latin'
REV='c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e'
BASE=f'https://raw.githubusercontent.com/sgossner/VCSL/{REV}/'
specs=[]
def add(name,directory,files,tail):
 for n,file in enumerate(files,1):specs.append((f'{name}{n}',directory+'/'+file,tail))
idi='Idiophones/Struck Idiophones/';mem='Membranophones/Struck Membranophones/Conga'
add('latinClave',idi+'Claves',['Claves1_Hit_v2_rr1_Mid.wav','Claves1_Hit_v3_rr1_Mid.wav'],.22)
add('latinCongaOpen',mem,['Conga_HitN_v2_rr1_Sum.wav','Conga_HitN_v2_rr2_Sum.wav'],.48)
add('latinCongaMute',mem,['Conga_HitFM_v2_rr1_Sum.wav','Conga_HitFM_v2_rr2_Sum.wav'],.22)
add('latinTumbaOpen',mem,['Tumba_HitN_v2_rr1_Sum.wav','Tumba_HitN_v2_rr2_Sum.wav'],.58)
add('latinCowbell',idi+'Cowbells',['Cowbell1_Normal_v2_rr1_Mid.wav','Cowbell1_Normal_v3_rr1_Mid.wav'],.35)
add('latinGuiroShort',idi+'Guiro/Legacy',['guiro_short.wav','guiro_short2.wav'],.2)
add('latinGuiroLong',idi+'Guiro/Legacy',['guiro_long.wav','guiro_long2.wav'],.4)
add('latinShaker',idi+'Shaker, Large',['LShaker_Shake1D_rr2_Mid.wav','LShaker_Shake1U_rr1_Mid.wav'],.16)
def prepare(spec):
 name,path,tail=spec
 data=urllib.request.urlopen(BASE+urllib.parse.quote(path),timeout=60).read()
 with tempfile.TemporaryDirectory() as tmp:
  source=pathlib.Path(tmp)/'source.wav';source.write_bytes(data)
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(source),'-ac','1','-ar','32000','-af','highpass=f=65,lowpass=f=14000','-f','f32le','-'])
 values=array.array('f');values.frombytes(raw);peak=max(map(abs,values))
 onset=next((i for i,v in enumerate(values) if abs(v)>peak*.006),0);start=max(0,onset-16);values=values[start:start+round(tail*32000)];peak=max(map(abs,values))
 pcm=array.array('h',(round(v*.85/peak*32767*min(1,i/16,(len(values)-1-i)/320)) for i,v in enumerate(values)))
 dest=ROOT/(name+'.wav')
 with wave.open(str(dest),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(32000);out.writeframes(pcm.tobytes())
 return {'id':name,'path':path,'sourceSha256':hashlib.sha256(data).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'onsetTrimFrames':start,'duration':len(pcm)/32000,'bytes':dest.stat().st_size}
ROOT.mkdir(exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(prepare,specs))
(ROOT/'LICENSE').write_bytes(urllib.request.urlopen(BASE+'LICENSE').read().rstrip()+b'\n')
(ROOT/'sources.json').write_text(json.dumps({'repository':'sgossner/VCSL','revision':REV,'license':'CC0-1.0','attribution':'Versilian Community Sample Library, Sam Gossner / Versilian Studios and contributors.','format':'mono 32000 Hz PCM16','processing':'Mono downmix, 65 Hz high-pass, 14 kHz low-pass, leading silence trim, short natural tails, peak normalization and edge fades.','files':files},indent=2)+'\n')
print(f'Prepared {len(files)} acoustic percussion hits, {sum(f["bytes"] for f in files)/1024:.0f} KiB')
