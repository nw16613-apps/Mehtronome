import {test} from 'node:test';import assert from 'node:assert/strict';
import {performanceExpression} from '../src/audio/performance-expression.js';
import {CompingInstrument} from '../src/audio/comping.js';
import {SampledBass} from '../src/audio/bass.js';
import {STUDIO_SAMPLE_ZONES} from '../src/audio/studio-zones.js';
import {BASS_SAMPLE_ZONES} from '../src/audio/sample-map.js';
const rate=8000;
function flute(){
 const zone=STUDIO_SAMPLE_ZONES.flute.find(z=>z.nominalMidi===72)||STUDIO_SAMPLE_ZONES.flute[0];
 const p=new CompingInstrument(rate),pcm=new Float32Array(rate*2).fill(.15);pcm.fill(.5,0,rate*.05);
 p.installKit({[zone.id]:pcm});p.soundLibrary='expanded';return {p,midi:zone.nominalMidi};
}
test('style articulation preserves percussive parts, flowing lines, swells and phrase dynamics',()=>{
 assert.equal(performanceExpression('funk','comping','cleanGuitar',.3).articulation,'damped');
 assert.equal(performanceExpression('ballad','comping','softPiano',3).articulation,'ringing');
 assert.equal(performanceExpression('legatoFusion','comping','swelledGuitar',3).articulation,'swell');
 assert.equal(performanceExpression('legatoFusion','sequence','fluteLead',.55).articulation,'legato');
 assert.ok(performanceExpression('blues','bass','',1,7).velocity<performanceExpression('blues','bass','',1,4).velocity);
 assert.ok(performanceExpression('blues','sequence','jazzGuitar',1,1).velocity<performanceExpression('blues','sequence','jazzGuitar',1,0).velocity);
});
test('only nearby connected notes skip the flute breath; repeated notes, rests and leaps retain real attacks',()=>{
 for(const [interval,wait,expression,connected]of [[2,100,'legato',true],[0,100,'legato',false],[12,100,'legato',false],[2,rate,'legato',false],[2,100,null,false]]){
  const {p,midi}=flute();p.strike([midi],.7,.5,120,0,0,undefined,'sequence','fluteLead');
  for(let i=0;i<wait;i++)p.render();
  p.strike([midi+interval],.7,.5,120,wait,0,undefined,'sequence','fluteLead',0,null,expression);
  const v=p.voices[1];assert.equal(v.samplePosition>0,connected);assert.equal(v.articulation==='connected crossfade',connected);
  for(let i=0;i<rate;i++)assert.ok(Number.isFinite(p.render()));
 }
});
test('delayed connected notes do not release the old voice before their scheduled onset',()=>{
 const {p,midi}=flute();p.strike([midi],2,.5,120,0,0,undefined,'sequence','fluteLead');
 for(let i=0;i<100;i++)p.render();const old=p.voices[0];
 p.strike([midi+2],1,.5,120,100,0,undefined,'sequence','fluteLead',40,null,'legato');
 assert.equal(old.releaseAt,141);
 for(let i=0;i<40;i++)p.render();assert.equal(old.release,1);assert.equal(p.voices[1].age,0);
 p.render();assert.ok(p.voices[1].age>0);
});
test('new bass plucks damp preceding low notes, and short notes have shorter releases than sustained notes',()=>{
 const zone=BASS_SAMPLE_ZONES[0],pcm=new Float32Array(rate*2).fill(.2),bass=new SampledBass(rate,{[zone.id]:pcm});
 const held=bass.noteOn(zone.rootMidi,1,.5,'roots');for(let i=0;i<100;i++)bass.render();
 const tail=held.releaseDecay;const short=bass.noteOn(zone.rootMidi+2,.08,.5,'roots');
 assert.ok(held.releasing&&held.releaseDecay<tail);assert.ok(short.releaseDecay<tail);
 for(let i=0;i<rate;i++)assert.ok(Number.isFinite(bass.render()));
 assert.ok(held.envelope<.0001);
});
