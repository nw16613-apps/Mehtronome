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
    await load(context(44100));assert.equal(requests.length,4);
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
