import {usesPentatonicCollection} from '../guitar/scale-collection.js';
import {isScaleFingering,isPentatonicFingering} from '../guitar/fingering-types.js';
import {isExactVoicing} from '../guitar/fingering-rules.js';
import {contentFamily,contentFamilies} from './exercise-catalogue.js';
import {SCALE_SEQUENCES} from '../guitar/scale-sequences.js';
// Changing a shape keeps the selected pattern; changing its note material only
// switches between scale/chord versions when the old material cannot fit.
export function linkExerciseFingering(view,selection,harmony){
 if(selection?.kind==='three'&&usesPentatonicCollection(view)&&view.parentScaleFingering!=='three')selection={...selection,kind:'caged'};
 if(['horizontal','diagonal','alternate'].includes(view.traversal)){if(selection)view.fingering=selection.kind;view.exactFingering=false;return view;}
 if(!selection)return view;
 const changed=view.fingering!==selection.kind,kind=selection.kind,scale=isScaleFingering(kind);
 Object.assign(view,{linkedFingering:true,fingering:kind});
 if(kind==='caged'){view.exactFingering=false;return view;}
 Object.assign(view,{inversion:selection.inversion??0,fingeringFret:selection.fret??5,fingeringStringSet:selection.stringSet??0,spreadSource:selection.spreadSource||'chord'});
 if(changed){
  view.exactFingering=false;
  if(!scale&&['positional','positionalscale'].includes(view.study))view.study='positional';
  else if(!scale&&SCALE_SEQUENCES[view.study.replace(/^arpseq_/,'')])view.study='arpseq_'+view.study.replace(/^arpseq_/,'');
  else if(!scale&&['pentatonic','triadpairs','guidetones','connections'].includes(view.study))view.study='positional';
  if(!scale){
   view.material=kind==='spread'?'triad':isExactVoicing(kind)?'seventh':view.material==='triad'?'triad':'seventh';
   if(!['oneTwo','twoOne'].includes(kind)||!view.arpeggioSource)view.arpeggioSource='selectedChord';
   // A layout change preserves the selected triad/seventh material.
  }
 }
 if(scale)view.exactFingering=false;if(isPentatonicFingering(kind))view.scaleCollection='pentatonic';
 if(kind==='spread'){view.material='triad';if(view.enclosureTarget==='3')view.enclosureTarget='all';}
 if(isExactVoicing(kind)){view.chordFingering=kind;
  view.exactFingering=false;view.arpeggioRegister='up';view.arpeggioSequence='stepwise';
  if(view.arpeggioRoutine==='connected')view.arpeggioRoutine='repeat';
  if(!contentFamilies(view.material,'selectedChord',view).some(([id])=>id===contentFamily(view)))view.study='positional';
 }
 if(!scale){if(view.study==='positionalscale')view.study='positional';if(!['oneTwo','twoOne'].includes(kind)||!view.arpeggioSource)view.arpeggioSource='selectedChord';if(SCALE_SEQUENCES[view.study])view.study='arpseq_'+view.study;}
 return view;
}
