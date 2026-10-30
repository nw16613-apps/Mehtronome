/** Use the device's native rate. Scheduled practice audio benefits more from
 * stable output buffering on phones than from interactive-input latency. */
export function audioContextOptions(userAgent='',coarsePointer=false){
 const mobile=coarsePointer||/Android|iPhone|iPad|iPod/i.test(userAgent);
 return {latencyHint:mobile?'playback':'balanced'};
}
