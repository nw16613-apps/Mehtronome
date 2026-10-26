import {voicingTones} from './voicings.js';

// Merge same-fret notes into a barre only when every string underneath it is
// sounding at that fret or higher. Muted/lower-fretted strings block the barre.
function fingersFor(notes) {
  const groups=[];
  for(const note of [...notes].sort((a,b)=>a.fret-b.fret||a.string-b.string)){
    const group=groups.find(group=>group[0].fret===note.fret &&
      Array.from({length:note.string-group[0].string+1},(_,i)=>group[0].string+i)
        .every(string=>notes.some(n=>n.string===string&&n.fret>=note.fret)));
    if(group)group.push(note);else groups.push([note]);
  }
  return {
    notes:notes.map(note=>({...note,finger:groups.findIndex(group=>group.includes(note))+1})),
    barres:groups.filter(group=>group.length>1).map(group=>({finger:groups.indexOf(group)+1,fret:group[0].fret,from:group[0].string,to:group.at(-1).string})),
  };
}

/** @typedef {{notes:Array<{string:number,fret:number,midi:number,pc:number,name:string,finger:number}>,barres:Array<{finger:number,fret:number,from:number,to:number}>,span:number,omitted:string[],intervals:string[],muted:number[]}} Grip */
/** @returns {Grip | null} */
export function recommendedGrip(harmony,board) {
  const pcs=[...new Set(harmony.chordPcs)];
  const indices=voicingTones(harmony);
  const preferred=new Set(indices.map(i=>harmony.chordPcs[i]));
  const intervals=harmony.midi.map(n=>n-harmony.midi[0]);
  const third=intervals.findIndex(n=>[3,4,5,2].includes(n));
  const seventh=intervals.findIndex(n=>[10,11].includes(n)||harmony.chordId==='dim7'&&n===9);
  const defining=intervals.map((n,i)=>[6,8,9].includes(n)?i:-1).filter(i=>i>=0);
  const required=[third,seventh,...defining].filter(i=>i>=0).map(i=>harmony.chordPcs[i]);
  const requestedBass=harmony.bassMidi==null?null:harmony.bassMidi%12;
  const options=Array.from({length:6},(_,string)=>board.notes.filter(n=>n.string===string&&n.chord));
  const desired=pcs.length===3?3:4;
  let best=null,bestScore=Infinity;
  const consider=notes=>{
    if(notes.length<3)return;
    if(requestedBass!==null&&[...notes].sort((a,b)=>a.midi-b.midi)[0].pc!==requestedBass)return;
    const included=new Set(notes.map(n=>n.pc));
    if(included.size<Math.min(3,pcs.length)||required.some(pc=>!included.has(pc)))return;
    const frets=notes.map(n=>n.fret),span=Math.max(...frets)-Math.min(...frets);
    if(span>3)return;
    const fingering=fingersFor(notes);
    const root=board.rootPc;
    const skipped=notes.at(-1).string-notes[0].string+1-notes.length;
    const missing=[...preferred].filter(pc=>!included.has(pc)).length;
    const score=(included.has(root)?0:120)+missing*30+Math.abs(notes.length-desired)*8+span*8+skipped*15
      +Math.max(...fingering.notes.map(n=>n.finger))*2+fingering.barres.length*2
      +(notes[0].pc===root?-6:0)-notes[0].string*.3;
    if(score>=bestScore)return;
    bestScore=score;
    best={...fingering,span,omitted:harmony.tones.filter((_,i)=>!included.has(harmony.chordPcs[i])),
      intervals:fingering.notes.map(n=>harmony.intervals[harmony.chordPcs.indexOf(n.pc)]),
      muted:Array.from({length:6},(_,i)=>i).filter(string=>!notes.some(n=>n.string===string))};
  };
  const search=(string,notes)=>{
    if(notes.length===4||string===6){consider(notes);return;}
    search(string+1,notes);
    for(const note of options[string]){
      if(notes.some(n=>Math.abs(n.fret-note.fret)>3))continue;
      search(string+1,[...notes,note]);
    }
  };
  search(0,[]);
  return best;
}
