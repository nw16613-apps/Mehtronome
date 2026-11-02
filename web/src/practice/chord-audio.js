/** One visual attack schedules its voices together, or in low-to-high strum order. */
export function chordAudioEvents(events,start,tempo,strummed=false){
 return events.flatMap(e=>{const voices=e.note.voices||[e.note],length=e.duration*60/tempo;return voices.map((note,i)=>{const offset=strummed&&voices.length>1?i*.012:0;return {note,accent:e.accent,sustain:e.resolution||voices.length>1,at:start+e.start*60/tempo+offset,length:Math.max(.05,length-offset),gainScale:1/Math.sqrt(voices.length)};});});
}
