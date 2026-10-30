import { Engine } from './engine.js';

// Native output arrays already cover the entire steady-state quantum. Create
// subarray views only for the first, partially delayed start block.
const channelView=(outputs,index,channel,offset)=>{const data=outputs[index]?.[channel];return offset?data?.subarray(offset):data;};

class HarmonyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.engine = new Engine(sampleRate);
    this.active = false;
    this.meterFrames = 0;
    this.onBeat = event => this.port.postMessage(event);
    this.port.onmessage = ({ data }) => {
      if (data.type === 'drum-kit') {
        this.engine.installDrumKit(data.kit);
      } else if (data.type === 'start') {
        this.engine.configure(data.settings);
        this.engine.reset();
        this.startFrame = Number.isFinite(data.startTime) ? Math.round(data.startTime * sampleRate) : null;
        this.active = true;
      } else if (data.type === 'audition') {
        this.engine.configure(data.settings);
        this.engine.audition(data.step, data.notes, data.acoustic);
        this.active = true;
      } else if (data.type === 'stop') {
        this.engine.running = false;
      } else if (data.type === 'settings') {
        this.engine.configure(data.settings);
        this.port.postMessage({ type: 'harmony', step: this.engine.step });
      }
    };
  }

  process(_inputs, outputs) {
    const channels = outputs[0];
    if (this.active && channels.length) {
      if(this.startFrame!==null&&currentFrame+channels[0].length<=this.startFrame)return true;
      const offset=this.startFrame===null?0:Math.max(0,this.startFrame-currentFrame);
      this.startFrame=null;
      this.engine.render(offset?channels[0].subarray(offset):channels[0], this.onBeat, channelView(outputs,1,0,offset), channelView(outputs,1,1,offset), undefined, channelView(outputs,2,0,offset), undefined, channelView(outputs,3,0,offset), this.onBeat);
      if (outputs[2]?.length > 1) outputs[2][1].set((offset?outputs[2][0].subarray(offset):outputs[2][0]),offset);
      for (let i = 1; i < channels.length; i++) channels[i].set((offset?channels[0].subarray(offset):channels[0]),offset);
      this.meterFrames+=channels[0].length;
      if(this.meterFrames>=sampleRate/20){
        this.port.postMessage({type:'meters',peaks:Array.from(this.engine.meterPeaks)});
        this.engine.meterPeaks.fill(0);this.meterFrames=0;
      }
      if (!this.engine.running && this.engine.level < 0.00001) this.active = false;
    }
    return true;
  }
}

registerProcessor('mehtronome', HarmonyProcessor);
