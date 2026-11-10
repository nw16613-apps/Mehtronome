"""Install the auditioned VSCO upright bank; other preferred banks are unchanged.
Prepare tools/sample-audition/prepare-uprights.py first, then pass its cache path.
"""
import hashlib,json,pathlib,sys,wave
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/preferred'
cache=pathlib.Path(sys.argv[1]);source=json.loads((cache/'sources.json').read_text());metadata=json.loads((ROOT/'sources.json').read_text());previous=[f for f in metadata['files']if f['bank']=='upright'];files=[f for f in metadata['files']if f['bank']!='upright'];added=[]
for z in source['files']:
 if z['family']!='vsco':continue
 data=(cache/(z['id']+'.f32')).read_bytes();assert hashlib.sha256(data).hexdigest()==z['sha256'];x=np.frombuffer(data,dtype='<f4');assert np.isfinite(x).all()
 take=1+sum(f['nominalMidi']==z['nominalMidi']and f['layer']==z['layer']for f in added);id=f'qVscoBass{int(z["nominalMidi"])}v{z["layer"]}r{take}';target=ROOT/(id+'.wav')
 with wave.open(str(target),'wb')as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(32000);w.writeframes(np.round(np.clip(x,-.99,.99)*32767).astype('<i2').tobytes())
 added.append({**z,'id':id,'bank':'upright','take':take,'mapRevision':source['mapRevision']['vsco'],'auditionPcmSha256':z['sha256'],'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size})
assert len(added)==40;files+=added
for old in previous:
 if old['id']not in {f['id']for f in added}:(ROOT/(old['id']+'.wav')).unlink(missing_ok=True)
(ROOT/'LICENSE-vsco').write_bytes((cache/'LICENSE-vsco.txt').read_bytes());(ROOT/'LICENSE-sneaky').unlink(missing_ok=True)
metadata['files']=files;metadata['uprightProcessing']=source['processing']+' Bundled as PCM16. Runtime source calibration -3 dB follows the matched audition.';(ROOT/'sources.json').write_text(json.dumps(metadata,indent=2)+'\n')
zones={}
for f in files:zones.setdefault(f['bank'],[]).append({k:f[k]for k in ['id','nominalMidi','rootMidi','layer','take','velLow','velHigh']})
parent=ROOT.parent.parent;(parent/'preferred-zones.js').write_text('export const PREFERRED_SAMPLE_ZONES='+json.dumps(zones,indent=2)+';\n')
(parent/'preferred-manifest.js').write_text('export const PREFERRED_SAMPLE_FILES={\n'+''.join(f' {f["id"]}:new URL("./samples/preferred/{f["id"]}.wav",import.meta.url),\n'for f in files)+'};\nexport const GUITAR_CABINET_URL=new URL("./samples/preferred/cabinet.wav",import.meta.url);\n')
print('Installed',len(added),'VSCO recordings;',round(sum(f['bytes']for f in added)/1048576,2),'MiB encoded; other preferred banks preserved.')
