// Swing belongs to the backing arrangement, independently of metronome swing.
export function backingSubdivision(phase,groove){
 return groove==='swing'||groove==='shuffle'?(phase>=5/6?3:phase>=2/3?2:phase>=1/3?1:0):Math.min(3,Math.floor(phase*4));
}
