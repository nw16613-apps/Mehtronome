// Written spelling determines staff position, including B♯/C♭ across an
// octave boundary. MIDI alone determines the sound, not the written octave.
export function writtenPitch(note){
 const letter='CDEFGAB'.indexOf(note.name[0]);
 const alteration=[...note.name.slice(1)].reduce((sum,c)=>sum+(c==='♯'||c==='#'?1:c==='♭'||c==='b'?-1:c==='𝄪'?2:c==='𝄫'?-2:0),0);
 return {letter,alteration,octave:Math.floor((note.midi-alteration)/12)-1};
}
export function staffY(note){const {letter,octave}=writtenPitch(note);return 101-(octave*7+letter-30)*5-35;}
// No key signature is printed. Carry accidentals within a bar at the same
// written octave, and explicitly cancel a preceding sharp/flat with a natural.
export function notationAccidental(note,state){
 const {letter,alteration,octave}=writtenPitch(note),key=`${letter}:${octave}`,previous=state.get(key)||0;
 state.set(key,alteration);
 if(previous===alteration)return '';
 return alteration>0?'♯'.repeat(alteration):alteration<0?'♭'.repeat(-alteration):'♮';
}
