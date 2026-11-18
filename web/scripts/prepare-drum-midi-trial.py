"""Prepare an attributed, unquantized listening pilot from original GMD MIDI.
Usage: python scripts/prepare-drum-midi-trial.py /path/to/groove
"""
import csv,hashlib,json,shutil,struct,sys
from pathlib import Path

def read_midi(path):
 data=Path(path).read_bytes()
 if data[:4]!=b'MThd':raise ValueError('Expected standard MIDI')
 length,kind,tracks,division=struct.unpack_from('>IHHH',data,4)
 if kind not in (0,1) or division&0x8000:raise ValueError('Expected PPQN type 0/1 MIDI')
 pos=8+length;notes=[];controllers=[];tempos=[];meter=[];end=0
 for track in range(tracks):
  if data[pos:pos+4]!=b'MTrk':raise ValueError('Missing MIDI track')
  size=struct.unpack_from('>I',data,pos+4)[0];p=pos+8;limit=p+size;tick=0;running=None
  def vlq():
   nonlocal p
   value=0
   for _ in range(4):
    byte=data[p];p+=1;value=(value<<7)|(byte&127)
    if not byte&128:return value
   raise ValueError('Invalid MIDI VLQ')
  while p<limit:
   tick+=vlq();status=data[p]
   if status&128:p+=1
   else:
    if running is None:raise ValueError('Missing MIDI running status')
    status=running
   if status==255:
    kind=data[p];p+=1;n=vlq();value=data[p:p+n];p+=n
    if kind==81:tempos.append([tick/division,int.from_bytes(value,'big')])
    if kind==88:meter.append([tick/division,value[0],2**value[1]])
   elif status in (240,247):
    n=vlq();p+=n;running=None
   elif 128<=status<240:
    running=status;kind=status>>4;channel=status&15;n=1 if kind in (12,13) else 2;value=data[p:p+n];p+=n
    if kind==9 and value[1]>0:notes.append({'beat':tick/division,'pitch':value[0],'velocity':value[1],'channel':channel})
    if kind==11 and value[0]==4:controllers.append({'beat':tick/division,'value':value[1]})
   else:raise ValueError('Unsupported MIDI event')
  end=max(end,tick/division);pos=limit
 return {'ppqn':division,'notes':sorted(notes,key=lambda n:n['beat']),'hiHatPedal':sorted(controllers,key=lambda n:n['beat']),'tempos':tempos,'metres':meter,'endBeat':end}

def prepare(root):
 root=Path(root);out=Path(__file__).resolve().parents[1]/'public/drum-midi-trial';out.mkdir(exist_ok=True);(out/'midi').mkdir(exist_ok=True)
 choices=[('fusionJazz','Jazz-funk fusion',116,'drummer1/session1',['4_jazz-funk_116_beat_4-4.mid','5_jazz-funk_116_beat_4-4.mid']),('funk','Funk',95,'drummer8/session1',['1_funk_95_beat_4-4.mid','2_funk_95_beat_4-4.mid']),('popRock','Rock',105,'',['drummer3/session1/9_rock_105_beat_4-4.mid','drummer5/session2/12_rock_105_beat_4-4.mid'])]
 records=[];metadata={r['midi_filename']:r for r in csv.DictReader((root/'info.csv').open())}
 for style,title,bpm,folder,files in choices:
  sources=[]
  for name in files:
   relative=(folder+'/' if folder else '')+name;p=root/relative;source=read_midi(p);copied=style+'-round2-'+name.replace('/','-');shutil.copyfile(p,out/'midi'/copied)
   assert int(metadata[relative]['bpm'])==bpm
   source.update({'sourceId':metadata[relative]['id'],'originalPath':relative,'file':'midi/'+copied,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()});sources.append(source)
   print(style,name,len(source['notes']),round(source['endBeat'],3),'first',round(source['notes'][0]['beat'],3),'last',round(source['notes'][-1]['beat'],3))
  records.append({'style':style,'title':title,'bpm':bpm,'startBeat':16,'sources':sources})
 data={'version':2,'round':2,'source':'Groove MIDI Dataset v1.0.0','credit':'Google LLC; Groove MIDI Dataset contributors','licence':'CC BY 4.0','licenceUrl':'https://creativecommons.org/licenses/by/4.0/','sourceUrl':'https://magenta.withgoogle.com/datasets/groove','mirror':'https://github.com/zharry29/drums-with-llm/tree/476adbc938a600eaca26bbb02648e6127b5eca64/groove','performances':records}
 (out/'performances.json').write_text(json.dumps(data,indent=2)+'\n');shutil.copyfile(root/'LICENSE',out/'LICENSE.txt')
if __name__=='__main__':prepare(sys.argv[1])
