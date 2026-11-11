import {cloneTemplate} from './custom-progression.js';
import {progressionDefinition} from '../audio/music.js';
/** A backed passage retains its enclosing bars; solo playback starts exactly
 * on its first note. Original score indices and cell identifiers are retained. */
export function passagePlaybackPlan(plan,range,backing=false){
 if(!plan||!range)return plan;
 const chosen=plan.events.filter(e=>e.index>=range.start&&e.index<=range.end&&(range.cellId===undefined||e.cellId===range.cellId)&&(range.subcellIndex===undefined||e.subcellIndex===range.subcellIndex));if(!chosen.length)return plan;
 const first=Math.min(...chosen.map(e=>e.start)),last=Math.max(...chosen.map(e=>e.start+e.duration)),start=backing?Math.floor((first+1e-6)/plan.beats)*plan.beats:first,end=backing?Math.ceil((last-1e-6)/plan.beats)*plan.beats:last;
 const slots=plan.slots.filter(s=>s.start<end&&s.start+s.duration>start).map(s=>({...s,start:Math.max(start,s.start)-start,duration:Math.min(end,s.start+s.duration)-Math.max(start,s.start)}));
 return {...plan,events:chosen.map(e=>({...e,start:e.start-start})),slots,duration:end-start,harmonicDuration:end-start,cycles:1,scoreStart:start,passage:true,resolution:undefined};
}
export function passageBackingSettings(settings,plan){
 if(!settings.progression||!plan?.passage)return settings;
 const base=cloneTemplate(progressionDefinition(settings),settings.chord,settings.mode,settings);
 return {...settings,template:'custom',loopEnabled:false,standardMelodyEnabled:false,standardMelodyPickup:false,standardMelodyTimeline:undefined,standardMelodyEnding:0,customProgression:{...base,standardMelody:undefined,steps:plan.slots.map(s=>({...base.steps[s.step],beats:s.duration})),roman:plan.slots.map(s=>base.roman[s.step])}};
}
