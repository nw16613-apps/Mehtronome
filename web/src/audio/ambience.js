// A deterministic stereo room: a short pre-delay, sparse early reflections and
// a diffuse, damped tail. Generation happens once on the main thread; the native
// convolver handles playback without extra work in the audio worklet.
export function roomImpulse(rate) {
  const duration = 3.8;
  const length = Math.ceil(rate * duration);
  const channels = [new Float32Array(length), new Float32Array(length)];
  const preDelay = Math.round(rate * .024);
  for (let channel = 0; channel < 2; channel++) {
    const pcm = channels[channel];
    let seed = 0x5123 + channel * 0x3ab1, low = 0, dark = 0, dc = 0;
    const brightness = 1 - Math.exp(-2 * Math.PI * 3800 / rate);
    const warmth = 1 - Math.exp(-2 * Math.PI * 850 / rate);
    const highpass = 1 - Math.exp(-2 * Math.PI * 180 / rate);
    for (let i = preDelay; i < length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      low += brightness * (noise - low);
      dark += warmth * (noise - dark);
      const time = (i - preDelay) / rate;
      // High frequencies decay sooner; low-mid energy gives the tail warmth.
      const diffuse = low * Math.exp(-time / .34) + dark * .65 * Math.exp(-time / .68);
      dc += highpass * (diffuse - dc);
      const density = Math.min(1, time / .045);
      pcm[i] = (diffuse - dc) * density * .12 * Math.min(1, (length - 1 - i) / (rate * .05));
    }
    // Reflections are small clusters rather than isolated clicks. Different
    // delays in each channel create width without a phase-flipped dry signal.
    for (let reflection = 0; reflection < 7; reflection++) {
      const time = [.029,.043,.061,.079,.103,.137,.173][reflection] + channel * [.001,.003,-.002,.004,-.003,.006,.002][reflection];
      const start = Math.round(time * rate);
      const width = Math.max(3, Math.round(rate * (.001 + reflection * .00018)));
      for (let tap = 0; tap < width; tap++) {
        const window = Math.sin(Math.PI * tap / (width - 1));
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        pcm[start + tap] += (seed / 2147483648 - 1) * window * .1 * Math.exp(-reflection * .28);
      }
    }
  }
  return channels;
}
