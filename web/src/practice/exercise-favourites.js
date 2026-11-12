import {SCALE_SEQUENCES} from '../guitar/scale-sequences.js';
import {normalizeExerciseOptions,exerciseMenuOptions} from './exercise-options.js';
// A favourite identifies a musical/physical recipe, not tempo, page zoom or
// the chart currently playing. Canonical aliases must share one bookmark.
export function exerciseFavouriteKey(snapshot){
 const v=normalizeExerciseOptions({...snapshot}),result={study:v.study,motion:v.motion,rhythm:v.rhythm};
 if(exerciseMenuOptions(v.study).material)result.material=v.material;
 if(/^(arpseq_)?scaleperm_123$/.test(v.study))result.study=v.study.replace('scaleperm_123','groups3');
 if(/^(arpseq_)?scaleperm_1234$/.test(v.study))result.study=v.study.replace('scaleperm_1234','groups4');
 const fields=v.study==='harmonized'?['arpeggioSequence','sequenceAdvance','arpeggioSource','arpeggioPattern','arpeggioRegister','arpeggioRoutine','arpeggioApproach']:
 SCALE_SEQUENCES[v.study.replace(/^arpseq_/, '')]?['sequenceAdvance','sequenceOrder']:
 v.study.startsWith('enclosures')?['enclosureTarget','enclosurePattern']:
 ['positional','positionalscale'].includes(v.study)?['fingering',...(v.fingering!=='caged'?['inversion','fingeringFret','fingeringStringSet']:[]),'startTone','patternStartRoute']:
 v.study==='pentatonic'?['source','pattern']:v.study==='triadpairs'?['source']:[];
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
