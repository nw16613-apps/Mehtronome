let requestCounter=0;
const status=document.getElementById('status'),root=document.getElementById('comparisons');
try{
 const response=await fetch('/drum-midi-trial/manifest.json',{cache:'no-store'});if(!response.ok)throw new Error('Could not load comparison clips');const data=await response.json();
 for(const p of data.performances){
  const card=document.createElement('article');card.className='card';card.dataset.style=p.style;
  card.innerHTML=`<div class="heading"><h2>${p.title}</h2><span class="meta">${p.bpm} BPM · ${p.kit} · 8 bars + downbeat</span></div><div class="choices" role="group" aria-label="${p.title} comparison versions"></div><div class="selection" aria-live="polite">Choose a version to listen.</div><audio controls preload="none" aria-label="${p.title} player"></audio>`;
  const audio=card.querySelector('audio'),selection=card.querySelector('.selection');
  for(const variant of p.variants){const button=document.createElement('button');button.type='button';button.textContent=variant.label;button.dataset.variant=variant.id;button.setAttribute('aria-pressed','false');
   button.addEventListener('click',async()=>{
    const request=++requestCounter,time=audio.ended?0:audio.currentTime;
    for(const other of document.querySelectorAll('audio'))if(other!==audio)other.pause();
    try{
     if(audio.dataset.variant!==variant.id){audio.pause();audio.src='/drum-midi-trial/'+variant.file;audio.dataset.variant=variant.id;audio.load();await new Promise((resolve,reject)=>{audio.addEventListener('loadedmetadata',resolve,{once:true});audio.addEventListener('error',()=>reject(new Error('Clip could not be loaded')),{once:true});});if(request!==requestCounter)return;audio.currentTime=Math.min(time,p.seconds);}
     if(request!==requestCounter)return;await audio.play();selection.textContent=variant.label;for(const b of card.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));status.textContent='';
    }catch(error){if(request===requestCounter)status.textContent='Playback could not start. Please try the clip again.';}
   });card.querySelector('.choices').append(button);
  }
  audio.addEventListener('play',()=>{for(const other of document.querySelectorAll('audio'))if(other!==audio)other.pause();});root.append(card);
 }
 status.textContent='';
}catch(error){status.textContent='The comparisons could not load. Please refresh and try again.';}
