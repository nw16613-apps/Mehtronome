import {voicingTones} from './voicings.js';
import {cagedPositionFor,TUNING} from './fretboard.js';

// Standard major-chord skeletons, low E to high E. Modal scale-box geometry
// can differ from the chord's framework, so always resolve the latter first.
export const CAGED_GRIP_SHAPES = {
  C:{frets:[null,3,2,0,1,0],rootString:1},
  A:{frets:[null,0,2,2,2,0],rootString:1},
  G:{frets:[3,2,0,0,0,3],rootString:0},
  E:{frets:[0,2,2,1,0,0],rootString:0},
  D:{frets:[null,null,0,2,3,2],rootString:2},
};

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

/** @typedef {{notes:Array<{string:number,fret:number,midi:number,pc:number,name:string,finger:number}>,barres:Array<{finger:number,fret:number,from:number,to:number}>,framework:string,span:number,omitted:string[],intervals:string[],muted:number[]}} Grip */
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
  const framework=cagedPositionFor(board)?.shape;
  const skeleton=CAGED_GRIP_SHAPES[framework];
  if(!skeleton)return null;
  const roots=Array.from({length:board.end-board.start+1},(_,i)=>({fret:board.start+i})).filter(n=>(TUNING[skeleton.rootString]+n.fret)%12===board.rootPc);
  // Each candidate is an alteration or a playable fragment of this shape,
  // never a different nearby voicing selected just for its small fret span.
  const candidates=TUNING.flatMap((open,string)=>Array.from({length:board.end-board.start+1},(_,i)=>{
    const fret=board.start+i,midi=open+fret,pc=midi%12,index=harmony.chordPcs.indexOf(pc);
    if(index<0)return null;
    return board.notes.find(n=>n.string===string&&n.fret===fret)||{
      string,fret,midi,pc,name:harmony.tones[index],root:pc===board.rootPc,chord:true,
      scale:harmony.scalePcs.includes(pc),scaleIndex:harmony.scalePcs.indexOf(pc),
      chromaticDegree:harmony.intervals[index],characteristic:false,
    };
  }).filter(Boolean));
  let targets=[];
  const desired=skeleton.frets.filter(f=>f!==null).length;
  let best=null,bestScore=Infinity;
  const consider=notes=>{
    if(notes.length<3)return;
    if(requestedBass!==null&&[...notes].sort((a,b)=>a.midi-b.midi)[0].pc!==requestedBass)return;
    if(!notes.some(n=>n.string===skeleton.rootString&&n.pc===board.rootPc))return;
    if(requestedBass===null&&notes[0].pc!==board.rootPc)return;
    const included=new Set(notes.map(n=>n.pc));
    if(included.size<Math.min(3,pcs.length)||required.some(pc=>!included.has(pc)))return;
    const frets=notes.map(n=>n.fret),span=Math.max(...frets)-Math.min(...frets);
    if(span>3)return;
    const fingering=fingersFor(notes);
    if(Math.max(...fingering.notes.map(n=>n.finger))>4)return;
    const skipped=notes.at(-1).string-notes[0].string+1-notes.length;
    const missing=[...preferred].filter(pc=>!included.has(pc)).length;
    const displacement=notes.reduce((sum,n)=>sum+Math.abs(n.fret-targets[n.string]),0);
    const score=missing*30+(desired-notes.length)*12+displacement*5+span*2+skipped*15
      +Math.max(...fingering.notes.map(n=>n.finger))*2+fingering.barres.length;

    if(score>=bestScore)return;
    bestScore=score;
    best={...fingering,framework,span,omitted:harmony.tones.filter((_,i)=>!included.has(harmony.chordPcs[i])),
      intervals:fingering.notes.map(n=>harmony.intervals[harmony.chordPcs.indexOf(n.pc)]),
      muted:Array.from({length:6},(_,i)=>i).filter(string=>!notes.some(n=>n.string===string))};
  };
  const search=(string,notes)=>{
    if(string===6){consider(notes);return;}
    search(string+1,notes);
    if(targets[string]===null)return;
    for(const note of candidates.filter(n=>n.string===string&&Math.abs(n.fret-targets[string])<=4)){
      if(notes.some(n=>Math.abs(n.fret-note.fret)>3))continue;
      search(string+1,[...notes,note]);
    }
  };
  for(const root of roots){
    const offset=root.fret-skeleton.frets[skeleton.rootString];
    targets=skeleton.frets.map(f=>f===null?null:f+offset);
    search(0,[]);
  }
  return best;
}
