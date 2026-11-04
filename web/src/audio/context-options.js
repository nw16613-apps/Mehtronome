/** Phone playback uses a bounded DSP rate and output buffering. The recorded
 * banks are 32 kHz; desktop playback keeps the device-native rate. */
export function audioContextOptions(userAgent='',coarsePointer=false){
 const mobile=coarsePointer||/Android|iPhone|iPad|iPod/i.test(userAgent);
 return mobile?{latencyHint:'playback',sampleRate:32000}:{latencyHint:'balanced'};
}

// Some devices restrict context rates; retain playback buffering if 32 kHz is rejected.
export function createPlaybackContext(Context,userAgent='',coarsePointer=false){
 const options=audioContextOptions(userAgent,coarsePointer);
 try{return new Context(options);}catch(error){if(!options.sampleRate)throw error;return new Context({latencyHint:'playback'});}
}
