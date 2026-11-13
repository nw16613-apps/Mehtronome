import {MODES} from '../audio/music.js';
import {TUNING} from './fretboard.js';
import {neckRouteBoard} from './neck-traversal.js';
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
