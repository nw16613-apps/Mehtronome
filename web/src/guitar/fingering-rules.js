// A capability belongs to a fingering geometry, not to one exercise page.
export const isExactVoicing=kind=>['spread','drop2','drop3'].includes(kind);
export const isExactVoicingBoard=board=>isExactVoicing(board?.kind);
const chromatic=['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
export function voicingNeighbour(board,target,midi,name){
 const fret=target.fret+midi-target.midi;if(fret<1||fret>24)return null;
 if(midi===target.midi)return {...target};
 const pc=(midi%12+12)%12,tone=board.notes.find(n=>n.pc===pc);
 return {...target,midi,pc,fret,string:target.string,name:tone?.name||name,root:pc===board.rootPc,chord:!!tone,scaleIndex:-1,characteristic:false,chromaticDegree:tone?.chromaticDegree||chromatic[(pc-board.rootPc+12)%12]};
}
export function voicingExerciseBoard(board,notes){
 if(!isExactVoicingBoard(board)||!notes.length)return board;
 return {...board,start:Math.min(board.start,...notes.map(n=>n.fret)),end:Math.max(board.end,...notes.map(n=>n.fret))};
}
