import {VOICING_FAMILIES,CHORD_MATERIALS,STRING_SETS,chordMaterial} from '../guitar/chord-library.js';
import {CHORD_STUDIES} from './chord-studies.js';
import {escapeChordText as esc} from './chord-symbol.js';
export const CHORD_DEFAULTS={family:'caged',material:'seventh',strings:'auto',inversion:'all',region:'neck',construction:'thirds',movement:'step',rhythm:'held',attack:'together'};
export function studyCategory(study){return study?.startsWith('chord:')?'chords':'scales-arpeggios';}
export function categoryTabs(active,workspace){return `<div class="material-tabs" role="tablist" aria-label="${workspace==='guitar'?'Fretboard':'Exercise'} material">${[['scales-arpeggios','Scales & arpeggios'],['chords','Chords']].map(([id,label])=>`<button type="button" role="tab" data-material-tab="${id}" data-material-workspace="${workspace}" aria-selected="${active===id}" tabindex="${active===id?0:-1}">${label}</button>`).join('')}</div>`;}
export function normalizedChordOptions(raw={}){
 const v={...CHORD_DEFAULTS,...raw};
 if(!VOICING_FAMILIES[v.family])v.family='drop2';if(!CHORD_MATERIALS[v.material])v.material='seventh';if(!STRING_SETS[v.strings])v.strings='auto';if(!['all','0','1','2','3'].includes(String(v.inversion)))v.inversion='all';if(!['near','neck'].includes(v.region))v.region='neck';
 if(!['thirds','fourths','fifths'].includes(v.construction))v.construction='thirds';if(!['step','thirds','fourths','fifths'].includes(v.movement))v.movement='step';if(!['held','quarter','offbeats','syncopated'].includes(v.rhythm))v.rhythm='held';if(!['together','strum'].includes(v.attack))v.attack='together';
 if(v.family==='spread')v.material='triad';if(v.material==='guide')v.family='close';if(['drop2','drop3','drop24'].includes(v.family)&&['triad','shell'].includes(v.material))v.material='seventh';const count=v.material==='guide'?2:['triad','shell'].includes(v.material)?3:4;if(v.strings!=='auto'&&STRING_SETS[v.strings]?.length!==count)v.strings='auto';return v;
}
export function chordControls(options,harmony,prefix='exercise',study='progression'){
 const v=normalizedChordOptions(options);if(prefix==='exercise'&&!['scale','sequence'].includes(study))v.construction='thirds';const material=chordMaterial(harmony,v.material),count=material?.chordPcs.length||4;
 const menu=(key,title,values,disabled=false)=>`<label>${title}<select data-chord-option="${key}" data-chord-workspace="${prefix}" id="${prefix}-chord-${key}" ${disabled?'disabled':''}>${Object.entries(values).map(([value,label])=>`<option value="${esc(value)}" ${String(v[key])===value?'selected':''} ${key==='family'&&['inversions','scale','sequence'].includes(study)&&value==='caged'?'disabled':''} ${key==='material'&&['drop2','drop3','drop24'].includes(v.family)&&['triad','shell','guide'].includes(value)?'disabled':''}>${esc(label)}</option>`).join('')}</select></label>`;
 let html=menu('family','Voicing family',VOICING_FAMILIES)+menu('material','Chord material',v.construction==='thirds'?CHORD_MATERIALS:{...CHORD_MATERIALS,triad:'Three-note stacks',seventh:'Four-note stacks'},v.family==='spread');
 html+=menu('strings','String set',Object.fromEntries(Object.entries(STRING_SETS).filter(([id,s])=>id==='auto'||s.length===count).map(([id])=>[id,id==='auto'?'Choose a playable set':id.split('').join('–')])),v.family==='caged');
 html+=menu('inversion','Bass voice',Object.fromEntries([['all','All bass arrangements'],...(material?.intervals||['1','3','5','7']).map((interval,i)=>[String(i),`${interval} in bass`])]),v.family==='caged'||study==='inversions');
 html+=menu('region','Practice region',{near:'Near selected CAGED position',neck:'Across the neck · frets 0–20'});
 if(prefix==='exercise'&&['scale','sequence'].includes(study))html+=menu('construction','Chord construction',{thirds:'Diatonic thirds',fourths:'Diatonic fourths · quartal',fifths:'Diatonic fifths · quintal'})+menu('movement','Root movement',study==='sequence'?{step:'1–3–2–4 · overlapping groups'}:{step:'Scale degrees',thirds:'Diatonic thirds',fourths:'Diatonic fourths',fifths:'Diatonic fifths'},study==='sequence');
 if(prefix==='guitar')html+=menu('construction','Chord construction',{thirds:'Written chord',fourths:'Scale-built fourths · quartal',fifths:'Scale-built fifths · quintal'});
 if(prefix==='exercise')html+=menu('rhythm','Chord rhythm',{held:'Hold through each chord',quarter:'Quarter notes',offbeats:'Offbeat eighths',syncopated:'Syncopated pattern'})+menu('attack','Playback',{together:'Together',strum:'Strummed'});
 return html;
}
export function chordLesson(study){return ({inversions:'Cycle the bass voice through the available inversions on a fixed string set. Across the neck allows each inversion to move beyond the CAGED reference.',scale:'Harmonise each scale degree. Construction selects the chord tones; root movement selects the order. Diatonic fourths and fifths vary in interval quality with the scale.',sequence:'Play harmonised scale degrees in the overlapping 1–3–2–4 pattern, advancing two degrees for each group.',progression:'Play one practical voicing for each chart chord. Choose bass voice and string set, then sustain through its written duration.',voiceleading:'Keep the string set fixed. Retain common tones and favour small movements between successive chord voicings.',transform:'Change one root through major, major seventh, dominant seventh, minor and minor seventh qualities. Listen to the notes that change.',comping:'Practise chord changes with quarter notes, offbeats or syncopation. Whole voicings sound together; the chart keeps its written harmony.'})[study]||'Practise playable chord voicings.';}
export function lockChordControls(root,locked,fretOptions,exerciseOptions,study){
 for(const control of root.querySelectorAll('[data-chord-option],#guitar-chord-choice,[data-material-tab],[data-practise-chords]')){
  const key=control.dataset.chordOption,workspace=control.dataset.chordWorkspace,family=workspace==='guitar'?fretOptions.family:exerciseOptions.family;
  const fixedCaged=family==='caged'&&['strings','inversion'].includes(key),cycling=workspace==='exercise'&&key==='inversion'&&study==='chord:inversions',fixedTriad=key==='material'&&family==='spread',sequence=key==='movement'&&study==='chord:sequence';
  control.disabled=locked||fixedCaged||cycling||fixedTriad||sequence;
 }
}
