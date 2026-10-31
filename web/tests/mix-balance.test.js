import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
import {MIX_CHANNELS} from '../src/practice/mixer.js';
import {MIX_REFERENCE_LEVEL,BUS_GAINS} from '../src/audio/mix-balance.js';
import {BACKING_STYLES} from '../src/practice/backing-styles.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const rate=8000,kit=await readSampleBank(rate);
test('all mixer faders and engine volumes share the -12 dB starting reference',()=>{
 for(const channel of MIX_CHANNELS){assert.equal(channel.value/100,MIX_REFERENCE_LEVEL);assert.equal((20*Math.log10(channel.value/100)).toFixed(1),'-12.0');}
 for(const field of ['click','harmony','drumsVolume','bassVolume','compingVolume','sequenceVolume'])assert.equal(DEFAULTS[field],MIX_REFERENCE_LEVEL);
});
function render(style,volume=.25,key=9,chord='min7',mode='dorian'){
 const engine=new Engine(rate);engine.installDrumKit(kit);engine.configure({...BACKING_STYLES[style].settings,key,mode,chord,countIn:false,bpm:120,drums:true,bass:true,comping:true,sequence:true,click:volume,harmony:volume,drumsVolume:volume,bassVolume:volume,compingVolume:volume,sequenceVolume:volume});engine.reset();
 const click=new Float32Array(rate*8),left=new Float32Array(click.length),right=new Float32Array(click.length),rhythm=new Float32Array(click.length);engine.render(click,undefined,left,right,undefined,rhythm);let peak=0,energy=0;
 for(let i=0;i<click.length;i++){const l=click[i]+left[i]+rhythm[i],r=click[i]+right[i]+rhythm[i];assert.ok(Number.isFinite(l)&&Number.isFinite(r));peak=Math.max(peak,Math.abs(l),Math.abs(r));energy+=(l*l+r*r)/2;}
 return {peak,rms:Math.sqrt(energy/click.length)};
}
test('the calibrated real band has headroom at the reference mix and at full faders in every style',()=>{
 for(const id of Object.keys(BACKING_STYLES))for(const level of [.25,1]){const result=render(id,level);assert.ok(result.peak<(level===1?1:.35),`${id} ${level}: ${result.peak}`);assert.ok(result.rms>.001,id);}
});
test('calibrated post-fader meters match the actual drum/bass/comping mix',()=>{
 for(const [id,channel,volumeField]of [['popRock','drums','drumsVolume'],['traditionalJazz','bass','bassVolume'],['bossa','comping','compingVolume']]){
  const e=new Engine(rate);e.installDrumKit(kit);e.configure({...BACKING_STYLES[id].settings,countIn:false,key:9,mode:'dorian',chord:'min7',click:0,harmony:0,drums:true,bass:true,comping:true,sequence:false,drumsVolume:0,bassVolume:0,compingVolume:0,[volumeField]:.25});e.reset();const rhythm=new Float32Array(rate*4);e.render(new Float32Array(rhythm.length),undefined,new Float32Array(rhythm.length),null,undefined,rhythm);const measured=rhythm.reduce((peak,value)=>Math.max(peak,Math.abs(value)),0),index={drums:4,bass:6,comping:8}[channel];assert.ok(Math.abs(e.meterPeaks[index]-measured)<1e-6,channel);
 }
 assert.ok(BUS_GAINS.harmony<BUS_GAINS.drums);
});

test('fuller extensions in other registers retain reference-mix headroom',()=>{
 for(const id of Object.keys(BACKING_STYLES))for(const [key,chord,mode]of [[0,'dom13','mixolydian'],[4,'maj9','lydian']])assert.ok(render(id,.25,key,chord,mode).peak<.35,id+' '+chord);
});
