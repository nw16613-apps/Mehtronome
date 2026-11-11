import {SCALE_SEQUENCES,SCALE_SEQUENCE_FAMILY_LABELS} from '../guitar/scale-sequences.js';
export const SCALE_SEQUENCE_FAMILIES=Object.fromEntries(Object.keys(SCALE_SEQUENCE_FAMILY_LABELS).map(family=>[family,Object.entries(SCALE_SEQUENCES).filter(([,d])=>d.family===family).map(([id,d])=>[id,d.label])]));
export const SCALE_SEQUENCE_STUDIES=new Set(Object.values(SCALE_SEQUENCE_FAMILIES).flat().flatMap(([id])=>[id,'arpseq_'+id]));
export const scaleSequenceFamily=study=>Object.entries(SCALE_SEQUENCE_FAMILIES).find(([,items])=>items.some(([id])=>id===study.replace(/^arpseq_/, '')))?.[0]||'groups';
export const scaleSequenceLabel=study=>Object.values(SCALE_SEQUENCE_FAMILIES).flat().find(([id])=>id===study.replace(/^arpseq_/, ''))?.[1]||'';
export function libraryExerciseValue(study){
 if(study.startsWith('arpseq_'))return 'arpeggioSequences';
 return ['positional','positionalscale'].includes(study)?'continuous':SCALE_SEQUENCE_STUDIES.has(study)?'scaleSequences':study.startsWith('enclosures')?'enclosureLibrary':study;
}
export function resolveLibraryExercise(value,previous=''){
 if(value==='arpeggioSequences')return previous.startsWith('arpseq_')?previous:'arpseq_groups3';
 if(value==='continuous')return ['positional','positionalscale'].includes(previous)?previous:'positionalscale';
 if(value==='scaleSequences')return SCALE_SEQUENCE_STUDIES.has(previous)&&!previous.startsWith('arpseq_')?previous:'groups3';
 if(value==='enclosureLibrary')return previous.startsWith('enclosures')?previous:'enclosures4';
 return value;
}
