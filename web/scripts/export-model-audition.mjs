// Development-only fixtures. Nothing generated here is labelled as AI music.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {DEFAULTS} from '../src/audio/engine.js';
import {referenceChart,referencePlan} from '../src/audio/reference-performances.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {CHORDS,harmonyAt,progressionPositionAtBeat} from '../src/audio/music.js';

export function auditionFixture(id,sourceCommit='working-tree'){
 if(!['blues','legatoFusion'].includes(id))throw new Error('Choose one of the two initial audition styles.');
 const c=referenceChart(id),s={...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,
  backingStyle:id,key:c.key,beats:c.beats,bpm:c.bpm,progression:true,template:'custom',extensionMorph:false,
  sequenceActivity:'supporting',customProgression:normalizeCustomProgression(c.progression)};
 const plan=referencePlan(s),totalBeats=16*c.beats,primerBeats=4*c.beats;
 const tracks={bass:[],comping:[],sequence:[]},chords=[];
 for(const track of Object.keys(tracks))for(let grid=0;grid<totalBeats*12;grid++)for(const e of plan.score[track][grid]||[]){
  const beat=grid/12;
  // The rendered baseline swings the shared beat phase. Convert the written
  // onsets to actual timing; sounding lengths remain linear beat durations.
  const swing=b=>{if(id!=='blues')return b;const whole=Math.floor(b),f=b-whole;return whole+(f<.5?f*4/3:2/3+(f-.5)*2/3);};
  const onset=swing(beat),end=Math.min(totalBeats,onset+e.duration);
  tracks[track].push({beat:onset,duration:Math.max(.01,end-onset),notes:e.notes||[e.midi],velocity:e.velocity,
   targetStep:e.targetStep,origin:'current-arranger',articulation:e.articulation||null});
 }
 let last=-1;
 for(let tick=0;tick<totalBeats*12;tick++){
  const beat=tick/12,step=progressionPositionAtBeat(s,beat).step;if(step===last)continue;last=step;
  const h=harmonyAt(s,step);chords.push({beat,step,symbol:h.name+CHORDS[h.chordId].symbol,chord:h.chordId,mode:h.mode,
   chordPcs:h.chordPcs,controlNotes:CHORDS[h.chordId].intervals.map(n=>48+h.chordPcs[0]+n),scalePcs:h.scalePcs,bassMidi:h.bassMidi??null});
 }
 chords.forEach((h,i)=>h.duration=(chords[i+1]?.beat??totalBeats)-h.beat);
 return {version:1,kind:'external-model-audition-input',style:id,bpm:c.bpm,beatsPerBar:c.beats,key:c.key,totalBeats,primerBeats,
  seeds:[1729,2718,3141,5772],generated:false,sourceCommit,
  programs:{controls:0,bass:33,comping:27,sequence:id==='blues'?16:73},chords,tracks,
  notes:'Four-bar authored primer, twelve-bar model continuation. Current drums stay constant. Controls are not an audible extra instrument.'};
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
 if(!process.argv[2]||!/^[a-f0-9]{40}$/.test(process.argv[3]||''))throw new Error('Usage: node web/scripts/export-model-audition.mjs OUTPUT_DIRECTORY SOURCE_COMMIT_SHA');
 const root=resolve(process.argv[2]);await mkdir(root,{recursive:true});
 for(const id of ['blues','legatoFusion'])await writeFile(join(root,id+'.json'),JSON.stringify(auditionFixture(id,process.argv[3]),null,2)+'\n');
 console.log('Prepared two original-chart fixtures; no AI generation has run.');
}
