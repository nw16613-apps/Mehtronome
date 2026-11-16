import {POSITIONS,fretboardFor,cagedPositionFor} from './fretboard.js';
import {perStringCatalogue} from './per-string.js';
import {MODES} from '../audio/music.js';
/** Parent geometry always comes from the complete mode, never the material source. */
export function parentScalePositions(harmony,kind='caged',preferredFret=5){
 const h=harmony.geometryHarmony||harmony;
 if(kind==='three')return perStringCatalogue(h,'three').map(entry=>{
  const board=entry.choices.reduce((best,b)=>!best||Math.abs(b.firstFret-preferredFret)<Math.abs(best.firstFret-preferredFret)?b:best,null);
  return {id:String(entry.degree),index:entry.degree,label:`Starting degree ${MODES[h.mode].degrees[entry.degree]} · ${h.scaleNames[entry.degree]}`,board};
 }).filter(p=>p.board).sort((a,b)=>a.board.start-b.board.start||a.index-b.index);
 return POSITIONS.map(p=>{const board=fretboardFor(h,p.shape),identity=cagedPositionFor(board);return {id:identity.numeral,index:POSITIONS.findIndex(p=>p.numeral===identity.numeral),label:`Position ${identity.numeral} · ${identity.shape} shape`,board};}).sort((a,b)=>a.board.start-b.board.start||a.index-b.index);
}
export const usesParentPosition=view=>['caged','three'].includes(view.fingering);
