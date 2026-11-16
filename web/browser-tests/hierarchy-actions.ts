import type {Page} from '@playwright/test';
// Choose the public hierarchy rather than bypassing hidden recipe controls.
export async function chooseMaterial(page:Page,side:'guitar'|'exercise',material:string){
 await page.locator(`#${side}-material-kind`).selectOption(material==='scale'?'scales':'arpeggios');
 if(material==='scale')await page.locator(`#${side}-content-source`).selectOption('mode');
 else await page.locator(`#${side}-content-material`).selectOption(material);
}
export async function chooseFingering(page:Page,side:'guitar'|'exercise',kind:string){
 const group=page.locator(`#${side}-material-kind`),current=await group.inputValue();
 if(['spread','drop2','drop3'].includes(kind))await group.selectOption('chords');
 else if(['oneTwo','twoOne'].includes(kind)||current==='chords')await group.selectOption('arpeggios');
 if(side==='guitar'){
  if(['caged','three'].includes(kind)){await page.locator('#parent-scale-fingering').selectOption(kind);const material=page.locator('#guitar-material-fingering');if(await material.inputValue()!=='parent')await material.selectOption('parent');}
  else await page.locator('#guitar-material-fingering').selectOption(kind);
 }else await page.locator('#exercise-fingering').selectOption(kind);
}
