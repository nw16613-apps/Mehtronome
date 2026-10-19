// A single sample clock drives clicks, count-in and chord changes. No UI timers.
export const DEFAULTS = {
  bpm: 90, beats: 4, key: 0, minor: false, progression: false,
  click: 0.5, harmony: 0.35, countIn: true,
};
export const DEGREES = [0, 5, 3, 4];
export const major = [0, 2, 4, 5, 7, 9, 11];
export const minor = [0, 2, 3, 5, 7, 8, 10];

export function chordNotes(key, isMinor, degree = 0) {
  const scale = isMinor ? minor : major;
  return [degree, degree + 2, degree + 4].map(i =>
    48 + key + scale[i % 7] + 12 * Math.floor(i / 7));
}

export class Engine {
  constructor(rate = 48000) {
    this.rate = rate;
    this.settings = { ...DEFAULTS };
    this.reset();
  }

  reset() {
    this.phase = 0;
    this.beat = -1;
    this.remainingCount = this.settings.countIn ? this.settings.beats : 0;
    this.nextBeat = true;
    this.clickAge = this.rate;
    this.clickFrequency = 1500;
    this.phases = [0, 0, 0];
    this.frequencies = [0, 0, 0];
    this.level = 0;
    this.clickLevel = 0;
    this.harmonyLevel = 0;
    this.running = true;
    this.age = 0;
    this.degree = 0;
    this.configure({});
  }

  configure(settings) {
    Object.assign(this.settings, settings);
    const s = this.settings;
    s.bpm = Math.max(30, Math.min(240, Number(s.bpm) || 90));
    this.setChord(this.degree);
  }

  setChord(degree) {
    this.degree = degree;
    this.frequencies = chordNotes(this.settings.key, this.settings.minor, degree)
      .map(note => 440 * 2 ** ((note - 69) / 12));
  }

  render(output, onBeat = () => {}) {
    const s = this.settings;
    const smoothing = 1 - Math.exp(-1 / (this.rate * 0.018));
    for (let i = 0; i < output.length; i++) {
      if (this.nextBeat) {
        this.nextBeat = false;
        this.beat++;
        const counting = this.beat < this.remainingCount;
        const musicalBeat = Math.max(0, this.beat - this.remainingCount);
        const bar = Math.floor(musicalBeat / s.beats);
        const step = s.progression ? bar % 4 : 0;
        this.setChord(s.progression ? DEGREES[step] : 0);
        this.clickAge = 0;
        this.clickFrequency = this.beat % s.beats === 0 ? 1500 : 1000;
        onBeat({ counting, beat: this.beat % s.beats, bar: bar + 1, step });
      }
      const playing = this.running ? 1 : 0;
      this.level += (playing - this.level) * smoothing;
      this.clickLevel += (s.click - this.clickLevel) * smoothing;
      const backing = this.beat >= this.remainingCount ? s.harmony : 0;
      this.harmonyLevel += (backing - this.harmonyLevel) * smoothing;
      const t = this.clickAge++ / this.rate;
      const click = t < .06 ? Math.sin(2 * Math.PI * this.clickFrequency * t) * Math.exp(-100 * t) : 0;
      let chord = 0;
      for (let voice = 0; voice < 3; voice++) {
        this.phases[voice] = (this.phases[voice] + 2 * Math.PI * this.frequencies[voice] / this.rate) % (2 * Math.PI);
        const p = this.phases[voice];
        chord += (Math.sin(p) + .16 * Math.sin(2 * p) + .04 * Math.sin(3 * p)) / 3.6;
      }
      output[i] = this.level * (.3 * this.clickLevel * click + .4 * this.harmonyLevel * chord);
      // Integer units avoid drift and preserve position when the tempo changes.
      this.phase += s.bpm;
      if (this.phase >= 60 * this.rate) {
        this.phase -= 60 * this.rate;
        this.nextBeat = true;
      }
      this.age++;
    }
  }
}
