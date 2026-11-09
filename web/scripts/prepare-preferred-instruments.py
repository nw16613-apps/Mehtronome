"""Bundle the auditioned user-preferred recordings, within mobile bank budgets.
Run the sample-audition preparation scripts first. No runtime downloads from vendors.
"""
import pathlib,json,hashlib,wave,shutil
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[1]/'src/audio/samples/preferred'
ROOT.mkdir(exist_ok=True)
families={}
for cache in ['/workspace/sample-candidates-round2','/workspace/sample-candidates']:
 p=pathlib.Path(cache)
 for z in json.loads((p/'sources.json').read_text())['files']:families.setdefault(z['family'],[]).append((p,z))
out=[];zones={}
for family,bank in [('emily','electricGuitar'),('yr','electricBass'),('sneaky','upright')]:
 for cache,z in families[family]:
  if family=='emily' and (z['nominalMidi']<40 or z['layer'] not in [41/128,81/128]):continue
  x=np.fromfile(cache/(z['id']+'.f32'),dtype='<f4').copy();x=x[:round(32000*(4 if family=='emily' else 3.5))]
  x[-384:]*=np.linspace(1,0,384)
  layer=0 if family!='emily' or z['layer']==41/128 else 1
  prefix={'emily':'qEmilyGuitar','yr':'qYamahaBass','sneaky':'qSneakyBass'}[family]
  peers=[f for f in out if f['bank']==bank and f['nominalMidi']==z['nominalMidi'] and f['layer']==layer]
  take=len(peers)+1;id=prefix+str(int(z['nominalMidi']))+'v'+str(layer)+'r'+str(take)
  target=ROOT/(id+'.wav')
  with wave.open(str(target),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(32000);w.writeframes(np.round(np.clip(x,-.99,.99)*32767).astype('<i2').tobytes())
  item={**z,'id':id,'bank':bank,'layer':layer,'take':take,'velLow':0 if layer==0 else 81/128,'velHigh':81/128 if family=='emily' and layer==0 else 1.01,'seconds':len(x)/32000,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
  out.append(item);zones.setdefault(bank,[]).append({k:item[k] for k in ['id','nominalMidi','rootMidi','layer','take','velLow','velHigh']})
 for name in ['LICENSE-'+family]:shutil.copyfile(cache/name,ROOT/name)
cab=pathlib.Path('/workspace/sample-candidates-round2');shutil.copyfile(cab/'cabinet.wav',ROOT/'cabinet.wav');shutil.copyfile(cab/'cabinet-source.md',ROOT/'cabinet-source.md')
metadata=json.loads((cab/'sources.json').read_text())['cabinet']
(ROOT/'sources.json').write_text(json.dumps(dict(processing='Auditioned PCM converted to mono 32k PCM16. Emily retains two independent takes, medium/firm layers and natural decays up to 4 seconds; bass up to 3.5 seconds. Short end fades. Other source dynamics survive through note velocity. Cabinet processing is native Web Audio, not baked into notes.',files=out,cabinet=metadata),indent=2)+'\n')
parent=ROOT.parent.parent
(parent/'preferred-zones.js').write_text('export const PREFERRED_SAMPLE_ZONES='+json.dumps(zones,indent=2)+';\n')
(parent/'preferred-manifest.js').write_text('export const PREFERRED_SAMPLE_FILES={\n'+''.join(f' {f["id"]}:new URL("./samples/preferred/{f["id"]}.wav",import.meta.url),\n' for f in out)+'};\nexport const GUITAR_CABINET_URL=new URL("./samples/preferred/cabinet.wav",import.meta.url);\n')
print(len(out),'recordings',round(sum(f['bytes'] for f in out)/1048576,2),'MiB encoded')
