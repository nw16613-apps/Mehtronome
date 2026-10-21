import {readFile} from 'node:fs/promises';
import {SAMPLE_FILES} from '../src/audio/sample-manifest.js';

// Offline counterpart of the browser loader for repeatable listening renders
// and benchmarks. Supports the bundled mono/stereo 16-bit PCM WAV recordings.
export async function readSampleBank(rate) {
  const entries=await Promise.all(Object.entries(SAMPLE_FILES).map(async([name,url])=>{
    const bytes=await readFile(url);
    if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw new Error(`Invalid WAV: ${name}`);
    let data,sourceRate,channels;
    for(let offset=12;offset+8<=bytes.length;){
      const size=bytes.readUInt32LE(offset+4),tag=bytes.toString('ascii',offset,offset+4);
      if(tag==='fmt '){
        if(bytes.readUInt16LE(offset+8)!==1||bytes.readUInt16LE(offset+22)!==16)throw new Error(`Expected 16-bit PCM: ${name}`);
        channels=bytes.readUInt16LE(offset+10);sourceRate=bytes.readUInt32LE(offset+12);
      }
      if(tag==='data')data=bytes.subarray(offset+8,offset+8+size);
      offset+=8+size+(size%2);
    }
    if(!data||!channels||!sourceRate)throw new Error(`Incomplete WAV: ${name}`);
    const frames=data.length/(2*channels),source=new Float32Array(frames);
    for(let i=0;i<frames;i++)for(let channel=0;channel<channels;channel++)source[i]+=data.readInt16LE((i*channels+channel)*2)/(32768*channels);
    const pcm=new Float32Array(Math.ceil(frames*rate/sourceRate));
    let mean=0;
    for(let i=0;i<pcm.length;i++){
      const position=i*sourceRate/rate,index=Math.min(frames-1,Math.floor(position)),fraction=position-index;
      pcm[i]=source[index]+(source[Math.min(frames-1,index+1)]-source[index])*fraction;mean+=pcm[i]/pcm.length;
    }
    let peak=0;
    for(let i=0;i<pcm.length;i++){pcm[i]-=mean;peak=Math.max(peak,Math.abs(pcm[i]));}
    if(peak<1e-7)throw new Error(`Silent WAV: ${name}`);
    const gain=(name.startsWith('bass')?.8:.85)/peak,attack=Math.max(1,Math.round(rate*.0005)),release=Math.max(1,Math.round(rate*.012));
    for(let i=0;i<pcm.length;i++)pcm[i]*=gain*Math.min(1,i/attack,(pcm.length-1-i)/release);
    return [name,pcm];
  }));
  return Object.fromEntries(entries);
}
