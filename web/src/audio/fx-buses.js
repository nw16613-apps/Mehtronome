export const FX_CHANNELS=['click','harmony','drums','bass','comping','sequence','space'];
export const FX_PRESET_CONTROLS=['fx-reverb-type','fx-delay-division','fx-reverb-return','fx-delay-return',...FX_CHANNELS.flatMap(id=>['send-reverb-'+id,'send-delay-'+id])];
const percent=(value,fallback=0)=>Number.isFinite(Number(value))?Math.max(0,Math.min(100,Number(value))):fallback;
export function normalizeFxSettings(value={}){
 return {reverbType:value.reverbType==='plate'?'plate':'room',delayDivision:value.delayDivision==='dotted'?'dotted':'eighth',reverbReturn:percent(value.reverbReturn??25,25),delayReturn:percent(value.delayReturn??25,25),sends:Object.fromEntries(FX_CHANNELS.map(id=>[id,{reverb:percent(value.sends?.[id]?.reverb),delay:percent(value.sends?.[id]?.delay)}]))};
}
export function fxDelaySeconds(bpm,division){return 60/Math.max(30,Math.min(300,Number(bpm)||90))*(division==='dotted'?.75:.5);}
export function fxImpulse(rate,kind){
 const duration=kind==='plate'?2.1:.75,pre=Math.round(rate*(kind==='plate'?.018:.008)),length=Math.ceil(rate*duration);
 return [0,1].map(channel=>{const pcm=new Float32Array(length);let seed=271+channel*193,low=0;const alpha=1-Math.exp(-2*Math.PI*6000/rate);
  for(let i=pre;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=alpha*(noise-low);const t=(i-pre)/rate;pcm[i]=low*Math.exp(-t/(duration/7))*Math.min(1,t/.008)*Math.min(1,(length-i)/(rate*.025));}
  return pcm;});
}
// Both buses are 100% wet. Each source retains its existing dry route.
export function createFxBuses(context,destination,sources,initial={}){
 let state=normalizeFxSettings(initial),bpm=90,reverb,delay,feedback,tone,reverbKind='';
 const reverbInput=context.createGain(),delayInput=context.createGain(),reverbReturn=context.createGain(),delayReturn=context.createGain();
 const highpass=context.createBiquadFilter();highpass.type='highpass';highpass.frequency.value=150;reverbInput.connect(highpass);
 const delayHighpass=context.createBiquadFilter();delayHighpass.type='highpass';delayHighpass.frequency.value=180;delayInput.connect(delayHighpass);
 reverbReturn.gain.value=0;delayReturn.gain.value=0;reverbReturn.connect(destination);delayReturn.connect(destination);
 const sends=Object.fromEntries(FX_CHANNELS.map(id=>{const source=sources[id],r=context.createGain(),d=context.createGain();r.gain.value=0;d.gain.value=0;source.node.connect(r,source.output||0);source.node.connect(d,source.output||0);r.connect(reverbInput);d.connect(delayInput);return [id,{reverb:r,delay:d}];}));
 const voices=new Map(),buffers=new Map();let reverbSleep,delaySleep,signature='';
 const ramp=(param,value)=>param.setTargetAtTime(value,context.currentTime,.02);
 function dropReverb(){highpass.disconnect();for(const [node,gain]of voices){node.disconnect();node.buffer=null;gain.disconnect();}voices.clear();reverb=undefined;reverbKind='';}
 function dropDelay(){delayHighpass.disconnect();for(const node of [delay,feedback,tone])node?.disconnect();delay=undefined;}
 function buildReverb(){const old=reverb,oldGain=voices.get(old);reverb=context.createConvolver();let buffer=buffers.get(state.reverbType);if(!buffer){const pcm=fxImpulse(context.sampleRate,state.reverbType);buffer=context.createBuffer(2,pcm[0].length,context.sampleRate);pcm.forEach((values,i)=>buffer.getChannelData(i).set(values));buffers.set(state.reverbType,buffer);}reverb.buffer=buffer;const gain=context.createGain();gain.gain.value=0;highpass.connect(reverb).connect(gain).connect(reverbReturn);voices.set(reverb,gain);ramp(gain.gain,1);reverbKind=state.reverbType;if(oldGain){ramp(oldGain.gain,0);setTimeout(()=>{if(!voices.has(old))return;highpass.disconnect(old);old.disconnect();old.buffer=null;oldGain.disconnect();voices.delete(old);},120);}}

 function buildDelay(){dropDelay();delay=context.createDelay(2);delay.delayTime.value=fxDelaySeconds(bpm,state.delayDivision);tone=context.createBiquadFilter();tone.type='lowpass';tone.frequency.value=4800;feedback=context.createGain();feedback.gain.value=.28;delayHighpass.connect(delay).connect(tone);tone.connect(delayReturn);tone.connect(feedback).connect(delay);}
 function set(next){const clean=normalizeFxSettings(next),key=JSON.stringify(clean);if(key===signature)return;signature=key;state=clean;
  const r=state.reverbReturn>0&&FX_CHANNELS.some(id=>state.sends[id].reverb>0),d=state.delayReturn>0&&FX_CHANNELS.some(id=>state.sends[id].delay>0);
  if(r){clearTimeout(reverbSleep);if(!reverb||reverbKind!==state.reverbType)buildReverb();}else if(reverb){clearTimeout(reverbSleep);reverbSleep=setTimeout(dropReverb,2300);}
  if(d){clearTimeout(delaySleep);if(!delay)buildDelay();}else if(delay){clearTimeout(delaySleep);delaySleep=setTimeout(dropDelay,4500);}
  for(const id of FX_CHANNELS)for(const bus of ['reverb','delay'])ramp(sends[id][bus].gain,state.sends[id][bus]/100);
  ramp(reverbReturn.gain,state.reverbReturn/100*.6);ramp(delayReturn.gain,state.delayReturn/100*.6);if(delay)ramp(delay.delayTime,fxDelaySeconds(bpm,state.delayDivision));
 }
 function setTempo(value){if(value===bpm)return;bpm=value;if(delay)ramp(delay.delayTime,fxDelaySeconds(bpm,state.delayDivision));}
 function reset(){clearTimeout(reverbSleep);clearTimeout(delaySleep);dropReverb();dropDelay();signature='';set(state);}
 set(state);return {set,setTempo,reset,sends,reverbReturn,delayReturn};
}
