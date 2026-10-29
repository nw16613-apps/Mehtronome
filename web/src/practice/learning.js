import {characteristicNotes} from '../audio/music.js';
import {recommendedGrip} from '../guitar/grips.js';
export const GOALS=[
 {id:'mode',name:'Learn a mode’s sound',mode:'dorian',chord:'min7',study:'thirds',workspace:'harmony',tip:'Hear the held minor seventh. Sing the root, minor third and natural sixth; then find them in Fretboard.'},
 {id:'shape',name:'Explore a chord arpeggio',mode:'dorian',chord:'min7',study:'positional',workspace:'guitar',tip:'Strum the ringed grip, choose Practise arpeggio, then explore its positional arpeggio phrase.'},
 {id:'connect',name:'Connect two CAGED positions',mode:'dorian',chord:'min7',study:'groups4',workspace:'exercises',tip:'Play the first cell in Position I, select Position II here, then repeat the idea and resolve to the same chord tone.'},
 {id:'jazz',name:'Outline an essential ii–V–I',mode:'major',chord:'maj7',study:'harmonized',template:'major251essential',workspace:'exercises',tip:'Explore diatonic arpeggio cells through the ii–V–I chord changes.'},
 {id:'pentatonic',name:'Apply a pentatonic idea',mode:'dorian',chord:'min7',study:'pentatonic',workspace:'exercises',tip:'Play one cell, leave space, and finish on a chord tone. Compare the source’s included and omitted colours.'},
 {id:'time',name:'Leave space and keep time',mode:'dorian',chord:'min7',study:'thirds',workspace:'practice',tip:'Keep a two-beat motif through the silent bars. Gap training checks your internal pulse, not your accuracy.'},
];
export function gripStudy(board,harmony){
 const grip=recommendedGrip(harmony,board);if(!grip)return [];
 const notes=grip.notes.toSorted((a,b)=>a.midi-b.midi).map(note=>({...note,chromaticDegree:harmony.intervals[harmony.chordPcs.indexOf(note.pc)]}));
 return [{chord:`Exact grip · ${harmony.name}${harmony.suffix}`,rootName:harmony.name,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),notes,annotation:'Only the sounding strings of the selected grip',targetIndex:notes.length-1}];
}
export function gripFacts(grip,harmony){
 if(!grip)return null;const notes=grip.notes.toSorted((a,b)=>a.midi-b.midi),bass=notes[0],index=harmony.chordPcs.indexOf(bass.pc),interval=harmony.intervals[index];
 return {formula:harmony.intervals.join(' · '),voiced:notes.map(n=>`${n.name} (${harmony.intervals[harmony.chordPcs.indexOf(n.pc)]})`).join(' · '),omitted:grip.omitted.join(' · ')||'None',bass:`${bass.name} · ${interval==='1'?'root position':['3','♭3'].includes(interval)?'first inversion':['5','♭5','♯5'].includes(interval)?'second inversion':['7','♭7','♭♭7'].includes(interval)?'third inversion':'extension in bass'}`,strings:Array.from({length:6},(_,i)=>notes.find(n=>n.string===i)?.fret??'×').join(' · ')};
}
export function overlayDegrees(source,harmony){
 const letters='CDEFGAB',root=harmony.chordPcs[0],rootLetter=letters.indexOf(harmony.name[0]),natural=[0,2,4,5,7,9,11];
 return source.pcs.map((pc,i)=>{
  const degree=(letters.indexOf(source.names[i][0])-rootLetter+7)%7;
  const delta=((pc-root-natural[degree]+18)%12)-6;
  return (delta<0?'♭'.repeat(-delta):'♯'.repeat(delta))+(degree+1);
 });
}
export function lessonCells(groups,limit=2){
 const cells=[];
 for(const group of groups){
  if(!group.notes?.length)continue;
  let offset=0;
  const lengths=group.cellLengths||[group.notes?.length||0];
  for(const [i,length]of lengths.entries()){
   const notes=group.notes.slice(offset,offset+length);offset+=length;
   if(!notes.length)continue;
   cells.push({name:group.materialCells?.[i]||group.chord,notes:notes.map(n=>n.name).join(' · ')});
   if(cells.length===limit)return cells;
  }
 }
 return cells;
}
export function overlayPurpose(source,harmony){
 if(!source)return '';const missing=harmony.tones.filter((_,i)=>!source.pcs.includes(harmony.chordPcs[i]));
 const missingColours=characteristicNotes(harmony).filter(n=>!source.pcs.includes(n.pc)).map(n=>`${n.name} (${n.degree})`);
 return `${source.groups?'Triads: '+source.groups.map(g=>g.name+' ['+g.names.join(' · ')+']').join(' / ')+'. ':''}Notes: ${source.names.join(' · ')}. Degrees over ${harmony.name}${harmony.suffix}: ${overlayDegrees(source,harmony).join(' · ')}. Characteristic colours omitted: ${missingColours.join(' · ')||'none'}. Chord tones omitted: ${missing.join(' · ')||'none'}. ${source.explanation} Resolve a short idea to ${harmony.tones[1]||harmony.name}, then leave space.`;
}
export function exerciseLesson(study,groups,harmony,source,options={}){
 const annotation=groups[0]?.annotation;
 let trains='Hear chords built from the scale and compare them with the backing.',pattern='Stack alternate scale degrees to form the selected triads, seventh or ninth chords. Each cell is one arpeggio built by stacking alternate notes of the scale guide; the backing chord symbols above the staff describe the accompaniment.',listen='Hear how each study cell colours the held chord. A cell’s chord can differ from the accompaniment.',apply='Pick three notes, repeat their rhythm, then change the ending and leave space.';
 if(study==='chordtones'||study==='chordtonesalternating'){
  trains='Build scale-note stacks from the core tones of the backing chord.';
  pattern='Use the first four written chord tones as cell roots (or all tones of a shorter chord), then stack alternate notes of the scale guide: 1–3–5 for triads, 1–3–5–7 for tetrads, or 1–3–5–7–9 for ninth chords. These numbers are relative to that cell root.';
  listen='The cells can be different chords. For Bm7 in B Dorian, seventh-chord cells rooted on B, D, F♯ and A are Bm7, Dmaj7, F♯m7 and Amaj7—not four inversions of Bm7. Only cells that fit the region are shown.';
  if(harmony.name!=='B'||harmony.chordId!=='min7'||harmony.mode!=='dorian')listen='Each cell starts from a tone of the current chord but can form a different diatonic chord. Compare its colour with the backing; these are not simply inversions of the current chord.';
  apply='Choose one cell, keep its rhythm, then resolve into a tone of the backing chord and leave space.';
 }else if(study==='harmonized'||study==='alternating'){
  trains='Hear the scale harmonised in successive arpeggio cells.';
  pattern='Stack alternate scale notes from successive available scale degrees. Material chooses triads (1–3–5), tetrads (1–3–5–7) or ninth chords (1–3–5–7–9), relative to each cell root.';
  listen='A study cell and the backing can be different chords. Compare the first displayed cells below; the symbols above the staff name only the accompaniment.';
  apply='Take one arpeggio cell, vary its ending and resolve to a tone of the backing chord.';
 }else if(study==='grip'){trains='Learn the exact sounding notes of this voicing.';pattern='Low-to-high notes of the displayed grip, without adding the omitted chord tones.';listen='Keep the chord sound in mind while picking each string.';apply='Strum once, pick the grip notes, then choose Positional arpeggio to explore a balanced phrase in the region.';}
 else if(study==='positional'){trains='Play a balanced chord-arpeggio phrase in this CAGED region.';pattern='Use consecutive chord-tone pitches without repeating turning notes. Triplets use a seven-note span: six notes each way, two beats per half. Sixteenths use nine pitches: eight notes each way, also two beats per half. Eighths retain nine pitches for four beats each way. A position with fewer pitches uses a shorter span. For triplets, Full position with turnaround covers every available pitch, then a smaller sweep completes an eight-beat phrase (two bars of 4/4).';listen='Hear the same chord in several registers.';apply='Choose two grip notes, add a nearby arpeggio note, then finish on the third.';}
 else if(/^enclosures|chromaticneighbors|doubleapproach/.test(study)){trains='Hear approach notes resolve into a target.';pattern=annotation||'Approach a chord tone chromatically, then resolve.';listen='The marked last note is the resolution target. Its beat depends on cell length and subdivision; it is not always a strong beat.';apply='Use one cell, resolve to the third, then rest for two beats. Place the target deliberately by shifting when you start.';}
 else if(study==='approach'){trains='Connect one arpeggio to the next with a chromatic approach.';pattern='Play the named arpeggio, then a half-step approach to the first note of the next group.';listen='The last note of a group can be an approach, not the resolution. The resolution begins the next group.';apply='Connect just two groups, resolve, then stop and listen to the backing.';}
 else if(study==='approacheverytone'){trains='Approach each arpeggio tone from a half-step away.';pattern='Chromatic approach → chord tone, repeated through the displayed arpeggio.';listen='Each chord tone is a resolution; targets are not guaranteed to land on strong beats.';apply='Choose one target and delay the approach so its resolution lands where you intend.';}
 else if(study==='passingtones'){trains='Hear chromatic passing tones between scale notes.';pattern='A diatonic line with a chromatic note inserted between available whole steps.';listen='Separate passing colour from the scale notes around it.';apply='Use one passing connection, then sustain a chord tone.';}
 else if(study==='inversions'){trains='Hear the same chord starting from different chord tones.';pattern='Rotate the first three, four or five written chord tones, as selected in Material, through every complete register in this position. A shorter chord uses all its tones. A melodic starting note does not change the backing chord’s bass or inversion.';listen='Compare the opening third, fifth or seventh with the held backing.';apply='Play one inversion cell, rest, and resolve to the chord root.';}
 else if(study==='upperstructure'){trains='Hear the ninth above a seventh chord.';pattern='3–5–7–9 from each scale degree; the root is omitted.';listen='Hear how a rootless upper structure relates to the backing root.';apply='Play an upper structure once, hold the ninth briefly, then resolve to the third.';}
 else if(study==='triadpairs'||study==='pentatonic'){trains=study==='triadpairs'?'Combine two triads as a melodic palette.':'Move a small pentatonic idea through the position.';pattern=overlayPurpose(source,harmony)||annotation||'Use the selected source and pattern.';listen='Compare included colours with the chord tones the source omits.';apply='Play one cell, rest, and finish on a chord tone. Avoid treating every source as equally defining the mode.';}
 else if(['thirds','fourths','sixths','groups3','groups4','digital1324','cells'].includes(study)){trains='Hear and navigate a scale pattern rather than running the scale.';pattern={thirds:'1–3, 2–4, 3–5… (diatonic thirds)',fourths:'1–4, 2–5, 3–6… (diatonic fourths)',sixths:'1–6, 2–7, 3–8… (diatonic sixths)',groups3:'1–2–3, 2–3–4…',groups4:'1–2–3–4, 2–3–4–5…',digital1324:'1–3–2–4, 2–4–3–5…',cells:'1–2–3–5 from each scale degree'}[study];listen='Sing the interval before playing it; hear the return to a chord tone.';apply='Use only one cell in a phrase. Repeat its rhythm with a different ending, then leave space.';}
 else if(study==='guidetones'||study==='connections'){trains='Connect chord changes through nearby chord tones.';pattern=study==='guidetones'?'Play the displayed third or seventh on each chord change and sustain it for that chord’s duration.': 'Play each named chord’s arpeggio when its chord arrives, then rest until the next change.';listen='Hear common tones and semitone resolutions. This is a melodic path, not a simultaneous voicing.';apply='Sustain one target per chord, then add a short approach before the next target.';}
 if(['alternating','chordtonesalternating'].includes(study))pattern+=' Successive cells alternate upward and downward contours. Starting direction controls both the initial travel through the position and the first cell contour; alternation continues through chord changes and range turns.';
 if(['thirds','fourths','sixths','groups3','groups4','digital1324','cells'].includes(study))pattern+=' Downward first mirrors the scale-step offsets. Only exact, complete cells available in the chosen diagram are used; a missing pitch is not replaced by the next available note.';
 if(options.progression&&study==='positional')listen+=' Chord and position changes preserve the phrase phase. The nearest fitting span is selected without skipping ahead in the phrase. The backing chart stays unchanged.';
 if(options.progression&&study!=='positional')listen+=' The pattern is rebuilt from the new chord’s scale guide while continuing in the current direction from the nearest valid cell. A position change adapts that sequence rather than resetting at the edge; repeated harmony retains its cursor. At the usable range boundary, the sequence turns into the opposite pattern. Study cells do not change the backing progression.';
 if(harmony.scalePcs.length!==7){
  const count=harmony.scalePcs.length;
  const intro=`This is a ${count}-note scale. Numeric patterns count positions in its ordered collection, including octave wrapping. `;
  pattern=intro+(['harmonized','alternating','chordtones','chordtonesalternating','approach','approacheverytone'].includes(study)?(count===6?'Stack alternate scale notes. Four notes repeat the starting pitch class an octave higher, and five continue that cycle. On whole-tone and augmented scales the three-note stacks are augmented triads. These are not ordinary diatonic seventh or ninth chords.':count===5?'Stack alternate notes of the five-note scale, wrapping at the octave. The groups are scale-step patterns, not ordinary diatonic seventh or ninth chords.':'Stack alternate scale notes in groups of three, four or five. A five-note stack repeats its first pitch class an octave higher; it is not a diatonic ninth chord.'):study==='upperstructure'?`Use ordered scale steps 3–5–7–9, wrapping after ${count} steps.`:pattern);
 }

 const first=groups.flatMap(g=>g.notes||[])[0];
 const starting=first?`First written note: ${first.name} · string ${6-first.string}, fret ${first.fret}. ${options.progression?'Each chord slot uses complete available cells; unused time is a rest.':'The chosen direction and the notes available in this position determine the starting note.'}`:'No complete cell is available here. Choose another position or, in a progression, allow a longer chord slot.';
 return {trains,pattern,listen,apply,starting,cells:lessonCells(groups),rhythm:`Try this yourself in 4/4: play ${harmony.tones[1]||harmony.name} on beat 1, hold through beat 2, rest on beat 3, then play ${harmony.tones[0]} on beat 4. This is an application prompt, not the subdivision exercise playback.`};
}
export function shortCell(groups){return groups.length?[{...groups[0],notes:groups[0].notes.slice(0,8),targetIndex:groups[0].targetIndex<8?groups[0].targetIndex:undefined}]:[];}
export function positionalArpeggio(board,harmony,motion='ascending'){
 const byMidi=new Map();for(const n of board.notes)if(harmony.chordPcs.includes(n.pc)&&!byMidi.has(n.midi))byMidi.set(n.midi,{...n,name:harmony.tones[harmony.chordPcs.indexOf(n.pc)],chromaticDegree:harmony.intervals[harmony.chordPcs.indexOf(n.pc)]});
 let notes=[...byMidi.values()].sort((a,b)=>a.midi-b.midi);if(motion==='descending'||motion==='down-up')notes.reverse();if(motion==='up-down'||motion==='down-up')notes=[...notes,...notes.slice(0,-1).reverse()];
 return notes.length?[{chord:`${harmony.name}${harmony.suffix} · positional arpeggio`,rootName:harmony.name,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),notes,annotation:'All available chord tones in this position'}]:[];
}
export function guideToneExamples(harmonies){
 if(harmonies.length<3)return [];
 const pick=(h,kind)=>{const i=h.intervals.findIndex(x=>kind==='third'?['3','♭3'].includes(x):['7','♭7'].includes(x));return i<0?null:h.tones[i];};
 return [[pick(harmonies[0],'third'),pick(harmonies[1],'seventh'),pick(harmonies[2],'third')],[pick(harmonies[0],'seventh'),pick(harmonies[1],'third'),pick(harmonies[2],'seventh')]].filter(path=>path.every(Boolean)).map(path=>path.join(' → '));
}
