import {MUSICAL_STUDIES} from './musical-phrases.js';
// Keep restored favourites/presets compatible with the current exercise menu.
const fixedMaterial=new Set(['arpgroups3','arpgroups4','positionalscale','positional','cells','thirds','fourths','sixths','digital1324','groups3','groups4','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','doubleapproach','chromaticneighbors','passingtones','upperstructure','triadpairs','pentatonic']);
export function normalizeExerciseOptions(view){
 view.stage='full';
 view.fingering=['three','oneTwo','twoOne','drop2','drop3'].includes(view.fingering)?view.fingering:'caged';
 view.fingeringStringSet=Math.max(0,Math.min(view.fingering==='drop3'?1:2,Math.floor(Number(view.fingeringStringSet)||0)));
 view.inversion=Math.max(0,Math.min(6,Math.floor(Number(view.inversion)||0)));
 view.fingeringFret=Number.isFinite(Number(view.fingeringFret))?Math.max(0,Math.min(36,Number(view.fingeringFret))):5;
 view.startTone=/^[1-7]:[0-8]$/.test(view.startTone)?view.startTone.split(':')[0]+':0':'default';
 // Retire saved triplet phrase formulas; preserve explicit degree starts.
 delete view.phrase;
 if(view.material==='extensions')view.material='seventh';
 if(view.study==='upperstructure')view.study='harmonized';
 if(view.study==='grip')view.study='positional';
 if(['guidetones','connections','shells','shellphrases','drops'].includes(view.study))view.study='harmonized';
 if(view.study!=='triadpairs')view.motion=['descending','down-up'].includes(view.motion)?'descending':'ascending';
 return view;
}
export function exerciseMenuOptions(study){
 return {material:!(study in MUSICAL_STUDIES)&&!fixedMaterial.has(study),directionLabel:study==='triadpairs'?'Cell contour':'Starting direction',directions:study==='triadpairs'?
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
 if(study.startsWith('enclosures'))return 'Surround each target chord tone with the written approach notes, then resolve to it.';
 const descriptions={
  motifspace:'Repeat a short scale motif with a changed chord-tone ending. Hold the written notes and leave the rests silent; keep the same shape of the rhythm across changes.',
  changetargets:'Land on a nearby third or seventh when each chord arrives, then use the current scale and chord tones to lead toward the next change. Shorter chords use their available core tones.',
  questionanswer:'Play a short question, leave space, then give a softer answer with a reversed contour. Each phrase begins and ends on a tone of the current chord.',
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
