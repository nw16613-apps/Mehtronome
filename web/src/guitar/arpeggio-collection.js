import {theoryOptions} from './superimposition.js';
import {exerciseArpeggioHarmony} from './arpeggio-harmony.js';
import {modeChordHarmonies} from './mode-chords.js';
/** One source definition for diagrams, physical fingerings and exercise cells. */
export function arpeggioCollection(harmony,material='seventh',source='selectedChord',choiceId=''){
 if(source==='triadPair'){const choices=theoryOptions(harmony).triadPairs,pair=choices.find(c=>c.id===choiceId)||choices[0];return (pair?.groups||[]).map(g=>({...harmony,name:g.names[0],suffix:({major:'',minor:'m',diminished:'dim',augmented:'aug'})[g.quality]||'',chordPcs:g.pcs,tones:g.names,intervals:g.pcs.map((pc,i)=>i===0?'1':i===1?(pc-g.pcs[0]+12)%12===3?'♭3':'3':(pc-g.pcs[0]+12)%12===6?'♭5':(pc-g.pcs[0]+12)%12===8?'♯5':'5'),modeDegree:harmony.scalePcs.indexOf(g.pcs[0])}));}

 const core=exerciseArpeggioHarmony(harmony,material);
 if(!['diatonic','chordRoots'].includes(source))return [core];
 const roots=exerciseArpeggioHarmony(harmony,'seventh').chordPcs;
 return modeChordHarmonies(harmony,material==='triad'?3:4).filter(h=>source!=='chordRoots'||roots.includes(h.chordPcs[0]));
}
export function arpeggioInversion(board,harmony){
 const bass=board.notes.filter(n=>harmony.chordPcs.includes(n.pc)).sort((a,b)=>a.midi-b.midi)[0];
 if(!bass)return 'No tones in this shape';
 const index=harmony.chordPcs.indexOf(bass.pc);
 return ['Root position','First inversion','Second inversion','Third inversion'][index]||'Bass '+bass.name;
}

export function triadPairCollectionHarmony(harmony,view){
 if(view.arpeggioSource!=='triadPair'&&view.study!=='triadpairs')return harmony;
 const choices=theoryOptions(harmony).triadPairs,pair=choices.find(c=>c.id===view.source)||choices[0];if(!pair)return harmony;
 const pcs=harmony.scalePcs.filter(pc=>pair.pcs.includes(pc));
 return {...harmony,scalePcs:pcs,scaleNames:pcs.map(pc=>pair.names[pair.pcs.indexOf(pc)]),pairCollection:pair.id};
}
