export const FX_CHANNELS=['click','harmony','drums','bass','comping','sequence','space'];
export const FX_BUSES=['reverb','reverbB','delay'];
export const REVERB_TYPES={room:'Short room',chamber:'Chamber',plate:'Plate',hall:'Hall'};
export const DELAY_DIVISIONS={sixteenth:'Sixteenth notes',dottedSixteenth:'Dotted sixteenths',eighthTriplet:'Eighth-note triplets',eighth:'Eighth notes',dotted:'Dotted eighths',quarterTriplet:'Quarter-note triplets',quarter:'Quarter notes',dottedQuarter:'Dotted quarters',half:'Half notes',whole:'Whole notes · one 4/4 bar'};
const DELAY_BEATS={sixteenth:.25,dottedSixteenth:.375,eighthTriplet:1/3,eighth:.5,dotted:.75,quarterTriplet:2/3,quarter:1,dottedQuarter:1.5,half:2,whole:4};
export const FX_PRESET_CONTROLS=['fx-reverb-type','fx-reverb-b-type','fx-delay-division',...FX_CHANNELS.flatMap(id=>FX_BUSES.map(bus=>'send-'+bus+'-'+id))];
const percent=(value,fallback=0)=>Number.isFinite(Number(value))?Math.max(0,Math.min(100,Number(value))):fallback;
export function normalizeFxSettings(value={}){
 return {reverbType:Object.hasOwn(REVERB_TYPES,value.reverbType)?value.reverbType:'room',reverbBType:Object.hasOwn(REVERB_TYPES,value.reverbBType)?value.reverbBType:'plate',delayDivision:Object.hasOwn(DELAY_DIVISIONS,value.delayDivision)?value.delayDivision:'eighth',reverbReturn:100,reverbBReturn:100,delayReturn:100,sends:Object.fromEntries(FX_CHANNELS.map(id=>[id,Object.fromEntries(FX_BUSES.map(bus=>[bus,percent(value.sends?.[id]?.[bus])]))]))};
}
export function fxDelaySeconds(bpm,division){return 60/Math.max(30,Math.min(300,Number(bpm)||90))*(DELAY_BEATS[division]??.5);}
const REVERB_SHAPES={room:{duration:.75,pre:.008,tone:6000},chamber:{duration:1.3,pre:.012,tone:5200},plate:{duration:2.1,pre:.018,tone:6000},hall:{duration:3.2,pre:.028,tone:4300}};
export function fxImpulse(rate,kind){
 const {duration,pre:preSeconds,tone}=REVERB_SHAPES[kind]||REVERB_SHAPES.room,pre=Math.round(rate*preSeconds),length=Math.ceil(rate*duration);
 return [0,1].map(channel=>{const pcm=new Float32Array(length);let seed=271+channel*193,low=0;const alpha=1-Math.exp(-2*Math.PI*tone/rate);
  for(let i=pre;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=alpha*(noise-low);const t=(i-pre)/rate;pcm[i]=low*Math.exp(-t/(duration/7))*Math.min(1,t/.008)*Math.min(1,(length-i)/(rate*.025));}
  return pcm;});
}
// Three independent, fully wet buses. Returns stay at unity; source dry paths
// are untouched. Native nodes are created only while a bus has audible sends.
export function createFxBuses(context,destination,sources,initial={}){
 let state=normalizeFxSettings(initial),bpm=90,delay,feedback,tone,lfo,depth,delaySleep,signature='';
 const ramp=(param,value)=>param.setTargetAtTime(value,context.currentTime,.02);
 const buffers=new Map();
 function bufferFor(kind){let buffer=buffers.get(kind);if(!buffer){const pcm=fxImpulse(context.sampleRate,kind);buffer=context.createBuffer(2,pcm[0].length,context.sampleRate);pcm.forEach((values,i)=>buffer.getChannelData(i).set(values));buffers.set(kind,buffer);}return buffer;}
 function makeReverb(){
  const input=context.createGain(),highpass=context.createBiquadFilter(),output=context.createGain(),voices=new Map();
  highpass.type='highpass';highpass.frequency.value=150;input.connect(highpass);output.gain.value=1;output.connect(destination);
  let current,kind='',sleep;
  function drop(){highpass.disconnect();for(const [node,gain]of voices){node.disconnect();node.buffer=null;gain.disconnect();}voices.clear();current=undefined;kind='';}
  function set(nextKind,active){
   clearTimeout(sleep);
   if(!active){if(current)sleep=setTimeout(drop,(REVERB_SHAPES[kind].duration+.25)*1000);return;}
   if(current&&kind===nextKind)return;
   const old=current,oldGain=voices.get(old);current=context.createConvolver();current.buffer=bufferFor(nextKind);
   const gain=context.createGain();gain.gain.value=0;highpass.connect(current).connect(gain).connect(output);voices.set(current,gain);ramp(gain.gain,1);kind=nextKind;
   if(oldGain){ramp(oldGain.gain,0);setTimeout(()=>{if(!voices.has(old))return;highpass.disconnect(old);old.disconnect();old.buffer=null;oldGain.disconnect();voices.delete(old);},120);}
  }
  return {input,output,set,reset(){clearTimeout(sleep);drop();}};
 }
 const a=makeReverb(),b=makeReverb(),delayInput=context.createGain(),delayHighpass=context.createBiquadFilter(),delayReturn=context.createGain();
 delayHighpass.type='highpass';delayHighpass.frequency.value=180;delayInput.connect(delayHighpass);delayReturn.gain.value=1;delayReturn.connect(destination);
 const inputs={reverb:a.input,reverbB:b.input,delay:delayInput};
 const sends=Object.fromEntries(FX_CHANNELS.map(id=>[id,Object.fromEntries(FX_BUSES.map(bus=>{const gain=context.createGain();gain.gain.value=0;sources[id].node.connect(gain,sources[id].output||0);gain.connect(inputs[bus]);return [bus,gain];}))]));
 function dropDelay(){delayHighpass.disconnect();if(lfo){lfo.stop();lfo.disconnect();}for(const node of [delay,feedback,tone,depth])node?.disconnect();delay=undefined;lfo=undefined;}
 function buildDelay(){
  delay=context.createDelay(9);delay.delayTime.value=fxDelaySeconds(bpm,state.delayDivision);
  tone=context.createBiquadFilter();tone.type='lowpass';tone.frequency.value=4800;
  feedback=context.createGain();feedback.gain.value=.28;
  delayHighpass.connect(delay).connect(tone);tone.connect(delayReturn);tone.connect(feedback).connect(delay);
  // Slow +/-2.5 ms drift gives the repeats movement without a second dry signal.
  lfo=context.createOscillator();lfo.type='sine';lfo.frequency.value=.3;depth=context.createGain();depth.gain.value=.0025;
  lfo.connect(depth).connect(delay.delayTime);lfo.start();
 }
 function set(next){const clean=normalizeFxSettings(next),key=JSON.stringify(clean);if(key===signature)return;signature=key;state=clean;
  a.set(state.reverbType,FX_CHANNELS.some(id=>state.sends[id].reverb>0));b.set(state.reverbBType,FX_CHANNELS.some(id=>state.sends[id].reverbB>0));
  const active=FX_CHANNELS.some(id=>state.sends[id].delay>0);clearTimeout(delaySleep);
  if(active){if(!delay)buildDelay();}else if(delay)delaySleep=setTimeout(dropDelay,(fxDelaySeconds(bpm,state.delayDivision)*6+.4)*1000);
  for(const id of FX_CHANNELS)for(const bus of FX_BUSES)ramp(sends[id][bus].gain,state.sends[id][bus]/100);
  if(delay)ramp(delay.delayTime,fxDelaySeconds(bpm,state.delayDivision));
 }
 function setTempo(value){if(value===bpm)return;bpm=value;if(delay){ramp(delay.delayTime,fxDelaySeconds(bpm,state.delayDivision));if(!FX_CHANNELS.some(id=>state.sends[id].delay>0)){clearTimeout(delaySleep);delaySleep=setTimeout(dropDelay,(fxDelaySeconds(bpm,state.delayDivision)*6+.4)*1000);}}}
 function reset(){clearTimeout(delaySleep);a.reset();b.reset();dropDelay();signature='';set(state);}
 set(state);return {set,setTempo,reset,sends,reverbReturn:a.output,reverbBReturn:b.output,delayReturn};
}
