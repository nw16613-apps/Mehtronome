// Plucked-string waveguides: a pick excites each string, then the bridge
// gradually absorbs its upper harmonics. No oscillators or ambient pad layers.
export class GuitarStrum {
  constructor(rate, notes) {
    this.age = 0;
    this.voices = notes.map((note, index) => {
      const frequency = 440 * 2 ** ((note - 69) / 12);
      const delay = rate / frequency - .5;
      const length = Math.ceil(delay) + 2;
      const buffer = new Float32Array(length);
      let seed = note * 1009 + 17, previous = 0, mean = 0;
      for (let i = 0; i < length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const noise = seed / 2147483648 - 1;
        // A rounded pick attack, rather than bright white-noise excitation.
        previous = .55 * previous + .45 * noise;
        buffer[i] = previous;
        mean += previous / length;
      }
      for (let i = 0; i < length; i++) buffer[i] -= mean;
      return { buffer, delay, index:0, previous:0,
        start:Math.round(index * .022 * rate),
        damping:Math.exp(-3 / (frequency * 3.8)),
        attack:Math.max(1,Math.round(.002 * rate)) };
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
    return sum * .8 / Math.sqrt(this.voices.length);
  }
}
