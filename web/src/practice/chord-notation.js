import {staffY,notationAccidental} from './notation-pitch.js';
import {notationChordDiagram} from './notation-chord-diagram.js';
import {escapeChordText as esc} from './chord-symbol.js';
/** Every attack is one selectable chord: all heads/TAB frets share its index. */
export function chordNotationSvg(plan,title,{chordDiagrams=false}={}){
 let output='';const bars=Math.ceil(plan.duration/plan.beats),barWidth=230,width=800;
 for(let first=0;first<bars;first+=3){const count=Math.min(3,bars-first),minimumY=Math.min(61,...plan.events.flatMap(e=>(e.note.voices||[e.note]).map(staffY))),top=(chordDiagrams?190:100)+Math.max(0,61-minimumY),height=top+220,tab=top+110;
 let svg=`<svg class="exercise-notation chord-study-notation aligned-notation" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${width}" height="${height}" rx="8" class="notation-paper"/><text x="70" y="23" class="exercise-title">${esc(title)}${first?' · continued':''}</text><g class="chord-score-content">`;
 for(let l=0;l<5;l++)svg+=`<line class="notation-line" x1="40" x2="${70+count*barWidth}" y1="${top+l*10}" y2="${top+l*10}"/>`;
 for(let l=0;l<6;l++)svg+=`<line class="notation-line tab-line" x1="40" x2="${70+count*barWidth}" y1="${tab+l*14}" y2="${tab+l*14}"/>`;
 svg+=`<text x="18" y="${top+40}" class="treble-clef">𝄞</text><text x="51" y="${top+18}" class="time-signature">${plan.beats}</text><text x="51" y="${top+36}" class="time-signature">4</text><text x="20" y="${tab+20}" class="tab-clef">T<tspan x="20" dy="13">A</tspan><tspan x="20" dy="13">B</tspan></text>`;
 for(let bar=first;bar<first+count;bar++){
  const left=70+(bar-first)*barWidth,start=bar*plan.beats,end=Math.min(plan.duration,start+plan.beats),atBar=plan.events.filter(e=>e.start<end&&e.start+e.duration>start),accidentals=new Map();
  svg+=`<line class="bar-line" data-bar="${bar}" x1="${left+barWidth}" x2="${left+barWidth}" y1="${top}" y2="${top+40}"/><line class="bar-line" x1="${left+barWidth}" x2="${left+barWidth}" y1="${tab}" y2="${tab+70}"/>`;
  let restCursor=start;const rest=(from,to)=>{let result='';while(from<to-1e-7){const duration=Math.min(to-from,1-(from%1)),x=left+18+(from-start)/plan.beats*(barWidth-20);result+=`<text class="notation-rest" data-rest-beats="${duration}" x="${x}" y="${top+28}">${duration>=1?'𝄽':'𝄾'}</text>`;from+=duration;}return result;};
  for(const e of atBar){if(e.start>restCursor)svg+=rest(restCursor,Math.min(e.start,end));restCursor=Math.max(restCursor,e.start+e.duration);}if(restCursor<end)svg+=rest(restCursor,end);
  for(const e of atBar){const at=Math.max(e.start,start),x=left+18+(at-start)/plan.beats*(barWidth-20),duration=Math.min(end,e.start+e.duration)-at,voices=e.note.voices||[e.note],ys=voices.map(n=>staffY(n)-61+top);
   if(e.start>=start){svg+=`<text class="chord-study-symbol" x="${x-4}" y="${Math.min(top-48,...ys.map(y=>y-50))}" font-size="12">${e.note.studyLabel.includes(' · ')?e.note.studyLabel.split(' · ').map((part,i)=>`<tspan x="${x-4}" dy="${i?11:0}" font-size="${i?9:12}">${esc(part)}</tspan>`).join(''):esc(e.note.studyLabel)}</text>`;if(chordDiagrams)svg+=notationChordDiagram(e.note.harmony,null,plan.slots.find(s=>s.slot===e.slot)?.position,x-3,50,e.note.grip);}
   svg+=`<g class="exercise-note" data-note-index="${e.index}" data-group-index="${e.slot}" data-start-beat="${at}" data-duration-beats="${duration}" tabindex="0" role="button" aria-label="${esc(e.note.studyLabel)}, ${voices.length} chord tones, ${duration} beats"><rect class="chord-attack-hit" x="${x-12}" y="${Math.min(...ys)-12}" width="26" height="${tab+82-Math.min(...ys)}" fill="transparent"/>`;
   let previousOffset=0;voices.forEach((n,i)=>{const y=ys[i],headOffset=i&&Math.abs(ys[i]-ys[i-1])<=5&&previousOffset===0?-10:0;previousOffset=headOffset;const hx=x+headOffset,acc=notationAccidental(n,accidentals);if(acc)svg+=`<text class="accidental" x="${x-16}" y="${y+4}">${esc(acc)}</text>`;
    for(let ledger=top+50;ledger<=y+1;ledger+=10)svg+=`<line class="ledger-line" x1="${x-10}" x2="${x+10}" y1="${ledger}" y2="${ledger}"/>`;
    for(let ledger=top-10;ledger>=y-1;ledger-=10)svg+=`<line class="ledger-line" x1="${x-10}" x2="${x+10}" y1="${ledger}" y2="${ledger}"/>`;
    svg+=`<ellipse class="note-head" data-voice-midi="${n.midi}" cx="${hx}" cy="${y}" rx="6.5" ry="4.5" transform="rotate(-18 ${hx} ${y})"/>${duration>=2?`<ellipse class="note-hole" cx="${hx}" cy="${y}" rx="3.5" ry="2"/>`:''}<rect class="tab-fret-bg" x="${x-9}" y="${tab+(5-n.string)*14-9}" width="18" height="17"/><text class="tab-fret" data-string="${n.string}" x="${x}" y="${tab+(5-n.string)*14+4}">${n.fret}</text><text class="note-name-label" x="${x}" y="${top+48+i*11}" text-anchor="middle">${esc(n.name)}</text><text class="degree-note-label" x="${x}" y="${top+48+i*11}" text-anchor="middle">${esc(n.chromaticDegree)}</text>`;
   });
   if(duration<4)svg+=`<line class="note-stem" x1="${x+6}" x2="${x+6}" y1="${Math.max(...ys)}" y2="${Math.min(...ys)-28}"/>`;
   if(duration===3)svg+=`<circle class="duration-dot" cx="${x+16}" cy="${Math.min(...ys)}" r="2"/>`;
   if(duration<1)svg+=`<path class="note-flag" d="M ${x+6} ${Math.min(...ys)-28} q 13 6 3 17"/>`;
   if(e.start<start)svg+=`<path class="note-tie" d="M ${x-15} ${Math.max(...ys)+10} q 8 8 16 0"/>`;
   if(e.start+e.duration>end)svg+=`<path class="note-tie" d="M ${x+6} ${Math.max(...ys)+10} q 20 10 42 0"/>`;
   svg+='</g>';
  }
 }
 output+=svg+'</g></svg>';
 }
 return output;
}
