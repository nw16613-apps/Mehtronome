// Decode and resample once before playback; the worklet receives ready-to-read PCM.
const files = {
  kick: new URL('./samples/kick.wav', import.meta.url),
  snare: new URL('./samples/snare.wav', import.meta.url),
  hat: new URL('./samples/hat.wav', import.meta.url),
  ride: new URL('./samples/ride.wav', import.meta.url),
  rim: new URL('./samples/rim.wav', import.meta.url),
};
export async function loadDrumKit(context) {
  const entries = await Promise.all(Object.entries(files).map(async ([name, url]) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Drum samples could not load. Please refresh and try again.');
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    const pcm = new Float32Array(buffer.getChannelData(0));
    let peak = 0;
    for (const value of pcm) peak = Math.max(peak, Math.abs(value));
    if (!peak) throw new Error('A drum sample was empty. Please refresh and try again.');
    for (let i = 0; i < pcm.length; i++) pcm[i] *= .85 / peak;
    return [name, pcm];
  }));
  return Object.fromEntries(entries);
}
