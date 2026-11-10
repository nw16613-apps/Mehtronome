import {normalizeCustomProgression,cloneTemplate,MAX_CHART_STEPS,customPitchName} from './custom-progression.js';
import {orderedRoots,generatorRootLetter} from './progression-generator.js';
import {harmonyAt,MODES,CHORDS,PROGRESSIONS} from '../audio/music.js';
import {scaleChoicesForChord,chordChoicesForMode} from './scale-explorer.js';
import {JAZZ_STANDARDS} from './jazz-standards.js';
import {REFERENCE_PERFORMANCES,referenceChart} from '../audio/reference-performances.js';
import {REPERTOIRE_STUDIES} from './repertoire.js';

export const STUDY_PATH_KEY='mehtronome-dorian-study-path-v1';
export const STUDY_TIERS=[
 {id:1,name:'One mode · one key',scope:'Across the neck'},
 {id:2,name:'Changing keys',scope:'One chord quality & mode'},
 {id:3,name:'Mixed qualities & modes',scope:'Turnarounds · across the neck'},
 {id:4,name:'Standards & songs',scope:'Complete forms · across the neck'},
];
export const STUDY_MATERIALS=[
 ['positionalscale','Scale','Scale'],['positional','Core arpeggio','Arpeggio'],['voicings','CAGED chord voicings','Chords'],
 ['thirds','Scale in thirds','Scale sequences'],['fourths','Scale in fourths','Scale sequences'],['sixths','Scale in sixths','Scale sequences'],
 ['groups3','Scale groups of three','Scale sequences'],['groups4','Scale groups of four','Scale sequences'],
 ['digital1324','1–3–2–4','Scale sequences'],['cells','1–2–3–5','Scale sequences'],
 ['arpgroups3','Arpeggio groups of three','Arpeggio sequences'],['arpgroups4','Arpeggio groups of four','Arpeggio sequences'],
 ['harmonized','Diatonic seventh arpeggios','Arpeggio sequences'],['alternating','Alternating diatonic arpeggios','Arpeggio sequences'],
];
export const STUDY_ROOT_ORDERS={fourths:'Circle of fourths',fifths:'Perfect fifths',minorThird:'Minor thirds · ♭3',majorThird:'Major thirds',whole:'Whole steps',chromatic:'Semitones',tritone:'Tritones',random:'Random · all roots'};
export const STUDY_TURNAROUNDS={two:'ii–V',three:'ii–V–I',four:'vi–ii–V–I',...Object.fromEntries(Object.entries(PROGRESSIONS).filter(([id,p])=>p.kind==='jazz'&&id!=='jazzBlues'&&id!=='major251').map(([id,p])=>[id,p.name]))};
const positions=['I','II','III','IV','V'],regions=['low','lowerMiddle','middle','upperMiddle','high'];
export const studyModeChoices=chord=>scaleChoicesForChord(chord).filter(c=>c.strict);
export const studyChordChoices=mode=>chordChoicesForMode(mode).filter(c=>c.strict);
export function studyPair(mode='dorian',chord='min7',workflow='mode'){
 if(!MODES[mode])mode='dorian';if(!CHORDS[chord])chord='min7';
 if(!studyModeChoices(chord).some(c=>c.id===mode)){
  if(workflow==='chord')mode=studyModeChoices(chord).find(m=>MODES[m.id].chord===chord)?.id||studyModeChoices(chord)[0]?.id||'dorian';
  else chord=studyChordChoices(mode).find(c=>c.suggested)?.id||studyChordChoices(mode)[0]?.id||'min7';
 }
 return {mode,chord};
}
function rhythmChanges(){
 const step=(root,chord,mode,beats=2)=>({root,chord,mode,beats});
 const a=()=>[
 step(0,'maj7','major'),step(9,'min7','minor'),step(2,'min7','dorian'),step(7,'dom7','mixolydian'),
 step(0,'maj7','major'),step(9,'min7','minor'),step(2,'min7','dorian'),step(7,'dom7','mixolydian'),
 step(0,'dom7','mixolydian'),step(5,'maj7','lydian'),step(5,'min7','dorian'),step(10,'dom7','mixolydian'),
 step(0,'maj7','major'),step(9,'dom7alt','altered'),step(2,'min7','dorian'),step(7,'dom7','mixolydian')];
 const first=a(),second=a(),last=a();first[0].section='A1';second[0].section='A2';last[0].section='A3';
 last.splice(-2,2,step(0,'maj7','major',4));
 const bridge=[step(4,'dom7','mixolydian',8),step(9,'dom7','mixolydian',8),step(2,'dom7','mixolydian',8),step(7,'dom7','mixolydian',8)];bridge[0].section='B';
 return normalizeCustomProgression({name:'Rhythm changes · AABA study',sourceNotes:'Original practice form based on common rhythm changes. Chord-scale guides are editable suggestions.',steps:[...first,...second,...bridge,...last]});
}
export const STUDY_FORMS=[
 ...Object.values(REFERENCE_PERFORMANCES).sort((a,b)=>a.name.localeCompare(b.name)).map(def=>{
  const chart=referenceChart(def.id);
  return {...chart,id:'reference:'+def.id,name:def.name,label:`${def.name} · ${def.bars} bars · ${def.bpm} BPM`,group:'Backing reference studies',progression:normalizeCustomProgression(chart.progression)};
 }),
 ...Object.entries(PROGRESSIONS).filter(([,p])=>p.kind==='modal').map(([id,p])=>{
  const key=9,settings={key,beats:4,template:id,progression:true,mode:p.mode,chord:MODES[p.mode].chord};
  return {id:'modal:'+id,name:p.name,key,beats:4,group:'Modal progressions',progression:normalizeCustomProgression({...cloneTemplate(p,settings.chord,settings.mode,settings),name:p.name})};
 }),
 ...JAZZ_STANDARDS.map(s=>({...s,id:'standard:'+s.id,group:'Jazz standards'})),
 {id:'form:rhythm',name:'Rhythm changes · AABA',key:10,beats:4,group:'Complete forms',progression:rhythmChanges()},
 {id:'form:jazz-blues',name:'12-bar jazz blues',key:5,beats:4,group:'Complete forms',progression:cloneTemplate(PROGRESSIONS.jazzBlues,'dom7','mixolydian')},
 ...REPERTOIRE_STUDIES.map(s=>({...s,id:'form:'+s.id,key:9,beats:4,group:'Original studies'})),
];
const patterns=s=>s.tier===1?'vamp':s.tier===2?'keys':s.tier===3?'turnaround:'+s.turnaround+(s.keyCycle==='fourths'?':fourths':''):s.form;
export function normalizeStudyPath(value={}){
 value=value&&typeof value==='object'?value:{};const root=Number(value.root),pair=studyPair(value.mode,value.chord,value.workflow||'mode');
 const harmonyEdits={};for(const [i,e]of Object.entries(value.harmonyEdits||{}).slice(0,128))if(/^\d+$/.test(i)&&Number(i)<128&&e&&typeof e==='object')harmonyEdits[i]=studyPair(e.mode,e.chord,'mode');
 return {tier:[1,2,3,4].includes(Number(value.tier))?Number(value.tier):1,root:Number.isInteger(root)&&root>=0&&root<12?root:9,...pair,
  workflow:value.workflow==='chord'?'chord':'mode',material:STUDY_MATERIALS.some(([id])=>id===value.material)?value.material:'positionalscale',
  position:positions.includes(value.position)?value.position:'I',region:regions.includes(value.region)?value.region:'middle',
  route:['manual','framework'].includes(value.route)?'manual':'region',order:Object.hasOwn(STUDY_ROOT_ORDERS,value.order)?value.order:'fourths',
  coverage:value.coverage===true,keyCycle:value.keyCycle==='fourths'?'fourths':'single',turnaround:Object.hasOwn(STUDY_TURNAROUNDS,value.turnaround)?value.turnaround:'three',
  form:typeof value.form==='string'&&value.form.length<100?value.form:'standard:autumn-leaves',
  bars:[1,2,4,8].includes(Number(value.bars))?Number(value.bars):2,passes:Math.max(1,Math.min(8,Math.floor(Number(value.passes)||1))),
  manualPositions:Array.isArray(value.manualPositions)?value.manualPositions.slice(0,128).map(p=>positions.includes(p)?p:null):[],
  harmonyEdits,editContext:typeof value.editContext==='string'?value.editContext.slice(0,120):'',card:Math.max(0,Math.min(127,Math.floor(Number(value.card)||0)))};
}
export function readStudyPath(raw){
 try{const data=JSON.parse(raw||'{}'),previous=data?.selection;
  // Existing mixed-pattern drafts belong to Tier 3; the loaded working chart is untouched.
  const selection=Number(previous?.tier)===2&&Object.hasOwn(STUDY_TURNAROUNDS,previous.variation)?{...previous,tier:3,turnaround:previous.variation,editContext:'',harmonyEdits:{}}:previous;
  return {selection:normalizeStudyPath(selection),marked:Array.isArray(data.marked)?[...new Set(data.marked.filter(id=>typeof id==='string'&&id.length<500))].slice(0,3000):[]};}
 catch{return {selection:normalizeStudyPath(),marked:[]};}
}
const hash=text=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return (n>>>0).toString(36);};
function turnaround(id,bars){
 if(PROGRESSIONS[id])return cloneTemplate(PROGRESSIONS[id],'min7','dorian').steps.flatMap(step=>{
  let remaining=(step.beats??step.bars*4)*bars;const out=[];
  while(remaining>0){const duration=Math.min(32,remaining);const {bars:oldBars,beats:oldBeats,...rest}=step;out.push({...rest,beats:duration,...(out.length?{section:''}:{})});remaining-=duration;}
  return out;
 });
 const ii={root:2,letter:1,chord:'min7',mode:'dorian',bars},v={root:7,letter:4,chord:'dom7',mode:'mixolydian',bars},i={root:0,letter:0,chord:'maj7',mode:'major',bars};
 return id==='two'?[ii,v]:id==='four'?[{root:9,letter:5,chord:'min7',mode:'minor',bars},ii,v,i]:[ii,v,i];
}
export function studyPathPlan(value,sources=STUDY_FORMS){
 const s=normalizeStudyPath(value),navigation=s.route==='manual'?'all':'path';let key=s.root,base,name,metadata={},beats=4;
 if(s.tier===4){
  const source=sources.find(f=>f.id===s.form)||STUDY_FORMS.find(f=>f.id==='standard:autumn-leaves');s.form=source.id;
  const clean=normalizeCustomProgression(source.progression);base=clean.steps;name=source.name;beats=source.beats||4;
  metadata={sourceNotes:clean.sourceNotes,sources:clean.sources,referencePerformance:clean.referencePerformance,arrangedPerformance:clean.arrangedPerformance};
 }else if(s.tier===3){
  base=turnaround(s.turnaround,s.bars);name=STUDY_TURNAROUNDS[s.turnaround];
  if(s.keyCycle==='fourths'){
   const phrase=base,keys=orderedRoots({start:key,order:'fourths',count:12});
   base=keys.flatMap(tonic=>{
    const offset=(tonic-key+12)%12,letter=generatorRootLetter(key,tonic,true),keyName=customPitchName(key,offset,letter);
    return phrase.map((step,i)=>({...step,root:(offset+step.root)%12,letter:(letter+step.letter)%7,
     ...(step.bass!==null&&step.bass!==undefined?{bass:(offset+step.bass)%12,bassLetter:(letter+step.bassLetter)%7}:{}),
     ...(!i?{section:keyName+(step.section?' · '+step.section:'')}:{})}));
   });
   name+=' · Circle of fourths';
  }
 }
 else{
  const cycle={fourths:12,fifths:12,minorThird:4,majorThird:3,whole:6,chromatic:12,tritone:2,random:12};
  const roots=s.tier===1?[s.root]:orderedRoots({start:s.root,order:s.order,coverage:s.order==='random'||s.coverage,count:s.coverage?12:cycle[s.order]});
  base=roots.map(root=>({root:(root-key+12)%12,letter:generatorRootLetter(key,root,['fourths','minorThird','majorThird','tritone'].includes(s.order)),chord:s.chord,mode:s.mode,bars:s.bars}));
  name=s.tier===1?`${MODES[s.mode].name} · ${CHORDS[s.chord].name}`:`${MODES[s.mode].name} · ${STUDY_ROOT_ORDERS[s.order]}`;
 }
 const maxPasses=Math.min(8,Math.max(1,Math.floor(MAX_CHART_STEPS/base.length)));s.passes=Math.min(s.passes,maxPasses);
 const steps=Array.from({length:s.passes},(_,pass)=>base.map((step,i)=>({...step,...(s.passes>1&&i===0?{section:`Pass ${pass+1}${step.section?' · '+step.section:''}`}:{})}))).flat();
 if(s.tier>=3&&s.editContext===patterns(s))for(const [i,e]of Object.entries(s.harmonyEdits))if(steps[Number(i)])Object.assign(steps[Number(i)],e);
 const progression=normalizeCustomProgression({name,...metadata,steps}),chart={key,beats,progression};
 const settings={key,mode:s.mode,chord:s.chord,template:'custom',progression:true,beats,customProgression:progression};
 const harmonies=steps.map((_,i)=>harmonyAt(settings,i)),chords=harmonies.map(h=>h.name+h.suffix);
 const route=navigation==='all'?steps.map((_,i)=>s.manualPositions[i]||s.position):null;
 const id='v2:'+s.tier+':'+hash(JSON.stringify([key,beats,progression,route||s.region,s.material]));
 return {selection:s,chart,navigation,positions:route,study:s.material==='voicings'?'positional':s.material,chords,harmonies,id,maxPasses,baseCount:base.length,editContext:patterns(s),singleQuality:s.tier<=2,sources,view:s.material==='voicings'?'guitar':'exercises'};
}
export const studyPathId=(s,sources)=>studyPathPlan(s,sources).id;
