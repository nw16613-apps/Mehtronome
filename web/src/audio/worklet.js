import { Engine } from './engine.js';

class HarmonyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.engine = new Engine(sampleRate);
    this.active = false;
    this.port.onmessage = ({ data }) => {
      if (data.type === 'start') {
        this.engine.configure(data.settings);
        this.engine.reset();
        this.active = true;
      } else if (data.type === 'audition') {
        this.engine.configure(data.settings);
        this.engine.audition(data.step);
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
      this.engine.render(channels[0], event => this.port.postMessage(event), outputs[1]?.[0]);
      if (outputs[1]?.length > 1) outputs[1][1].set(outputs[1][0]);
      for (let i = 1; i < channels.length; i++) channels[i].set(channels[0]);
      if (!this.engine.running && this.engine.level < 0.00001) this.active = false;
    }
    return true;
  }
}

registerProcessor('mehtronome', HarmonyProcessor);
