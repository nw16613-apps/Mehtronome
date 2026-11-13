// Scale degrees are ordinal steps in the chosen collection, including pentatonics.
const run=n=>Array.from({length:n},(_,i)=>i);
const permutations=xs=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
export const SCALE_SEQUENCES={};
const add=(id,family,label,offsets,extra={})=>SCALE_SEQUENCES[id]={family,label,offsets,...extra};
for(const [n,name,id]of [[2,'Seconds','seconds'],[3,'Thirds','thirds'],[4,'Fourths','fourths'],[5,'Fifths','fifths'],[6,'Sixths','sixths'],[7,'Sevenths','sevenths'],[8,'Octaves','octaves']])add(id,'intervals',`${name} · 1–${n}`,[0,n-1]);
for(let n=3;n<=8;n++)add('groups'+n,'groups','Groups of '+n,run(n));
// Keep the existing 1–3–2–4 identifier in its systematic numerical order.
for(const n of [3,4])for(const p of permutations(run(n)))add(n===4&&p.join('')==='0213'?'digital1324':'scaleperm_'+p.map(x=>x+1).join(''),'permutations'+n,p.map(x=>x+1).join('–'),p);
add('cells','digital','1–2–3–5',[0,1,2,4]);
for(let n=3;n<=8;n++)for(const close of [false,true])add(`return${n}${close?'closed':''}`,'returns',`${n}-note span · `+([...run(n),...run(n-1).reverse().slice(0,close?undefined:-1)].map(x=>x+1).join('–')),[...run(n),...run(n-1).reverse().slice(0,close?undefined:-1)]);
for(let n=3;n<=8;n++){
 const offsets=run(n-1).flatMap(i=>[0,i+1]);
 add('expand'+n,'expanding','Expand · '+offsets.map(x=>x+1).join('–'),offsets);
 add('expandContract'+n,'expanding','Expand and contract · span '+n,[...offsets,...offsets.toReversed().slice(1)]);
 add('contract'+n,'expanding','Contract · '+offsets.toReversed().map(x=>x+1).join('–'),offsets.toReversed());
}
for(let skip=2;skip<=6;skip++){const offsets=run(3).flatMap(i=>[i,i+skip]);add('skip'+skip,'skips','Skip / step · '+offsets.map(x=>x+1).join('–'),offsets);}
add('pedalLower','pedals','Fixed lower pedal',[0],{pedal:'lower'});add('pedalUpper','pedals','Fixed upper pedal',[0],{pedal:'upper'});
export const SCALE_SEQUENCE_FAMILY_LABELS={intervals:'Interval pairs',groups:'Consecutive-note groups',permutations3:'3-note permutations · 6',permutations4:'4-note permutations · 24',digital:'Digital patterns',returns:'Return patterns',expanding:'Expanding / contracting intervals',skips:'Skips and steps',pedals:'Fixed pedals'};
export const SCALE_CELL_ORDERS=[['normal','Written order'],['reverse','Reverse every cell'],['alternate','Reverse alternate cells · written first'],['alternateReverse','Reverse alternate cells · reversed first'],['rotate','Rotate entry each cell'],['cycle','Cycle all orders · 3/4-note cells'],['directional','Follow travel direction'],['directionalReverse','Opposite to travel direction']];
// Collections with an explicit written cell retain that cell on both travel
// legs. Source-transcribed lesson contours and continuous paths stay literal.
export const hasPentatonicCellOrder=pattern=>!String(pattern||'').startsWith('lesson');
export const hasChromaticSide=study=>['doubleapproach','chromaticneighbors'].includes(study);
export const hasExerciseCellOrder=view=>Boolean(SCALE_SEQUENCES[view.study?.replace(/^arpseq_/, '')])||view.study==='pentatonic'&&hasPentatonicCellOrder(view.pattern)||view.study==='harmonized'&&view.arpeggioSequence&&view.arpeggioSequence!=='stepwise'||hasChromaticSide(view.study);
export const hasDirectionalCellOrder=view=>hasExerciseCellOrder(view)&&!hasChromaticSide(view.study);
export function scaleCellOrders(study){
 if(study==='doubleapproach')return [['normal','From below · −2, −1, target'],['reverse','From above · +2, +1, target']];
 if(study==='chromaticneighbors')return [['normal','Upper then lower · return to target'],['reverse','Lower then upper · return to target']];
 const definition=SCALE_SEQUENCES[study.replace(/^arpseq_/, '')];
 if(definition?.family!=='intervals'){
  const labels=definition?.family==='groups'?{normal:'Upward groups · both ways',reverse:'Downward groups · both ways',directional:'Upward ascending / downward descending',directionalReverse:'Downward ascending / upward descending'}:{directional:'Written ascending / reversed descending',directionalReverse:'Reversed ascending / written descending'};
  return [...SCALE_CELL_ORDERS.slice(0,2),...SCALE_CELL_ORDERS.slice(-2),...SCALE_CELL_ORDERS.slice(2,-2)].map(([id,label])=>[id,labels[id]||label]);
 }
 const n=definition.offsets[1]+1;
 return [['normal',`1–${n}`],['reverse',`${n}–1`],['directional',`1–${n} ascending / ${n}–1 descending`],['directionalReverse',`${n}–1 ascending / 1–${n} descending`],['alternate',`Alternate 1–${n} / ${n}–1`],['alternateReverse',`Alternate ${n}–1 / 1–${n}`]];
}
export function scaleSequenceCells(board,harmony,study,motion,options={}){
 const definition=SCALE_SEQUENCES[study];if(!definition)return [];
 const direction=['descending','down-up'].includes(motion)?-1:1,count=harmony.scalePcs.length;
 const byMidi=new Map();for(const note of board.notes)if(harmony.scalePcs.includes(note.pc)&&!byMidi.has(note.midi))byMidi.set(note.midi,note);
 const sorted=[...byMidi.values()].sort((a,b)=>a.midi-b.midi),anchors=direction>0?sorted:sorted.toReversed(),intervals=harmony.scalePcs.map(pc=>(pc-harmony.scalePcs[0]+12)%12),cells=[];
 for(const anchor of anchors){
  const degree=harmony.scalePcs.indexOf(anchor.pc);
  const cellDirection=1;
  let notes=definition.offsets.map(offset=>{const step=degree+cellDirection*offset,index=(step%count+count)%count,midi=anchor.midi+intervals[index]+12*Math.floor(step/count)-intervals[degree],note=byMidi.get(midi);return note?{...note,name:harmony.scaleNames[index]}:null;});
  if(notes.some(n=>!n))continue;
  if(definition.pedal){const pedal=definition.pedal==='lower'?sorted[0]:sorted.at(-1);if(anchor.midi===pedal.midi)continue;notes=[pedal,anchor].map(n=>({...n,name:harmony.scaleNames[harmony.scalePcs.indexOf(n.pc)]}));}
  cells.push({chord:`${harmony.scaleNames[degree]} · ${definition.label}`,rootName:harmony.scaleNames[degree],notes,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),orderSteps:definition.pedal?null:definition.offsets.map(i=>i+1),sequenceAnchor:anchor.midi,sequenceDirection:direction,scaleSequence:true});
 }
 const advance=[1,2,3].includes(Number(options.sequenceAdvance))?Number(options.sequenceAdvance):1;
 return cells.filter((_,i)=>i%advance===0).map((c,i)=>({...c,degree:i+1}));
}
export function orderedScaleCell(cell,order='normal',ordinal=0){
 const written=cell.writtenNotes||cell.notes,base=cell.alternateCells&&ordinal%2?written.toReversed():written;
 const reverse=order==='reverse'||order==='alternate'&&ordinal%2===1||order==='alternateReverse'&&ordinal%2===0||order==='directional'&&cell.sequenceDirection<0||order==='directionalReverse'&&cell.sequenceDirection>0;
 const cycle=order==='cycle'&&[3,4].includes(cell.notes.length)?permutations(run(base.length))[ordinal%(cell.notes.length===3?6:24)].map(i=>base[i]):null;
 const notes=cycle|| (reverse?base.toReversed():order==='rotate'?[...base.slice(ordinal%base.length),...base.slice(0,ordinal%base.length)]:base);
 const steps=cell.writtenOrderSteps||cell.orderSteps;
 return {...cell,orderSteps:steps?notes.map(n=>steps[written.indexOf(n)]):null,notes,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc)};
}
