import {Engine} from '../src/audio/engine.js';
import {BACKING_STYLES} from '../src/practice/backing-styles.js';
import {readSampleBank} from './read-sample-bank.mjs';
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
// Requires FFmpeg for offline EBU R128 loudness measurements. No app runtime dependency.
const temporary=mkdtempSync(join(tmpdir(),'mehtronome-mix-')),stem=join(temporary,'stem.f32');
try{
const rate=16000,kit=await readSampleBank(rate),channels=['click','harmony','drums','bass','comping','sequence'],out=[];
for(const [style,arrangement]of Object.entries(BACKING_STYLES)){
 const row={style};
 for(const channel of channels){
  if(channel==='click'&&style!=='popRock')continue;
  const engine=new Engine(rate);engine.installDrumKit(kit);engine.configure({...arrangement.settings,bpm:100,key:9,chord:'min7',mode:'dorian',countIn:false,progression:false,drums:true,bass:true,comping:true,sequence:true,click:.251188643,harmony:.251188643,drumsVolume:.251188643,bassVolume:.251188643,compingVolume:.251188643,sequenceVolume:.251188643,mutedChannels:channels.filter(id=>id!==channel).join(',')});engine.reset();
  const click=new Float32Array(rate*20),left=new Float32Array(click.length),right=new Float32Array(click.length),rhythm=new Float32Array(click.length);engine.render(click,undefined,left,right,undefined,rhythm);
  const pcm=new Float32Array((click.length-rate*2)*2);let sum=0,peak=0,active=[];
  for(let i=rate*2;i<click.length;i++){const l=click[i]+left[i]+rhythm[i],r=click[i]+right[i]+rhythm[i],at=(i-rate*2)*2;pcm[at]=l;pcm[at+1]=r;sum+=(l*l+r*r)/2;peak=Math.max(peak,Math.abs(l),Math.abs(r));}
  for(let offset=0;offset<pcm.length;offset+=rate*.2){let energy=0;const end=Math.min(pcm.length,offset+rate*.2);for(let i=offset;i<end;i++)energy+=pcm[i]*pcm[i];const rms=Math.sqrt(energy/(end-offset));if(rms>.0001)active.push(rms);}
  active.sort((a,b)=>a-b);
  writeFileSync(stem,Buffer.from(pcm.buffer));
  const r=spawnSync('ffmpeg',['-hide_banner','-f','f32le','-ar',String(rate),'-ac','2','-i',stem,'-af','ebur128=peak=true','-f','null','-'],{maxBuffer:1024*1024});const text=r.stderr.toString().split('Summary:').at(-1);const lufs=Number(text.match(/I:\s*([-\d.]+)/)?.[1]);
  row[channel]={lufs,rmsDb:20*Math.log10(Math.sqrt(sum/(click.length-rate*2))),peakDb:20*Math.log10(peak),activeDb:20*Math.log10(active[Math.floor(active.length*.75)]||1e-10)};
 }
 out.push(row);console.log(style,Object.entries(row).filter(([k])=>k!=='style').map(([k,v])=>`${k}: ${v.lufs}LU, ${v.peakDb.toFixed(1)}pk, ${v.activeDb.toFixed(1)}act`).join(' | '));
}

console.log(JSON.stringify(out,null,2));
}finally{rmSync(temporary,{recursive:true,force:true});}
