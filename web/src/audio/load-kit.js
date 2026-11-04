import { SAMPLE_FILES } from './sample-manifest.js';
// Separate bounded queues prevent a bank switch multiplying network/decoder load.
function limit(work){let active=0;const queue=[];const pump=()=>{while(active<4&&queue.length){const job=queue.shift();active++;Promise.resolve().then(()=>work(...job.args)).then(job.resolve,job.reject).finally(()=>{active--;pump();});}};return (...args)=>new Promise((resolve,reject)=>{queue.push({args,resolve,reject});pump();});}
export function createSampleLoader(files){
 const encoded=new Map(),decoded=new Map();
 const fetchOne=limit(async(name,lowPriority)=>{const response=await fetch(files[name],lowPriority?{priority:'low'}:undefined);if(!response.ok)throw new Error('Backing samples could not load. Please try Start again.');return response.arrayBuffer();});
 function read(name,lowPriority=false){if(!Object.hasOwn(files,name))return Promise.reject(new Error('Unknown backing sample.'));let pending=encoded.get(name);if(!pending){pending=fetchOne(name,lowPriority);encoded.set(name,pending);pending.catch(()=>{if(encoded.get(name)===pending)encoded.delete(name);});}return pending;}
 const decodeOne=limit(async(context,name)=>{
    const rate=context.sampleRate,bytes=await read(name),buffer=await context.decodeAudioData(bytes.slice(0));
    if (!buffer.length || !buffer.numberOfChannels || buffer.length > rate * 12) {
      throw new Error('A backing sample could not be decoded. Please try Start again.');
    }
    const pcm = new Float32Array(buffer.length);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const values = buffer.getChannelData(channel);
      for (let i = 0; i < pcm.length; i++) pcm[i] += values[i] / buffer.numberOfChannels;
    }
    let mean = 0;
    for (const value of pcm) {
      if (!Number.isFinite(value)) throw new Error('A backing sample was invalid. Please try Start again.');
      mean += value / pcm.length;
    }
    let peak = 0;
    for (let i = 0; i < pcm.length; i++) { pcm[i] -= mean; peak = Math.max(peak, Math.abs(pcm[i])); }
    if (peak < 1e-7) throw new Error('A backing sample was empty. Please try Start again.');
    const gain = ((name.startsWith('bass')||name.startsWith('upright')) ? .8 : .85) / peak;
    // Short edge fades prevent a cropped recording creating a discontinuity.
    const attack = Math.max(1, Math.round(rate * .0005));
    const release = Math.max(1, Math.round(rate * .012));
    for (let i = 0; i < pcm.length; i++) {
      pcm[i] *= gain * Math.min(1, i / attack, (pcm.length - 1 - i) / release);
    }

    return pcm;
 });
 function decode(context,name){let bank=decoded.get(context.sampleRate);if(!bank){bank=new Map();decoded.set(context.sampleRate,bank);}let pending=bank.get(name);if(!pending){pending=decodeOne(context,name);bank.set(name,pending);pending.catch(()=>{if(bank.get(name)===pending)bank.delete(name);encoded.delete(name);});}return pending;}
 const load=async(context,names=Object.keys(files))=>Object.fromEntries(await Promise.all([...new Set(names)].map(async name=>[name,(await decode(context,name)).slice()])));
 // Fetch only: no AudioContext, playback, decoding or CPU-heavy processing.
 load.prefetch=async(names)=>{await Promise.all([...new Set(names)].map(name=>read(name,true)));};
 return load;
}
export const loadDrumKit=createSampleLoader(SAMPLE_FILES);
