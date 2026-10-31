import {test,expect} from '@playwright/test';

test('CAGED chord-quality shapes render every sounded string and audition the exact full grip',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const Original=window.AudioWorkletNode;(window as any).__auditions=[];
  window.AudioWorkletNode=class extends Original{
   constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
    super(context,name,options);const post=this.port.postMessage.bind(this.port);
    this.port.postMessage=(data:any,transfer?:Transferable[])=>{if(data.type==='audition')(window as any).__auditions.push(data);if(transfer)post(data,transfer);else post(data);};
   }
  };
 });
 await page.goto('/');await page.locator('[data-workspace-target="guitar-title"]').click();
 await page.locator('#show-grip').check();
 const golden:{[key:string]:(number|null)[]}={I:[5,7,5,5,5,5],II:[null,null,7,9,8,8],III:[null,12,10,12,10,12],IV:[null,12,14,12,13,12],V:[5,null,5,5,5,null]};
 for(const [position,frets]of Object.entries(golden)){
  await page.locator(`#position-overview [data-overview-position="${position}"]`).click();
  const card=page.locator('#guitar-diagrams .position-card');
  const actual=await card.locator('.grip-note').evaluateAll(nodes=>Array.from({length:6},(_,string)=>{
   const node=nodes.find(n=>n.getAttribute('data-string')===String(string));return node?Number(node.getAttribute('data-fret')):null;
  }));
  expect(actual).toEqual(frets);
  await expect(card.locator('.grip-mute')).toHaveCount(frets.filter(f=>f===null).length);
  await card.locator('.grip-preview').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__auditions.length)).toBe(Object.keys(golden).indexOf(position)+1);
  const notes=await page.evaluate(()=>(window as any).__auditions.at(-1).notes);
  expect(notes).toEqual(frets.flatMap((f,i)=>f===null?[]:[[40,45,50,55,59,64][i]+f]));
  await card.locator('.grip-preview').click();
 }
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 expect(errors).toEqual([]);
});
