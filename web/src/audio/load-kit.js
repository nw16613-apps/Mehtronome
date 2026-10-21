import { SAMPLE_FILES } from './sample-manifest.js';

// Keep the decoded originals outside the worklet. Each installation gets fresh
// arrays because postMessage transfers (and detaches) the caller's buffers.
export function createSampleLoader(files) {
  const decoded = new Map();
  return async context => {
    const rate = context.sampleRate;
    let pending = decoded.get(rate);
    if (!pending) {
      pending = Promise.all(Object.entries(files).map(async ([name, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Backing samples could not load. Please try Start again.');
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        if (!buffer.length || !buffer.numberOfChannels || buffer.length > rate * 12) {
          throw new Error('A backing sample could not be decoded. Please try Start again.');
        }
        const pcm = new Float32Array(buffer.length);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const values = buffer.getChannelData(channel);
          for (let i = 0; i < pcm.length; i++) pcm[i] += values[i] / buffer.numberOfChannels;
        }
        let mean = 0;
        for (const value of pcm) {
          if (!Number.isFinite(value)) throw new Error('A backing sample was invalid. Please try Start again.');
          mean += value / pcm.length;
        }
        let peak = 0;
        for (let i = 0; i < pcm.length; i++) { pcm[i] -= mean; peak = Math.max(peak, Math.abs(pcm[i])); }
        if (peak < 1e-7) throw new Error('A backing sample was empty. Please try Start again.');
        const gain = (name.startsWith('bass') ? .8 : .85) / peak;
        // Short edge fades prevent a cropped recording creating a discontinuity.
        const attack = Math.max(1, Math.round(rate * .0005));
        const release = Math.max(1, Math.round(rate * .012));
        for (let i = 0; i < pcm.length; i++) {
          pcm[i] *= gain * Math.min(1, i / attack, (pcm.length - 1 - i) / release);
        }
        return [name, pcm];
      })).then(entries => Object.fromEntries(entries));
      decoded.set(rate, pending);
      // A failed first load must be retryable, including after a new context.
      pending.catch(() => { if (decoded.get(rate) === pending) decoded.delete(rate); });
    }
    const kit = await pending;
    return Object.fromEntries(Object.entries(kit).map(([name, pcm]) => [name, pcm.slice()]));
  };
}

// Fetching, decoding and normalisation happen once, before transport starts.
export const loadDrumKit = createSampleLoader(SAMPLE_FILES);
