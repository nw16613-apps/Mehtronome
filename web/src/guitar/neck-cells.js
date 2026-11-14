import {MODES} from '../audio/music.js';
import {TUNING} from './fretboard.js';
import {neckRouteBoard,normalizeTraversal} from './neck-traversal.js';
/** Consecutive pitches on each selected string: three for scale cells, or
 * the requested chord-tone count. Never clip cells or skip pitches to fit. */
export function traversalScaleCells(harmony,options,notesPerString=3){
 const board=neckRouteBoard(harmony,options),strings=board.route.traversalStrings.split(',').map(Number),byPosition=new Map(board.notes.filter(n=>n.scale).map(n=>[`${n.string}:${n.fret}`,n]));
 const shapes=[];
 for(let first=board.start;first<=board.end;first++){
  const startMidi=TUNING[strings[0]]+first,degree=harmony.scalePcs.indexOf(startMidi%12);if(degree<0)continue;
  const notes=[];let previous=startMidi-1,valid=true;
  for(const string of strings){
   for(let i=0;i<notesPerString;i++){
    let midi=previous+1;while(!harmony.scalePcs.includes(midi%12))midi++;
    const note=byPosition.get(`${string}:${midi-TUNING[string]}`);
    if(!note){valid=false;break;}notes.push(note);previous=midi;
   }
   if(!valid)break;
  }
  if(!valid)continue;
  const frets=notes.map(n=>n.fret),tag=(harmony.cellDegrees||MODES[harmony.mode]?.degrees)?.[degree]||String(degree+1),start=Math.min(...frets),end=Math.max(...frets);
  shapes.push({degree:`${degree}:${first}`,scaleDegree:degree,index:degree,tag,label:`Degree ${tag} · ${harmony.scaleNames[degree]} · ${notes.length}-note cell · frets ${start}–${end}`,board:{...board,notes,start,end,firstFret:first}});
 }
 return shapes;
}

/** A diagonal route crosses successive string blocks, using the neighbouring
 * position for each block. Every block retains that position's real fingering. */
export function diagonalStringRoutes(harmony,options,notesPerString=3){
 const view=normalizeTraversal({...options}),strings=view.traversalStrings.split(',').map(Number),size=view.traversalShiftStrings;
 const positions=traversalScaleCells(harmony,view,notesPerString);
 if(size>=strings.length)return positions;
 const sets=[];for(let i=0;i<strings.length;i+=size)sets.push(strings.slice(i,i+size));
 const routes=[];
 for(let start=0;start+sets.length<=positions.length;start++){
  const first=positions[start],blocks=sets.map((set,index)=>{
   const parent=positions[start+index],notes=parent.board.notes.filter(n=>set.includes(n.string)),frets=notes.map(n=>n.fret),id=`${first.degree}/block:${index}`;
   return {degree:id,index,tag:String(index+1),blockIndex:index,parentId:parent.degree,routeId:first.degree,strings:set,label:`Block ${index+1} · ${set.map(s=>['low E','A','D','G','B','high E'][s]).join(' + ')} · frets ${Math.min(...frets)}–${Math.max(...frets)}`,board:{...parent.board,notes,start:Math.min(...frets),end:Math.max(...frets),firstFret:parent.board.firstFret}};
  });
  const notes=blocks.flatMap(b=>b.board.notes),frets=notes.map(n=>n.fret);
  routes.push({...first,blocks,label:`Degree ${first.tag} · ${harmony.scaleNames[first.scaleDegree]} · ${blocks.length} blocks · frets ${Math.min(...frets)}–${Math.max(...frets)}`,board:{...first.board,notes,start:Math.min(...frets),end:Math.max(...frets)}});
 }
 return routes;
}
