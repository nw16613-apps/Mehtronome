/** Shape colours describe fingerings; note fills retain their harmonic meaning. */
export const shapeColor=index=>`var(--shape-${Math.max(0,index)%8})`;
const ns='http://www.w3.org/2000/svg';
export function emphasizeFullNeck(container,board,index,diagonal=false){
 const svg=container.querySelector('svg.fretboard');if(!svg)return;
 container.classList.toggle('has-selected-shape',!!board);container.style.setProperty('--shape-color',shapeColor(index));
 if(!board)return;
 const keys=new Set(board.notes.map(n=>`${n.string}:${n.fret}`));
 svg.querySelectorAll('.fret-note').forEach(note=>{
  if(!keys.has(`${note.dataset.string}:${note.dataset.fret}`))return;
  note.classList.add('shape-selected-note','per-string-map-selected');
  const ring=note.querySelector('circle').cloneNode();ring.setAttribute('r','16');ring.setAttribute('class','shape-selected-ring per-string-map-ring');note.append(ring);
 });
 if(!diagonal)return;
 const points=shapeEnvelope(board);
 const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect');clip.id='full-neck-shape-clip';rect.setAttribute('x','62');rect.setAttribute('y','35');rect.setAttribute('width','1240');rect.setAttribute('height','208');clip.append(rect);defs.append(clip);
 const path=document.createElementNS(ns,'polygon');path.setAttribute('points',points.map(p=>p.join(',')).join(' '));path.setAttribute('class','shape-boundary');path.setAttribute('clip-path','url(#full-neck-shape-clip)');path.setAttribute('aria-hidden','true');
 svg.prepend(defs,path);
}

function shapeEnvelope(board,range={start:1,end:17}){
 // Match the map range, defaulting to the original frets 1–17 canvas.
 // The envelope follows each string's actual notes at either map edge.
 const x=fret=>62+(fret-range.start+.5)*1240/(range.end-range.start+1),y=string=>54+(5-string)*34;
 const rows=[5,4,3,2,1,0].filter(string=>board.notes.some(n=>n.string===string)).map(string=>{const frets=board.notes.filter(n=>n.string===string).map(n=>n.fret);return {string,left:x(Math.min(...frets))-22,right:x(Math.max(...frets))+22};});
 return [[rows[0].left,y(rows[0].string)-18],...rows.map(r=>[r.left,y(r.string)]),[rows.at(-1).left,y(rows.at(-1).string)+18],[rows.at(-1).right,y(rows.at(-1).string)+18],...rows.toReversed().map(r=>[r.right,y(r.string)]),[rows[0].right,y(rows[0].string)-18]];
}

/** Clickable envelopes for every per-string shape; their labels remain on top
 * so overlapping diagonals can always be selected independently. */
export function perStringMapRegions(container,shapes,selected,range={start:1,end:17}){
 const svg=container.querySelector('svg.fretboard');if(!svg)return;
 svg.querySelector('.shape-boundary')?.remove();
 if(!svg.querySelector('#full-neck-shape-clip')){
  const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect');clip.id='full-neck-shape-clip';rect.setAttribute('x','62');rect.setAttribute('y','22');rect.setAttribute('width','1240');rect.setAttribute('height','222');clip.append(rect);defs.append(clip);svg.prepend(defs);
 }
 const usedLabels=[];
 const areas=document.createElementNS(ns,'g'),labels=document.createElementNS(ns,'g');areas.setAttribute('class','per-string-region-areas');labels.setAttribute('class','per-string-region-labels');
 shapes.forEach((shape,index)=>{
  const active=String(shape.degree)===String(selected),points=shapeEnvelope(shape.board,range);
  const group=document.createElementNS(ns,'g');group.setAttribute('class',`per-string-map-region${active?' selected':''}`);group.setAttribute('data-full-string-position',String(shape.degree));group.style.setProperty('--shape-color',shapeColor(shape.index??index));
  const polygon=document.createElementNS(ns,'polygon');polygon.setAttribute('points',points.map(p=>p.join(',')).join(' '));polygon.setAttribute('clip-path','url(#full-neck-shape-clip)');polygon.setAttribute('class',active?'shape-boundary':'shape-region-boundary');group.append(polygon);areas.append(group);
  const label=document.createElementNS(ns,'g');label.setAttribute('class',`per-string-map-region per-string-region-label${active?' selected':''}`);label.setAttribute('data-full-string-position',String(shape.degree));label.setAttribute('role','button');label.setAttribute('tabindex','0');label.setAttribute('aria-pressed',String(active));label.setAttribute('aria-label','Highlight '+shape.label);label.style.setProperty('--shape-color',shapeColor(shape.index??index));
  const first=shape.board.notes[0],desired=62+(first.fret-range.start+.5)*1240/(range.end-range.start+1);
  // Compact numbered labels occupy distinct slots above the string diagram.
  let x=Math.min(1260,Math.max(68,desired));
  const spacing=shapes.length>30?35:40;
  const free=(at)=>usedLabels.every(other=>Math.abs(other-at)>=spacing);
  if(!free(x)){const candidates=Array.from({length:Math.floor(1190/spacing)+1},(_,i)=>68+i*spacing).filter(free);x=candidates.sort((a,b)=>Math.abs(a-x)-Math.abs(b-x))[0]??x;}usedLabels.push(x);
  const tag=document.createElementNS(ns,'rect'),text=document.createElementNS(ns,'text');
  const title=document.createElementNS(ns,'title');title.textContent=shape.label;label.append(title);tag.setAttribute('x',String(x));tag.setAttribute('y','22');tag.setAttribute('width','34');tag.setAttribute('height','23');tag.setAttribute('rx','4');text.setAttribute('x',String(x+17));text.setAttribute('y','38');text.setAttribute('text-anchor','middle');text.textContent=shape.tag||String(index+1);label.append(tag,text);labels.append(label);
 });
 svg.insertBefore(areas,svg.querySelector('.fret-wire')||svg.firstChild);svg.append(labels);
}
