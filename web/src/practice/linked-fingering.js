import {isExactVoicing} from '../guitar/fingering-rules.js';
import {contentFamily,contentFamilies} from './exercise-catalogue.js';
import {SCALE_SEQUENCES} from '../guitar/scale-sequences.js';
// Changing a shape keeps the selected pattern; changing its note material only
// switches between scale/chord versions when the old material cannot fit.
export function linkExerciseFingering(view,selection,harmony){
 if(['horizontal','diagonal','alternate'].includes(view.traversal)){view.fingering='caged';view.exactFingering=false;return view;}
 if(!selection)return view;
 const changed=view.fingering!==selection.kind,kind=selection.kind;
 Object.assign(view,{linkedFingering:true,fingering:kind});
 if(kind==='caged'){view.exactFingering=false;return view;}
 Object.assign(view,{inversion:selection.inversion??0,fingeringFret:selection.fret??5,fingeringStringSet:selection.stringSet??0,spreadSource:selection.spreadSource||'chord'});
 if(changed){
  view.exactFingering=false;
  if(['positional','positionalscale'].includes(view.study))view.study=kind==='three'?'positionalscale':'positional';
  else if(SCALE_SEQUENCES[view.study.replace(/^arpseq_/,'')])view.study=(kind==='three'?'':'arpseq_')+view.study.replace(/^arpseq_/,'');
  else if(kind!=='three'&&['pentatonic','triadpairs','guidetones','connections'].includes(view.study))view.study='positional';
  if(kind!=='three'){
   view.material=kind==='spread'||selection.spreadSource!=='mode'&&harmony.chordPcs.length<=3?'triad':'seventh';
   view.arpeggioSource='selectedChord';
   view.exactFingering=view.study==='positional'&&selection.spreadSource!=='mode'&&kind!=='spread'&&harmony.chordPcs.length>4;
  }
 }
 if(kind==='three')view.exactFingering=false;
 if(kind==='spread'){view.material='triad';if(view.enclosureTarget==='3')view.enclosureTarget='all';}
 if(isExactVoicing(kind)){
  view.exactFingering=false;view.arpeggioRegister='up';view.arpeggioSequence='stepwise';
  if(view.arpeggioRoutine==='connected')view.arpeggioRoutine='repeat';
  if(!contentFamilies(view.material,'selectedChord',view).some(([id])=>id===contentFamily(view)))view.study='positional';
 }
 if(!['caged','three'].includes(kind)){if(view.study==='positionalscale')view.study='positional';view.arpeggioSource='selectedChord';if(SCALE_SEQUENCES[view.study])view.study='arpseq_'+view.study;}
 return view;
}
