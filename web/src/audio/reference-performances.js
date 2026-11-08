import {harmonyAt,progressionBeatDurations,progressionDefinition,MODES,ROOT_NAMES} from './music.js';
import {coordinateEnsemble} from './ensemble-conversation.js';
import {withReferenceActivity} from './reference-activity.js';
import {arrangeReference,arrangementSupport} from './reference-arranger.js';
import {STYLE_REFERENCES,catalogueScore} from './reference-catalogue.js';
import {sessionEvents} from './session-performance.js';
export {sessionEventGain} from './session-performance.js';
// Original, explicitly written ensemble studies. This is score playback, not
// runtime AI generation. Rows are bars; onsets/durations are quarter-note beats.
// Blues half-beats swing through the existing common clock.
const bluesHarmony=[
 [5,'dom9','mixolydian',4],[10,'dom9','mixolydian',4],[5,'dom9','mixolydian',4],[5,'dom13','mixolydian',4],
 [10,'dom9','mixolydian',4],[11,'dim7','diminished_whole_half',4],[5,'dom9','mixolydian',4],[2,'dom7alt','altered',4],
 [7,'min9','dorian',4],[0,'dom13','mixolydian',4],[5,'dom9','mixolydian',2],[2,'dom7alt','altered',2],[7,'min9','dorian',2],[0,'dom13','mixolydian',2],
];
const fusionHarmony=[
 [9,'maj9sharp11','lydian',8],[0,'min9','dorian',8],[3,'maj9sharp11','lydian',8],[2,'min9','dorian',4],[7,'dom13','mixolydian',4],
 [0,'maj9sharp11','lydian',8],[6,'min9','dorian',8],[10,'maj9sharp11','lydian',8],[4,'dom13','mixolydian',4],[9,'maj9sharp11','lydian',4],
];
export const REFERENCE_PERFORMANCES={
 ...STYLE_REFERENCES,
 blues:{id:'blues',name:'Blues · Two conversations',style:'blues',key:5,bpm:112,bars:24,rate:2,
  description:'Two 12-bar choruses in F. A restrained opening develops into a second chorus, with walking bass, guitar replies, organ melody and written turnarounds.',
  harmony:[...bluesHarmony,...bluesHarmony],sections:{0:'First chorus · call',4:'First chorus · response',8:'First turnaround',12:'Second chorus · develop',16:'Second chorus · lift',20:'Final turnaround'}},
 legatoFusion:{id:'legatoFusion',name:'Legato Fusion · Drifting light',style:'legatoFusion',key:9,bpm:104,bars:16,rate:4,
  description:'An original 16-bar study in shifting tonal centres. A connected flute line floats over sustained guitar voicings, melodic electric bass and an evolving ride part.',
  harmony:fusionHarmony,sections:{0:'Opening · spacious',4:'Lift · develop',8:'Contrast · answer',12:'Return · resolve'}},
};
// Bass rows: onset:MIDI:duration. Deliberate chromatic approaches belong to the
// written line; they must not be snapped back to a chord or scale index.
const bass={
 blues:[
 '0:41:.92 1:45:.9 2:48:.94 3:46:.9','0:46:.94 1:50:.9 2:53:.92 3:40:.88','0:41:.94 1:48:.9 2:45:.9 3:43:.92','0:41:.94 1:45:.9 2:50:.9 3:45:.88',
 '0:46:.92 1:50:.9 2:53:.9 3:42:.88','0:47:.92 1:50:.9 2:53:.9 3:40:.88','0:41:.94 1:45:.92 2:48:.9 3:37:.88','0:38:.94 1:42:.9 2:44:.9 3:42:.88',
 '0:43:.92 1:46:.9 2:45:.9 3:35:.88','0:36:.92 1:40:.9 2:45:.9 3:40:.88','0:41:.92 1:45:.9 2:38:.92 3:42:.9','0:43:.92 1:46:.9 2:36:.92 3:40:.9',
 '0:41:.94 1:43:.9 2:45:.9 3:45:.9','0:46:.94 1:48:.9 2:49:.9 3:40:.9','0:41:.94 1:45:.9 2:48:.9 3:50:.9','0:51:.92 1:50:.9 2:48:.9 3:45:.9',
 '0:46:.94 1:41:.9 2:44:.9 3:46:.9','0:47:.94 1:44:.9 2:41:.9 3:40:.9','0:41:.94 1:48:.9 2:51:.9 3:37:.9','0:38:.94 1:41:.9 2:44:.9 3:42:.9',
 '0:43:.94 1:45:.9 2:46:.9 3:35:.9','0:36:.94 1:40:.9 2:43:.9 3:40:.9','0:41:.94 1:45:.9 2:38:.94 3:42:.9','0:43:.94 1:46:.9 2:36:.94 3:40:.9',
 ],
 legatoFusion:[
 '0:33:2.8 3.5:40:.5','1:44:1.6 3:47:.8','0:36:2.6 3:43:.85','0.5:46:1.3 2.5:38:1.3',
 '0:39:2.8 3.25:46:.6','0.5:50:1.4 2.5:46:.7 3.5:37:.4','0:38:2.5 3:45:.8','0:43:1.4 2:47:.8 3:35:.8',
 '0:36:3.4','0.75:43:1.3 2.5:47:.9 3.5:41:.4','0:42:2.7 3.25:49:.6','0.5:52:1.4 2.5:49:.7 3.5:45:.4',
 '0:46:2.8 3.25:41:.6','0.5:45:1.5 2.75:48:.65 3.5:39:.4','0:40:1.5 2:44:.8 3:47:.75','0:33:3.7',
 ],
};
// Comping: onset:duration:velocity:exact MIDI voicing. The guitar answers gaps
// in the Blues lead; fusion attacks often sustain across a barline.
const comping={
 blues:[
 '0:.55:.49:57,63,67,72 2.5:.65:.44:57,63,67,72','1.5:.65:.46:56,60,62,65 3:.5:.4:56,60,62,65','0.5:.5:.43:57,63,67,72','1:.6:.44:57,63,67,74 3:.5:.46:57,63,67,74',
 '0:.7:.48:56,60,62,65 2.5:.5:.4:56,60,62,65','1:.65:.43:56,59,62,65 3:.45:.39:56,59,62,65','0.5:.7:.46:57,63,67,72','0:.65:.47:54,60,65,70 2.5:.6:.41:54,60,65,70',
 '1:.7:.44:58,62,65,69','0.5:.65:.44:58,62,64,69 2.5:.5:.4:58,62,64,69','0:.65:.46:57,63,67,72 2:.65:.45:54,60,65,70','0:.6:.44:58,62,65,69 2.5:.5:.48:58,62,64,69',
 '0:.65:.51:57,63,67,72 3:.5:.42:57,63,67,72','1:.6:.46:56,60,62,65 2.5:.5:.43:56,60,62,65','0.5:.6:.46:57,63,67,72 3:.5:.41:57,63,67,72','1.5:.7:.47:57,63,67,74',
 '0:.75:.52:56,60,62,65 3:.45:.44:56,60,62,65','0.5:.6:.44:56,59,62,65 2:.55:.46:56,59,62,65','1:.65:.47:57,63,67,72','0:.7:.49:54,60,65,70 3:.5:.42:54,60,65,70',
 '0.5:.7:.46:58,62,65,69 3:.5:.42:58,62,65,69','1:.65:.48:58,62,64,69','0:.7:.48:57,63,67,72 2.5:.65:.46:54,60,65,70','0.5:.6:.45:58,62,65,69 2:.8:.46:58,62,64,69',
 ],
 legatoFusion:[
 '0:5.4:.48:44,56,59,63,68','2.5:1.35:.36:56,59,63,68','0:5.8:.46:46,58,62,67','3:1.2:.36:58,62,67,72',
 '0:5.5:.49:43,55,62,65,69','2.5:1.3:.38:55,62,65,69','0:3.5:.46:41,53,57,60,64','0.5:3:.46:41,53,59,64,69',
 '0:5.8:.47:40,52,59,62,66','3:1.4:.35:52,59,62,66','0:5.5:.47:45,57,61,64,68','2.5:1.3:.37:57,61,64,68',
 '0:5.8:.49:50,57,60,64,69','3:1.1:.36:57,60,64,69','0:3.5:.47:44,56,62,66,73','0:3.8:.46:44,56,59,63,68',
 ],
};
// Lead: onset:MIDI:duration[:velocity]. Rests are intentional. Notes may carry
// into the next bar: the scheduler must not release them on a harmony update.
const sequence={
 blues:[
 '0.5:69:.45 1:72:.9 2.5:75:.45 3:72:1.4','0.5:70:.45 1:69:.8 2.5:65:.9','1:68:.45 1.5:69:.45 2:72:1.3','0.5:75:.45 1:74:.9 2.5:72:.45 3:69:.8',
 '0.5:68:.45 1:65:1.2 3:62:.7','0.5:65:.45 1:68:.9 2.5:65:.45 3:62:.8','1:63:.45 1.5:64:.45 2:65:1.4','0.5:66:.45 1:65:.9 2.5:60:.45 3:58:.7',
 '0.5:58:.45 1:62:.9 2.5:65:1.3','0.5:64:.45 1:62:.9 2.5:58:.45 3:57:.8','0.5:57:.45 1:60:.8 2.5:60:.45 3:58:.8','0.5:58:.45 1:62:.7 2.5:64:1.15',
 '0.5:69:.45 1:72:.45 1.5:74:.45 2:75:.9 3.5:72:.8','1:70:.45 1.5:69:.45 2:68:.45 2.5:65:1.1','0.5:65:.45 1:68:.45 1.5:69:.9 3:72:.8','0:75:.9 1.5:74:.45 2:72:.9 3.5:69:.8',
 '1:68:.45 1.5:65:.45 2:62:.9 3.5:60:.8','1:62:.45 1.5:65:.45 2:68:1.3','0.5:69:.45 1:72:.45 1.5:75:.45 2:77:1.3','0.5:77:.45 1:75:.45 1.5:72:.45 2:70:.9 3.5:66:.45',
 '0.5:65:.45 1:62:.45 1.5:58:.9 3:57:.8','0.5:58:.45 1:62:.45 1.5:64:.9 3:69:.8','0.5:67:.45 1:65:.9 2.5:66:.45 3:65:.8','0.5:62:.45 1:58:.9 2.5:57:.45 3:55:.8',
 ],
 legatoFusion:[
 '0.5:71:.7 1.25:73:.45 1.75:75:1.2 3:76:1.6','1:75:.45 1.5:73:.95 2.5:71:1.4','0.5:70:.95 1.5:74:.45 2:77:1.9','0.5:79:.7 1.25:77:.45 1.75:74:.7 2.5:72:1.3',
 '0.5:74:.7 1.25:77:.45 1.75:81:1.2 3:79:1.4','1:77:.45 1.5:74:.7 2.25:72:.45 2.75:70:.95','0.5:69:.7 1.25:72:.45 1.75:76:1.2 3:74:.85','0.5:71:.7 1.25:69:.45 1.75:67:.7 2.5:65:1.3',
 '0.5:66:.7 1.25:67:.45 1.75:71:1.2 3:74:1.6','1:76:.45 1.5:74:.7 2.25:71:.45 2.75:67:.95','0.5:68:.7 1.25:69:.45 1.75:73:1.2 3:76:1.6','1:80:.45 1.5:78:.45 2:76:.7 2.75:73:1.1',
 '0.5:76:.7 1.25:77:.45 1.75:81:1.2 3:79:1.5','1:77:.45 1.5:76:.7 2.25:72:.45 2.75:69:.95','0.5:68:.7 1.25:66:.45 1.75:64:.7 2.5:62:1.3','0.5:63:.7 1.25:64:.45 1.75:68:.7 2.5:71:1.3',
 ],
};
// Each complete bar is scored explicitly. k=kick, s=snare, h=hat,
// r=ride, p=pedal hat, t/u=high/low tom, c=crash. Quiet ghosts use low gain.
const drumNames={k:'kick',s:'snare',h:'hat',r:'ride',p:'hatPedal',t:'tomHigh',u:'tomLow',c:'crash'};
const drums={
 blues:[
 '0k.65 0h.21 2h.15 4s.52 4h.24 6h.14 8k.52 8h.2 10h.15 12s.54 12h.23 14h.14',
 '0k.6 0h.2 2h.14 4s.51 4h.23 6h.14 8k.49 8h.19 10h.14 12s.53 12h.24 14k.34 14h.14',
 '0k.63 0h.2 2h.14 4s.53 4h.24 6h.15 8k.5 8h.19 10s.1 10h.14 12s.54 12h.22 14h.14',
 '0k.62 0h.2 2h.14 4s.52 4h.23 6h.14 8k.5 8h.2 10h.15 12s.46 14s.26',
 '0k.66 0h.23 2h.15 4s.55 4h.24 6h.15 8k.52 8h.2 10h.14 12s.54 12h.24 14h.14',
 '0k.61 0h.2 2h.14 4s.5 4h.23 6h.14 8k.5 8h.2 10k.3 10h.14 12s.52 12h.23 14h.14',
 '0k.62 0h.21 2h.14 4s.52 4h.24 6h.14 8k.5 8h.2 10h.14 12s.53 12h.23 14h.14',
 '0k.62 0h.2 2h.14 4s.53 4h.23 6h.14 8k.49 8h.2 10h.14 12s.4 14t.28',
 '0k.65 0h.22 2h.14 4s.55 4h.24 6h.14 8k.53 8h.2 10h.15 12s.54 12h.24 14h.15',
 '0k.6 0h.2 2h.14 4s.51 4h.23 6h.14 8k.51 8h.2 10h.14 12s.54 12h.23 14k.3 14h.14',
 '0k.63 0h.2 2h.14 4s.54 4h.24 6h.14 8k.54 8h.21 10h.14 12s.52 12h.23 14h.15',
 '0k.62 0h.2 2h.14 4s.52 4h.23 6h.14 8k.5 8h.2 10s.2 12t.28 14u.32',
 '0k.68 0c.25 2h.15 4s.56 4h.24 6h.15 8k.54 8h.21 10h.15 12s.56 12h.25 14h.15',
 '0k.63 0h.22 2h.15 4s.54 4h.25 6h.15 8k.52 8h.21 10h.15 12s.55 12h.25 14k.32 14h.15',
 '0k.65 0h.22 2h.15 4s.55 4h.25 6h.15 8k.51 8h.21 10s.12 10h.15 12s.56 12h.25 14h.15',
 '0k.63 0h.22 2h.15 4s.54 4h.25 6h.15 8k.53 8h.22 10h.15 12s.47 14s.28',
 '0k.68 0h.24 2h.16 4s.57 4h.26 6h.15 8k.55 8h.22 10h.16 12s.56 12h.26 14h.15',
 '0k.64 0h.22 2h.15 4s.54 4h.25 6h.15 8k.51 8h.21 10k.32 10h.15 12s.55 12h.25 14h.15',
 '0k.65 0h.22 2h.15 4s.55 4h.25 6h.15 8k.52 8h.21 10h.15 12s.56 12h.25 14h.15',
 '0k.64 0h.22 2h.15 4s.54 4h.25 6h.15 8k.52 8h.21 10h.15 12t.3 14u.34',
 '0k.68 0h.24 2h.15 4s.57 4h.26 6h.15 8k.55 8h.22 10h.16 12s.57 12h.26 14h.15',
 '0k.64 0h.22 2h.15 4s.54 4h.25 6h.15 8k.52 8h.21 10h.15 12s.55 12h.25 14k.32 14h.15',
 '0k.65 0h.22 2h.15 4s.55 4h.25 6h.15 8k.54 8h.22 10h.15 12s.56 12h.25 14h.15',
 '0k.63 0h.21 2h.14 4s.52 4h.24 6h.14 8k.51 8h.2 10s.24 12t.3 14u.35',
 ],
 legatoFusion:[
 '0k.56 0r.23 4r.18 6s.12 8r.22 8p.16 10k.35 12s.44 12r.18 15r.13',
 '0r.22 3k.38 4r.18 8s.43 8r.22 10r.14 12p.16 14r.17',
 '0k.54 0r.24 4r.18 7s.12 8r.22 8p.16 11k.34 12s.45 14r.17',
 '0r.22 2k.34 4r.18 8s.4 8r.2 10s.16 12t.23 14u.26',
 '0k.6 0c.24 4r.2 6k.36 8s.48 8r.25 10r.15 12p.17 14r.19',
 '0r.25 3k.4 4r.19 7s.14 8r.23 10k.35 12s.48 12r.2 15r.15',
 '0k.56 0r.23 4r.18 6s.14 8s.46 8r.23 11k.36 12r.18 14r.17',
 '0k.55 0r.24 4s.43 4r.18 8k.4 8r.22 10s.2 12t.28 14u.3',
 '0k.51 0r.21 4r.16 8p.15 8r.19 12s.38 14r.14',
 '0r.21 3k.32 4r.16 8s.39 8r.19 12p.15 14r.15',
 '0k.54 0r.22 4r.17 6s.11 8r.21 10k.33 12s.42 14r.16',
 '0r.22 2k.35 4r.18 8s.42 8r.21 10s.16 12t.22 15u.25',
 '0k.6 0c.24 4r.2 6k.38 8s.49 8r.25 10r.16 12p.17 14r.19',
 '0r.25 3k.4 4r.2 7s.14 8r.24 10k.36 12s.49 12r.2 15r.15',
 '0k.58 0r.25 4s.46 4r.19 8k.41 8r.23 10s.2 12t.29 14u.32',
 '0k.54 0c.22 4r.17 8r.19 8p.15 12s.36 14r.14',
 ],
};
function indexRows(rows,rate,parse){
 const slots=Array.from({length:rows.length*4*rate},()=>[]);
 rows.forEach((row,bar)=>row.split(' ').filter(Boolean).forEach(token=>{const event=parse(token);slots[bar*4*rate+Math.round(event.at*rate)].push({...event,bar});}));return slots;
}
const scores=new Map();
export function referenceScore(id){
 if(scores.has(id))return scores.get(id);const def=Object.hasOwn(REFERENCE_PERFORMANCES,id)?REFERENCE_PERFORMANCES[id]:null;if(!def)return null;
 if(STYLE_REFERENCES[id]){const score=catalogueScore(id);scores.set(id,score);return score;}
 const pitched=t=>{const [at,midi,duration,velocity]=t.split(':').map(Number);return {at,midi,duration,velocity:Number.isFinite(velocity)?velocity:.62};};
 const score={id,bars:def.bars,rate:def.rate,
  bass:indexRows(bass[id],4,pitched),sequence:indexRows(sequence[id],def.rate,pitched),
  comping:indexRows(comping[id],4,t=>{const [at,duration,velocity,notes]=t.split(':');return {at:+at,duration:+duration,velocity:+velocity,notes:notes.split(',').map(Number)};}),
  drums:indexRows(drums[id],4,t=>{const [,slot,name,gain]=t.match(/^(\d+)([kshrptuc])(\.\d+)$/);return {at:+slot/4,name:drumNames[name],velocity:+gain};}),
 };scores.set(id,score);return score;
}
export function referenceChart(id){
 const def=Object.hasOwn(REFERENCE_PERFORMANCES,id)?REFERENCE_PERFORMANCES[id]:null;if(!def)throw new Error('Unknown reference performance.');let beat=0;
 const letters=[0,1,1,2,2,3,3,4,5,5,6,6];
 return {key:def.key,beats:def.beats||4,bpm:def.bpm,sequenceActivity:'supporting',progression:{version:2,name:def.name,referencePerformance:id,sourceNotes:'Original authored backing study chart. The selected backing style automatically adapts to these changes. Transposition, tempo changes and chart edits are supported; no external music-generation service.',steps:def.harmony.map(([pc,chord,mode,duration])=>{const section=def.sections[beat/(def.beats||4)];beat+=duration;return {root:(pc-def.key+12)%12,letter:(letters[pc]-letters[def.key]+7)%7,chord,mode,beats:duration,...(section?{section}:{})};})}};
}
// Validate once per configure, never per sample. An edited chart must not keep
// playing the old pitches under new chord symbols. Keep the marker for Undo.
// Automatic playback derives an ephemeral chart from the actual harmonic
// context. The user's chart, metadata, loop and settings are never rewritten.
export function automaticBackingSettings(settings){
 const def=Object.hasOwn(REFERENCE_PERFORMANCES,settings.backingStyle)?REFERENCE_PERFORMANCES[settings.backingStyle]:null;if(!def)return null;
 const definition=progressionDefinition(settings),durations=settings.progression?progressionBeatDurations(settings):[settings.beats*4];
 const steps=durations.map((duration,index)=>{
  const h=harmonyAt(settings,index),root=h.chordPcs[0],intervals=[...new Set(h.scalePcs.map(pc=>(pc-root+12)%12))].sort((a,b)=>a-b);
  const matches=id=>MODES[id]&&JSON.stringify([...MODES[id].intervals].sort((a,b)=>a-b))===JSON.stringify(intervals);
  const mode=matches(h.mode)?h.mode:Object.keys(MODES).find(matches)||h.mode;
  const section=definition.steps?.[index]?.section;
  return {root:(root-settings.key+12)%12,letter:('CDEFGAB'.indexOf(h.name[0])-'CDEFGAB'.indexOf(ROOT_NAMES[settings.key][0])+7)%7,chord:h.chordId,mode,beats:duration,bass:Number.isFinite(h.bassMidi)?(h.bassMidi-settings.key+120)%12:null,...(section?{section}:{})};
 });
 return {...settings,progression:true,template:'custom',extensionMorph:false,loopEnabled:!!settings.progression&&settings.loopEnabled,customProgression:{version:2,kind:'custom',name:definition.name||'Current chart',steps,roman:steps.map((_,i)=>harmonyAt(settings,i).roman||'I')}};
}
export function referenceStatus(settings){
 if(settings.automaticBacking){const source=automaticBackingSettings(settings),def=REFERENCE_PERFORMANCES[settings.backingStyle],reason=source?arrangementSupport(source,def):'Choose a backing style.';return {active:!reason,id:settings.backingStyle,adapted:true,reason};}
 const adapted=settings.template==='custom'?settings.customProgression?.arrangedPerformance:null;
 const id=settings.template==='custom'?(adapted||settings.customProgression?.referencePerformance):null,def=Object.hasOwn(REFERENCE_PERFORMANCES,id)?REFERENCE_PERFORMANCES[id]:null;if(!def)return {active:false,id:null,adapted:false,reason:''};
 const fail=reason=>({active:false,id,adapted:!!adapted,reason});
 if(adapted){const reason=arrangementSupport(settings,def);return reason?fail(reason):{active:true,id,adapted:true,reason:''};}
 if(!settings.progression)return fail('Enable the reference chart to hear its written performance.');
 if(settings.backingStyle!==def.style)return fail('Choose its matching backing style to hear the written performance.');
 if(settings.beats!==(def.beats||4)||settings.loopEnabled||settings.extensionMorph)return fail(`The written performance needs ${def.beats||4} beats per bar, Full chart and chord variation off.`);
 const steps=settings.customProgression.steps;
 if(steps.length!==def.harmony.length||steps.some((step,i)=>{const [pc,chord,mode,duration]=def.harmony[i];return step.root!==(pc-def.key+12)%12||step.chord!==chord||step.mode!==mode||(step.beats??step.bars*(def.beats||4))!==duration||step.bass!=null;}))return fail('Chart changed: standard backing is playing. Reload the study to restore its written parts.');
 return {active:true,id,adapted:false,reason:''};
}
export function referencePlanKey(s){return JSON.stringify([!!s.automaticBacking,s.key,s.mode,s.chord,s.minor,s.beats,s.progression,s.template,s.customProgression,s.backingStyle,s.extensionMorph,s.loopEnabled,s.loopUnit,s.loopStart,s.loopEnd,s.loopBeatStart,s.loopBeatEnd]);}
export function referenceBasePlan(settings){
 if(settings.automaticBacking){const source=automaticBackingSettings(settings),def=REFERENCE_PERFORMANCES[settings.backingStyle];if(!source||arrangementSupport(source,def))return null;return {score:arrangeReference(referenceScore(def.id),def,source),transpose:0};}
 const status=referenceStatus(settings);if(!status.active)return null;
 const def=REFERENCE_PERFORMANCES[status.id],transpose=status.adapted?0:((settings.key-def.key+18)%12)-6;
 const score=status.adapted?arrangeReference(referenceScore(status.id),def,settings):referenceScore(status.id);
 return {score,transpose};
}
export function referenceActivityPlan(base,activity){
 if(!base)return null;
 return {...base,score:coordinateEnsemble(withReferenceActivity(base.score,REFERENCE_PERFORMANCES[base.score.id],activity))};
}
export function referencePlan(settings){return referenceActivityPlan(referenceBasePlan(settings),settings.sequenceActivity);}

export function referenceEvents(plan,track,grid){const slots=plan.score[track],local=((grid%slots.length)+slots.length)%slots.length;return sessionEvents(plan.score,track,grid,local);}

// Native scores use twelve ticks per beat so thirds and sixteenths coexist.
// Preserve the approved two initial studies' original timing exactly.
export function referenceGrid(plan,track,beat,phase,settings){
 const score=plan.score;
 if(!score.gridRate)return beat*(track==='sequence'?score.rate:4)+(track==='sequence'?Math.min(score.rate-1,Math.floor(phase*score.rate)):Math.min(3,Math.floor(phase*4)));
 if(['traditionalJazz','blues','jazzWaltz','secondLine'].includes(score.id)){
  const swing=['blues','secondLine'].includes(score.id)?2/3:Math.max(.54,2/3-Math.max(0,settings.bpm-140)*.00075);
  phase=phase<swing?phase/swing*.5:.5+(phase-swing)/(1-swing)*.5;
 }
 return beat*score.gridRate+Math.min(score.gridRate-1,Math.floor(phase*score.gridRate+1e-9));
}
