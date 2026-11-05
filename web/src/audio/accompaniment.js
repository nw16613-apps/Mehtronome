// A part event names a harmonic role, not a whole-chord retrigger.
// [sixteenth, role, held beats, velocity, optional independent voice group].
// Latin/Brazilian figures keep their two-bar orientation through the form.
export const ACCOMPANIMENT_PARTS={
 popRock:{name:'Picked guitar figure',bars:[
  [[0,'lowDyad',2.4,.48],[4,'fifth',1.4,.33],[8,'third',1.5,.36],[12,'top',1.3,.30]],
  [[0,'root',1.6,.38],[6,'upper',1.5,.43],[10,'fifth',1.3,.31]],
 ]},
 traditionalJazz:{name:'Piano comping and guide voices',bars:[
  [[2,'chord',1.8,.48],[11,'seventh',.9,.28]],[[6,'shell',1.8,.42]],
  [[3,'chord',1.7,.47],[13,'third',.7,.28]],[[6,'chord',1.8,.45]],
 ]},
 fusionJazz:{name:'Electric-key vamp',bars:[
  [[0,'lowDyad',1.8,.43],[3,'third',.5,.29],[7,'fifth',.65,.30],[10,'upperColour',1.25,.43]],
  [[1,'root',1.1,.34],[6,'seventh',.7,.31],[11,'upperColour',1.1,.42]],
 ]},
 blues:{name:'Shuffle guitar riff',bars:[
  [[0,'lowDyad',.65,.46],[6,'upper',.35,.35],[8,'lowDyad',.65,.44],[14,'third',.3,.28]],
  [[0,'lowDyad',.65,.46],[6,'upper',.35,.35],[8,'lowDyad',.65,.44],[14,'seventh',.3,.28]],
 ]},
 motown:{name:'Offbeat piano figure',bars:[
  [[2,'upper',.35,.43],[6,'fifth',.4,.29],[10,'upper',.35,.43]],
  [[2,'third',.4,.30],[6,'upper',.35,.43],[14,'fifth',.35,.29]],
 ]},
 funk:{name:'Interlocking clav riff',bars:[
  [[1,'root',.18,.36],[4,'upper',.24,.44],[7,'fifth',.16,.28],[10,'third',.24,.35],[14,'upper',.22,.38]],
  [[2,'root',.18,.35],[6,'upper',.24,.44],[9,'seventh',.16,.28],[12,'fifth',.22,.33]],
 ]},
 neoSoul:{name:'Held keys with a moving inner voice',bars:[
  [[0,'pad',3.6,.46,'pad'],[0,'innerThird',1.7,.32,'inner'],[8,'innerColour',.9,.28,'inner'],[12,'innerThird',1.3,.30,'inner']],
  [[0,'pad',3.5,.45,'pad'],[0,'innerThird',2.1,.31,'inner'],[10,'innerColour',1.3,.28,'inner']],
 ]},
 bossa:{name:'Thumb-and-chord guitar pattern',bars:[
  [[0,'thumbRoot',.7,.30],[6,'upper3',.8,.43],[8,'thumbFifth',.7,.28],[12,'upper3',.6,.38]],
  [[0,'thumbRoot',.7,.30],[4,'upper3',.65,.38],[8,'thumbFifth',.7,.28],[10,'upper3',1.1,.42]],
 ]},
 latin:{name:'Two-bar piano montuno',bars:[
  [[0,'rootOctave',.45,.34],[2,'upper',.35,.32],[6,'upperColour',.4,.37],[8,'fifthOctave',.45,.32],[10,'third',.4,.27],[14,'upper',.4,.35]],
  [[0,'rootOctave',.45,.34],[2,'upper',.35,.31],[6,'upperColour',.4,.36],[8,'fifthOctave',.45,.32],[10,'seventh',.4,.26],[12,'upper',.35,.34],[14,'third',.4,.27]],
 ]},
 ballad:{name:'Spacious broken piano chords',bars:[
  [[0,'lowDyad',3.7,.40],[2,'upper',3.1,.39],[10,'top',1.3,.23]],
  [[0,'root',3.7,.34],[4,'upper3',3,.40]],
 ]},
};
const at=(pc,floor)=>floor+((pc-floor)%12+12)%12;
const unique=notes=>[...new Set(notes)].sort((a,b)=>a-b);
// Prepare every pitch once, outside the sample loop. Individual fragments can
// omit chord members; the figure as a whole follows the current written harmony.
export function prepareAccompaniment(harmony,voicings,style){
 if(!ACCOMPANIMENT_PARTS[style]||!harmony?.chordPcs?.length)return null;
 const pcs=harmony.chordPcs,root=pcs[0],interval=pc=>(pc-root+12)%12;
 const third=pcs.find(pc=>[3,4].includes(interval(pc)))??pcs.find(pc=>[2,5].includes(interval(pc)))??pcs[1]??root;
 const fifth=pcs.find(pc=>[6,7,8].includes(interval(pc)))??pcs[2]??root;
 const seventh=pcs.find(pc=>[10,11].includes(interval(pc)))??pcs.find(pc=>interval(pc)===9)??fifth;
 const options=(voicings?.length?voicings:[pcs.map(pc=>at(pc,60))]).map(chord=>{
  const upper=unique([at(third,64),at(seventh,67)]),colour=chord.find(note=>![root,third,fifth,seventh].includes(note%12))??at(seventh,67);
  const innerThird=at(third,60),neighbours=harmony.scalePcs.filter(pc=>![root,third,fifth,seventh].includes(pc)&&(pcs.some(n=>[10,11].includes(interval(n)))||![10,11].includes(interval(pc)))).flatMap(pc=>[at(pc,48),at(pc,60),at(pc,72)]).sort((a,b)=>Math.abs(a-innerThird)-Math.abs(b-innerThird)||a-b),innerColour=neighbours[0]??at(fifth,60);
  const pad=unique([at(root,55),at(fifth,60),at(seventh,67)]).filter(note=>note%12!==third);
  return {thumbRoot:[at(root,48)],thumbFifth:[at(fifth,48)],innerThird:[innerThird],innerColour:[innerColour],chord:[...chord],root:[at(root,55)],fifth:[at(fifth,60)],third:[at(third,64)],seventh:[at(seventh,67)],top:[chord.at(-1)],colour:[at(colour%12,62)],
   lowDyad:unique([at(root,55),at(fifth,60)]),upper,upperColour:unique([at(third,64),at(colour%12,67)]),shell:upper,upper3:unique(chord.slice(-3)),pad:pad.length?pad:[at(root,55)],
   rootOctave:[at(root,60),at(root,60)+12],fifthOctave:[at(fifth,60),at(fifth,60)+12]};
 });
 return {style,signature:style+':'+pcs.join(',')+':'+harmony.scalePcs.join(','),allowed:new Set([...pcs,...harmony.scalePcs]),options};
}
export function accompanimentCell(style,bar){const part=ACCOMPANIMENT_PARTS[style];return part?.bars[bar%part.bars.length]||[];}
