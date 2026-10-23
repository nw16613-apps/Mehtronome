import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
import {Rhythm} from '../src/audio/rhythm.js';
import {harmonyAt,CHORDS} from '../src/audio/music.js';
import {DRUM_GROOVES,BASS_PATTERNS} from '../src/audio/rhythm.js';
import {SAMPLE_FILES,DRUM_SAMPLE_GROUPS} from '../src/audio/sample-manifest.js';
const noop=()=>{};
function setup(settings={}){
  const engine=new Engine(8000);
  engine.configure({countIn:false,click:0,harmony:0,bpm:120,drums:true,bass:true,...settings});engine.reset();return engine;
}
function render(engine,length){
  const click=new Float32Array(length),pad=new Float32Array(length),right=new Float32Array(length),dry=new Float32Array(length),events=[];
  engine.render(click,noop,pad,right,undefined,dry,event=>events.push(event));
  return {click,pad,right,dry,events};
}

test('drum grooves hit sample-clock beats and shuffled offbeats exactly',()=>{
  const straight=render(setup({bass:false}),16000);
  assert.deepEqual(straight.events.filter(e=>e.type==='kick').map(e=>e.sample),[0,6000,8000,11000]);
  assert.deepEqual(straight.events.filter(e=>e.type==='snare'&&e.gain>.5).map(e=>e.sample),[4000,12000]);
  assert.deepEqual(straight.events.filter(e=>e.type==='hat').map(e=>e.sample),[0,2000,4000,6000,8000,10000,12000,14000]);
  const shuffle=render(setup({bass:false,drumGroove:'shuffle'}),8000);
  assert.deepEqual(shuffle.events.filter(e=>e.type==='hat').map(e=>e.sample),[0,2667,4000,6667]);
  const swing=render(setup({bass:false,drumGroove:'swing'}),16000);
  assert.deepEqual(swing.events.filter(e=>e.type==='ride').map(e=>e.sample),[0,4000,6667,8000,12000,14667]);
  const half=render(setup({bass:false,drumGroove:'halftime'}),16000);
  assert.deepEqual(half.events.filter(e=>e.type==='snare'&&e.gain>.5).map(e=>e.sample),[8000]);
});

test('bass patterns follow actual chord tones and land on the root each bar in every meter',()=>{
  for(const bassPattern of Object.keys(BASS_PATTERNS))for(const beats of [3,4,5,6,7]){
    const engine=setup({drums:false,bassPattern,beats,progression:true,template:'major251'});
    const {events}=render(engine,beats*4000*4);
    assert.ok(events.length>=8);
    for(const event of events){
      const info=harmonyAt(engine.settings,event.step);
      assert.equal(event.type,'bass');
      assert.ok(info.chordPcs.includes(event.midi%12));
      assert.ok(event.midi>=28&&event.midi<=59);
      if(event.beat===0)assert.equal(event.midi%12,info.midi[0]%12);
    }
  }
  for(const drumGroove of Object.keys(DRUM_GROOVES))for(const beats of [3,5,7]){
    const result=render(setup({beats,drumGroove,bass:false}),beats*4000*2);
    assert.ok(result.events.some(e=>e.type==='kick'&&e.sample===beats*4000));
  }
});

test('count-in and chord previews never play drums or bass, and rhythm bypasses the pad bus',()=>{
  const engine=setup({countIn:true,sound:'atmosphere'});
  const result=render(engine,24000);
  assert.ok(result.dry.subarray(0,16000).every(x=>x===0));
  assert.equal(result.events[0].sample,16000);
  assert.ok(result.dry.subarray(16000).some(x=>Math.abs(x)>.01));
  assert.ok(result.pad.every(x=>x===0));assert.ok(result.right.every(x=>x===0));assert.ok(result.click.every(x=>x===0));
  engine.audition(1);const preview=render(engine,8000);
  assert.deepEqual(preview.events,[]);assert.ok(preview.dry.every(x=>x===0));
});

test('drum and bass switches and volumes are independent; enabling waits for the next grid',()=>{
  for(const settings of [{drums:false,bass:false},{drumsVolume:0,bassVolume:0},{drums:false,bassVolume:0},{bass:false,drumsVolume:0}]){
    assert.ok(render(setup(settings),8000).dry.every(x=>x===0));
  }
  for(const settings of [{drums:false},{bass:false}])assert.ok(render(setup(settings),8000).dry.some(x=>Math.abs(x)>.005));
  const engine=setup({drums:false,bass:false,bassPattern:'fifths'});render(engine,1500);
  engine.configure({drums:true,bass:true});const active=render(engine,5500);
  assert.equal(active.events[0].sample,2000);
  assert.equal(active.events.find(e=>e.type==='bass').sample,6000);
  engine.configure({drums:false,bass:false});render(engine,16000);
  assert.ok(render(engine,8000).dry.every(x=>Math.abs(x)<1e-8));
});

test('full backing is block-size independent, bounded, and fades to silence',()=>{
  const settings={sound:'atmosphere',chord:'maj9sharp11',mode:'lydian',click:1,harmony:1,drumsVolume:1,bassVolume:1,
    sequence:true,sequenceDensity:1,sequenceVolume:1,sequenceRate:4,bassPattern:'walk',bpm:137};
  const a=setup(settings),b=setup(settings);const full=render(a,48000);
  const actual=new Float32Array(48000),dry=new Float32Array(48000),pad=new Float32Array(48000),right=new Float32Array(48000);
  for(let offset=0;offset<actual.length;offset+=128){
    b.render(actual.subarray(offset,offset+128),noop,pad.subarray(offset,offset+128),right.subarray(offset,offset+128),undefined,dry.subarray(offset,offset+128));
  }
  assert.deepEqual(actual,full.click);assert.deepEqual(dry,full.dry);assert.deepEqual(pad,full.pad);assert.deepEqual(right,full.right);
  for(let i=0;i<actual.length;i++)assert.ok(Number.isFinite(actual[i]+dry[i]+pad[i])&&Math.abs(actual[i]+dry[i]+pad[i])<1);
  a.running=false;render(a,16000);assert.ok(render(a,8000).dry.every(x=>Math.abs(x)<1e-8));
});

test('drum and bass styles produce distinct event patterns and articulations',()=>{
  assert.equal(Object.keys(DRUM_GROOVES).length,11);
  assert.equal(Object.keys(BASS_PATTERNS).length,12);
  const drumSignatures=Object.keys(DRUM_GROOVES).map(drumGroove=>JSON.stringify(render(setup({drumGroove,bass:false}),16000).events));
  assert.equal(new Set(drumSignatures).size,Object.keys(DRUM_GROOVES).length);
  const bassSignatures=Object.keys(BASS_PATTERNS).map(bassPattern=>{
    const engine=setup({bassPattern,drums:false});
    const result=render(engine,16000);
    return JSON.stringify(result.events)+engine.rhythm.bassVoices.map(v=>v.decay).join();
  });
  assert.equal(new Set(bassSignatures).size,Object.keys(BASS_PATTERNS).length);
  const bossa=render(setup({drumGroove:'bossa',bassPattern:'bossa'}),16000);
  assert.deepEqual(bossa.events.filter(e=>e.type==='rim').map(e=>e.sample),[0,6000,12000]);
  assert.deepEqual(bossa.events.filter(e=>e.type==='bass').map(e=>e.sample),[0,6000,8000,14000]);
});

test('bundled WAV kit is valid, survives transport resets and renders safely in every style',async()=>{
  const {readFile}=await import('node:fs/promises');
  const kit={};
  for(const [name,url]of Object.entries(SAMPLE_FILES)){
    const bytes=await readFile(url);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WAVE');
    let data,sourceRate;
    for(let offset=12;offset+8<=bytes.length;){
      const size=bytes.readUInt32LE(offset+4),tag=bytes.toString('ascii',offset,offset+4);
      if(tag==='fmt '){
        assert.equal(bytes.readUInt16LE(offset+8),1);assert.equal(bytes.readUInt16LE(offset+10),1);
        sourceRate=bytes.readUInt32LE(offset+12);assert.ok([24000,32000].includes(sourceRate));
        assert.equal(bytes.readUInt16LE(offset+22),16);
      }
      if(tag==='data')data=bytes.subarray(offset+8,offset+8+size);
      offset+=8+size+(size%2);
    }
    assert.ok(data&&data.length>4000);
    const frames=data.length/2,pcm=new Float32Array(Math.floor(frames*24000/sourceRate));let peak=0;
    for(let i=0;i<pcm.length;i++){
      const position=i*sourceRate/24000,index=Math.floor(position),fraction=position-index;
      const from=data.readInt16LE(index*2)/32768,to=index+1<frames?data.readInt16LE((index+1)*2)/32768:0;
      pcm[i]=from+(to-from)*fraction;peak=Math.max(peak,Math.abs(pcm[i]));
    }
    assert.ok(peak>.01,name);for(let i=0;i<pcm.length;i++)pcm[i]*=.75/peak;
    kit[name]=pcm;
  }
  for(const drumGroove of Object.keys(DRUM_GROOVES)){
    const engine=new Engine(24000);
    engine.installDrumKit(kit);engine.configure({countIn:false,drums:true,bass:true,drumGroove,drumsVolume:1,bassVolume:1});engine.reset();
    assert.equal(engine.rhythm.kit,kit);
    const result=render(engine,96000);
    assert.ok(result.dry.some(x=>Math.abs(x)>.05));
    for(let i=0;i<result.dry.length;i++)assert.ok(Number.isFinite(result.dry[i])&&Math.abs(result.dry[i]+result.pad[i]+result.click[i])<1);
  }
});


test('phrases vary over four bars with ghost notes, pickups, dynamics and bass octaves',()=>{
  for(const drumGroove of Object.keys(DRUM_GROOVES)){
    const result=render(setup({drumGroove,bass:false}),64000);
    const phrase=bar=>result.events.filter(e=>Math.floor(e.sample/16000)===bar)
      .map(e=>[e.type,e.sample%16000,e.gain]);
    assert.notDeepEqual(phrase(0),phrase(3),drumGroove);
    assert.ok(result.events.some(e=>['snare','rim'].includes(e.type)&&e.gain<.2),drumGroove);
  }
  for(const bassPattern of ['fifths','funk']){
    const {events}=render(setup({drums:false,bassPattern}),16000);
    assert.ok(events.some(e=>e.midi>=48));
    assert.ok(events.some(e=>e.sub%2===1||e.sub===2));
    assert.ok(new Set(events.map(e=>e.gain)).size>2);
  }
  for(const bassPattern of ['roots','walk']){
    const {events}=render(setup({drums:false,bassPattern}),32000);
    const phrase=bar=>events.filter(e=>Math.floor(e.sample/16000)===bar).map(e=>[e.sample%16000,e.midi]);
    assert.notDeepEqual(phrase(0),phrase(1));
  }
});

test('bass ostinato timing stays independent of drum swing and uses exact sixteenths',()=>{
  const signature=drumGroove=>render(setup({drumGroove,bassPattern:'funk'}),16000).events.filter(e=>e.type==='bass');
  const straight=signature('straight');
  assert.deepEqual(straight.map(e=>e.sample),[0,3000,6000,9000,11000,14000,15000]);
  assert.deepEqual(signature('swing'),straight);
  assert.deepEqual(signature('shuffle'),straight);
  const {events}=render(setup({bass:false,drumGroove:'shuffle'}),16000);
  assert.ok(events.some(e=>e.type==='snare'&&e.sample===3334&&e.gain<.2));
});

test('sixteenth ostinatos stay block independent through fills at awkward tempos',()=>{
  for(const [drumGroove,bassPattern] of [['halftime','funk'],['shuffle','fifths'],['swing','walk'],['bossa','bossa']]){
    const settings={drumGroove,bassPattern,bpm:137,beats:5};
    const whole=setup(settings),blocks=setup(settings);
    const expected=render(whole,48000);
    const actual=new Float32Array(48000),events=[];
    for(let offset=0;offset<actual.length;offset+=127){
      const count=Math.min(127,actual.length-offset);
      const block=render(blocks,count);actual.set(block.dry,offset);events.push(...block.events);
    }
    assert.deepEqual(actual,expected.dry);assert.deepEqual(events,expected.events);
    for(const value of actual)assert.ok(Number.isFinite(value)&&Math.abs(value)<1);
  }
});


test('bass variations remain valid for every chord size, including dyads',()=>{
  for(const chord of Object.keys(CHORDS))for(const bassPattern of Object.keys(BASS_PATTERNS)){
    const engine=setup({chord,bassPattern,drums:false});
    const rhythm=new Rhythm(8000),events=[];
    for(let beat=0;beat<16;beat++)for(let sub=0;sub<4;sub++){
      rhythm.tick(engine.settings,beat,sub/4,engine.chordMidi,beat*4000+sub*1000,0,e=>events.push(e));
    }
    assert.ok(events.length>0);
    for(const event of events){assert.ok(Number.isFinite(event.midi),`${chord}: ${bassPattern}`);assert.ok(engine.chordMidi.some(n=>n%12===event.midi%12));}
  }
});

test('recorded hits alternate takes, soft snares use real ghost takes, and closed hats choke open hats',()=>{
  const kit=Object.fromEntries(Object.values(DRUM_SAMPLE_GROUPS).flat().map((id,index)=>[id,new Float32Array(4000).fill(.1+index*.002)]));
  const rhythm=new Rhythm(8000,kit),events=[];
  for(let i=0;i<4;i++)rhythm.hitDrum('snare',.65,i,0,0,0,event=>events.push(event));
  const takes=DRUM_SAMPLE_GROUPS.snare;
  assert.deepEqual(events.map(event=>event.sampleId),[0,1,2,3].map(index=>takes[index%takes.length]));
  rhythm.hitDrum('snare',.12,4,0,0,0,event=>events.push(event));
  assert.ok(DRUM_SAMPLE_GROUPS.snareGhost.includes(events.at(-1).sampleId));
  assert.equal(events.at(-1).type,'snare');
  rhythm.hitDrum('hatOpen',.2,5,0,0,0,noop);
  const open=rhythm.drumVoices.find(voice=>voice.kind==='hatOpen');
  assert.equal(open.choking,false);
  assert.ok(open.gain<.12&&open.gain>.11);
  for(let i=0;i<100;i++)rhythm.render(true,false);
  rhythm.hitDrum('hat',.2,105,0,0,0,noop);
  assert.equal(open.choking,true);
  for(let i=0;i<800;i++)rhythm.render(true,false);
  assert.equal(open.sample,null);
});

test('eight-bar drum phrases make different answers and resolve fills without overloading the kit',()=>{
  for(const drumGroove of Object.keys(DRUM_GROOVES)){
    const {events}=render(setup({drumGroove,bass:false}),128000);
    const signatures=Array.from({length:4},(_,bar)=>JSON.stringify(events.filter(event=>Math.floor(event.sample/16000)===bar)
      .map(event=>[event.type,event.sample%16000,event.gain])));
    assert.equal(new Set(signatures).size,4,drumGroove);
    assert.ok(events.every(event=>event.gain<=.85),drumGroove);
    // Strong kicks and the main backbeat remain on the same reliable pulse.
    assert.ok(events.some(event=>event.type==='kick'&&event.sample===7*16000),drumGroove);
  }
});

test('walking bass connects chord-tone octaves and approaches the next root with a consonant note',()=>{
  const {events}=render(setup({drums:false,bassPattern:'walk'}),32000);
  const bass=events.filter(event=>event.type==='bass');
  assert.ok(bass.slice(1).every((event,index)=>Math.abs(event.midi-bass[index].midi)<=7));
  assert.equal(bass[4].midi%12,bass[0].midi%12);
  assert.notEqual(bass[4].midi,bass[0].midi);
  const rhythm=new Rhythm(8000),approaches=[];
  const current=[50,53,57,60],next=[55,59,62,65];
  rhythm.lastBassMidi=45;
  rhythm.playBass({bassPattern:'walk',beats:4,bpm:120},0,3,0,current,12000,0,event=>approaches.push(event),next);
  const last=approaches.at(-1);
  assert.equal(last.approaching,true);
  assert.ok(current.some(note=>note%12===last.midi%12));
  assert.ok(Math.abs(last.midi-31)<=2);
});

test('mixer-muted voices continue aging instead of replaying frozen attacks when raised',()=>{
  const kit={kick:new Float32Array(256).fill(.2)};
  const rhythm=new Rhythm(8000,kit);
  rhythm.hitDrum('kick',.5,0,0,0,0,noop);
  rhythm.bassInstrument.noteOn(40,.04,.6,'funk');
  const bass=rhythm.bassInstrument.voices[0];
  for(let i=0;i<8000;i++){
    rhythm.render(false,false);
    assert.equal(rhythm.drums,0);assert.equal(rhythm.bass,0);
  }
  assert.equal(rhythm.drumVoices[0].sample,null);
  assert.ok(bass.age>320);
  rhythm.render(true,true);
  assert.ok(Math.abs(rhythm.drums)+Math.abs(rhythm.bass)<.0001);
});
