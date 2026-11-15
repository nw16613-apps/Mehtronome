import {traversalScaleCells,diagonalStringRoutes} from '../guitar/neck-cells.js';
import {contentMaterial,contentSource} from './exercise-catalogue.js';
import {neckRouteBoard,traversalLabel,normalizeTraversal} from '../guitar/neck-traversal.js';
import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {progressionExerciseGroups} from './progression-exercises.js';
export function neckCellHarmony(harmony,view){
 if(contentMaterial(view)==='scale'||contentSource(view)!=='selectedChord')return harmony;
 const core=exerciseArpeggioHarmony(harmony,view.material);return {...core,scalePcs:core.chordPcs,scaleNames:core.tones,cellDegrees:core.intervals};
}
export function neckExerciseCells(harmony,view){if(view.fingering&&!['caged','three'].includes(view.fingering))return [];const collection=neckCellHarmony(harmony,view),routes=view.traversal==='diagonal'?diagonalStringRoutes:traversalScaleCells;
 if(view.fingering==='three'&&collection.cellDegrees&&!view.traversalLegacyCore){
  const subset=board=>({...board,notes:board.notes.filter(n=>collection.scalePcs.includes(n.pc))});
  return routes(harmony,view,3,harmony).map(r=>({...r,board:subset(r.board),...(r.blocks?{blocks:r.blocks.map(b=>({...b,board:subset(b.board)}))}:{})})).filter(r=>r.board.notes.length&&(!r.blocks||r.blocks.every(b=>b.board.notes.length)));
 }
 return routes(collection,view,collection.cellDegrees?2:3,harmony);}
export function neckRouteChoice(choices,view){
 const exact=choices.find(s=>s.degree===view.traversalCell);if(exact)return exact;
 const fret=Number(String(view.traversalCell||'').split(':').at(-1));
 if(Number.isFinite(fret)&&choices.length)return [...choices].sort((a,b)=>Math.abs(a.board.firstFret-fret)-Math.abs(b.board.firstFret-fret))[0];
 return ['descending','down-up'].includes(view.motion)?choices.at(-1):choices[0];
}
/** Across-neck studies use the same cell/travel engine as position studies.
 * A continuous arpeggio is a traversal of core chord pitches, not its mode. */
export function neckExerciseGroups(harmonies,durations,view){
 view=normalizeTraversal({...view});
 const boards=harmonies.map(h=>neckRouteBoard(h,view));
 const multiBlock=view.traversal==='diagonal'&&view.traversalShiftStrings<view.traversalStrings.split(',').length,blockTraversal=multiBlock;
 const groups=progressionExerciseGroups(harmonies,durations||[2048],boards[0],{...view,traversal:multiBlock?'diagonal':'horizontal',blockTraversal,routeGroups:multiBlock,strictBlocks:multiBlock,study:view.study==='positional'?'positionalscale':view.study,once:!durations,
  regionBoardsFor:h=>{
   const choices=neckExerciseCells(h,view),selected=neckRouteChoice(choices,view);
   const regions=multiBlock?choices.flatMap((r,routeIndex)=>r.blocks.map(b=>({...b,routeIndex,start:r.degree===selected?.degree&&b.blockIndex===(['descending','down-up'].includes(view.motion)?r.blocks.length-1:0)}))):choices;
   return regions.map(s=>({...s.board,neckCell:{id:s.degree,label:s.label,notes:s.board.notes,harmony:h,...(multiBlock?{routeId:s.routeId,routeIndex:s.routeIndex,blockIndex:s.blockIndex,parentId:s.parentId,start:s.start}: {})},route:{...s.board.route,cell:true,traversalStrings:multiBlock?s.strings.join(','):s.board.route.traversalStrings}}));
  },
  positionPath:harmonies.map(()=>({neck:true})),boardFor:(_,i)=>boards[i],harmonyFor:h=>{
   if(view.study!=='positional')return h;
   const core=exerciseArpeggioHarmony(h,view.material);return {...core,scalePcs:core.chordPcs,scaleNames:core.tones};
  }});
 for(const [i,group]of groups.entries()){group.harmony=harmonies[i];group.annotation=traversalLabel(view);if(!['caged','three',undefined].includes(view.fingering))group.warning='Across-neck traversal supports CAGED and 3NPS fingerings. Choose one of these fingerings or Selected position.';}
 return groups;
}
