import {chordSvg} from './chord-symbol.js';
const ns='http://www.w3.org/2000/svg';
/** Chords live outside the music transform. Measure the actual glyphs/stems,
 * including ledger notes, rather than guessing a fixed top margin. */
export function reserveChordBands(panel:HTMLElement){
 panel.querySelectorAll<SVGSVGElement>('.exercise-notation').forEach(svg=>{
  let band=svg.querySelector<SVGGElement>('.notation-chord-band');if(!band){band=document.createElementNS(ns,'g');band.setAttribute('class','notation-chord-band');svg.append(band);}
  svg.querySelectorAll<SVGTextElement>('.notation-chord-symbol').forEach(symbol=>{band!.append(symbol);symbol.setAttribute('y','50');});
  let music=svg.querySelector<SVGGElement>('.notation-music');if(!music){music=document.createElementNS(ns,'g');music.setAttribute('class','notation-music');for(const child of Array.from(svg.children))if(!child.matches('title,.notation-paper,.exercise-title,.notation-backing,.notation-chord-band'))music.append(child);svg.append(music);}
  const box=music.getBBox(),tops=[...Array.from(music.querySelectorAll('.note-head')).map(n=>Number(n.getAttribute('cy'))-18),...Array.from(music.querySelectorAll('.note-stem,.note-beam')).map(n=>Math.min(Number(n.getAttribute('y1')),Number(n.getAttribute('y2')))-4)];
  tops.push(...Array.from(music.querySelectorAll('.note-accent')).map(n=>Number(n.getAttribute('y'))-16));
  const top=band.querySelector('.notation-chord-diagram')?box.y:tops.length?Math.min(...tops):box.y,bandBottom=Math.max(56,band.getBBox().y+band.getBBox().height);
  const shift=Math.max(24,bandBottom+18-top),height=Math.max(280,box.y+box.height)+shift+18;
  music.setAttribute('transform',`translate(0 ${shift})`);svg.setAttribute('viewBox',`0 0 ${svg.viewBox.baseVal.width} ${height}`);svg.querySelector('.notation-paper')?.setAttribute('height',String(height));
 });
}
export function updateBackingSymbols(panel:HTMLElement,chordAt:(beat:number)=>string,division:number,beats:number,range:{start:number;end:number},baseBeat=0){
 let previous='',first=true;
 panel.querySelectorAll<SVGSVGElement>('.exercise-notation:not(.aligned-notation)').forEach(svg=>{
  let band=svg.querySelector<SVGGElement>('.notation-chord-band');if(!band){band=document.createElementNS(ns,'g');band.setAttribute('class','notation-chord-band');svg.append(band);}
  let html='';
  svg.querySelectorAll<SVGGElement>('.exercise-note').forEach(note=>{
   const index=Number(note.dataset.noteIndex);if(index<range.start||index>range.end)return;
   const relative=(index-range.start)/division;
   const chord=chordAt(baseBeat+relative);
   if(first||chord!==previous){const x=Number(note.querySelector('.note-head')?.getAttribute('cx'))-6;html+=chordSvg(chord,x,50,'backing');}
   first=false;previous=chord;
  });
  band.querySelectorAll('.notation-chord-symbol').forEach(symbol=>symbol.remove());band.insertAdjacentHTML('afterbegin',html);
 });
}
