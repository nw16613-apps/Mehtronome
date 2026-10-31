// Keep restored favourites/presets compatible with the current exercise menu.
const fixedMaterial=new Set(['arpgroups3','arpgroups4','positionalscale','positional','cells','thirds','fourths','sixths','digital1324','groups3','groups4','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','doubleapproach','chromaticneighbors','passingtones','upperstructure','triadpairs','pentatonic']);
export function normalizeExerciseOptions(view){
 view.stage='full';
 view.startTone=/^[1-7]:[0-8]$/.test(view.startTone)?view.startTone.split(':')[0]+':0':'default';
 if(!['balanced','balanced2','balanced3','balancedcycle','turnaround'].includes(view.phrase))view.phrase='balanced';
 if(view.material==='extensions')view.material='seventh';
 if(view.study==='upperstructure')view.study='harmonized';
 if(view.study==='grip')view.study='positional';
 if(['guidetones','connections','shells','shellphrases','drops'].includes(view.study))view.study='harmonized';
 if(view.study!=='triadpairs')view.motion=['descending','down-up'].includes(view.motion)?'descending':'ascending';
 return view;
}
export function exerciseMenuOptions(study){
 return {material:!fixedMaterial.has(study),directionLabel:study==='triadpairs'?'Cell contour':'Starting direction',directions:study==='triadpairs'?
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

export const POSITIONAL_TRIPLET_PHRASES=[['balanced','Balanced span'],['balancedcycle','Cycling spans'],['turnaround','Full-position runs']];
export function exercisePhraseLabel(phrase){return POSITIONAL_TRIPLET_PHRASES.find(([id])=>id===phrase)?.[1]||({'balanced2':'Balanced span · previous variation 2','balanced3':'Balanced span · previous variation 3'}[phrase])||'Balanced span';}
