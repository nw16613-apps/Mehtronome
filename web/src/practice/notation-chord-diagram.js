import {escapeChordText as esc} from './chord-symbol.js';
import {recommendedGrip} from '../guitar/grips.js';

/** An actual grip inside the selected CAGED board, never a generic open shape.
 * Low E is at the left; dots identify frets, not prescribed finger numbers. */
export function notationChordDiagram(harmony,board,position,x,y){
 const grip=harmony&&board?recommendedGrip(harmony,board):null;
 const label=`Position ${position?.numeral||'—'}${position?.shape?' · '+position.shape+' shape':''}`;
 const title=`${harmony? harmony.name+harmony.suffix:''} · ${label}`;
 let svg=`<g class="notation-chord-diagram" data-position="${esc(position?.numeral||'')}" data-grip-available="${Boolean(grip)}" transform="translate(${x} ${y}) scale(0.6)" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
 // Inline styling keeps diagrams readable in exported SVGs and printed scores.
 const text=(value,tx,ty,size=8,anchor='middle')=>`<text x="${tx}" y="${ty}" text-anchor="${anchor}" style="font:${size}px system-ui;fill:#17201d">${esc(value)}</text>`;
 if(!grip)return svg+text('No grip in this',34,28)+text('position',34,40)+text(label,34,90,7)+'</g>';
 const fretted=grip.notes.filter(note=>note.fret>0),start=fretted.length?Math.min(...fretted.map(note=>note.fret)):1;
 const rows=4,left=10,top=18,dx=10,dy=14;
 svg+='<g fill="none" stroke="#17201d" stroke-width=".8">';
 for(let string=0;string<6;string++)svg+=`<path d="M ${left+string*dx} ${top} V ${top+rows*dy}"/>`;
 for(let fret=0;fret<=rows;fret++)svg+=`<path d="M ${left} ${top+fret*dy} H ${left+5*dx}"${start===1&&fret===0?' stroke-width="2.5"':''}/>`;
 svg+='</g>'+text(`${start}fr`,left-4,top+10,7,'end');
 for(let string=0;string<6;string++){
  const note=grip.notes.find(note=>note.string===string),cx=left+string*dx;
  if(!note||note.fret===0)svg+=text(note?'○':'×',cx,top-5,10);
  else svg+=`<circle class="notation-grip-dot" data-string="${string}" data-fret="${note.fret}" cx="${cx}" cy="${top+(note.fret-start+.5)*dy}" r="3.5" fill="#17201d"/>`;
 }
 return svg+text(label,34,90,7)+'</g>';
}
export function notationDiagramKey(slot){return JSON.stringify([slot.chord,slot.position?.numeral,slot.board?.start,slot.board?.end]);}
