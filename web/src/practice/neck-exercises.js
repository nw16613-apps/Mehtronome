import {traversalScaleCells,diagonalStringRoutes} from '../guitar/neck-cells.js';
import {contentMaterial,contentSource} from './exercise-catalogue.js';
import {neckRouteBoard,traversalLabel,normalizeTraversal} from '../guitar/neck-traversal.js';
import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {progressionExerciseGroups} from './progression-exercises.js';
export function neckCellHarmony(harmony,view){
 if(contentMaterial(view)==='scale'||contentSource(view)!=='selectedChord')return harmony;
 const core=exerciseArpeggioHarmony(harmony,view.material);return {...core,scalePcs:core.chordPcs,scaleNames:core.tones,cellDegrees:core.intervals};
}
export function neckExerciseCells(harmony,view){const collection=neckCellHarmony(harmony,view);return (view.traversal==='diagonal'?diagonalStringRoutes:traversalScaleCells)(collection,view,collection.cellDegrees?2:3);}
export function neckRouteChoice(choices,view){
 const exact=choices.find(s=>s.degree===view.traversalCell);if(exact)return exact;
 const fret=Number(String(view.traversalCell||'').split(':')[1]);
 if(Number.isFinite(fret)&&choices.length)return [...choices].sort((a,b)=>Math.abs(a.board.firstFret-fret)-Math.abs(b.board.firstFret-fret))[0];
 return ['descending','down-up'].includes(view.motion)?choices.at(-1):choices[0];
}
/** Across-neck studies use the same cell/travel engine as position studies.
 * A continuous arpeggio is a traversal of core chord pitches, not its mode. */
export function neckExerciseGroups(harmonies,durations,view){
 view=normalizeTraversal({...view});
 const boards=harmonies.map(h=>neckRouteBoard(h,view));
 const blockTraversal=view.traversal==='diagonal',multiBlock=blockTraversal&&view.traversalShiftStrings<view.traversalStrings.split(',').length,alternateRouteGroups=multiBlock&&view.traversalPositionOrder==='alternate';
 const groups=progressionExerciseGroups(harmonies,durations||[2048],boards[0],{...view,blockTraversal,alternateRouteGroups,strictBlocks:multiBlock,study:view.study==='positional'?'positionalscale':view.study,once:!durations,
  regionBoardsFor:h=>{
   const choices=neckExerciseCells(h,view),selected=neckRouteChoice(choices,view);
   const regions=alternateRouteGroups?choices.flatMap((r,routeIndex)=>r.blocks.map(b=>({...b,routeIndex,start:r.degree===selected?.degree&&b.blockIndex===(['descending','down-up'].includes(view.motion)?r.blocks.length-1:0)}))):multiBlock?(selected?.blocks||[]):choices;
   return regions.map(s=>({...s.board,neckCell:{id:s.degree,label:s.label,notes:s.board.notes,harmony:h,...(multiBlock?{routeId:s.routeId,routeIndex:s.routeIndex,blockIndex:s.blockIndex,parentId:s.parentId,start:s.start}: {})},route:{...s.board.route,cell:true,traversalStrings:multiBlock?s.strings.join(','):s.board.route.traversalStrings}}));
  },
  positionPath:harmonies.map(()=>({neck:true})),boardFor:(_,i)=>boards[i],harmonyFor:h=>{
   if(view.study!=='positional')return h;
   const core=exerciseArpeggioHarmony(h,view.material);return {...core,scalePcs:core.chordPcs,scaleNames:core.tones};
  }});
 for(const [i,group]of groups.entries()){group.harmony=harmonies[i];group.annotation=traversalLabel(view);}
 return groups;
}
