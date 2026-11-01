import {test,expect} from '@playwright/test';
const firstPitch=async(page:any,slot:number)=>{const label=await page.locator(`.exercise-note[data-group-index="${slot}"]`).first().getAttribute('aria-label'),m=label.match(/string (\d), fret (\d+)/)!;return ([0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]))%12;};
test('Pattern start applies the chosen degree to every chord for scales and arpeggios in all rhythms',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'degrees',name:'Every chord degree',key:9,beats:4,progression:{version:2,name:'Every chord degree',steps:[{root:0,chord:'min7',mode:'dorian'},{root:3,chord:'maj7',mode:'major'},{root:9,chord:'halfDim',mode:'locrian'},{root:7,chord:'augMaj7',mode:'lydian_augmented'}].map(step=>({...step,bars:1,bass:null}))}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:degrees');await page.locator('[data-workspace-target=caged-exercise]').click();
 const expected={'1:0':[9,0,6,4],'3:0':[0,4,9,8],'5:0':[4,7,0,0],'7:0':[7,11,4,3]};
 for(const study of ['positional','positionalscale']){
  await page.locator('#exercise-study').selectOption(study);
  for(const rhythm of ['eighths','sixteenths','triplets']){
   await page.locator('#exercise-rhythm').selectOption(rhythm);
   for(const [choice,pcs]of Object.entries(expected)){
    await page.locator('#exercise-start-note').selectOption(choice);
    for(let slot=0;slot<4;slot++)expect(await firstPitch(page,slot),`${study} ${rhythm} ${choice} chord ${slot}`).toBe(pcs[slot]);
   }
  }
 }
 expect(errors).toEqual([]);
});
