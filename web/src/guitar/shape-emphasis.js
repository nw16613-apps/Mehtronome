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
 // Match the original full-neck canvas (frets 1–17). The envelope follows
 // each string's actual notes, including portions clipped by the map edge.
 const x=fret=>62+(fret-.5)*1240/17,y=string=>54+(5-string)*34;
 const rows=[5,4,3,2,1,0].map(string=>{const frets=board.notes.filter(n=>n.string===string).map(n=>n.fret);return {string,left:x(Math.min(...frets))-22,right:x(Math.max(...frets))+22};});
 const points=[[rows[0].left,36],...rows.map(r=>[r.left,y(r.string)]),[rows[5].left,242],[rows[5].right,242],...rows.toReversed().map(r=>[r.right,y(r.string)]),[rows[0].right,36]];
 const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect');clip.id='full-neck-shape-clip';rect.setAttribute('x','62');rect.setAttribute('y','35');rect.setAttribute('width','1240');rect.setAttribute('height','208');clip.append(rect);defs.append(clip);
 const path=document.createElementNS(ns,'polygon');path.setAttribute('points',points.map(p=>p.join(',')).join(' '));path.setAttribute('class','shape-boundary');path.setAttribute('clip-path','url(#full-neck-shape-clip)');path.setAttribute('aria-hidden','true');
 svg.prepend(defs,path);
}
