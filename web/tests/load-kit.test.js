import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSampleLoader} from '../src/audio/load-kit.js';

const context=(rate=48000)=>({sampleRate:rate,async decodeAudioData(){
  const values=Float32Array.from({length:1024},(_,i)=>Math.sin(i*.13)*Math.exp(-i/600)+.03);
  return {length:values.length,numberOfChannels:2,getChannelData(channel){return channel?values.map(value=>value*.5):values;}};
}});
async function mockedFetch(run){
  const original=globalThis.fetch,requests=[];
  globalThis.fetch=async url=>{requests.push(String(url));return {ok:true,arrayBuffer:async()=>new ArrayBuffer(2)};};
  try{await run(requests);}finally{globalThis.fetch=original;}
}

test('sample bank is prepared once per rate and fresh buffers survive worklet transfer and context replacement',async()=>{
  await mockedFetch(async requests=>{
    const load=createSampleLoader({kick:'kick.wav',bass28:'bass.wav'}),audio=context();
    const first=await load(audio);
    for(const [name,pcm] of Object.entries(first)){
      const peak=Math.max(...pcm.map(Math.abs));
      assert.ok(peak>.2&&peak<=(name.startsWith('bass')?.800001:.850001));
      assert.equal(Math.abs(pcm[0]),0);assert.equal(Math.abs(pcm.at(-1)),0);
      assert.ok(pcm.every(Number.isFinite));
    }
    const copy=structuredClone(first);
    structuredClone(first,{transfer:Object.values(first).map(pcm=>pcm.buffer)});
    assert.equal(first.kick.length,0);
    const second=await load(context());
    assert.deepEqual(second,copy);assert.notEqual(second.kick,copy.kick);
    assert.equal(requests.length,2);
    second.kick.fill(0);
    assert.deepEqual(await load(context()),copy);
    await load(context(44100));assert.equal(requests.length,2);
  });
});

test('failed fetching or decoding is evicted so Start can retry with a fresh context',async()=>{
  const original=globalThis.fetch;
  try{
    let calls=0;
    globalThis.fetch=async()=>({ok:++calls!==1,arrayBuffer:async()=>new ArrayBuffer(2)});
    const load=createSampleLoader({snare:'snare.wav'});
    await assert.rejects(load(context()),/samples could not load/);
    assert.ok((await load(context())).snare.length>0);assert.equal(calls,2);
    const decode=createSampleLoader({kick:'kick.wav'});
    await assert.rejects(decode({...context(),decodeAudioData:async()=>{throw new Error('Decode failed');}}),/Decode failed/);
    assert.ok((await decode(context())).kick.length>0);
  }finally{globalThis.fetch=original;}
});

test('empty and non-finite recordings cannot start a corrupt audio worklet',async()=>{
  await mockedFetch(async()=>{
    for(const values of [new Float32Array(100),Float32Array.of(0,NaN,1),Float32Array.of(0,Infinity,1)]){
      const load=createSampleLoader({kick:'kick.wav'});
      await assert.rejects(load({...context(),async decodeAudioData(){return {length:values.length,numberOfChannels:1,getChannelData:()=>values};}}),/sample was empty|sample was invalid/);
    }
  });
});

test('sample loading limits simultaneous decodes while retaining every bank',async()=>{
 const original=globalThis.fetch;let running=0,peak=0;
 globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(2)});
 try{const audio=context(),load=createSampleLoader(Object.fromEntries(Array.from({length:21},(_,i)=>['sample'+i,'sample.wav'])));
 const result=await load({...audio,async decodeAudioData(data){running++;peak=Math.max(peak,running);await new Promise(resolve=>setTimeout(resolve,1));const buffer=await audio.decodeAudioData(data);running--;return buffer;}});
 assert.equal(Object.keys(result).length,21);assert.equal(peak,4);
 }finally{globalThis.fetch=original;}
});

test('selective overlapping loads share each fetch/decode and empty playback loads nothing',async()=>{
 await mockedFetch(async requests=>{let decodes=0;const c=context(),audio={...c,async decodeAudioData(data){decodes++;return c.decodeAudioData(data);}},load=createSampleLoader({kick:'kick.wav',snare:'snare.wav',ride:'ride.wav'});assert.deepEqual(await load(audio,[]),{});assert.equal(requests.length,0);const [a,b]=await Promise.all([load(audio,['kick','snare']),load(audio,['snare'])]);assert.deepEqual(Object.keys(a),['kick','snare']);assert.equal(requests.length,2);assert.equal(decodes,2);assert.notEqual(a.snare,b.snare);await load(audio,['ride']);assert.equal(requests.length,3);});
});
test('prefetch fetches selected bytes without decoding or starting audio, then reuses them',async()=>{
 await mockedFetch(async requests=>{const load=createSampleLoader({kick:'kick.wav',unused:'unused.wav'});await load.prefetch(['kick']);assert.deepEqual(requests,['kick.wav']);await load(context(),['kick']);assert.equal(requests.length,1);});
});
test('bounded recording caches evict old banks without invalidating delivered audio or simultaneous requests',async()=>{
 await mockedFetch(async requests=>{const audio=context(),load=createSampleLoader({a:'a.wav',b:'b.wav',c:'c.wav'},{maxEncodedBytes:2,maxDecodedBytes:4096});const first=await load(audio,['a']);const copy=first.a.slice();await load(audio,['b']);assert.deepEqual(first.a,copy);await load(audio,['a']);assert.equal(requests.filter(s=>s==='a.wav').length,2);const [a,b]=await Promise.all([load(audio,['c']),load(audio,['c'])]);assert.deepEqual(a.c,b.c);assert.notEqual(a.c,b.c);assert.equal(requests.filter(s=>s==='c.wav').length,1);});
});
