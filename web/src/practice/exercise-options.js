// Keep restored favourites/presets compatible with the current exercise menu.
const fixedMaterial=new Set(['positional','cells','thirds','fourths','sixths','digital1324','groups3','groups4','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','doubleapproach','chromaticneighbors','passingtones','upperstructure','triadpairs','pentatonic']);
export function normalizeExerciseOptions(view){
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
