import {harmonyAt,progressionBeatDurations} from '../audio/music.js';

// Compare sounding harmony and durations, independent of titles, spelling and CAGED choices.
export function playbackChartKey(settings:any){
 return JSON.stringify(progressionBeatDurations(settings).map((beats:number,index:number)=>{
  const h=harmonyAt(settings,index);return [h.chordPcs,h.scalePcs,beats];
 }));
}
export function highlightChordPlayback(settings:any,step:number,playing:boolean){
 const preview=document.querySelector<HTMLElement>('#generator-preview-chords');
 const previewMatches=!!preview?.dataset.playbackChart&&preview.dataset.playbackChart===playbackChartKey(settings);
 const study=document.querySelector<HTMLElement>('.study-chart-preview');
 const studyMatches=!!study?.dataset.playbackChart&&study.dataset.playbackChart===playbackChartKey(settings);
 document.querySelectorAll<HTMLElement>('[data-route-step],[data-reference-step],[data-generator-step],[data-study-step]').forEach(card=>{
  const generated=card.dataset.generatorStep!==undefined,studied=card.dataset.studyStep!==undefined;
  const index=Number(card.dataset.routeStep??card.dataset.referenceStep??card.dataset.generatorStep??card.dataset.studyStep);
  const active=playing&&index===step&&(!generated||previewMatches)&&(!studied||studyMatches);
  card.classList.toggle('chord-playing',active);
  if(active)card.dataset.playbackCurrent='true';else delete card.dataset.playbackCurrent;
 });
}
