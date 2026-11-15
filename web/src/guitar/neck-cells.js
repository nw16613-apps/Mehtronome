import {MODES} from '../audio/music.js';
import {TUNING,POSITIONS,fretboardFor,cagedPositionFor} from './fretboard.js';
import {neckRouteBoard,normalizeTraversal} from './neck-traversal.js';
/** Consecutive pitches on each selected string: three for scale cells, or
 * the requested chord-tone count. Never clip cells or skip pitches to fit. */
export function traversalScaleCells(harmony,options,notesPerString=3,geometryHarmony=harmony){
 if(options.fingering==='caged')return cagedTraversalCells(harmony,options,geometryHarmony);
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

/** Reuse the modal CAGED geometry shown on the fretboard. Translate whole
 * shapes by octaves, then restrict strings/material without clipping notes. */
export function cagedTraversalCells(harmony,options,geometryHarmony=harmony){
 const full=neckRouteBoard(geometryHarmony,options),strings=full.route.traversalStrings.split(',').map(Number),result=[];
 for(const position of POSITIONS){
  const source=fretboardFor(geometryHarmony,position.shape),identity=cagedPositionFor(source)||position;
  for(const octave of [-24,-12,0,12,24]){
   const notes=source.notes.filter(n=>strings.includes(n.string)&&harmony.scalePcs.includes(n.pc)).map(n=>({...n,fret:n.fret+octave,midi:n.midi+octave}));
   if(!notes.length||strings.some(string=>!notes.some(n=>n.string===string))||notes.some(n=>n.fret<full.start||n.fret>full.end))continue;
   const start=Math.min(...notes.map(n=>n.fret)),end=Math.max(...notes.map(n=>n.fret)),first=source.start+octave;
   result.push({degree:`caged:${position.shape}:${first}`,index:POSITIONS.indexOf(identity),tag:identity.numeral,label:`Position ${identity.numeral} · ${identity.shape} shape · frets ${start}–${end}`,board:{...source,route:full.route,notes,start,end,firstFret:first,rootFret:source.rootFret+octave}});
  }
 }
 return result.sort((a,b)=>a.board.firstFret-b.board.firstFret||a.index-b.index);
}

/** A diagonal route crosses successive string blocks, using the neighbouring
 * position for each block. Every block retains that position's real fingering. */
export function diagonalStringRoutes(harmony,options,notesPerString=3,geometryHarmony=harmony){
 const view=normalizeTraversal({...options}),strings=view.traversalStrings.split(',').map(Number),size=view.traversalShiftStrings;
 const positions=traversalScaleCells(harmony,view,notesPerString,geometryHarmony);
 if(size>=strings.length)return positions;
 const sets=[];for(let i=0;i<strings.length;i+=size)sets.push(strings.slice(i,i+size));
 const routes=[];
 for(let start=0;start+sets.length<=positions.length;start++){
  const first=positions[start],blocks=sets.map((set,index)=>{
   const parent=positions[start+index],notes=parent.board.notes.filter(n=>set.includes(n.string)),frets=notes.map(n=>n.fret),id=`${first.degree}/block:${index}`;
   return {degree:id,index,tag:String(index+1),blockIndex:index,parentId:parent.degree,routeId:first.degree,strings:set,label:`Block ${index+1} · ${set.map(s=>['low E','A','D','G','B','high E'][s]).join(' + ')} · frets ${Math.min(...frets)}–${Math.max(...frets)}`,board:{...parent.board,notes,start:Math.min(...frets),end:Math.max(...frets),firstFret:parent.board.firstFret}};
  });
  const notes=blocks.flatMap(b=>b.board.notes),frets=notes.map(n=>n.fret);
  routes.push({...first,blocks,label:`${view.fingering==='caged'?first.label.split(' · frets')[0]:'Degree '+first.tag+' · '+harmony.scaleNames[first.scaleDegree]} · ${blocks.length} blocks · frets ${Math.min(...frets)}–${Math.max(...frets)}`,board:{...first.board,notes,start:Math.min(...frets),end:Math.max(...frets)}});
 }
 return routes;
}
