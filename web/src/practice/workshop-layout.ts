const preference='mehtronome-workshop-reference';let referenceOpen=true;try{referenceOpen=localStorage.getItem(preference)!=='closed';}catch{}
/** Keep the lesson short while making source material available in one place. */
export function groupWorkshopReference(route:HTMLElement){
 const detail=document.createElement('details');detail.className='workshop-reference';detail.open=referenceOpen;detail.addEventListener('toggle',()=>{if(!detail.isConnected)return;referenceOpen=detail.open;try{localStorage.setItem(preference,detail.open?'open':'closed');}catch{}});detail.innerHTML='<summary>Source chords, omissions &amp; voice movement</summary>';
 for(const child of Array.from(route.children))if(child.tagName!=='H3')detail.append(child);
 route.append(detail);
}
