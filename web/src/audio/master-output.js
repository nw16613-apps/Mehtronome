// Device listening level is separate from the instrument mix and transport fade.
// Fixed make-up gain brings the calibrated full band into normal app territory.
export const MASTER_VOLUME_KEY='mehtronome-master-volume-v1';
export const DEFAULT_MASTER_VOLUME=100;
export const OUTPUT_BOOST_DB=17;
// Native compressors include make-up gain; reserve output headroom after it.
export const OUTPUT_HEADROOM_GAIN=10**(-4/20);
export const OUTPUT_LIMITER={threshold:-3,knee:0,ratio:20,attack:0,release:.12};
export function masterVolumePercent(value){
 if(value===null||value===undefined||value==='')return DEFAULT_MASTER_VOLUME;
 const percent=Number(value);return Number.isFinite(percent)?Math.max(0,Math.min(100,percent)):DEFAULT_MASTER_VOLUME;
}
export function createMasterOutput(context,percent=DEFAULT_MASTER_VOLUME){
 const input=context.createGain(),limiter=context.createDynamicsCompressor(),volume=context.createGain();
 input.gain.value=10**(OUTPUT_BOOST_DB/20);
 for(const [parameter,value]of Object.entries(OUTPUT_LIMITER))limiter[parameter].value=value;
 volume.gain.value=masterVolumePercent(percent)/100*OUTPUT_HEADROOM_GAIN;
 input.connect(limiter).connect(volume).connect(context.destination);
 return {input,limiter,volume,setVolume(percent){volume.gain.setTargetAtTime(masterVolumePercent(percent)/100*OUTPUT_HEADROOM_GAIN,context.currentTime,.02);}};
}
