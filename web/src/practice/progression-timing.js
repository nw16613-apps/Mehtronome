/** Musical time in quarter-note beats, independent of browser/audio clocks. */
export function progressionStudyPlan(groups,steps,bars,beats,study,rhythm='eighths') {
  const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
  const events=[],slots=[],warnings=[];let offset=0,index=0;
  for(const [slot,step]of steps.entries()){
    const duration=Math.round(Math.max(1/beats,bars[step]??1)*beats),group=groups.find(g=>g.slot===slot);
    if(group?.warning)warnings.push(group.warning);
    const fits=study==='guidetones'?1:Math.floor(duration*division);
    if((group?.notes.length||0)>fits)warnings.push(`${group.chord}: only the first ${fits} notes fit at this rhythm. Choose a faster subdivision or a longer chord duration to hear the full arpeggio.`);
    slots.push({slot,step,start:offset,duration,chord:group?.chord||'',annotation:group?.annotation||'',position:group?.position,board:group?.board,harmony:group?.harmony});
    for(const [local,note]of (group?.notes||[]).entries()){
      const at=study==='guidetones'?0:local/division;
      if(at>=duration)break;
      events.push({index:index+local,note,step,slot,target:group?.targetIndices?.includes(local)||group?.targetIndex===local,start:offset+at,duration:study==='guidetones'?duration:Math.min(1/division,duration-at)});
    }
    index+=group?.notes.length||0;offset+=duration;
  }
  const harmonicDuration=offset;
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const cycles=beats/gcd(Math.round(offset),beats);
  const baseEvents=[...events],baseSlots=[...slots];
  for(let cycle=1;cycle<cycles;cycle++){
    events.push(...baseEvents.map(event=>({...event,start:event.start+cycle*harmonicDuration})));
    slots.push(...baseSlots.map(slot=>({...slot,start:slot.start+cycle*harmonicDuration})));
  }
  if(cycles>1)warnings.push(`This ${harmonicDuration}-beat progression is shown ${cycles} times so the notation and repeated study return together to beat 1.`);
  return {events,slots,warnings,duration:offset*cycles,harmonicDuration,cycles,beats,division,study};
}
export function planPosition(plan,elapsedBeats){
  const beat=((elapsedBeats%plan.duration)+plan.duration)%plan.duration;
  const slot=plan.slots.find(s=>beat>=s.start&&beat<s.start+s.duration)||plan.slots[0];
  const event=plan.events.find(e=>beat>=e.start-1e-8&&beat<e.start+e.duration-1e-8);
  return {beat,slot,event};
}
