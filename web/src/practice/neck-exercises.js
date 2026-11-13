import {traversalScaleCells} from '../guitar/neck-cells.js';
import {contentMaterial,contentSource} from './exercise-catalogue.js';
import {neckRouteBoard,traversalLabel,normalizeTraversal} from '../guitar/neck-traversal.js';
import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {progressionExerciseGroups} from './progression-exercises.js';
export function neckCellHarmony(harmony,view){
 if(contentMaterial(view)==='scale'||contentSource(view)!=='selectedChord')return harmony;
 const core=exerciseArpeggioHarmony(harmony,view.material);return {...core,scalePcs:core.chordPcs,scaleNames:core.tones,cellDegrees:core.intervals};
}
export function neckExerciseCells(harmony,view){const collection=neckCellHarmony(harmony,view);return traversalScaleCells(collection,view,collection.cellDegrees?2:3);}
/** Across-neck studies use the same cell/travel engine as position studies.
 * A continuous arpeggio is a traversal of core chord pitches, not its mode. */
export function neckExerciseGroups(harmonies,durations,view){
 view=normalizeTraversal({...view});
 const boards=harmonies.map(h=>neckRouteBoard(h,view));
 const groups=progressionExerciseGroups(harmonies,durations||[2048],boards[0],{...view,study:view.study==='positional'?'positionalscale':view.study,once:!durations,
  regionBoardsFor:h=>neckExerciseCells(h,view).map(s=>({...s.board,neckCell:{id:s.degree,label:s.label,notes:s.board.notes},route:{...s.board.route,cell:true}})),
  positionPath:harmonies.map(()=>({neck:true})),boardFor:(_,i)=>boards[i],harmonyFor:h=>{
   if(view.study!=='positional')return h;
   const core=exerciseArpeggioHarmony(h,view.material);return {...core,scalePcs:core.chordPcs,scaleNames:core.tones};
  }});
 for(const [i,group]of groups.entries()){group.harmony=harmonies[i];group.annotation=traversalLabel(view);}
 return groups;
}
