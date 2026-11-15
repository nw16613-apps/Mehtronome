import {cagedStudy} from '../guitar/exercises.js';
import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {acrossNeck,canRouteNotes} from '../guitar/neck-traversal.js';
import {neckExerciseCells} from './neck-exercises.js';
import {perStringExerciseChoice} from './per-string-exercises.js';
import {contentMaterial,contentSource,contentFamily,changeContentFamily} from './exercise-catalogue.js';
import {recipePatterns} from './recipe-controls.js';
const contexts=new Map(),results=new Map();
const geometryKey=(h,v,b)=>JSON.stringify([h.name,h.suffix,h.scalePcs,h.chordPcs,contentMaterial(v),contentSource(v),v.fingering,v.inversion,v.fingeringFret,v.fingeringStringSet,v.spreadSource,v.scaleCollection,v.source,v.traversal,v.traversalStrings,v.traversalStart,v.traversalEnd,v.traversalShiftStrings,v.traversalPositionOrder,v.traversalLegacyCore,b?.notes.map(n=>[n.midi,n.string,n.fret])]);
function shapesFor(h,v,board){
 const key=geometryKey(h,v,board);if(contexts.has(key))return contexts.get(key);
 let shapes;
 if(acrossNeck(v))shapes=neckExerciseCells(h,v).map(s=>({parts:s.blocks||[s],id:s.degree}));
 else if(v.fingering&&v.fingering!=='caged'){const choice=perStringExerciseChoice(h,v);shapes=[{parts:[{board:choice.board,harmony:choice.entry.harmony}],id:'selected'}];}
 else shapes=[{parts:[{board:board||fretboardFor(h,'E')}],id:'selected'}];
 contexts.set(key,shapes);if(contexts.size>200)contexts.clear();return shapes;
}
export function exerciseCapability(h,view,board){
 const key=geometryKey(h,view,board)+JSON.stringify([view.study,view.arpeggioPattern,view.arpeggioSequence,view.sequenceOrder,view.sequenceAdvance,view.arpeggioRegister,view.arpeggioRoutine,view.arpeggioApproach,view.enclosurePattern,view.enclosureTarget,view.motion,view.pattern]);
 if(results.has(key))return results.get(key);
 const shapes=shapesFor(h,view,board),valid=shapes.filter(s=>s.parts.every(part=>{
  const b=part.board,physical=part.harmony||b.exerciseHarmony||h,v=part.harmony||b.exerciseHarmony?{...view,arpeggioSource:'selectedChord'}:view;
  if(!b.notes.length)return false;
  if(v.study==='positionalscale')return b.notes.some(n=>physical.scalePcs.includes(n.pc));
  if(v.study==='positional')return b.notes.some(n=>exerciseArpeggioHarmony(physical,v.material).chordPcs.includes(n.pc));
  const cells=cagedStudy(b,physical,v.study,v.material,v.motion,v);
  return cells.some(c=>c.notes?.length&&(!b.route||canRouteNotes(c.notes,b)));
 }));
 const available=(!(view.traversal==='diagonal'&&view.traversalShiftStrings<view.traversalStrings.split(',').length)||valid.length===shapes.length)&&valid.length>=(acrossNeck(view)&&view.traversalPositionOrder==='alternate'?2:1);
 const result={available,validShapes:valid.map(s=>s.id),reason:available?'':`${h.name}${h.suffix}: no complete ${contentFamily(view)==='continuous'?'traversal':'pattern'} fits the selected ${acrossNeck(view)?'string blocks and fret range':'fingering'}.${view.traversalPositionOrder==='alternate'?' Alternating positions requires two complete shapes.':''}`};
 results.set(key,result);if(results.size>3000)results.clear();return result;
}
export function exerciseChartCapability(chart,view){
 for(const [index,context]of chart.entries()){const fit=exerciseCapability(context.harmony,view,context.board);if(!fit.available)return {...fit,reason:(chart.length>1?'Chord slot '+(index+1)+': ':'')+fit.reason};}
 return {available:true,reason:''};
}
export function applyExerciseCapabilities(panel,h,view,board,generated=true,warning='',chart=null){
 const check=v=>exerciseChartCapability(chart||[{harmony:h,board}],v),family=panel.querySelector('#exercise-content-family');
 for(const option of family?.options||[]){const candidate=changeContentFamily({...view},option.value),patterns=recipePatterns(candidate);let capability=check(candidate);
  if(!capability.available)for(const p of patterns){capability=check({...candidate,[p.field]:p.value});if(capability.available)break;}
  option.disabled=!capability.available;option.title=capability.reason;
 }
 for(const [id,field]of [['exercise-scale-pattern','study'],['exercise-arpeggio-pattern','arpeggioPattern'],['exercise-arpeggio-sequence','arpeggioSequence'],['exercise-enclosure-pattern','enclosurePattern']]){
  const menu=panel.querySelector('#'+id);for(const option of menu?.options||[]){const capability=check({...view,[field]:option.value});option.disabled=!capability.available;option.title=capability.reason;}
 }
 const tested=check(view),current=generated?tested:{...tested,available:false,reason:warning||tested.reason||'No complete pattern fits this setup.'};if(!current.available){
  const score=panel.querySelector('.notation-scroll');if(score){score.replaceChildren();const notice=document.createElement('p');notice.className='exercise-empty-state';notice.setAttribute('role','status');notice.textContent=current.reason;score.append(notice);}
  for(const id of ['exercise-preview','exercise-export','exercise-print']){const button=panel.querySelector('#'+id);if(button){button.disabled=true;button.title=current.reason;}}
 }
 return current;
}

export function applyStudyRecipeCapabilities(panel,h,view,harmonies=[h]){
 const check=v=>exerciseChartCapability(harmonies.map(harmony=>({harmony})),v);
 for(const option of panel.querySelector('#study-recipe-family')?.options||[]){const candidate=changeContentFamily({...view},option.value);let fit=check(candidate);if(!fit.available)for(const p of recipePatterns(candidate)){fit=check({...candidate,[p.field]:p.value});if(fit.available)break;}option.disabled=!fit.available;option.title=fit.reason;}
 const patterns=recipePatterns(view);for(const option of panel.querySelector('#study-recipe-pattern')?.options||[]){const p=patterns.find(p=>p.value===option.value);if(p){const fit=check({...view,[p.field]:p.value});option.disabled=!fit.available;option.title=fit.reason;}}
 return check(view);
}
