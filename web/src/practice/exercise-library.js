export const SCALE_SEQUENCE_FAMILIES={intervals:[['thirds','Thirds · 1–3'],['fourths','Fourths · 1–4'],['sixths','Sixths · 1–6']],groups:[['groups3','Groups of three'],['groups4','Groups of four']],digital:[['digital1324','1–3–2–4'],['cells','1–2–3–5']]};
export const SCALE_SEQUENCE_STUDIES=new Set(Object.values(SCALE_SEQUENCE_FAMILIES).flat().map(([id])=>id));
export const scaleSequenceFamily=study=>Object.entries(SCALE_SEQUENCE_FAMILIES).find(([,items])=>items.some(([id])=>id===study))?.[0]||'groups';
export const scaleSequenceLabel=study=>Object.values(SCALE_SEQUENCE_FAMILIES).flat().find(([id])=>id===study)?.[1]||'';
export function libraryExerciseValue(study){
 return ['positional','positionalscale'].includes(study)?'continuous':SCALE_SEQUENCE_STUDIES.has(study)?'scaleSequences':study.startsWith('enclosures')?'enclosureLibrary':study;
}
export function resolveLibraryExercise(value,previous=''){
 if(value==='continuous')return ['positional','positionalscale'].includes(previous)?previous:'positionalscale';
 if(value==='scaleSequences')return SCALE_SEQUENCE_STUDIES.has(previous)?previous:'groups3';
 if(value==='enclosureLibrary')return previous.startsWith('enclosures')?previous:'enclosures4';
 return value;
}
