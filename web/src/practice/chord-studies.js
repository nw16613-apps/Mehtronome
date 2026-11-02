import {chordMaterial,chordVoicings,scaleChord,voiceLeadingCost} from '../guitar/chord-library.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {harmonyAt} from '../audio/music.js';
import {recommendedMode} from './custom-progression.js';
export const CHORD_STUDIES={progression:'Chord changes',scale:'Chord scale',inversions:'Inversions',sequence:'Chord-scale sequence',voiceleading:'Voice-leading route',transform:'Voicing transformations',comping:'Rhythmic comping'};
export function chordAttacks(duration,beats,rhythm){
 if(rhythm==='held')return [{at:0,duration}];
 const entries=[];for(let bar=0;bar<duration;bar+=beats){const positions=rhythm==='offbeats'?Array.from({length:beats},(_,i)=>i+.5):rhythm==='syncopated'?[0,1.5,2.5]:Array.from({length:beats},(_,i)=>i);
  for(const at of positions)if(bar+at<duration)entries.push({at:bar+at,duration:Math.min(rhythm==='quarter'?1:.5,duration-bar-at)});
 }
 return entries;
}
export function chordStudyPlan(harmonies,durations,path,options={}){
 const {study='progression',material='seventh',family='drop2',construction='thirds',movement='step',inversion='all',rhythm='held',beats=4,motion='ascending'}=options;
 const groups=[],events=[],slots=[],warnings=[];let offset=0,index=0,cursor=0,previous=null,fixedSet=options.strings||'auto',lastContext='',lastDegree=-1;
 for(let slot=0;slot<harmonies.length;slot++){
  const harmony=harmonies[slot],position=path[slot],board=fretboardFor(harmony,position.geometryShape),duration=durations[slot],context=JSON.stringify([harmony.chordPcs,harmony.scalePcs]);
  if(context!==lastContext){cursor=0;lastDegree=-1;}lastContext=context;
  const notes=[],labels=[],grips=[],failures=new Set();
  for(const attack of chordAttacks(duration,beats,rhythm)){
   let target,degree=0;
   if(study==='scale'||study==='sequence'){
    const n=harmony.scalePcs.length,step={step:1,thirds:2,fourths:3,fifths:4}[movement]||1;
    degree=study==='sequence'?(Math.floor(cursor/4)*2+[0,2,1,3][cursor%4])%n:cursor*step%n;
    if(motion==='descending')degree=n-1-degree;
    target=scaleChord(harmony,degree,material,construction,options.formula);
    if(target&&['shell','rootless','guide','extensions'].includes(material))target=chordMaterial(target,material);
   }else if(study==='transform'){
    const chord=['major','maj7','dom7','minor','min7'][cursor%5],h=harmonyAt({key:harmony.chordPcs[0],chord,mode:recommendedMode(chord)});target=chordMaterial(h,['major','minor'].includes(chord)?'triad':material);
   }else target=chordMaterial(harmony,material);
   let requested=inversion;
   if(study==='inversions'&&target)requested=String(motion==='descending'?target.chordPcs.length-1-cursor%target.chordPcs.length:cursor%target.chordPcs.length);
   if(study==='inversions'&&target&&fixedSet==='auto'){
    const all=chordVoicings(target,board,{...options,strings:'auto',inversion:'all'}),sets=[...new Set(all.map(g=>g.stringSet))];
    fixedSet=sets.toSorted((a,b)=>new Set(all.filter(g=>g.stringSet===b).map(g=>g.inversion)).size-new Set(all.filter(g=>g.stringSet===a).map(g=>g.inversion)).size||all.find(g=>g.stringSet===a).score-all.find(g=>g.stringSet===b).score)[0]||'auto';
   }
   if(family!=='caged'&&study!=='inversions'&&target&&fixedSet==='auto'){
    const all=chordVoicings(target,board,{...options,strings:'auto',inversion:requested}),sets=[...new Set(all.map(g=>g.stringSet))];
    const targets=(study==='scale'||study==='sequence')?harmony.scalePcs.map((_,degree)=>{let h=scaleChord(harmony,degree,material,construction,options.formula);if(h&&['shell','rootless','guide','extensions'].includes(material))h=chordMaterial(h,material);return {h,board};}):harmonies.map((h,i)=>({h:chordMaterial(h,material),board:fretboardFor(h,path[i].geometryShape)}));
    const coverage=new Map(sets.map(set=>[set,targets.filter(t=>t.h&&chordVoicings(t.h,t.board,{...options,strings:set,inversion:requested}).length).length]));
    fixedSet=sets.toSorted((a,b)=>coverage.get(b)-coverage.get(a)||all.find(g=>g.stringSet===a).score-all.find(g=>g.stringSet===b).score)[0]||'auto';
   }
   const candidates=target?chordVoicings(target,board,{...options,strings:fixedSet,inversion:requested}):[];
   let grip=candidates[0];
   if(study==='inversions'&&target){const down=motion==='descending',first=cursor%target.chordPcs.length===0;const directed=first?candidates:candidates.filter(g=>!previous||(down?g.notes[0].midi<previous.notes[0].midi:g.notes[0].midi>previous.notes[0].midi));grip=directed.toSorted((a,b)=>first?(down?b.notes[0].midi-a.notes[0].midi:a.notes[0].midi-b.notes[0].midi):Math.abs(a.notes[0].midi-previous.notes[0].midi)-Math.abs(b.notes[0].midi-previous.notes[0].midi))[0]||grip;}
   if(study==='voiceleading'||study==='comping')grip=candidates.toSorted((a,b)=>voiceLeadingCost(previous,a)-voiceLeadingCost(previous,b))[0];
   if((study==='scale'||study==='sequence')&&previous&&degree!==lastDegree&&movement==='step'&&study==='scale'){
    const ascending=motion!=='descending',wrap=ascending?degree<lastDegree:degree>lastDegree;
    if(!wrap){const directional=candidates.filter(g=>ascending?g.notes[0].midi>=previous.notes[0].midi:g.notes[0].midi<=previous.notes[0].midi);grip=directional.toSorted((a,b)=>Math.abs(a.notes[0].midi-previous.notes[0].midi)-Math.abs(b.notes[0].midi-previous.notes[0].midi))[0]||grip;}
   }
   cursor++;lastDegree=degree;
   if(!grip){failures.add(!target?'The requested chord material is absent.':'No playable voicing fits this string set, inversion and region.');continue;}
   if(family!=='caged'&&fixedSet==='auto'&&grip.stringSet)fixedSet=grip.stringSet;
   const voices=grip.notes.map(n=>({...n})),note={...voices[0],voices,grip,harmony:target,studyLabel:grip.label},local=notes.length;
   notes.push(note);grips.push(grip);labels.push(grip.label);
   events.push({index:index+local,note,step:options.steps?.[slot]??slot,slot,start:offset+attack.at,duration:attack.duration,accent:attack.at%beats===0});previous=grip;
  }
  const warning=[...failures].join(' ');if(warning)warnings.push(`${harmony.name}${harmony.suffix}: ${warning} Try another string set, all bass inversions, or Across the neck.`);
  const group={slot,harmony,board,position,chord:harmony.name+harmony.suffix,rootName:harmony.name,notes,grip:grips[0]||null,globalStart:index,targetIndices:[],materialCells:labels,cellLengths:notes.map(()=>1),warning,annotation:CHORD_STUDIES[study]||'Chord study',chordStudy:true};groups.push(group);
  slots.push({slot,step:options.steps?.[slot]??slot,start:offset,duration,chord:group.chord,annotation:group.annotation,harmony,board,position});index+=notes.length;offset+=duration;
 }
 return {groups,plan:{events,slots,warnings:[...new Set(warnings)],duration:offset,harmonicDuration:offset,cycles:1,beats,division:1,study:'chord:'+study,chordStudy:true}};
}
