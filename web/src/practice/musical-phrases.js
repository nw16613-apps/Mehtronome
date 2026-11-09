import {fretboardFor} from '../guitar/fretboard.js';
import {progressionPositionPath} from '../guitar/position-path.js';

export const MUSICAL_STUDIES={
 motifspace:'Motif and space',
 changetargets:'Chord-change targets',
 questionanswer:'Question and answer',
};
const nearest=(notes,midi)=>notes.toSorted((a,b)=>Math.abs(a.midi-midi)-Math.abs(b.midi-midi)||a.fret-b.fret||a.string-b.string)[0];
function palette(board,harmony){
 const byMidi=new Map();
 for(const note of board.notes){
  if(note.fret===0||!harmony.scalePcs.includes(note.pc)&&!harmony.chordPcs.includes(note.pc))continue;
  const old=byMidi.get(note.midi);if(!old||note.fret<old.fret)byMidi.set(note.midi,note);
 }
 return [...byMidi.values()].sort((a,b)=>a.midi-b.midi);
}
function guideNotes(notes,harmony){
 const pcs=harmony.chordPcs.filter((_,i)=>/^[♭♯b#]*[37]$/.test(harmony.intervals?.[i]||''));
 const guides=notes.filter(n=>pcs.includes(n.pc));
 return guides.length?guides:notes.filter(n=>harmony.chordPcs.includes(n.pc));
}

/** Original short phrases, not transcriptions. Rhythm, targets and breathing
 * space are composed together; every pitch is chosen in the actual position. */
export function musicalPhraseGroups(harmonies,durations,anchor,options={}){
 const {study='motifspace',rhythm='eighths',motion='ascending',beats=4}=options;
 const division=rhythm==='triplets'?3:rhythm==='sixteenths'?4:2;
 const path=options.positionPath?.length===harmonies.length?options.positionPath:progressionPositionPath(harmonies,anchor);
 const boards=harmonies.map((h,i)=>fretboardFor(h,path[i].geometryShape));
 let previous=null,globalStart=0,phraseBar=0;
 return harmonies.map((harmony,slot)=>{
  const board=boards[slot],pool=palette(board,harmony),core=pool.filter(n=>harmony.chordPcs.includes(n.pc)),guides=guideNotes(pool,harmony);
  const notes=[],timing=[],duration=durations[slot];
  const nextSlot=slot+1<harmonies.length?slot+1:options.loop?0:slot;
  const nextGuides=guideNotes(palette(boards[nextSlot],harmonies[nextSlot]),harmonies[nextSlot]);
  for(let barStart=0;barStart<duration-1e-8;barStart+=beats,phraseBar++){
   const span=Math.min(beats,duration-barStart),answer=phraseBar%2===1;
   if(!core.length)continue;
   const reference=previous?.midi??(motion==='descending'?pool[Math.floor(pool.length*.7)]?.midi:pool[Math.floor(pool.length*.35)]?.midi)??60;
   const entry=nearest(study==='changetargets'?guides:core,reference),anchorIndex=pool.indexOf(entry);
   const direction=(motion==='descending'?-1:1)*(study==='questionanswer'&&answer?-1:1);
   // Values are in quarter-note beats, quantized to the chosen subdivision.
   // Triplets really use thirds of a beat; sixteenths add a short pickup.
   const unit=1/division;
   let shape=study==='changetargets'?[[0,1],[1.5,unit],[1.5+unit,unit],[2.5,1]]:
    study==='questionanswer'?(answer?[[.5,unit],[.5+unit,unit],[2,1]]:[[0,unit],[unit,unit],[1.5,1]]):
    answer?[[.5,unit],[.5+unit,unit],[2,1]]:[[.5,unit],[.5+unit,unit],[.5+2*unit,unit],[2.5,.5]];
   const quantize=value=>Math.round(value*division)/division;
   shape=shape.map(([at,length])=>[quantize(at),quantize(length)]).filter(([at])=>at<span-unit/2);
   // Even a one-beat chord has a held target followed by a short breath.
   if(shape.length<2)shape=[[0,Math.max(unit,span-unit)]];
   for(let i=0;i<shape.length;i++){
    const [at,length]=shape[i],last=i===shape.length-1;
    let note=pool[Math.max(0,Math.min(pool.length-1,anchorIndex+direction*[0,1,2,1][i%4]))]||entry;
    if(i===0)note=entry;
    if(last&&shape.length>1){
     if(study==='changetargets'&&nextGuides.length){
      // Current chord tone leads toward the incoming guide tone; it never
      // sounds the next harmony early, even when the scales are unrelated.
      note=core.toSorted((a,b)=>{
       const distance=n=>Math.min(...nextGuides.map(t=>Math.abs(t.midi-n.midi)))*2+Math.abs(n.midi-note.midi);
       return distance(a)-distance(b)||a.midi-b.midi;
      })[0];
     }else note=nearest(core,note.midi+direction*(answer?0:2));
    }
    const nextAt=shape[i+1]?.[0]??span;
    const held=Math.min(length,nextAt-at,span-at-(last&&span>=2?unit:0));
    if(held<=0)continue;
    const target=i===0||last,accent=study==='questionanswer'?i===0&&!answer:target;
    notes.push(note);timing.push({start:barStart+at,duration:held,target,accent,velocity:(answer ? .82 : 1)*(last ? .94 : i===0 ? 1 : .78)});
    previous=note;
   }
  }
  const result={slot,globalStart,harmony,board,position:path[slot],chord:harmony.name+harmony.suffix,rootName:harmony.name,
   notes,timing,targetIndices:timing.flatMap((e,i)=>e.target?[i]:[]),pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),
   materialCells:[MUSICAL_STUDIES[study]],annotation:MUSICAL_STUDIES[study],musicalPhrase:true,
   warning:notes.length?'':'No fretted chord tone is available in this position. Choose another position.'};
  globalStart+=notes.length;return result;
 });
}
