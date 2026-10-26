export const RECALL_TONES={third:['3','♭3'],seventh:['7','♭7','♭♭7'],root:['1'],fifth:['5','♭5','♯5']};
/** Use actual chord intervals and the visible positions, not scale-degree assumptions. */
export function chordToneQuestion(harmony,board,kind='third'){
 const index=harmony.intervals.findIndex(interval=>(RECALL_TONES[kind]||RECALL_TONES.third).includes(interval));
 const chord=harmony.name+harmony.suffix;
 if(index<0)return {unavailable:`${chord} has no ${kind} in its written formula. Choose another tone.`};
 const pc=harmony.chordPcs[index],answers=board.notes.filter(note=>note.pc===pc);
 if(!answers.length)return {unavailable:`The ${harmony.intervals[index]} of ${chord} is unavailable in this displayed position. Choose another tone or position.`};
 return {pc,interval:harmony.intervals[index],name:harmony.tones[index],chord,answers,prompt:`Find the ${harmony.intervals[index]} of ${chord}. Choose any matching note in this position.`};
}
