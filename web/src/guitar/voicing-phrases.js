import {TUNING} from './fretboard.js';
export const VOICING_PARTS={all:'All four voices',upper:'Upper two voices',inner:'Inner two voices',top:'Top voice · single string'};
export const VOICING_PHRASES={arpeggio:'Grip notes · eighth notes',motif:'Held note and answer',approach:'Late chromatic resolution'};
export function selectedVoices(grip,part='all'){
 if(!grip)return [];
 return part==='upper'?grip.notes.slice(2):part==='inner'?grip.notes.slice(1,3):part==='top'?grip.notes.slice(3):grip.notes;
}
/** Authored rhythms, not automatic performance grading or block-chord notation. */
export function voicingPhrase(grip,next,harmony,{part='all',phrase='arpeggio',duration=4,beats=4,last=false}={}){
 const source=selectedVoices(grip,part);if(!source.length)return {timing:[],warning:''};
 if(phrase==='arpeggio')return duration<source.length*.5?{timing:[],warning:`The complete ${source.length}-note cell needs ${source.length*.5} beats. This slot is a rest.`}:{timing:source.map((note,i)=>({note,start:i*.5,duration:.5,target:i===source.length-1})),warning:''};
 if(beats!==4||duration<4)return {timing:[],warning:'Written phrases require 4/4 and at least four beats per chord. This slot is a rest.'};
 const low=source[0],top=source.at(-1),middle=source[Math.min(1,source.length-1)];
 if(phrase==='motif')return {timing:[{note:top,start:0,duration:1.5,target:true},{note:low,start:2,duration:.5},{note:middle,start:2.5,duration:.5},{note:top,start:3,duration:1,target:true}],warning:''};
 const timing=[{note:low,start:0,duration:.5,target:true},{note:middle,start:.5,duration:.5},{note:top,start:1,duration:1,target:true}];
 if(last){timing.push({note:low,start:3.5,duration:.5,target:true});return {timing,warning:''};}
 const target=selectedVoices(next,part)[0];if(!target)return {timing,warning:'The next chord has no supported grip. The final eighth is a rest.'};
 const wanted=target.fret+(target.midi>=low.midi?-1:1),fret=wanted>=1&&wanted<=17?wanted:target.fret+(wanted<1?1:-1),midi=TUNING[target.string]+fret,pc=midi%12,index=harmony.scalePcs.indexOf(pc);
 const note={string:target.string,fret,midi,pc,name:index>=0?harmony.scaleNames[index]:['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][pc],scaleIndex:index,chromaticDegree:'approach',root:false,chord:harmony.chordPcs.includes(pc)};
 timing.push({note,start:3.5,duration:.5,target:false});return {timing,warning:''};
}
