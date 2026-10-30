import {test} from 'node:test';import assert from 'node:assert/strict';
import {CompingInstrument} from '../src/audio/comping.js';import {Engine} from '../src/audio/engine.js';import {audioContextOptions} from '../src/audio/context-options.js';
const tones={warmTine:{attack:.012,release:.28,decay:.42,fm:.24,second:.09,third:.025,tremolo:.018},felt:{attack:.02,release:.34,decay:.34,fm:.1,second:.035,third:.012,tremolo:.012},suitcase:{attack:.006,release:.24,decay:.52,fm:.4,second:.15,third:.045,tremolo:.055},reed:{attack:.009,release:.2,decay:.62,fm:.12,second:.06,third:.13,tremolo:.025}};
test('cached piano coefficients preserve the original electric-piano waveform and release',()=>{
 for(const rate of [8000,48000])for(const [tone,shape]of Object.entries(tones)){
  const instrument=new CompingInstrument(rate),midi=64,hold=.193*60/137*rate,increment=440*2**((midi-69)/12)/rate;instrument.strike([midi],.193,.7,137,0,0,null,'comping',tone);let phase=0,modPhase=0,error=0;
  for(let age=1;age<=rate*.8;age++){
   phase=(phase+increment)%1;modPhase=(modPhase+increment*2.01)%1;const seconds=age/rate,bell=Math.exp(-seconds*(tone==='felt'?4.8:3.2)),release=age<=hold?1:Math.exp(-(age-hold)/(rate*shape.release)),p=2*Math.PI*phase,mod=shape.fm*bell*Math.sin(2*Math.PI*modPhase),fundamental=Math.sin(p+mod),second=Math.sin(p*2+.12),third=Math.sin(p*3+.24),tremolo=1-shape.tremolo+shape.tremolo*Math.sin(2*Math.PI*seconds*4.7),wave=fundamental*(tone==='reed'?.74:.86)+second*shape.second*bell+third*shape.third*(tone==='reed'?.75:bell),expected=wave*.7*Math.min(1,seconds/shape.attack)*release*Math.exp(-seconds*shape.decay)*tremolo*.82;
   error=Math.max(error,Math.abs(instrument.render()-expected));
  }
  assert.ok(error<1e-9,`${tone} ${rate}: ${error}`);
 }
});
test('inaudible piano voices keep aging and resume at the current envelope/phase',()=>{
 const heard=new CompingInstrument(8000),muted=new CompingInstrument(8000);for(const instrument of [heard,muted])instrument.strike([60,64,67],.4,.6,120,0,0,null);
 for(let i=0;i<4000;i++){heard.render();assert.equal(muted.render(false),0);}
 for(let i=0;i<1000;i++)assert.equal(muted.render(),heard.render());
});
test('click-only mixer skips pad waveform reads and retains the sample clock and unmute',()=>{
 const state=new Engine(48000);state.configure({countIn:false,key:9,mode:'dorian',chord:'min7',click:.6,harmony:.4,drums:true,bass:true,comping:true,sequence:true,mutedChannels:'harmony,drums,bass,comping,sequence'});state.reset();let reads=0;
 state.waveCurrent=state.waveCurrent.map(table=>new Proxy(table,{get(target,key){if(typeof key==='string'&&/^\d+$/.test(key))reads++;return target[key];}}));
 const output=new Float32Array(48000),beats=[];state.render(output,event=>beats.push(event));assert.equal(reads,0);assert.ok(output.some(n=>Math.abs(n)>.001));assert.ok(beats.length>=2);assert.ok(state.rhythm.lastGrid>0);assert.equal(state.settings.comping,true);
 state.configure({mutedChannels:''});state.render(new Float32Array(1024));assert.ok(reads>0);
});
test('phones request output buffering without forcing a resampling rate',()=>{
 assert.deepEqual(audioContextOptions('Mozilla/5.0 (Android 13; OnePlus9Pro) Gecko/20100101 Firefox/143.0'),{latencyHint:'playback'});assert.deepEqual(audioContextOptions('desktop',true),{latencyHint:'playback'});assert.deepEqual(audioContextOptions('desktop'),{latencyHint:'balanced'});
});
