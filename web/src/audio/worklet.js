import { Engine } from './engine.js';

// Native output arrays already cover the entire steady-state quantum. Create
// subarray views only for the first, partially delayed start block.
const STEM_CHANNELS=[['drums',4,0,'drums'],['bass',5,0,'bass'],['comping',6,0,'comping'],['sequenceLeft',7,0,'sequence'],['sequenceRight',7,1,'sequence'],['harmonyLeft',8,0,'harmony'],['harmonyRight',8,1,'harmony']];
const channelView=(outputs,index,channel,offset)=>{const data=outputs[index]?.[channel];return offset?data?.subarray(offset):data;};

class HarmonyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.engine = new Engine(sampleRate);
    this.active = false;
    this.stems={};this.fxChannels=new Set();this.stemsEnabled=false;
    this.meterFrames = 0;
    this.onBeat = event => this.port.postMessage(event);
    this.port.onmessage = ({ data }) => {
      if(data.type==='exercise-tempo'){this.engine.updateExerciseTempo(data.bpm,data.remainingBeats);return;}
      if(data.type==='live-controls'){this.engine.updateLiveSettings(data.settings,data.cancelPending);return;}
      if(data.type==='fx-sends'){this.fxChannels=new Set(data.channels||[]);this.stemsEnabled=STEM_CHANNELS.some(([, , ,id])=>this.fxChannels.has(id));return;}
      if (data.type === 'drum-kit') {
        if(data.merge)this.engine.mergeDrumKit(data.kit);else this.engine.installDrumKit(data.kit);
      } else if (data.type === 'start') {
        this.engine.configure(data.settings,data.referencePlan);
        if(data.sampleNames)this.engine.mergeDrumKit({},data.sampleNames);
        this.engine.reset();
        this.startFrame = Number.isFinite(data.startTime) ? Math.round(data.startTime * sampleRate) : null;
        this.active = true;
      } else if (data.type === 'audition') {
        this.engine.configure(data.settings,data.referencePlan);
        if(data.sampleNames)this.engine.mergeDrumKit({},data.sampleNames);
        this.engine.audition(data.step, data.notes, data.acoustic);
        this.active = true;
      } else if (data.type === 'stop') {
        this.engine.running = false;this.engine.pendingSettings=null;
      } else if (data.type === 'settings') {
        const queued=data.live?this.engine.requestSettings(data.settings,data.referencePlan,data.id,data.sampleNames):(this.engine.configure(data.settings,data.referencePlan),false);
        if(!data.live&&data.sampleNames)this.engine.mergeDrumKit({},data.sampleNames);
        if(!queued)this.port.postMessage({type:data.live?'settings-applied':'harmony',id:data.id,settings:data.settings,step:this.engine.step});
      }
    };
  }

  process(_inputs, outputs) {
    const channels = outputs[0];
    if (this.active && channels.length) {
      if(this.startFrame!==null&&currentFrame+channels[0].length<=this.startFrame)return true;
      const offset=this.startFrame===null?0:Math.max(0,this.startFrame-currentFrame);
      this.startFrame=null;
      if(this.stemsEnabled)for(const [key,index,channel,id]of STEM_CHANNELS)this.stems[key]=this.fxChannels.has(id)?channelView(outputs,index,channel,offset):undefined;
      this.engine.render(offset?channels[0].subarray(offset):channels[0], this.onBeat, channelView(outputs,1,0,offset), channelView(outputs,1,1,offset), undefined, channelView(outputs,2,0,offset), undefined, channelView(outputs,3,0,offset), this.onBeat,this.stemsEnabled?this.stems:null);
      if (outputs[2]?.length > 1) outputs[2][1].set((offset?outputs[2][0].subarray(offset):outputs[2][0]),offset);
      for (let i = 1; i < channels.length; i++) channels[i].set((offset?channels[0].subarray(offset):channels[0]),offset);
      this.meterFrames+=channels[0].length;
      if(this.meterFrames>=sampleRate/(sampleRate<=32000?10:20)){
        this.port.postMessage({type:'meters',peaks:Array.from(this.engine.meterPeaks)});
        this.engine.meterPeaks.fill(0);this.meterFrames=0;
      }
      if (!this.engine.running && this.engine.level < 0.00001) this.active = false;
    }
    return true;
  }
}

registerProcessor('mehtronome', HarmonyProcessor);
