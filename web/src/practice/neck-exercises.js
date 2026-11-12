import {neckRouteBoard,traversalLabel} from '../guitar/neck-traversal.js';
import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {progressionExerciseGroups} from './progression-exercises.js';
/** Across-neck studies use the same cell/travel engine as position studies.
 * A continuous arpeggio is a traversal of core chord pitches, not its mode. */
export function neckExerciseGroups(harmonies,durations,view){
 const boards=harmonies.map(h=>neckRouteBoard(h,view));
 const groups=progressionExerciseGroups(harmonies,durations||[2048],boards[0],{...view,study:view.study==='positional'?'positionalscale':view.study,once:!durations,
  positionPath:harmonies.map(()=>({neck:true})),boardFor:(_,i)=>boards[i],harmonyFor:h=>{
   if(view.study!=='positional')return h;
   const core=exerciseArpeggioHarmony(h,view.material);return {...core,scalePcs:core.chordPcs,scaleNames:core.tones};
  }});
 for(const [i,group]of groups.entries()){group.harmony=harmonies[i];group.annotation=traversalLabel(view);}
 return groups;
}
