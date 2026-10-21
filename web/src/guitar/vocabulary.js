import { TUNING } from './fretboard.js';
import { voiceLeadingFor } from './voicings.js';

export const VOCABULARY_APPROACHES = {
  shell: {name:'Shells & extensions', description:'Keep the root and quality-defining guide tones; add a colour from the selected harmony or mode.'},
  rootless: {name:'Rootless', description:'Keep the third and seventh while leaving the root to the backing or bass. Extensions supply the colour.'},
  triad: {name:'Triad based', description:'Learn a major, minor, diminished or augmented triad inside the harmony, sometimes with an extra guide tone.'},
  quartal: {name:'Quartal', description:'Explore stacks of perfect or augmented fourths from the mode. These are modal colours, rather than complete chord spellings.'},
};

const mod = value => ((value % 12) + 12) % 12;
const NAMES = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const STRING_NAMES = ['E','A','D','G','B','E'];
const COLOUR_DEGREES = {1:'♭9',2:'9',3:'♯9',5:'11',6:'♯11',8:'♭13',9:'13'};
const DEGREES = ['1','♭9','9','♭3','3','11','♯11','5','♭13','13','♭7','7'];
const TRIADS = [
  {quality:'major', suffix:'major', intervals:[0,4,7]},
  {quality:'minor', suffix:'minor', intervals:[0,3,7]},
  {quality:'diminished', suffix:'diminished', intervals:[0,3,6]},
  {quality:'augmented', suffix:'augmented', intervals:[0,4,8]},
];

function combinations(values, count) {
  const result=[];
  const visit=(start, chosen)=>{
    if (chosen.length===count) { result.push(chosen); return; }
    for (let i=start;i<=values.length-(count-chosen.length);i++) visit(i+1,[...chosen,values[i]]);
  };
  visit(0,[]);
  return result;
}

const GROUPS = [4,3].flatMap(count=>combinations([0,1,2,3,4,5],count)
  .sort((a,b)=>b.reduce((sum,n)=>sum+n,0)-a.reduce((sum,n)=>sum+n,0)||a.join('').localeCompare(b.join(''))));
export const VOCABULARY_STRING_SETS = [
  {id:'all',name:'Any suitable strings'},
  ...GROUPS.map(strings=>({id:strings.map(string=>6-string).join(''),strings,
    name:`${strings.map(string=>6-string).join('–')} · ${strings.map(string=>STRING_NAMES[string]).join('–')}`})),
];

function harmonyInfo(harmony) {
  if (!harmony?.midi?.length || !harmony.midi.every(Number.isFinite)) return null;
  const root=mod(harmony.midi[0]);
  const chord=[...new Set(harmony.midi.map(mod))];
  const scale=[...new Set((harmony.scalePcs||chord).map(mod))];
  const allowed=new Set([...scale,...chord]);
  const label=pc=>{
    const index=harmony.midi.findIndex(midi=>mod(midi)===pc);
    if (index>=0&&harmony.intervals?.[index]) return harmony.intervals[index];
    const degree=mod(pc-root);
    return degree===3&&chord.includes(mod(root+4))?'♯9':DEGREES[degree];
  };
  const name=pc=>{
    const chordIndex=harmony.midi.findIndex(midi=>mod(midi)===pc);
    const scaleIndex=(harmony.scalePcs||[]).indexOf(pc);
    return (chordIndex>=0&&harmony.tones?.[chordIndex]) || (scaleIndex>=0&&harmony.scaleNames?.[scaleIndex]) || NAMES[pc];
  };
  const third=chord.find(pc=>[3,4].includes(mod(pc-root))&&['♭3','3'].includes(label(pc)));
  const seventh=chord.find(pc=>['♭♭7','♭7','7'].includes(label(pc)));
  const sixth=chord.find(pc=>label(pc)==='6');
  const suspension=third===undefined?chord.find(pc=>[2,5].includes(mod(pc-root))):undefined;
  const fifth=chord.find(pc=>[6,7,8].includes(mod(pc-root))&&['♭5','5','♯5'].includes(label(pc)));
  const alteredFifth=fifth!==undefined&&mod(fifth-root)!==7?fifth:undefined;
  // An extension belongs to the current scale or to the explicitly selected
  // chord. We never add a natural 9/13 by assuming a major parent scale.
  const colours=[2,9,6,1,5,8,3].map(interval=>mod(root+interval)).filter(pc=>allowed.has(pc));
  const usableColours=colours.filter(pc=>{
    if (chord.includes(pc)) return true;
    // A natural 11 crowds a major third; retain it only when requested by the chord.
    return !(mod(pc-root)===5&&third!==undefined&&mod(third-root)===4);
  });
  return {root,chord,scale,allowed,label,name,third,seventh,sixth,suspension,fifth,alteredFifth,colours:usableColours};
}

function recipeFactory(info) {
  const seen=new Set(),recipes=[];
  const add=(pcs, data={})=>{
    if (pcs.some(pc=>pc===undefined)) return;
    pcs=[...new Set(pcs)];
    if (pcs.length<3||pcs.length>4||pcs.some(pc=>!info.allowed.has(pc))) return;
    const signature=data.steps?`${pcs.join('.')}:${data.steps.join('.')}`:[...pcs].sort((a,b)=>a-b).join('.');
    if (seen.has(signature)) return;
    seen.add(signature);
    recipes.push({id:signature,pcs,priority:0,...data});
  };
  return {recipes,add};
}

function shellRecipes(info) {
  const {recipes,add}=recipeFactory(info);
  const middle=info.third??info.suspension;
  const guide=info.seventh??info.sixth??info.fifth;
  if (middle===undefined||guide===undefined) return recipes;
  const core=[info.root,middle,guide];
  const kind=info.seventh!==undefined?'shell':info.sixth!==undefined?'sixth shell':'triad core';
  const baseName=kind==='shell'?'Shell':kind==='sixth shell'?'Sixth shell':'Triad core';
  add(core,{name:baseName,kind,priority:0});
  for (const colour of info.colours) if (!core.includes(colour)) {
    const degree=info.chord.includes(colour)?info.label(colour):COLOUR_DEGREES[mod(colour-info.root)]||info.label(colour);
    add([...core,colour],{name:`${baseName} + ${degree}`,kind,priority:1});
  }
  return recipes;
}

function rootlessRecipes(info) {
  const {recipes,add}=recipeFactory(info);
  if (info.third===undefined||info.seventh===undefined) return recipes;
  const guides=[info.third,info.seventh];
  const core=info.alteredFifth===undefined?guides:[...guides,info.alteredFifth];
  const extras=[...new Set([...info.colours,info.fifth])].filter(pc=>pc!==undefined&&pc!==info.root&&!core.includes(pc));
  if (core.length===3) add(core,{name:'Rootless guide tones + altered fifth',kind:'rootless',priority:2});
  for (const extra of extras) add([...core,extra],{name:'Rootless guide tones & colour',kind:'rootless',priority:core.length===3?0:2});
  if (core.length===2) for (const pair of combinations(extras,2)) {
    add([...core,...pair],{name:'Rootless guide tones & colours',kind:'rootless',priority:0});
  }
  return recipes.slice(0,18);
}

function triadRecipes(info) {
  const {recipes,add}=recipeFactory(info);
  for (const root of info.allowed) for (const definition of TRIADS) {
    const pcs=definition.intervals.map(interval=>mod(root+interval));
    if (!pcs.every(pc=>info.allowed.has(pc))) continue;
    const triad={rootPc:root,quality:definition.quality,pcs,name:`${info.name(root)} ${definition.suffix}`};
    const guideCount=[info.third,info.seventh].filter(pc=>pc!==undefined&&pcs.includes(pc)).length;
    const priority=(root===info.root?0:2)+2-guideCount;
    const relation=root===info.root?'Root triad':`${info.label(root)} upper structure`;
    add(pcs,{name:`${triad.name} triad`,kind:'triad',triad,relation,priority});
    for (const guide of [info.third,info.seventh]) if (guide!==undefined&&!pcs.includes(guide)) {
      add([...pcs,guide],{name:`${triad.name} + ${info.label(guide)}`,kind:'triad',triad,relation,extraPc:guide,priority:priority-.5});
    }
  }
  return recipes.sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id)).slice(0,18);
}

function quartalRecipes(info) {
  const {recipes,add}=recipeFactory(info);
  const scale=new Set(info.scale);
  const visit=(pcs,steps)=>{
    if (pcs.length>=3) {
      const guides=[info.third,info.seventh].filter(pc=>pc!==undefined&&pcs.includes(pc)).length;
      add(pcs,{name:`${pcs.length}-note fourth stack`,kind:'quartal',steps,priority:3-guides+(pcs.length===3?.25:0),
        relation:'Modal quartal colour; not a complete chord spelling'});
    }
    if (pcs.length===4) return;
    for (const step of [5,6]) {
      const next=mod(pcs.at(-1)+step);
      if (scale.has(next)&&!pcs.includes(next)) visit([...pcs,next],[...steps,step]);
    }
  };
  for (const pc of info.scale) visit([pc],[]);
  return recipes.sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id)).slice(0,24);
}

function selectedStrings(options) {
  if (options.strings!==undefined) {
    if (!Array.isArray(options.strings)||![3,4].includes(options.strings.length)||new Set(options.strings).size!==options.strings.length||options.strings.some(s=>!Number.isInteger(s)||s<0||s>5)) return null;
    return [...options.strings].sort((a,b)=>a-b);
  }
  if (options.stringSet===undefined||options.stringSet==='all') return [];
  const selected=VOCABULARY_STRING_SETS.find(set=>set.id===options.stringSet);
  return selected?.strings||null;
}

function findShapes(recipe, groups, accept) {
  for (const strings of groups) {
    const visit=(notes,remaining,minFret,maxFret)=>{
      const index=notes.length,string=strings[index];
      const first=index===0;
      const low=first?1:Math.max(1,maxFret-4),high=first?24:Math.min(24,minFret+4);
      // Quartal recipes describe a sounding stack, so inversion or octave
      // displacement cannot turn their fourths into thirds or fifths.
      const exact=recipe.steps&&index>0?notes.at(-1).midi+recipe.steps[index-1]-TUNING[string]:null;
      for (let fret=exact??low;fret<=(exact??high);fret++) {
        if (fret<low||fret>high) continue;
        const midi=TUNING[string]+fret,pc=mod(midi);
        if (!remaining.includes(pc)||(!first&&midi<=notes.at(-1).midi)||(recipe.steps&&pc!==recipe.pcs[index])) continue;
        const next=[...notes,{string,fret,midi,pc}];
        if (next.length===strings.length) accept(next,recipe);
        else visit(next,remaining.filter(other=>other!==pc),first?fret:Math.min(minFret,fret),first?fret:Math.max(maxFret,fret));
      }
    };
    visit([],recipe.pcs,0,0);
  }
}

/**
 * Three/four-note vocabulary, fretted on distinct strings with a four-fret
 * maximum hand span. `fretRange` prefers contained shapes and permits an
 * explicitly marked adjacent shift of at most two frets. All labels refer to
 * the current chord root, which can differ from the modal tonic in a vamp.
 */
export function vocabularyVoicings(harmony, options={}) {
  const approach=options.approach||'shell';
  const metadata=VOCABULARY_APPROACHES[approach];
  const info=harmonyInfo(harmony);
  const result={approach,description:metadata?.description||'',voicings:[],recipes:[],reason:'',recommendedId:null};
  if (!metadata) return {...result,reason:'Choose a vocabulary approach.'};
  if (!info) return {...result,reason:'Choose a valid chord first.'};
  const range=options.fretRange;
  if (range!=null&&(!Number.isFinite(range.start)||!Number.isFinite(range.end)||range.start<1||range.end>24||range.start>range.end)) return {...result,reason:'Choose a fret range between 1 and 24.'};
  const hasTop=options.topPc!==null&&options.topPc!==undefined;
  if (hasTop&&(!Number.isInteger(options.topPc)||options.topPc<0||options.topPc>11)) return {...result,reason:'Choose a valid top note.'};
  const strings=selectedStrings(options);
  if (strings===null) return {...result,reason:'Choose a three- or four-string group.'};
  const recipes={shell:shellRecipes,rootless:rootlessRecipes,triad:triadRecipes,quartal:quartalRecipes}[approach](info);
  result.recipes=recipes;
  if (!recipes.length) return {...result,reason:approach==='rootless'
    ?'Rootless shapes need a third and seventh in the selected chord. Choose a seventh chord or another approach.'
    :approach==='shell'?'This chord has no third or suspension and guide tone for a shell. Try triad based or quartal colours.'
      :'No suitable pitch collection is available for this approach.'};
  const candidates=new Map();
  const accept=(positions,recipe)=>{
    const top=positions.at(-1);
    if (hasTop&&top.pc!==options.topPc) return;
    const minFret=Math.min(...positions.map(note=>note.fret)),maxFret=Math.max(...positions.map(note=>note.fret));
    const lower=range?Math.max(0,range.start-minFret):0,upper=range?Math.max(0,maxFret-range.end):0;
    const shiftFrets=Math.max(lower,upper),regionDistance=lower+upper;
    if (range&&shiftFrets>2) return;
    const intervals=positions.map(note=>info.label(note.pc));
    const notes=positions.map((note,index)=>({...note,root:note.pc===info.root,chord:true,name:info.name(note.pc),scaleIndex:index}));
    const key=positions.map(note=>`${note.string}-${note.fret}`).join('.');
    const start=Math.min(minFret,20);
    const board={id:`${approach}:${key}`,name:recipe.name,title:recipe.name,approach,type:approach,kind:recipe.kind,
      recipeId:recipe.id,recipe,intervals,formula:intervals.join('–'),notes,start,end:Math.max(start+4,maxFret),minFret,maxFret,
      rootPc:info.root,strings:notes.map(note=>6-note.string),wide:false,
      bass:notes[0].name,bassInterval:intervals[0],topPc:top.pc,topName:info.name(top.pc),topInterval:intervals.at(-1),
      contained:!range||regionDistance===0,inRange:!range||regionDistance===0,shiftFrets,regionDistance,
      relation:recipe.relation||'',added:notes.filter(note=>!info.chord.includes(note.pc)).map(note=>note.name),
      omitted:info.chord.filter(pc=>!notes.some(note=>note.pc===pc)).map(info.name),
      addedIntervals:notes.filter(note=>!info.chord.includes(note.pc)).map(note=>info.label(note.pc)),
      omittedIntervals:info.chord.filter(pc=>!notes.some(note=>note.pc===pc)).map(info.label),
      triad:recipe.triad||null,quartalSteps:recipe.steps||null};
    board.voiceLeading=voiceLeadingFor(options.previous,board);
    const centre=range?(range.start+range.end)/2:6;
    board.score=Math.abs((minFret+maxFret)/2-centre)+(maxFret-minFret)*1.5
      +notes.reduce((sum,note)=>sum+5-note.string,0)*.3+recipe.priority*.8;
    const existing=candidates.get(key);
    if (!existing||board.score<existing.score) candidates.set(key,board);
  };
  for (const recipe of recipes) {
    const groups=strings.length?(strings.length===recipe.pcs.length?[strings]:[]):GROUPS.filter(group=>group.length===recipe.pcs.length);
    findShapes(recipe,groups,accept);
  }
  const compare=(a,b)=>(range?Number(!a.contained)-Number(!b.contained)||a.shiftFrets-b.shiftFrets||a.regionDistance-b.regionDistance:0)
    ||(options.previous?a.voiceLeading.distance-b.voiceLeading.distance:0)||a.score-b.score||a.id.localeCompare(b.id);
  const sorted=[...candidates.values()].sort(compare);
  const limit=Number.isFinite(options.limit)?Math.max(1,Math.min(8,Math.floor(options.limit))):8;
  // The first choices demonstrate different recipes. With a previous chord,
  // movement takes precedence so the shortest connection remains first.
  const selected=[];
  if (!options.previous) {
    const recipesSeen=new Set();
    for (const board of sorted) if (!recipesSeen.has(board.recipeId)) {
      selected.push(board);recipesSeen.add(board.recipeId);
      if (selected.length===limit) break;
    }
  }
  for (const board of sorted) if (selected.length<limit&&!selected.includes(board)) selected.push(board);
  selected.sort(compare);
  return {...result,voicings:selected,recommendedId:options.previous?selected[0]?.id??null:null,
    reason:selected.length?'':'No comfortable shape matches this string group, top note and fret range. Try another group or widen the range.'};
}
