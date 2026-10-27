/** Fixed-size peak summary; keep no decoded PCM after rendering. */
export function waveformPeaks(samples,bins=160){
 const count=Math.max(1,Math.min(1000,Math.floor(bins))),peaks=Array(count).fill(0);
 for(let i=0;i<samples.length;i++){const slot=Math.min(count-1,Math.floor(i*count/samples.length)),value=Math.abs(samples[i]);if(Number.isFinite(value))peaks[slot]=Math.max(peaks[slot],Math.min(1,value));}return peaks;
}
export function trimAtFraction(fraction,duration){return Math.round(Math.max(0,Math.min(1,fraction))*Math.max(0,duration)*1000);}
