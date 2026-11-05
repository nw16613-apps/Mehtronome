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
// Related written parts: development, a thinner response, an answer, and a
// turnaround. These change notes/figures, not just the humanisation settings.
const PART_VARIATIONS={
 popRock:{
  develop:[[[0,'lowDyad',2.2,.46],[4,'third',1.2,.34],[8,'fifthUp',1.3,.32],[10,'top',1.1,.28]],[[0,'root',1.5,.36],[4,'fifth',1.4,.30],[8,'upperInversion',1.6,.40],[14,'thirdDown',.55,.26]]],
  space:[[[0,'lowDyad',3,.44],[8,'top',2,.27]],[[0,'root',2.2,.34],[10,'upper',1.7,.37]]],
  answer:[[[0,'root',1.4,.36],[4,'third',1.1,.32],[8,'upper',1.6,.41]],[[0,'lowDyad',2,.43],[8,'top',.8,.29],[10,'fifth',.65,.27],[14,'thirdDown',.6,.28]]],
  turn:[[[0,'lowDyad',2.7,.44],[6,'fifth',1.4,.30],[10,'top',1.2,.28]],[[0,'root',2,.34],[8,'third',.65,.28],[10,'fifth',.6,.27],[14,'root',.75,.32]]]
 },
 traditionalJazz:{
  develop:[[[0,'shell',1.4,.41],[7,'top',.8,.27],[10,'chord',1.4,.44]],[[2,'upperInversion',1.6,.40],[12,'thirdDown',.8,.26]]],
  space:[[[4,'chord',2.4,.43]],[[10,'shell',1.7,.37]]],
  answer:[[[3,'chord',1.6,.44],[10,'third',.7,.27]],[[2,'shell',1.1,.38],[8,'seventh',.7,.26],[14,'thirdDown',.6,.28]]],
  turn:[[[0,'chord',2,.44],[10,'top',.8,.26]],[[6,'shell',1.3,.39],[12,'seventh',.65,.27],[14,'thirdDown',.65,.29]]]
 },
 fusionJazz:{
  develop:[[[0,'lowDyad',1.6,.42],[3,'fifth',.45,.28],[6,'third',.6,.31],[10,'upperInversion',1.1,.40]],[[1,'root',1,.33],[5,'fifthUp',.5,.28],[9,'seventh',.55,.29],[12,'upperColour',.8,.39]]],
  space:[[[0,'lowDyad',2.5,.41],[10,'upperColour',1.3,.37]],[[3,'root',1.5,.31],[11,'upper',1.2,.37]]],
  answer:[[[0,'lowDyad',1.6,.41],[7,'seventh',.6,.28],[10,'upperColour',1.2,.40]],[[1,'thirdDown',1,.31],[6,'fifth',.55,.28],[11,'top',.6,.29],[14,'upper',.5,.37]]],
  turn:[[[0,'lowDyad',2,.42],[6,'third',.7,.29],[11,'upperColour',1,.38]],[[1,'root',1.7,.32],[10,'seventh',.5,.27],[13,'third',.4,.28],[15,'fifth',.4,.28]]]
 },
 blues:{
  develop:[[[0,'lowDyad',.7,.44],[6,'thirdDown',.35,.29],[8,'upper',.6,.36],[14,'fifth',.35,.29]],[[0,'lowDyad',.7,.44],[6,'seventh',.35,.28],[8,'upper',.6,.36],[14,'third',.35,.30]]],
  space:[[[0,'lowDyad',1.1,.43],[8,'upper',.85,.35]],[[0,'lowDyad',1.1,.43],[10,'third',.65,.28]]],
  answer:[[[0,'lowDyad',.7,.44],[6,'upper',.4,.34],[8,'lowDyad',.7,.42],[14,'fifth',.35,.28]],[[0,'root',.7,.35],[6,'seventh',.35,.28],[8,'fifth',.7,.32],[14,'thirdDown',.4,.29]]],
  turn:[[[0,'lowDyad',.75,.44],[6,'upper',.4,.35],[8,'lowDyad',1,.42]],[[0,'lowDyad',1.1,.43],[8,'seventh',.35,.28],[10,'fifth',.35,.28],[14,'root',.7,.34]]]
 },
 motown:{
  develop:[[[2,'upper',.32,.41],[6,'third',.4,.29],[10,'upperInversion',.32,.40],[14,'fifth',.35,.28]],[[2,'seventh',.4,.28],[6,'upper',.32,.41],[10,'thirdDown',.4,.29]]],
  space:[[[2,'upper',.4,.40],[10,'fifth',.55,.28]],[[6,'upper',.45,.40],[14,'third',.5,.28]]],
  answer:[[[2,'upper',.32,.41],[6,'fifth',.4,.28],[10,'upper',.32,.41]],[[2,'third',.35,.28],[6,'seventh',.35,.27],[10,'fifth',.35,.28],[14,'upper',.35,.39]]],
  turn:[[[2,'upperInversion',.35,.40],[6,'third',.4,.28],[10,'upper',.35,.41]],[[2,'upper',.4,.40],[8,'fifth',.35,.27],[10,'thirdDown',.35,.27],[14,'root',.5,.32]]]
 },
 funk:{
  develop:[[[1,'root',.18,.34],[4,'upper',.23,.42],[7,'third',.16,.28],[10,'fifth',.23,.33],[15,'upperInversion',.18,.35]],[[2,'thirdDown',.18,.31],[5,'fifth',.16,.27],[8,'upper',.23,.41],[11,'seventh',.16,.26],[14,'root',.2,.33]]],
  space:[[[1,'root',.24,.33],[6,'upper',.3,.41],[10,'fifth',.24,.29]],[[2,'third',.24,.30],[8,'upper',.3,.40],[14,'root',.24,.32]]],
  answer:[[[1,'root',.18,.34],[4,'upperInversion',.23,.40],[7,'fifth',.16,.27],[10,'third',.23,.33]],[[2,'root',.18,.33],[6,'upper',.23,.41],[9,'seventh',.16,.26],[12,'thirdDown',.18,.28],[15,'fifth',.2,.29]]],
  turn:[[[1,'root',.2,.34],[4,'upper',.25,.42],[10,'fifth',.22,.30]],[[2,'upper',.25,.40],[8,'seventh',.2,.27],[11,'fifth',.18,.27],[14,'thirdDown',.3,.31]]]
 },
 neoSoul:{
  develop:[[[0,'pad',3.6,.44,'pad'],[0,'innerColour',1.2,.29,'inner'],[6,'innerThird',1.2,.30,'inner'],[12,'innerFifth',1.1,.28,'inner']],[[0,'pad',3.5,.44,'pad'],[0,'innerThird',1.5,.30,'inner'],[8,'innerSeventh',1,.27,'inner'],[12,'innerColour',1.3,.28,'inner']]],
  space:[[[0,'pad',3.8,.43,'pad'],[2,'innerThird',3,.29,'inner']],[[0,'pad',3.7,.43,'pad'],[8,'innerColour',1.8,.27,'inner']]],
  answer:[[[0,'pad',3.6,.44,'pad'],[0,'innerThird',1.8,.30,'inner'],[10,'innerColour',1.2,.27,'inner']],[[0,'pad',3.6,.44,'pad'],[0,'innerFifth',1.2,.28,'inner'],[6,'innerColour',1.1,.27,'inner'],[12,'innerThird',1.3,.30,'inner']]],
  turn:[[[0,'pad',3.7,.44,'pad'],[0,'innerThird',2.2,.30,'inner'],[10,'innerSeventh',1.2,.27,'inner']],[[0,'pad',3.7,.43,'pad'],[0,'innerFifth',1.7,.28,'inner'],[8,'innerColour',.9,.27,'inner'],[12,'innerThird',1.4,.30,'inner']]]
 },
 bossa:{
  develop:[[[0,'thumbRoot',.75,.29],[4,'upper3',.75,.40],[8,'thumbFifth',.75,.27],[14,'upper',.55,.36]],[[0,'thumbRoot',.75,.29],[6,'upperInversion',.7,.38],[8,'thumbFifth',.75,.27],[12,'upper3',.8,.40]]],
  space:[[[0,'thumbRoot',1,.28],[6,'upper3',1.2,.39],[8,'thumbFifth',1,.26]],[[0,'thumbRoot',1,.28],[8,'thumbFifth',1,.26],[10,'upper3',1.3,.39]]],
  answer:[[[0,'thumbRoot',.7,.29],[6,'upper3',.8,.41],[8,'thumbFifth',.7,.27],[12,'top',.7,.26]],[[0,'thumbRoot',.7,.29],[4,'upper',.7,.36],[8,'thumbFifth',.7,.27],[10,'upper3',1.2,.40],[14,'third',.45,.25]]],
  turn:[[[0,'thumbRoot',.8,.29],[6,'upper3',.9,.40],[8,'thumbFifth',.8,.27]],[[0,'thumbRoot',.8,.29],[4,'upper3',.8,.39],[8,'thumbFifth',.75,.27],[12,'upper',.55,.35],[14,'top',.5,.25]]]
 },
 latin:{
  develop:[[[0,'rootOctave',.45,.33],[2,'upperInversion',.35,.30],[6,'upperColour',.4,.36],[8,'fifthOctave',.45,.31],[10,'seventh',.4,.26],[14,'upper',.4,.34]],[[0,'rootOctave',.45,.33],[2,'upper',.35,.30],[6,'upperColour',.4,.35],[8,'fifthOctave',.45,.31],[10,'thirdDown',.4,.26],[12,'upperInversion',.35,.32],[14,'fifth',.4,.26]]],
  space:[[[0,'rootOctave',.65,.32],[6,'upperColour',.6,.34],[8,'fifthOctave',.65,.30],[14,'upper',.5,.33]],[[0,'rootOctave',.65,.32],[6,'upper',.6,.33],[8,'fifthOctave',.65,.30],[12,'upperColour',.5,.34]]],
  answer:[[[0,'rootOctave',.45,.33],[2,'upper',.35,.30],[6,'upperColour',.4,.35],[8,'fifthOctave',.45,.31],[10,'top',.4,.25],[14,'upperInversion',.4,.32]],[[0,'rootOctave',.45,.33],[2,'upper',.35,.30],[6,'upperColour',.4,.35],[8,'fifthOctave',.45,.31],[10,'third',.35,.26],[12,'fifth',.35,.25],[14,'seventh',.4,.26]]],
  turn:[[[0,'rootOctave',.55,.33],[2,'upper',.4,.30],[6,'upperColour',.45,.35],[8,'fifthOctave',.55,.31],[14,'upper',.5,.33]],[[0,'rootOctave',.55,.33],[2,'upperInversion',.4,.30],[6,'upperColour',.45,.35],[8,'fifthOctave',.55,.31],[10,'seventh',.35,.25],[12,'thirdDown',.35,.25],[14,'root',.5,.30]]]
 },
 ballad:{
  develop:[[[0,'root',3.7,.33],[4,'upper3',2.8,.38],[12,'fifthUp',1.1,.23]],[[0,'lowDyad',3.7,.39],[6,'upperInversion',2.4,.35],[12,'third',1.1,.23]]],
  space:[[[0,'chord',3.8,.40]],[[4,'upper3',3,.35]]],
  answer:[[[0,'lowDyad',3.7,.39],[4,'upper',2.8,.37]],[[0,'root',3.7,.33],[4,'upper3',2.2,.38],[10,'top',1,.23],[14,'third',1,.24]]],
  turn:[[[0,'lowDyad',3.8,.39],[4,'upper3',2.9,.37]],[[0,'root',3.8,.33],[6,'upper',1.8,.35],[12,'top',1.3,.24]]]
 }
};
// A 32-bar form revisits the theme and places quieter/answering parts around it.
// Each selection is a whole two-bar pair, so clave sides never get reordered.
const FORM=['base','develop','space','answer','base','develop','answer','turn','base','space','develop','answer','base','answer','space','turn'];
const FORMS=Object.fromEntries(Object.entries(ACCOMPANIMENT_PARTS).map(([style,part])=>[style,Array.from({length:32},(_,bar)=>{
 const pair=Math.floor(bar/2),variant=FORM[pair],bars=variant==='base'?part.bars:PART_VARIATIONS[style][variant];
 const themePair=variant==='base'?FORM.slice(0,pair).filter(name=>name==='base').length:0;
 return {variant,cell:bars[(themePair*2+bar%2)%bars.length]};
})]));
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
  let upperInversion=unique([upper.at(-1),upper[0]+12]);if(upperInversion.at(-1)>84)upperInversion=upperInversion.map(note=>note-12);
  const pad=unique([at(root,55),at(fifth,60),at(seventh,67)]).filter(note=>note%12!==third);
  return {thirdDown:[at(third,64)-12],fifthUp:[at(fifth,60)+12],upperInversion,innerFifth:[at(fifth,60)],innerSeventh:[at(seventh,60)],thumbRoot:[at(root,48)],thumbFifth:[at(fifth,48)],innerThird:[innerThird],innerColour:[innerColour],chord:[...chord],root:[at(root,55)],fifth:[at(fifth,60)],third:[at(third,64)],seventh:[at(seventh,67)],top:[chord.at(-1)],colour:[at(colour%12,62)],
   lowDyad:unique([at(root,55),at(fifth,60)]),upper,upperColour:unique([at(third,64),at(colour%12,67)]),shell:upper,upper3:unique(chord.slice(-3)),pad:pad.length?pad:[at(root,55)],
   rootOctave:[at(root,60),at(root,60)+12],fifthOctave:[at(fifth,60),at(fifth,60)+12]};
 });
 return {style,signature:style+':'+pcs.join(',')+':'+harmony.scalePcs.join(','),allowed:new Set([...pcs,...harmony.scalePcs]),options};
}
export function accompanimentPhrase(style,bar,varied=true,turnaround=false){const part=ACCOMPANIMENT_PARTS[style];if(!part)return null;if(!varied)return BASE_FORMS[style][bar%part.bars.length];if(turnaround)return TURN_FORMS[style][bar%2];return FORMS[style][bar%32];}
const BASE_FORMS=Object.fromEntries(Object.entries(ACCOMPANIMENT_PARTS).map(([style,part])=>[style,part.bars.map(cell=>({variant:'base',cell}))]));
const TURN_FORMS=Object.fromEntries(Object.entries(PART_VARIATIONS).map(([style,parts])=>[style,parts.turn.map(cell=>({variant:'turn',cell}))]));
export function accompanimentCell(style,bar,varied=false,turnaround=false){return accompanimentPhrase(style,bar,varied,turnaround)?.cell||[];}
