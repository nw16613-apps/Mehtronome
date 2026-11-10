import {test} from 'node:test';import assert from 'node:assert/strict';
import {SampledBass} from '../src/audio/bass.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const rate=16000,kit=await readSampleBank(rate);
const render=(player,n)=>Float32Array.from({length:n},()=>player.render());
const edgeEnergy=a=>a.reduce((sum,v,i)=>i?sum+(v-a[i-1])**2:sum,0);
const energy=a=>a.reduce((sum,v)=>sum+v*v,0);
test('upright retains the recorded pluck with more definition at the same pitch, gate and gain',()=>{
 for(const style of ['roots','walk','ballad','modernStraightJazz']){
  const player=new SampledBass(rate,kit),old=new SampledBass(rate,kit),voice=player.noteOn(40,.45,.6,style,'upright','expanded'),baseline=old.noteOn(40,.45,.6,style,'upright','expanded');
  assert.equal(voice.sourceId,baseline.sourceId);assert.equal(voice.gate,baseline.gate);assert.equal(voice.gain,baseline.gain);assert.equal(voice.increment,baseline.increment);
  // Previous dark root/walk/ballad filtering applied on top of the recording.
  const previous=style==='walk'?{attack:.005,cutoff:2200,dry:.46}:style==='ballad'?{attack:.008,cutoff:1600,dry:.34}:{attack:.007,cutoff:1700,dry:.38};
  baseline.attackFrames=Math.round(previous.attack*(1.25-.45*.6)*rate);baseline.coefficient=1-Math.exp(-2*Math.PI*previous.cutoff/rate);baseline.dry=previous.dry;baseline.upright=false;
  const a=render(player,rate*3),b=render(old,rate*3),early=a.subarray(0,rate*.1),before=b.subarray(0,rate*.1);
  assert.ok(edgeEnergy(early)/energy(early)>edgeEnergy(before)/energy(before)*1.01,style+' greater attack definition relative to body');assert.ok(energy(early.subarray(0,80))>energy(before.subarray(0,80))*1.05,style+' initial pluck preserved');assert.ok(energy(early)<energy(before),style+' reduced low-body masking without a gain boost');assert.ok(a.every(n=>Number.isFinite(n)&&Math.abs(n)<1));assert.ok(player.voices.every(v=>v.envelope<.00001||!Number.isFinite(v.age)));
 }
});
test('electric bass keeps its existing articulation and does not receive upright tone shaping',()=>{
 const bass=new SampledBass(rate,kit),voice=bass.noteOn(40,.4,.6,'roots','electric','expanded');assert.equal(voice.dry,.38);assert.equal(voice.upright,false);assert.equal(voice.coefficient,1-Math.exp(-2*Math.PI*1700/rate));
});
