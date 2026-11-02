import {VOICING_FAMILIES,CHORD_MATERIALS,STRING_SETS,chordMaterial,parseChordFormula,scaleChord} from '../guitar/chord-library.js';
import {CHORD_STUDIES} from './chord-studies.js';
import {escapeChordText as esc} from './chord-symbol.js';
export const CHORD_DEFAULTS={family:'caged',material:'seventh',strings:'auto',inversion:'all',region:'neck',construction:'thirds',movement:'step',rhythm:'held',attack:'together',explore:'chord',degree:'0',advanced:false,formula:'1,9,5'};
export function studyCategory(study){return study?.startsWith('chord:')?'chords':'scales-arpeggios';}
export function categoryTabs(active,workspace){return `<div class="material-tabs" role="tablist" aria-label="${workspace==='guitar'?'Fretboard':'Exercise'} material">${[['scales-arpeggios','Scales & arpeggios'],['chords','Chords']].map(([id,label])=>`<button type="button" role="tab" data-material-tab="${id}" data-material-workspace="${workspace}" aria-selected="${active===id}" tabindex="${active===id?0:-1}">${label}</button>`).join('')}</div>`;}
export function normalizedChordOptions(raw={}){
 const v={...CHORD_DEFAULTS,...raw};
 if(raw.explore===undefined&&raw.construction&&raw.construction!=='thirds')v.explore='scale';
 if(!['chord','scale'].includes(v.explore))v.explore=v.construction!=='thirds'?'scale':'chord';
 v.degree=String(Math.max(0,Math.min(7,Number(v.degree)||0)));
 if(v.explore==='scale'&&!['triad','seventh'].includes(v.material))v.material='seventh';
 if(!VOICING_FAMILIES[v.family])v.family='drop2';if(!CHORD_MATERIALS[v.material])v.material='seventh';if(!STRING_SETS[v.strings])v.strings='auto';if(!['all','0','1','2','3'].includes(String(v.inversion)))v.inversion='all';if(!['near','neck'].includes(v.region))v.region='neck';
 if(!['thirds','fourths','fifths','root95','custom'].includes(v.construction))v.construction='thirds';if(!['step','thirds','fourths','fifths'].includes(v.movement))v.movement='step';if(!['held','quarter','offbeats','syncopated'].includes(v.rhythm))v.rhythm='held';if(!['together','strum'].includes(v.attack))v.attack='together';
 if(!parseChordFormula(v.formula))v.formula='1,9,5';
 if(['root95','custom'].includes(v.construction)){const count=v.construction==='root95'?3:parseChordFormula(v.formula).length;v.material=count===3?'triad':'seventh';if(count!==4&&['drop2','drop3','drop24','caged'].includes(v.family))v.family=count===3?'spread':'close';if(count===4&&v.family==='spread')v.family='drop2';}
 if(v.family==='spread')v.material='triad';if(v.material==='guide')v.family='close';if(['drop2','drop3','drop24'].includes(v.family)&&['triad','shell'].includes(v.material))v.material='seventh';const count=v.construction==='custom'?parseChordFormula(v.formula).length:v.material==='guide'?2:['triad','shell'].includes(v.material)?3:4;if(v.strings!=='auto'&&STRING_SETS[v.strings]?.length!==count)v.strings='auto';return v;
}
export function chordControls(options,harmony,prefix='exercise',study='progression'){
 const v=normalizedChordOptions(options);if(prefix==='exercise'&&!['scale','sequence'].includes(study))v.construction='thirds';const isScale=prefix==='guitar'?v.explore==='scale':['scale','sequence'].includes(study);const material=isScale?scaleChord(harmony,prefix==='guitar'?Number(v.degree)%harmony.scalePcs.length:0,v.material,v.construction,v.formula):chordMaterial(harmony,v.material),count=v.construction==='custom'?parseChordFormula(v.formula).length:v.construction==='root95'?3:material?.chordPcs.length||4;
 const menu=(key,title,values,disabled=false)=>`<label>${title}<select data-chord-option="${key}" data-chord-workspace="${prefix}" id="${prefix}-chord-${key}" ${disabled?'disabled':''}>${Object.entries(values).map(([value,label])=>`<option value="${esc(value)}" ${String(v[key])===value?'selected':''} ${key==='family'&&['inversions','scale','sequence'].includes(study)&&value==='caged'?'disabled':''} ${key==='material'&&['drop2','drop3','drop24'].includes(v.family)&&['triad','shell','guide'].includes(value)?'disabled':''}>${esc(label)}</option>`).join('')}</select></label>`;
 const scale=prefix==='guitar'?v.explore==='scale':['scale','sequence'].includes(study);
 let html=prefix==='guitar'?menu('explore','Explore',{chord:'Selected chord',scale:'Chord scale'}):'';
 html+=menu('family','Chord shape',VOICING_FAMILIES);
 if(scale)html+=menu('construction','Build chords from',{thirds:'Thirds',fourths:'Fourths · quartal',fifths:'Fifths · quintal',root95:'1–9–5',custom:'Choose intervals…'})+(v.construction==='custom'?`<label>Intervals<input type="text" id="${prefix}-chord-formula" data-chord-formula="${prefix}" value="${esc(v.formula)}" aria-describedby="${prefix}-formula-help"><small id="${prefix}-formula-help">2–4 scale degrees, e.g. 1, 9, 5.</small></label>`:'')+(['root95','custom'].includes(v.construction)?'':menu('material','Chord size',{triad:'Three notes',seventh:'Four notes'},v.family==='spread'));
 let more=scale?'':menu('material','Chord material',CHORD_MATERIALS,v.family==='spread');
 more+=menu('strings','String set',Object.fromEntries(Object.entries(STRING_SETS).filter(([id,s])=>id==='auto'||s.length===count).map(([id])=>[id,id==='auto'?'Automatic':id.split('').join('–')])),v.family==='caged');
 more+=menu('inversion','Bass voice',Object.fromEntries([['all','Automatic'],...(material?.intervals||['1','3','5','7']).map((interval,i)=>[String(i),`${interval} in bass`])]),v.family==='caged'||study==='inversions');
 more+=menu('region','Fretboard range',{near:'Near selected position',neck:'Across the neck'});
 if(prefix==='exercise'&&scale)more+=menu('movement','Move through the scale in',study==='sequence'?{step:'1–3–2–4'}:{step:'Scale order',thirds:'Thirds',fourths:'Fourths',fifths:'Fifths'},study==='sequence');
 if(prefix==='exercise')more+=menu('rhythm','Rhythm',{held:'Hold each chord',quarter:'Quarter notes',offbeats:'Offbeat eighths',syncopated:'Syncopated'})+menu('attack','Playback',{together:'Together',strum:'Strummed'});
 html+=`<details class="chord-more-options" data-chord-more="${prefix}" ${v.advanced?'open':''}><summary>More options</summary><div class="chord-more-fields">${more}</div></details>`;

 return html;
}
export function chordLesson(study){return ({inversions:'Cycle the bass voice through the available inversions on a fixed string set. Across the neck allows each inversion to move beyond the CAGED reference.',scale:'Harmonise each scale degree. Construction selects the chord tones; root movement selects the order. Diatonic fourths and fifths vary in interval quality with the scale.',sequence:'Play harmonised scale degrees in the overlapping 1–3–2–4 pattern, advancing two degrees for each group.',progression:'Play one practical voicing for each chart chord. Choose bass voice and string set, then sustain through its written duration.',voiceleading:'Keep the string set fixed. Retain common tones and favour small movements between successive chord voicings.',transform:'Change one root through major, major seventh, dominant seventh, minor and minor seventh qualities. Listen to the notes that change.',comping:'Practise chord changes with quarter notes, offbeats or syncopation. Whole voicings sound together; the chart keeps its written harmony.'})[study]||'Practise playable chord voicings.';}
export function lockChordControls(root,locked,fretOptions,exerciseOptions,study){
 for(const control of root.querySelectorAll('[data-chord-option],[data-chord-formula],#guitar-chord-choice,[data-chord-degree],[data-material-tab],[data-practise-chords]')){
  const key=control.dataset.chordOption,workspace=control.dataset.chordWorkspace,family=workspace==='guitar'?fretOptions.family:exerciseOptions.family;
  const fixedCaged=family==='caged'&&['strings','inversion'].includes(key),cycling=workspace==='exercise'&&key==='inversion'&&study==='chord:inversions',fixedTriad=key==='material'&&family==='spread',sequence=key==='movement'&&study==='chord:sequence';
  control.disabled=locked||fixedCaged||cycling||fixedTriad||sequence;
 }
}
