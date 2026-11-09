import {GUITAR_CABINET_URL} from './preferred-manifest.js';
import {nativeGuitarChannel,guitarChannelVolume,needsGuitarCabinet,guitarToneProfile} from './guitar-policy.js';
export {nativeGuitarChannel,guitarChannelVolume,needsGuitarCabinet,guitarToneProfile} from './guitar-policy.js';
const cabinets=new WeakMap();
export function loadGuitarCabinet(context,s){
 if(!needsGuitarCabinet(s))return Promise.resolve(null);
 let pending=cabinets.get(context);
 if(!pending){pending=(async()=>{
  const r=await fetch(GUITAR_CABINET_URL);if(!r.ok)throw Error('The guitar speaker response could not load. Try Play again.');
  const decoded=await context.decodeAudioData(await r.arrayBuffer()),buffer=context.createBuffer(1,decoded.length,context.sampleRate),x=buffer.getChannelData(0);
  for(let ch=0;ch<decoded.numberOfChannels;ch++){const data=decoded.getChannelData(ch);for(let n=0;n<x.length;n++)x[n]+=data[n]/decoded.numberOfChannels;}
  let mean=0;for(const v of x)mean+=v/x.length;let energy=0;for(let n=0;n<x.length;n++){x[n]-=mean;energy+=x[n]*x[n];}
  if(!Number.isFinite(energy)||energy<=0)throw Error('The guitar speaker response is invalid.');
  // Match the audition IR's energy at 32 kHz, including contexts at 44.1/48 kHz.
  const scale=Math.sqrt(32000/context.sampleRate)/Math.sqrt(energy);for(let n=0;n<x.length;n++)x[n]*=scale;
  return buffer;
 })();cabinets.set(context,pending);pending.catch(()=>cabinets.delete(context));}
 return pending;
}
function onePole(context,type,hz){const k=Math.tan(Math.PI*hz/context.sampleRate),a=(k-1)/(k+1),b=type==='highpass'?1/(1+k):k/(1+k);return context.createIIRFilter(type==='highpass'?[b,-b]:[b,b],[1,a]);}
const curveCache=new Map();function curve(kind){if(curveCache.has(kind))return curveCache.get(kind);const a=new Float32Array(8193);for(let n=0;n<a.length;n++){const x=n/(a.length-1)*2-1;a[n]=kind===1?Math.tanh(4*x):Math.tanh(.9*x)/.9;}curveCache.set(kind,a);return a;}

// Native browser DSP keeps the long cabinet convolution and oversampling out of
// the musical worklet. Each track has one shared amp after its strings are summed.
export function createGuitarChannel(context,source,destination){
 const input=context.createGain(),output=context.createGain(),bypass=context.createGain(),dryToMaster=context.createGain();
 input.connect(bypass).connect(output);dryToMaster.gain.value=0;output.connect(dryToMaster).connect(destination);
 source.node.connect(input,source.output||0);let amp=null,signature='';
 const ramp=(p,v)=>p.setTargetAtTime(v,context.currentTime,.025);
 function build(buffer){
  const normalize=context.createGain(),lowcut=context.createBiquadFilter(),tone=context.createBiquadFilter(),pre=context.createGain(),first=context.createWaveShaper(),coupling=onePole(context,'highpass',35),second=context.createWaveShaper(),recover=context.createGain(),cab=context.createConvolver(),finish=context.createBiquadFilter(),dry=context.createGain(),wet=context.createGain(),volume=context.createGain();
  normalize.gain.value=0;input.connect(normalize);lowcut.type='highpass';lowcut.Q.value=Math.SQRT1_2;tone.type='lowpass';tone.Q.value=Math.SQRT1_2;finish.type='lowpass';finish.Q.value=Math.SQRT1_2;
  first.curve=curve(1);second.curve=curve(2);first.oversample='4x';second.oversample='4x';cab.normalize=false;cab.buffer=buffer;
  normalize.connect(lowcut).connect(tone).connect(pre).connect(first).connect(coupling).connect(second).connect(recover).connect(cab).connect(finish);
  finish.connect(dry).connect(volume);volume.connect(output);
  const wetLow=onePole(context,'highpass',160),wetHigh=onePole(context,'lowpass',Math.min(7000,context.sampleRate*.45)),merger=context.createChannelMerger(2);
  finish.connect(wetLow).connect(wetHigh);merger.connect(wet).connect(volume);
  for(let ch=0;ch<2;ch++){
   const delay=context.createDelay(.05),lfo=context.createOscillator(),depth=context.createGain();delay.delayTime.value=.014;depth.gain.value=.0013;lfo.frequency.value=.32;
   if(ch===1)lfo.setPeriodicWave(context.createPeriodicWave(new Float32Array([0,1]),new Float32Array([0,0])));
   lfo.connect(depth).connect(delay.delayTime);lfo.start();wetHigh.connect(delay);delay.connect(merger,0,ch);
  }
  return {normalize,lowcut,tone,pre,recover,finish,dry,wet,volume};
 }
 function set(s,channel,buffer){
  const active=nativeGuitarChannel(s,channel),level=guitarChannelVolume(s,channel),toneId=channel==='comping'?s.compingTone:s.sequenceTone||s.compingTone;
  ramp(bypass.gain,active?0:1);ramp(dryToMaster.gain,active?1:0);
  if(!active||level<=0){if(amp){ramp(amp.normalize.gain,0);ramp(amp.volume.gain,0);}return;}
  if(!buffer)throw Error('Guitar speaker response is not ready.');
  if(!amp)amp=build(buffer);
  const p=guitarToneProfile(toneId,channel),key=toneId+':'+channel;
  if(signature!==key){signature=key;ramp(amp.lowcut.frequency,p.lowcut);ramp(amp.tone.frequency,p.tone);ramp(amp.pre.gain,p.gain/4);ramp(amp.recover.gain,1/p.gain);ramp(amp.finish.frequency,p.outputCut);ramp(amp.dry.gain,1-p.chorus);ramp(amp.wet.gain,p.chorus);}
  // Compensate the preamp input so changing a mixer fader changes level rather
  // than drive. The sampler's reference fader level in the audition was 25%.
  ramp(amp.normalize.gain,.25/Math.max(.001,level));ramp(amp.volume.gain,level/.25*10**(p.trim/20));
 }
 return {input,output,set,get built(){return !!amp;}};
}
