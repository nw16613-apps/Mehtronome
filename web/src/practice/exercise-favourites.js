import {hasRouteTurnOptions} from '../guitar/neck-traversal.js';
import {isExactVoicing} from '../guitar/fingering-rules.js';
import {SCALE_SEQUENCES,hasExerciseCellOrder} from '../guitar/scale-sequences.js';
import {normalizeExerciseOptions,exerciseMenuOptions} from './exercise-options.js';
// A favourite identifies a musical/physical recipe, not tempo, page zoom or
// the chart currently playing. Canonical aliases must share one bookmark.
export function exerciseFavouriteKey(snapshot){
 const v=normalizeExerciseOptions({...snapshot}),result={study:v.study,motion:v.motion,rhythm:v.rhythm};
 if(v.traversal!=='position')for(const field of ['traversal','traversalStrings','traversalStart','traversalEnd',...(v.traversalCell!=='first'?['traversalCell']:[])])result[field]=v[field];
 if(v.traversal!=='position'&&v.traversalPositionOrder==='alternate')result.traversalPositionOrder='alternate';
 if(hasRouteTurnOptions(v))result.traversalTurn=v.traversalTurn;
 if(exerciseMenuOptions(v.study).material&&!v.exactFingering)result.material=v.material;
 if(/^(arpseq_)?scaleperm_123$/.test(v.study))result.study=v.study.replace('scaleperm_123','groups3');
 if(/^(arpseq_)?scaleperm_1234$/.test(v.study))result.study=v.study.replace('scaleperm_1234','groups4');
 if(!['positional','positionalscale'].includes(v.study)&&v.entryTone!=='default')result.entryTone=v.entryTone;
 if(v.exactFingering)result.exactFingering=true;
 if(v.linkedFingering&&isExactVoicing(v.fingering))result.material=v.material;
 const fields=v.study==='harmonized'?['arpeggioSequence',...(hasExerciseCellOrder(v)?['sequenceOrder']:[]),'sequenceAdvance','arpeggioSource','arpeggioPattern','arpeggioRegister','arpeggioRoutine','arpeggioApproach']:
 SCALE_SEQUENCES[v.study.replace(/^arpseq_/, '')]?['sequenceAdvance','sequenceOrder']:
 v.study.startsWith('enclosures')?['enclosureTarget','enclosurePattern']:['doubleapproach','chromaticneighbors'].includes(v.study)?['sequenceOrder']:
 ['positional','positionalscale'].includes(v.study)?['fingering',...(v.fingering!=='caged'?['inversion','fingeringFret','fingeringStringSet',...(v.fingering!=='three'?['spreadSource']:[])]:[]),'startTone','patternStartRoute']:
 v.study==='pentatonic'?['source','pattern',...(hasExerciseCellOrder(v)?['sequenceOrder']:[])]:v.study==='triadpairs'?['source']:[];
 if(v.linkedFingering&&v.fingering!=='caged')for(const field of ['fingering','inversion','fingeringFret','fingeringStringSet',...(v.fingering!=='three'?['spreadSource']:[])])if(v[field]!==undefined)result[field]=v[field];
 for(const field of fields)if(v[field]!==undefined)result[field]=v[field];
 return JSON.stringify(result);
}
export function readExerciseFavourites(raw){
 let source;try{source=JSON.parse(raw||'[]');}catch{return [];}
 if(!Array.isArray(source))return [];
 const seen=new Set();return source.filter(v=>v&&typeof v==='object'&&typeof v.study==='string').map(v=>normalizeExerciseOptions({...v})).filter(v=>{const key=exerciseFavouriteKey(v);if(seen.has(key))return false;seen.add(key);return true;});
}
export function toggleExerciseFavourite(items,snapshot){
 const key=exerciseFavouriteKey(snapshot),exists=items.some(v=>exerciseFavouriteKey(v)===key);
 return exists?items.filter(v=>exerciseFavouriteKey(v)!==key):[...items,normalizeExerciseOptions({...snapshot})];
}
