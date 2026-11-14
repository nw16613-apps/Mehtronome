import {fullFretboardFor,fullFretboardSvg,TUNING} from './fretboard.js';
const names=['low E','A','D','G','B','high E'];
export const STRING_SETS=Array.from({length:6},(_,size)=>Array.from({length:6-size},(_,start)=>Array.from({length:size+1},(_,i)=>start+i))).flat();
export function normalizeTraversal(view){
 if(view.traversal==='alternate'){view.traversal='horizontal';view.traversalPositionOrder='alternate';}
 view.traversalPositionOrder=view.traversalPositionOrder==='alternate'?'alternate':'follow';
 view.traversalTurn=view.traversalTurn==='position'?'position':'note';
 view.traversalCell=/^\d+:\d+$/.test(view.traversalCell)?view.traversalCell:'first';
 view.traversal=['horizontal','diagonal'].includes(view.traversal)?view.traversal:'position';
 const fallback=view.traversal==='diagonal'?'0,1,2,3,4,5':'0,1';
 view.traversalStrings=STRING_SETS.some(s=>s.join(',')===view.traversalStrings)?view.traversalStrings:fallback;
 view.traversalShiftStrings=Math.max(1,Math.min(view.traversalStrings.split(',').length,Math.round(Number(view.traversalShiftStrings)||2)));
 view.traversalStart=Math.max(1,Math.min(23,Math.round(Number(view.traversalStart)||5)));
 view.traversalEnd=Math.max(view.traversalStart+1,Math.min(24,Math.round(Number(view.traversalEnd)||17)));
 return view;
}
export const acrossNeck=view=>['horizontal','diagonal','alternate'].includes(view?.traversal);
export const alternatesPositions=view=>view.traversal==='alternate'||view.traversalPositionOrder==='alternate';
export function hasRouteTurnOptions(view){
 return true;
}
export function traversalLabel(view){
 const v=normalizeTraversal({...view}),strings=v.traversalStrings.split(',').map(Number);
 return `${v.traversal==='diagonal'?'Diagonal':'Horizontal'}${alternatesPositions(v)?' · alternating positions':''} · ${strings.map(i=>names[i]).join('–')}${v.traversal==='diagonal'?` · shift every ${v.traversalShiftStrings} string${v.traversalShiftStrings===1?'':'s'}`:''} · frets ${v.traversalStart}–${v.traversalEnd}`;
}
export function neckRouteBoard(harmony,options){
 const v=normalizeTraversal({...options}),strings=v.traversalStrings.split(',').map(Number);
 const board=fullFretboardFor(harmony,v.traversalStart,v.traversalEnd);
 return {...board,notes:board.notes.filter(n=>strings.includes(n.string)),route:{traversal:v.traversal,traversalPositionOrder:v.traversalPositionOrder,traversalStrings:v.traversalStrings,traversalShiftStrings:v.traversalShiftStrings,traversalStart:v.traversalStart,traversalEnd:v.traversalEnd}};
}
/** Select actual fingerings without changing the musical cell. Compact hand
 * windows win when possible; wide melodic cells can shift rather than stretch.
 * Diagonal routes bias successive pitch anchors towards higher strings/frets. */
export function canRouteNotes(notes,board){const strings=board.route.traversalStrings.split(',').map(Number);return notes.every(n=>strings.some(string=>n.midi-TUNING[string]>=board.start&&n.midi-TUNING[string]<=board.end));}
export function routeCellNotes(notes,board,previous=null){
 if(!notes.length||!board.route)return notes;
 const strings=board.route.traversalStrings.split(',').map(Number);
 const candidates=notes.map(n=>{const fixed=board.neckCell&&board.notes.find(b=>b.midi===n.midi);if(fixed)return [{...n,string:fixed.string,fret:fixed.fret}];return strings.map(string=>({...n,string,fret:n.midi-TUNING[string]})).filter(n=>n.fret>=board.start&&n.fret<=board.end);});
 if(candidates.some(c=>!c.length))return null;
 const min=Math.min(...board.notes.map(n=>n.midi)),max=Math.max(...board.notes.map(n=>n.midi));
 const anchor=notes[0].sequenceAnchor??Math.min(...notes.map(n=>n.midi)),fraction=Math.max(0,Math.min(1,(anchor-min)/(max-min||1)));
 const target=board.start+(board.end-board.start)*fraction;
 let best=null;
 for(let window=board.start-4;window<=board.end;window++){
  let states=candidates[0].map(n=>({note:n,path:[n],cost:cost(n,window)+(previous?transition(previous,n):0)}));
  for(const choices of candidates.slice(1))states=choices.map(n=>{
   const ranked=states.map(s=>({state:s,value:s.cost+transition(s.note,n)})).sort((a,b)=>a.value-b.value)[0];
   return {note:n,path:[...ranked.state.path,n],cost:ranked.value+cost(n,window)};
  });
  const winner=states.sort((a,b)=>a.cost-b.cost)[0];if(!best||winner.cost<best.cost)best=winner;
 }
 return best.path;
 function cost(n,window){const outside=Math.max(window-n.fret,0,n.fret-window-4);return outside*outside*8+(board.route.traversal==='diagonal'?Math.abs(n.fret-target)*1.8:0);}
 function transition(a,b){return Math.abs(a.fret-b.fret)*.5+Math.abs(a.string-b.string)*1.2+Math.max(0,Math.abs(a.fret-b.fret)-4)*3;}
}
export function traversalControls(view,prefix='exercise',locked=false){
 const v=normalizeTraversal({...view}),disabled=locked?' disabled':'';
 const shiftControl=v.traversal==='diagonal'?`<label>Strings before position change<select id="${prefix}-neck-shift-strings" data-neck-field="traversalShiftStrings"${disabled}>${Array.from({length:v.traversalStrings.split(',').length},(_,i)=>`<option value="${i+1}" ${v.traversalShiftStrings===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label>`:'';
 return `<div class="neck-traversal-controls" aria-label="Fretboard traversal"><label>Traversal<select id="${prefix}-neck-traversal" data-neck-field="traversal"${disabled}>${[['position','Selected position'],['horizontal','Horizontal · complete each cell'],['diagonal','Diagonal · shifted string blocks']].map(([id,label])=>`<option value="${id}" ${v.traversal===id?'selected':''}>${label}</option>`).join('')}</select></label>${prefix==='exercise'&&acrossNeck(v)?`<label>Position order<select id="${prefix}-neck-position-order" data-neck-field="traversalPositionOrder"${disabled}><option value="follow" ${v.traversalPositionOrder==='follow'?'selected':''}>Follow traversal</option><option value="alternate" ${v.traversalPositionOrder==='alternate'?'selected':''}>Alternating positions · up/down</option></select></label>`:''}${prefix==='exercise'?`<label>Turn at<select id="${prefix}-neck-turn" data-neck-field="traversalTurn"${disabled}><option value="note" ${v.traversalTurn==='note'?'selected':''}>Boundary note · repeat it</option><option value="position" ${v.traversalTurn==='position'?'selected':''}>Entering end position</option></select></label>`:''}<label ${!acrossNeck(v)?'hidden':''}>String set<select id="${prefix}-neck-strings" data-neck-field="traversalStrings"${disabled}>${Array.from({length:6},(_,size)=>`<optgroup label="${size+1} string${size?'s':''}">${STRING_SETS.filter(s=>s.length===size+1).map(s=>`<option value="${s.join(',')}" ${v.traversalStrings===s.join(',')?'selected':''}>${s.map(i=>names[i]).join(' + ')}</option>`).join('')}</optgroup>`).join('')}</select></label>${shiftControl}<label ${!acrossNeck(v)?'hidden':''}>From fret<input id="${prefix}-neck-start" data-neck-field="traversalStart" type="number" min="1" max="23" value="${v.traversalStart}"${disabled}></label><label ${!acrossNeck(v)?'hidden':''}>To fret<input id="${prefix}-neck-end" data-neck-field="traversalEnd" type="number" min="2" max="24" value="${v.traversalEnd}"${disabled}></label></div>`;
}
export function routeMapSvg(board,degrees,modeDegrees,title,notes=[],blocks=[]){
 const extra=notes.filter(n=>!board.notes.some(b=>b.string===n.string&&b.fret===n.fret));
 let svg=fullFretboardSvg({...board,notes:[...board.notes,...extra]},degrees,modeDegrees,title,[],'all',true,null,false);
 const spacing=1240/(board.end-board.start+1),x=n=>62+spacing/2+(n.fret-board.start)*spacing,y=n=>54+(5-n.string)*34;
 const path=notes.length?`<polyline class="neck-route-line" points="${notes.map(n=>`${x(n)},${y(n)}`).join(' ')}"/>`:'';
 const blockParts=blocks.map((block,index)=>{
  const ns=block.board.notes,left=Math.min(...ns.map(x))-21,right=Math.max(...ns.map(x))+21,top=Math.min(...ns.map(y))-18,bottom=Math.max(...ns.map(y))+18,color=['#5eb2f2','#e7a45f','#ae91de','#60cfa4','#ed95b8','#d7ce6e'][index%6];
  return {area:`<g class="neck-route-block" data-route-block="${index}" aria-label="${block.label}" pointer-events="none"><rect x="${left}" y="${top}" width="${right-left}" height="${bottom-top}" rx="6" fill="${color}" fill-opacity=".06" stroke="${color}" stroke-width="1.5"/></g>`,number:`<g class="neck-route-block-number" data-route-block="${index}" pointer-events="none"><circle cx="${left-12}" cy="${(top+bottom)/2}" r="10" fill="#101c29" stroke="${color}"/><text x="${left-12}" y="${(top+bottom)/2+4}" text-anchor="middle" font-size="11" fill="${color}">${index+1}</text></g>`};
 });
 svg=svg.replace('<title>',`${blockParts.map(b=>b.area).join('')}${path}<title>`).replace('</svg>',`${blockParts.map(b=>b.number).join('')}</svg>`).replace('class="fretboard full-fretboard','class="fretboard full-fretboard neck-route-map');
 return svg;
}
