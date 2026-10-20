// A soft nylon-string pluck: a displaced string excites a waveguide, then
// couples into the guitar body. All filters are allocated before rendering.
export class GuitarStrum {
  constructor(rate, notes) {
    this.age = 0;
    this.body = [110, 195, 310].map((frequency, index) => {
      const radius = Math.exp(-1 / (rate * [.085, .06, .035][index]));
      return { a:2 * radius * Math.cos(2 * Math.PI * frequency / rate),
        b:radius * radius, gain:(1 - radius) * [.9, .6, .3][index], y1:0, y2:0 };
    });
    this.tone = 0;
    this.dc = 0;
    this.dcCoefficient = 1 - Math.exp(-2 * Math.PI * 20 / rate);
    this.toneCoefficient = 1 - Math.exp(-2 * Math.PI * 2300 / rate);
    this.voices = notes.map((note, index) => {
      const frequency = 440 * 2 ** ((note - 69) / 12);
      const delay = rate / frequency - .5;
      const length = Math.ceil(delay) + 2;
      const buffer = new Float32Array(length);
      let seed = note * 1009 + 17, mean = 0;
      // Pluck near the middle of the string: a strong fundamental and rounded
      // upper harmonics, rather than noise with a randomly weak fundamental.
      const pick = .32;
      for (let i = 0; i < length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const phase = i / length;
        const displacement = phase < pick ? phase / pick : (1 - phase) / (1 - pick);
        buffer[i] = displacement + .015 * (seed / 2147483648 - 1);
        mean += buffer[i] / length;
      }
      let peak = 0;
      for (let i = 0; i < length; i++) {
        buffer[i] -= mean;
        peak = Math.max(peak, Math.abs(buffer[i]));
      }
      for (let i = 0; i < length; i++) buffer[i] *= .75 / peak;
      return { buffer, delay, index:0, previous:0,
        start:Math.round(index * .022 * rate),
        damping:Math.exp(-3 / (frequency * 5.5)),
        attack:Math.max(1,Math.round(.004 * rate)) };
    });
  }

  sample() {
    let sum = 0;
    for (const voice of this.voices) {
      const elapsed = this.age - voice.start;
      if (elapsed < 0) continue;
      const buffer = voice.buffer;
      let read = voice.index - voice.delay;
      if (read < 0) read += buffer.length;
      const base = Math.floor(read), fraction = read - base;
      const value = buffer[base] * (1 - fraction) + buffer[(base + 1) % buffer.length] * fraction;
      buffer[voice.index] = .5 * (value + voice.previous) * voice.damping;
      voice.previous = value;
      voice.index = (voice.index + 1) % buffer.length;
      sum += value * Math.min(1, elapsed / voice.attack);
    }
    this.age++;
    const raw = sum / Math.sqrt(this.voices.length);
    this.dc += this.dcCoefficient * (raw - this.dc);
    const strings = raw - this.dc;
    this.tone += this.toneCoefficient * (strings - this.tone);
    let body = 0;
    for (const mode of this.body) {
      const value = mode.gain * strings + mode.a * mode.y1 - mode.b * mode.y2;
      mode.y2 = mode.y1;
      mode.y1 = value;
      body += value;
    }
    const value = .85 * this.tone + .4 * body;
    // Gentle saturation keeps low grips full without clipping at full volume.
    return value / (1 + Math.abs(value));
  }
}
