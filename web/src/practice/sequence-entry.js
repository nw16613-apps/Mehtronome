import {MODES} from '../audio/music.js';
import {arpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {orderedScaleCell,SCALE_SEQUENCES} from '../guitar/scale-sequences.js';
const mod=n=>(n%12+12)%12;
export function sequenceEntryNote(cell,view){
 if(view.study==='harmonized'){const midi=cell.sequenceAnchor;return {midi,pc:mod(midi),name:cell.rootName};}
 if(view.study.startsWith('enclosures')||view.study==='doubleapproach')return cell.notes[cell.targetIndices?.[0]??cell.targetIndex??cell.notes.length-1];
 if(view.study==='pentatonic'&&view.pattern?.startsWith('alternating')){const up=!['descending','down-up'].includes(view.motion),cellUp=cell.notes[1]?.midi>cell.notes[0].midi;return cellUp===up?cell.notes[0]:cell.notes.at(-1);}
 if(SCALE_SEQUENCES[view.study.replace(/^arpseq_/,'')])return orderedScaleCell(cell,view.sequenceOrder,0).notes[0];
 return cell.notes[0];
}
export function sequenceEntryChoices(cells,harmony,view){
 const scale=view.study==='harmonized'||Boolean(SCALE_SEQUENCES[view.study])||['pentatonic','passingtones','approach'].includes(view.study),core=arpeggioHarmony(harmony),seen=new Set(),choices=[];
 for(const cell of cells){const note=sequenceEntryNote(cell,view);if(!note)continue;const scaleIndex=harmony.scalePcs.indexOf(note.pc),coreIndex=core.chordPcs.indexOf(note.pc),role=core.intervals[coreIndex]?.match(/\d+/)?.[0];
  const value=scale&&scaleIndex>=0?'scale:'+scaleIndex:role?'chord:'+role:'offset:'+mod(note.pc-harmony.chordPcs[0]);if(seen.has(value))continue;seen.add(value);
  const degree=scale&&scaleIndex>=0?'Degree '+(MODES[harmony.mode]?.degrees[scaleIndex]||scaleIndex+1):coreIndex>=0?'Degree '+core.intervals[coreIndex]:'Note';choices.push({value,label:degree+' · '+(scaleIndex>=0?harmony.scaleNames[scaleIndex]:coreIndex>=0?core.tones[coreIndex]:note.name),note});
 }return choices;
}
export function sequenceEntryState(cells,harmony,view){
 const selected=view.entryTone||'default';if(selected==='default'||!cells.length)return {index:0,warning:''};
 const [kind,raw]=selected.split(':'),number=Number(raw),core=arpeggioHarmony(harmony),target=kind==='scale'?harmony.scalePcs[number]:kind==='chord'?core.chordPcs[core.intervals.findIndex(n=>n?.match(/\d+/)?.[0]===raw)]:kind==='offset'?mod(harmony.chordPcs[0]+number):undefined;
 const index=cells.findIndex(c=>sequenceEntryNote(c,view)?.pc===target);
 return index>=0?{index,warning:''}:{index:0,warning:'The selected starting note has no complete cell in this position; using the directional boundary.'};
}
export function savedEntryLabel(value){
 if(!value||value==='default')return '';
 const [kind,raw]=value.split(':'),n=Number(raw);
 return kind==='scale'?`Starting scale note ${n+1}`:kind==='degree'?`Starting degree ${n}`:kind==='chord'?`Starting chord degree ${n}`:kind==='offset'?`Starting degree ${['1','♭2','2','♭3','3','4','♯4','5','♭6','6','♭7','7'][n]}`:`Starting chord degree ${kind}`;
}
