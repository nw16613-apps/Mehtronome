import {renderJazzGuitarNote} from './jazz-guitar.js';
export const exerciseNoteDuration=length=>Math.max(.045,Math.min(12,length*.96));
const yieldTask=()=>new Promise(resolve=>setTimeout(resolve,0));

// Shared PCM is reusable; AudioBufferSourceNodes are deliberately never reused.
export class ExerciseBufferCache{
 constructor({limitBytes=16*1024*1024,render=renderJazzGuitarNote,pause=yieldTask}={}){this.limitBytes=limitBytes;this.render=render;this.pause=pause;this.contexts=new WeakMap();}
 key(context,midi,duration){return `${midi}:${Math.max(1,Math.ceil(context.sampleRate*duration-1e-7))}`;}
 get(context,midi,duration){
  let cache=this.contexts.get(context);if(!cache){cache={items:new Map(),bytes:0};this.contexts.set(context,cache);}
  const key=this.key(context,midi,duration),hit=cache.items.get(key);
  if(hit){cache.items.delete(key);cache.items.set(key,hit);return hit;}
  const frames=Number(key.split(':')[1]),samples=this.render(context.sampleRate,midi,frames/context.sampleRate),buffer=context.createBuffer(1,samples.length,context.sampleRate);buffer.copyToChannel(samples,0);
  if(buffer.length*4<=this.limitBytes){
   while(cache.bytes+buffer.length*4>this.limitBytes&&cache.items.size){const oldest=cache.items.keys().next().value;cache.bytes-=cache.items.get(oldest).length*4;cache.items.delete(oldest);}
   cache.items.set(key,buffer);cache.bytes+=buffer.length*4;
  }
  return buffer;
 }
 async prepare(context,requests,cancelled=()=>false){
  const buffers=new Map();let count=0;
  for(const {midi,duration}of requests){
   if(cancelled())return null;
   const key=this.key(context,midi,duration);if(buffers.has(key))continue;
   buffers.set(key,this.get(context,midi,duration));if(++count%4===0)await this.pause();
  }
  return cancelled()?null:buffers;
 }
}

// Keep only a short audio-clock horizon of live nodes, independent of score size.
export class ExerciseAudioQueue{
 constructor(context,schedule,{horizon=1,interval=50,startInterval=(callback,delay)=>setInterval(callback,delay),stopInterval=timer=>clearInterval(timer)}={}){this.context=context;this.schedule=schedule;this.horizon=horizon;this.interval=interval;this.startInterval=startInterval;this.stopInterval=stopInterval;this.events=[];this.cursor=0;this.timer=null;}
 enqueue(events){this.events.push(...events);this.pump();if(this.timer===null)this.timer=this.startInterval(()=>this.pump(),this.interval);}
 pump(){
  const now=this.context.currentTime;
  while(this.cursor<this.events.length&&this.events[this.cursor].at<=now+this.horizon){const event=this.events[this.cursor++];if(event.at+event.length>now)this.schedule(event);}
  if(this.cursor>=256||this.cursor===this.events.length){this.events=this.events.slice(this.cursor);this.cursor=0;}
 }
 stop(){if(this.timer!==null)this.stopInterval(this.timer);this.timer=null;this.events=[];this.cursor=0;}
}
