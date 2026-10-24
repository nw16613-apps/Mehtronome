export const PRACTICE_TASKS=[
  {id:'listen',stage:'Hear it',minutes:3,label:'Hear the pedal chord and sing the root and characteristic mode note'},
  {id:'colour',stage:'Hear it',minutes:3,label:'Improvise using only chord tones and the characteristic mode note'},
  ...['I','II','III','IV','V'].map(position=>({id:`position-${position}`,stage:'Map it',minutes:4,label:`Play Position ${position} slowly, then resolve into its chord shape`})),
  {id:'connect-12',stage:'Connect it',minutes:4,label:'Connect Positions I–II without leaving the current fretboard region'},
  {id:'connect-23',stage:'Connect it',minutes:4,label:'Connect Positions II–III without pausing'},
  {id:'connect-34',stage:'Connect it',minutes:4,label:'Connect Positions III–IV without pausing'},
  {id:'connect-45',stage:'Connect it',minutes:4,label:'Connect Positions IV–V without pausing'},
  {id:'arpeggio',stage:'Apply it',minutes:5,label:'Outline the selected chord and its extensions through all five positions'},
  {id:'pentatonic',stage:'Apply it',minutes:5,label:'Apply one suggested pentatonic superimposition through all positions'},
  {id:'triads',stage:'Apply it',minutes:5,label:'Alternate the suggested triad pair and resolve to the chord'},
  {id:'sequence',stage:'Make music',minutes:5,label:'Play one notation exercise cleanly with the metronome and harmony'},
  {id:'progression',stage:'Make music',minutes:5,label:'Follow the nearest positions through a chord progression'},
  {id:'improvise',stage:'Make music',minutes:5,label:'Improvise continuously, using gap training to check the time'},
];

export function curriculumKey({root,mode,chord}){return `${root}|${mode}|${chord}`;}
export function completedCount(completed){return PRACTICE_TASKS.filter(task=>completed?.includes(task.id)).length;}
export function practicePlan(completed,minutes=20){
  const done=new Set(completed||[]),pending=PRACTICE_TASKS.filter(task=>!done.has(task.id));
  const plan=[];let used=0;
  for(const task of pending){if(plan.length&&used+task.minutes>minutes)break;plan.push(task);used+=task.minutes;}
  return {tasks:plan,minutes:used};
}
export function modeProgress(records,root,mode){
  const prefix=`${root}|${mode}|`;let best=0;
  for(const [key,completed] of Object.entries(records||{}))if(key.startsWith(prefix))best=Math.max(best,completedCount(completed));
  return best;
}
