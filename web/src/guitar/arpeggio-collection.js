import {exerciseArpeggioHarmony} from './arpeggio-harmony.js';
import {modeChordHarmonies} from './mode-chords.js';
/** One source definition for diagrams, physical fingerings and exercise cells. */
export function arpeggioCollection(harmony,material='seventh',source='selectedChord'){
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
