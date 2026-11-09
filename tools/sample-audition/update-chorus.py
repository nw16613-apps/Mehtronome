"""Refresh chorus against the preserved audition references, without re-rendering
those references through the now-updated playable app's sample assignments.
Usage: python3 update-chorus.py CACHE EXISTING_AUDITION_DIRECTORY
"""
import hashlib,json,pathlib,subprocess,sys
import numpy as np
from chorus import process,SETTINGS
CACHE,OUT=map(pathlib.Path,sys.argv[1:]);report=json.loads((OUT/'comparisons.json').read_text())
def measure(path,channels,encoded=False):
 args=[] if encoded else ['-f','f32le','-ar','32000','-ac',str(channels)]
 r=subprocess.run(['ffmpeg','-hide_banner',*args,'-i',str(path),'-af','loudnorm=print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
 data=json.loads(r.stderr[r.stderr.rfind('{'):r.stderr.rfind('}')+1]);return dict(lufs=float(data['input_i']),truePeakDb=float(data['input_tp']))
def encode(src,dest,gain):
 subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','32000','-ac','2','-i',str(src),'-af',f'volume={gain}dB','-codec:a','libmp3lame','-b:a','160k',str(dest)],check=True)
for c in report[:3]:
 name=c['id'];mono=np.fromfile(CACHE/(name+'-emily-amp.raw'),dtype='<f4');stereo=process(mono);raw=CACHE/(name+'-emily-chorus-solo.raw');stereo.tofile(raw)
 current=measure(CACHE/(name+'-current-solo.raw'),2);new=measure(raw,2);v=next(v for v in c['variants'] if v['id']=='emily-chorus')
 v['label']='Emilyguitar · amp + chorus 35%';v['description']=f"Emily through the {c['amp']} amp/cab, then stereo chorus: 0.32 Hz, 14 ms delay, 1.3 ms depth, 35% wet; dry attack stays undelayed";v['sourceGainDb']=current['lufs']-new['lufs']
 target=min(c['soloTargetLufs'],new['lufs']-new['truePeakDb']-2);encode(raw,OUT/(name+'-emily-chorus-solo.mp3'),target-new['lufs']);v['solo']=measure(OUT/(name+'-emily-chorus-solo.mp3'),2,True)
 # Retain the original backing composite and replace only its guitar component.
 base=np.fromfile(CACHE/(name+'-current-mix.raw'),dtype='<f4').reshape(-1,2).astype(np.float64)
 guitar=np.fromfile(CACHE/(name+'-current-solo.raw'),dtype='<f4').reshape(-1,2).astype(np.float64)
 assert len(base)==len(stereo)
 mixed=(base-guitar+stereo*10**(v['sourceGainDb']/20)).astype('<f4');mixed.tofile(CACHE/(name+'-emily-chorus-mix.raw'))
 mixes=[measure(CACHE/(name+'-'+x['id']+'-mix.raw'),2) for x in c['variants']]
 gain=min(-20-mixes[0]['lufs'],*[-2-x['truePeakDb'] for x in mixes])
 for x in c['variants']:
  path=OUT/(name+'-'+x['id']+'-mix.mp3');encode(CACHE/(name+'-'+x['id']+'-mix.raw'),path,gain);x['mix']=measure(path,2,True);assert x['mix']['truePeakDb']<0
 assert abs(v['solo']['lufs']-c['variants'][0]['solo']['lufs'])<.3
 c['chorusSettings']=SETTINGS
 print('Updated',name,'35% chorus',flush=True)
for c in report:
 for v in c['variants']:
  if v['id']=='current':v['label']='Original';v['description']='Original recordings and processing used for the audition reference'
  v['audioRevision']={mode:hashlib.sha256((OUT/(c['id']+'-'+v['id']+'-'+mode+'.mp3')).read_bytes()).hexdigest()[:12] for mode in ['solo','mix']}
(OUT/'comparisons.json').write_text(json.dumps(report,indent=2)+'\n')
html=pathlib.Path(__file__).with_name('round2.html').read_text().replace('your existing app sound','the original audition reference').replace('These are listening candidates. The main app’s instruments and playback have not changed.','The playable preview now uses your preferred Emilyguitar and Yamaha bass, with native amp/cabinet processing and 35% chorus on these three guitar tones. These fixed clips preserve the original audition references.').replace('<strong>Current</strong>','<strong>Original</strong>').replace('Current has its original baked-in amp processing','Original has its baked-in amp processing')
(OUT/'index.html').write_text(html)
