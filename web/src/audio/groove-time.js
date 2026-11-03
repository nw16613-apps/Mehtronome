// Backing swing relaxes at faster tempos; the metronome has its own exact clock.
export function backingSubdivision(phase,groove,bpm=120){
 if(groove!=='swing'&&groove!=='shuffle')return Math.min(3,Math.floor(phase*4));
 const swing=groove==='shuffle'?2/3:Math.max(.54,2/3-Math.max(0,bpm-140)*.00075);
 return phase>=swing+(1-swing)/2?3:phase>=swing?2:phase>=swing/2?1:0;
}

// Stateless touch is repeatable across audio block sizes and playback restarts.
// The downbeat foundation stays exact; the hands sit a few milliseconds behind it.
export function performanceTouch(settings,kind,bar,cell,rate=48000){
 const amount=Math.max(0,Math.min(1,Number(settings.backingHumanize)||0));
 if(!amount)return {velocity:1,delayFrames:0,length:1};
 let seed=Math.imul(bar+1,374761393)^Math.imul(cell+1,668265263);
 for(let i=0;i<kind.length;i++)seed=Math.imul(seed^kind.charCodeAt(i),1274126177);
 const random=((seed^(seed>>>13))>>>0)/4294967296;
 const soul=['neoSoul','halftime'].includes(settings.drumGroove);
 const milliseconds=kind==='kick'?(cell===0?0:random*2):kind==='bass'?(cell===0?0:1+random*3):kind==='snare'?(soul?12:4)+random*(soul?10:5):kind==='comping'?(soul?8:2)+random*5:random*4;
 return {velocity:1+amount*((random-.5)*.12+([0,-.015,.015,-.025,.005,.02,-.01,.01][bar%8])),delayFrames:Math.round(Math.min(milliseconds*amount,60000/(settings.bpm||120)/16)*rate/1000),length:1+amount*(random-.5)*.12};
}
