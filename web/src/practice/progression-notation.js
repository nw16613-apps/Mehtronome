import {chordSvg} from './chord-symbol.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const staffY=note=>101-((Math.floor(note.midi/12)-1)*7+'CDEFGAB'.indexOf(note.name[0])-30)*5-35;
const durationPart=(remaining,at,division)=>{
 const fraction=at-Math.floor(at);if(division!==3&&fraction>1e-6)return [.5,.25].find(n=>n<=remaining+1e-6&&n<=1-fraction+1e-6)||Math.min(remaining,1-fraction);
 if(division===3&&(Math.abs(at-Math.round(at))>1e-6||remaining<1-1e-6))return Math.min(1/3,remaining);
 return [4,3,2,1,.5,.25].find(n=>n<=remaining+1e-6)||remaining;
};
/** True-duration notation/TAB for chord-aligned studies. Notes crossing bars
 * are tied and retain the same audition/selection index in every segment. */
export function progressionNotationSvg(plan,title){
 const barCount=Math.round(plan.duration/plan.beats),guide=plan.study==='guidetones',dense=plan.slots.some(s=>s.duration<plan.beats),perSystem=dense?2:guide?4:3;
 const unit=Math.max(guide?30:48,...plan.slots.map(s=>(s.chord.length*7+22)/Math.min(s.duration,plan.beats)));
 const barWidth=Math.max(guide?155:230,plan.beats*unit+35),systems=[];
 for(let first=0;first<barCount;first+=perSystem){
  const count=Math.min(perSystem,barCount-first),width=100+Math.min(perSystem,barCount)*barWidth,height=290,staffEnd=90+count*barWidth-8;
  let svg=`<svg class="exercise-notation aligned-notation" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)} · chord-aligned rhythm</title><rect width="${width}" height="${height}" rx="8" class="notation-paper"/><text class="exercise-title" x="90" y="20">${esc(title)}${first?' · continued':''}</text><text x="15" y="94" class="treble-clef">𝄞</text><text x="62" y="74" class="time-signature">${plan.beats}</text><text x="62" y="94" class="time-signature">4</text><text x="18" y="193" class="tab-clef">T<tspan x="18" dy="13">A</tspan><tspan x="18" dy="13">B</tspan></text>`;
  for(let line=0;line<5;line++)svg+=`<line class="notation-line" x1="44" x2="${staffEnd}" y1="${61+line*10}" y2="${61+line*10}"/>`;
  for(let string=0;string<6;string++)svg+=`<line class="notation-line tab-line" x1="44" x2="${staffEnd}" y1="${150+string*18}" y2="${150+string*18}"/>`;
  for(let bar=first;bar<first+count;bar++){
   const start=bar*plan.beats,end=start+plan.beats,left=90+(bar-first)*barWidth,unit=(barWidth-35)/plan.beats;
   const slot=plan.slots.find(s=>start>=s.start&&start<s.start+s.duration);
   const changes=plan.slots.filter(s=>s.start<end&&s.start+s.duration>start);
   for(const change of changes){const at=Math.max(start,change.start),x=left+18+(at-start)*unit,hasNotes=plan.events.some(e=>e.slot===change.slot&&e.start<end&&e.start+e.duration>start);svg+=chordSvg(change.chord,x,40,'backing')+`<text class="exercise-degree" x="${x}" y="272">${esc(change.response?'Your turn · lead rests':change.applicationLabel||(!hasNotes?'Rest':plan.study==='guidetones'?change.annotation.split(' · ')[0]:change.annotation.startsWith('Rest')?'Rest':plan.study==='connections'?'Arpeggio → rest':change.annotation.match(/\d+ cells?/)?.[0]||'Cell'))}</text>`;}
   const beamNotes=[];
   let at=start;
   while(at<end-1e-6){
    const event=plan.events.find(e=>at>=e.start-1e-6&&at<e.start+e.duration-1e-6);
    const next=plan.events.find(e=>e.start>at+1e-6);
    const available=Math.min(end,event?event.start+event.duration:next?.start??end)-at;
    const duration=durationPart(available,at,plan.division),x=left+18+(at-start)*unit;
    if(!event){
     const rest=duration>=4?'𝄻':duration>=2?'𝄼':duration>=1?'𝄽':duration>=.3?'𝄾':'𝄿';
     svg+=`<text class="notation-rest" data-rest-beats="${duration}" x="${x}" y="83">${rest}</text>`;
     if(duration===3)svg+=`<circle class="duration-dot" cx="${x+12}" cy="78" r="2"/>`;
    }else{
     const note=event.note,y=staffY(note),tabY=150+(5-note.string)*18;
     for(let ledger=111;ledger<=y+1;ledger+=10)svg+=`<line class="ledger-line" x1="${x-10}" x2="${x+10}" y1="${ledger}" y2="${ledger}"/>`;
     for(let ledger=51;ledger>=y-1;ledger-=10)svg+=`<line class="ledger-line" x1="${x-10}" x2="${x+10}" y1="${ledger}" y2="${ledger}"/>`;
     if(note.name.slice(1)&&Math.abs(at-event.start)<1e-6)svg+=`<text class="accidental" x="${x-14}" y="${y+4}">${esc(note.name.slice(1))}</text>`;
     svg+=`<g class="exercise-note${event.target?' target-note':''}" data-note-index="${event.index}" data-group-index="${event.slot}" data-start-beat="${at}" data-duration-beats="${duration}" tabindex="0" role="button" aria-label="${esc(`${note.name}, string ${6-note.string}, fret ${note.fret}, ${duration} beats`)}"><ellipse class="note-head" cx="${x}" cy="${y}" rx="${duration>=4?8:6.5}" ry="4.5" transform="rotate(-18 ${x} ${y})"/>${duration>=2?`<ellipse class="note-hole" cx="${x}" cy="${y}" rx="4" ry="2" transform="rotate(-18 ${x} ${y})"/>`:''}<rect class="tab-fret-bg" x="${x-8}" y="${tabY-8}" width="16" height="16"/><text class="tab-fret" x="${x}" y="${tabY+4}">${note.fret}</text><text class="note-name-label" x="${x}" y="${y+16}">${esc(note.name)}</text><text class="degree-note-label" x="${x}" y="${y+16}">${esc(note.chromaticDegree||note.name)}</text></g>`;
     if(duration<1)beamNotes.push({x,y,at,duration,slot:event.slot,accent:event.accent&&Math.abs(at-event.start)<1e-6});
     else if(duration<4)svg+=`<line class="note-stem" x1="${x+6}" x2="${x+6}" y1="${y}" y2="${y-28}"/>`;
     if(bar===first&&at>event.start+1e-6&&Math.abs(at-start)<1e-6)svg+=`<path class="note-tie" d="M ${left-6} ${y+9} q 12 10 ${x-left} 0"/>`;
     if(at+duration<event.start+event.duration-1e-6){const crossesBar=Math.abs(at+duration-end)<1e-6,reach=crossesBar?(bar+1<first+count?barWidth+6-(x-left):barWidth-20-(x-left)):duration*unit-12;svg+=`<path class="note-tie" d="M ${x+6} ${y+9} q ${reach/2} 12 ${reach} 0"/>`;}
     if(duration>=1&&event.accent&&Math.abs(at-event.start)<1e-6)svg+=`<text class="note-accent" x="${x}" y="${y-38}" text-anchor="middle">&gt;</text>`;
     if(duration===3)svg+=`<circle class="duration-dot" cx="${x+13}" cy="${y}" r="2"/>`;
    }
    if(plan.division===3&&duration<1&&Math.abs(at-Math.round(at))<1e-6)svg+=`<text class="tuplet-number" x="${x+unit/3}" y="53">3</text>`;
    at+=duration;
   }
   // Beam within a quarter-note beat, never across a rest or chord change.
   const beamGroups=[];
   for(const note of beamNotes){const previous=beamGroups.at(-1)?.at(-1);if(previous&&Math.floor(previous.at+1e-6)===Math.floor(note.at+1e-6)&&previous.slot===note.slot&&Math.abs(previous.at+previous.duration-note.at)<1e-6)beamGroups.at(-1).push(note);else beamGroups.push([note]);}
   for(const group of beamGroups){
    const top=Math.min(...group.map(note=>note.y))-28;
    for(const note of group)svg+=`<line class="note-stem" x1="${note.x+6}" x2="${note.x+6}" y1="${note.y}" y2="${top}"/>`;
    for(const note of group)if(note.accent)svg+=`<text class="note-accent" x="${note.x}" y="${top-10}" text-anchor="middle">&gt;</text>`;
    if(group.length===1){const note=group[0];svg+=`<path class="note-flag" d="M ${note.x+6} ${top} q 13 6 3 17"/>`;if(note.duration<.3)svg+=`<path class="note-flag" d="M ${note.x+6} ${top+6} q 13 6 3 17"/>`;continue;}
    svg+=`<line class="note-beam" data-beam-beat="${Math.floor(group[0].at)}" x1="${group[0].x+6}" x2="${group.at(-1).x+6}" y1="${top}" y2="${top}"/>`;
    for(let i=0;i<group.length;i++){
     const note=group[i];if(note.duration>=.3)continue;
     if(group[i+1]?.duration<.3)svg+=`<line class="note-beam secondary" x1="${note.x+6}" x2="${group[i+1].x+6}" y1="${top+6}" y2="${top+6}"/>`;
     else if(!(group[i-1]?.duration<.3)){const toward=i<group.length-1?1:-1;svg+=`<line class="note-beam secondary" x1="${note.x+6}" x2="${note.x+6+toward*10}" y1="${top+6}" y2="${top+6}"/>`;}
    }
   }
   const right=left+barWidth-8;svg+=`<line class="bar-line" data-bar="${bar+1}" x1="${right}" x2="${right}" y1="61" y2="101"/><line class="bar-line" x1="${right}" x2="${right}" y1="150" y2="240"/>`;
  }
  systems.push(svg+'</svg>');
 }
 return systems.join('');
}
