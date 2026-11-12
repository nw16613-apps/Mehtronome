import {SCALE_SEQUENCES,SCALE_CELL_ORDERS} from '../guitar/scale-sequences.js';
import {ARPEGGIO_ROOT_SEQUENCES} from '../guitar/arpeggio-sequences.js';
import {normalizeArpeggioPattern,canonicalArpeggioRecipe} from '../guitar/arpeggio-patterns.js';
import {ENCLOSURE_PATTERNS} from '../guitar/enclosures.js';
// Keep restored favourites/presets compatible with the current exercise menu.
const fixedMaterial=new Set(['enclosures4','enclosures5','arpgroups3','arpgroups4','positionalscale','positional','cells','thirds','fourths','sixths','digital1324','groups3','groups4','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','doubleapproach','chromaticneighbors','passingtones','upperstructure','triadpairs','pentatonic']);
export function normalizeExerciseOptions(view){
 view.stage='full';
 view.study=typeof view.study==='string'&&view.study?view.study:'positional';
 if(/^arpgroups[34]$/.test(view.study)){view.study='arpseq_groups'+view.study.at(-1);view.material='seventh';}
 if(view.study.startsWith('arpseq_'))view.material=view.material==='triad'?'triad':'seventh';
 view.sequenceAdvance=[1,2,3].includes(Number(view.sequenceAdvance))?Number(view.sequenceAdvance):1;
 view.sequenceOrder=SCALE_CELL_ORDERS.some(([id])=>id===view.sequenceOrder)?view.sequenceOrder:'normal';
 if(SCALE_SEQUENCES[view.study.replace(/^arpseq_/, '')]&&view.sequenceOrder==='cycle'&&![3,4].includes(SCALE_SEQUENCES[view.study.replace(/^arpseq_/, '')].offsets.length))view.sequenceOrder='normal';
 view.arpeggioSequence=Object.hasOwn(ARPEGGIO_ROOT_SEQUENCES,view.arpeggioSequence)?view.arpeggioSequence:'stepwise';
 view.arpeggioPattern=normalizeArpeggioPattern(view.arpeggioPattern||'straight',view.material);
 view.entryTone=/^(?:scale:[0-7]|chord:[1-7]|offset:(?:[0-9]|1[01]))$/.test(view.entryTone)?view.entryTone:'default';
 view.arpeggioClose=false; // Retired UI option: play only the selected written order.
 delete view.cellLabels;
 view.arpeggioRegister=['up','down','alternating','alternatingDown'].includes(view.arpeggioRegister)?view.arpeggioRegister:'up';
 const oldEnclosures={enclosuresdouble:['enclosures4',['descending','down-up'].includes(view.motion)?[-2,-1,1,0]:[2,1,-1,0]],enclosuresfiveone:['enclosures5',[-1,2,1,-1,0]],enclosuresfivetwo:['enclosures5',[1,-2,-1,1,0]],enclosuresfivethree:['enclosures5',[-2,1,-2,-1,0]],enclosuresfivefour:['enclosures5',[2,-1,2,1,0]]};
 if(oldEnclosures[view.study]){const [study,offsets]=oldEnclosures[view.study];view.study=study;view.enclosurePattern=Object.entries(ENCLOSURE_PATTERNS[study]).find(([,p])=>p.join(',')===offsets.join(','))?.[0]||'upper';}
 view.enclosureTarget=['all','0','1','2','3'].includes(view.enclosureTarget)?view.enclosureTarget:'all';
 view.enclosurePattern=Object.hasOwn(ENCLOSURE_PATTERNS[view.study]||{},view.enclosurePattern)?view.enclosurePattern:'upper';
 if(['motifspace','changetargets','questionanswer'].includes(view.study))view.study='positional';
 view.fingering=['three','oneTwo','twoOne','drop2','drop3'].includes(view.fingering)?view.fingering:'caged';
 if(view.study==='positionalscale'&&!['caged','three'].includes(view.fingering)){view.fingering='three';view.inversion=0;}
 if(view.study==='positional'&&view.material==='triad'&&view.fingering.startsWith('drop')){view.fingering='oneTwo';view.inversion=0;}
 if(view.study==='positional'&&view.fingering==='three'){view.fingering='oneTwo';view.inversion=0;}
 view.exactFingering=Boolean((view.exactFingering??(view.study==='positional'&&view.fingering!=='caged'))&&view.study==='positional'&&view.fingering!=='caged');
 view.fingeringStringSet=Math.max(0,Math.min(view.fingering==='drop3'?1:2,Math.floor(Number(view.fingeringStringSet)||0)));
 view.inversion=Math.max(0,Math.min(6,Math.floor(Number(view.inversion)||0)));
 view.fingeringFret=Number.isFinite(Number(view.fingeringFret))?Math.max(0,Math.min(36,Number(view.fingeringFret))):5;
 view.startTone=/^(?:scale:[0-7]|degree:[1-7])$/.test(view.startTone)?view.startTone:/^[1-7]:[0-8]$/.test(view.startTone)?view.startTone.split(':')[0]+':0':'default';
 // Retire saved triplet phrase formulas; preserve explicit degree starts.
 delete view.phrase;
 if(view.material==='extensions')view.material='seventh';
 if(view.study==='upperstructure')view.study='harmonized';
 if(view.study==='grip')view.study='positional';
 if(['guidetones','connections','shells','shellphrases','drops'].includes(view.study))view.study='harmonized';
 const oldStudy=view.study,originalPattern=view.arpeggioPattern;
 if(['harmonized','alternating','chordtones','chordtonesalternating','inversions','arpgroups4','approacheverytone'].includes(oldStudy)){
  view.arpeggioSource=['diatonic','chordRoots','selectedChord'].includes(view.arpeggioSource)?view.arpeggioSource:'diatonic';
  if(oldStudy.startsWith('chordtones'))view.arpeggioSource='chordRoots';
  if(['inversions','arpgroups4'].includes(oldStudy)){view.arpeggioSource='selectedChord';view.arpeggioRoutine='inversions';view.arpeggioPattern='straight';view.arpeggioClose=false;if(oldStudy==='arpgroups4')view.material='seventh';}
  if(oldStudy==='approacheverytone'){view.arpeggioApproach='directional';view.arpeggioPattern='straight';}
  view.study='harmonized';Object.assign(view,canonicalArpeggioRecipe(view));
  if(['alternating','chordtonesalternating'].includes(oldStudy)){
   if(originalPattern==='straight')view.arpeggioRoutine='alternate';
   else view.arpeggioRegister=view.arpeggioRegister==='down'?'alternatingDown':'alternating';
  }
 }
 if(view.study!=='triadpairs')view.motion=['descending','down-up'].includes(view.motion)?'descending':'ascending';
 return view;
}
export function exerciseMenuOptions(study){
 return {material:study==='positional'||study.startsWith('arpseq_')||!fixedMaterial.has(study)&&!SCALE_SEQUENCES[study.replace(/^arpseq_/, '')],directionLabel:study==='triadpairs'?'Cell contour':'Starting direction',directions:study==='triadpairs'?
 [['ascending','Ascending'],['descending','Descending'],['up-down','Ascending and descending'],['down-up','Descending and ascending']]:
 [['ascending','Upward first'],['descending','Downward first']]};
}

// Scale-step patterns retain their mathematics in other collections, but their
// intervals and stacks are not necessarily thirds, triads or seventh chords.
export function exerciseCollectionLabels(study,nonDiatonic=false){
 const studies=nonDiatonic?{thirds:'Alternate scale-note pairs',fourths:'Scale-step pairs · 1–4',sixths:'Scale-step pairs · 1–6',digital1324:'Scale-step 1–3–2–4',cells:'Scale-step 1–2–3–5',harmonized:'Alternate-note stacks',alternating:'Alternating scale-note stacks',chordtones:'Scale-note stacks from core chord tones',chordtonesalternating:'Alternating stacks from core chord tones',upperstructure:'Scale-step 3–5–7–9'}:{};
 const materials=study==='inversions'?['Up to 3 chord tones','Up to 4 chord tones']:nonDiatonic?['3-note stacks','4-note stacks']:['Triads','Seventh chords'];
 return {studies,materials};
}

/** One short explanation; chord, position, note and playback data live beside their controls. */
export function exerciseGuidance(study){
 if(study==='enclosures4'||study==='enclosures5')return 'Note count includes the target. Pattern offsets are semitones from the target; targets land on quarter-note beats.';
 if(study.startsWith('enclosures'))return 'Surround each target chord tone with the written approach notes, then resolve to it.';
 const descriptions={
  positional:'Ascend and descend through the chord’s core tones without repeating the turning notes. Pattern start chooses the entry note; the line flows across bar lines.',
  positionalscale:'Play the scale through the selected CAGED position, ascending and descending. Pattern start chooses the entry note; the line flows across bar lines.',
  thirds:'Play scale-note pairs 1–3, 2–4, 3–5 and so on. The interval follows the selected scale.',
  fourths:'Play scale-note pairs 1–4, 2–5, 3–6 and so on. The interval follows the selected scale.',
  sixths:'Play scale-note pairs 1–6, 2–7, 3–8 and so on. The interval follows the selected scale.',
  groups3:'Play overlapping groups of three scale notes, moving the starting note by one scale step each time.',
  groups4:'Play overlapping groups of four scale notes, moving the starting note by one scale step each time.',
  digital1324:'Play 1–3–2–4 from each successive scale degree.',
  cells:'Play 1–2–3–5 from each successive scale degree.',
  arpgroups3:'Play overlapping groups of three core chord tones, moving the starting note by one chord tone each time.',
  arpgroups4:'Play overlapping groups of four core chord tones, moving the starting note by one chord tone each time.',
  harmonized:'Stack alternate scale notes into the selected three- or four-note cells. These cells can form different chords from the backing chord.',
  alternating:'Stack alternate scale notes into cells, alternating upward and downward contours. These cells can form different chords from the backing chord.',
  chordtones:'Start a scale-note stack on each core tone of the backing chord. Each stack can form a different chord.',
  chordtonesalternating:'Start a scale-note stack on each core chord tone, alternating upward and downward contours. Each stack can form a different chord.',
  inversions:'Start the same chord-tone cell from each of its tones, using up to three or four chord tones. This changes the melodic starting note, not the backing chord’s bass.',
  approach:'Play each arpeggio, then approach the first note of the next cell chromatically.',
  doubleapproach:'Lead into each arpeggio cell with two chromatic approach notes.',
  chromaticneighbors:'Move away from a chord tone to its written chromatic neighbour, then return.',
  passingtones:'Connect scale notes with the written chromatic passing tones.',
  approacheverytone:'Approach each arpeggio tone chromatically, then resolve to it.',
  triadpairs:'Alternate the selected pair of triads as a melodic line, then resolve to a backing-chord tone.',
  pentatonic:'Play the selected pattern using the chosen pentatonic source. Resolve the phrase to a backing-chord tone.',
 };
 return descriptions[study]||'Follow the written pattern through each chord and its assigned CAGED position.';
}
