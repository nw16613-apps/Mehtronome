import {test,expect} from '@playwright/test';
for(const viewport of [{width:1504,height:1000},{width:390,height:844}])test(`notation stays inside its pages after chart changes at ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:['min7','halfDim'].map((chord,i)=>({id:'layout'+i,name:'Layout chart '+i,key:9,beats:4,progression:{version:2,name:'Layout chart '+i,steps:Array.from({length:4},()=>({root:0,chord,mode:i?'locrian':'dorian',bars:1,bass:null}))}}))})));
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-zoom').selectOption('fit');await page.locator('#exercise-chord-diagrams').check();
 const pageBounds=()=>page.locator('.exercise-notation').evaluateAll(svgs=>svgs.map(el=>{const svg=el as SVGSVGElement,music=svg.querySelector<SVGGElement>('.notation-music')!,box=music.getBBox(),matrix=music.transform.baseVal.consolidate()!.matrix;return {bottom:box.y+box.height+matrix.f,top:box.y+matrix.f,height:svg.viewBox.baseVal.height};}));
 for(const chart of ['saved:layout1','saved:layout0']){
  await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption(chart);
  // Let font-ready layout callbacks finish while Exercises is hidden.
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);});
  await page.locator('[data-workspace-target=caged-exercise]').click();
  const bounds=await pageBounds();expect(bounds.length).toBeGreaterThan(1);
  for(const b of bounds){expect(b.bottom).toBeLessThanOrEqual(b.height-8);expect(b.top).toBeGreaterThanOrEqual(24);}
  // Repeated tab entry must not accumulate translation or shrink the pages.
  await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('[data-workspace-target=caged-exercise]').click();const again=await pageBounds();expect(again.length).toBe(bounds.length);for(let i=0;i<bounds.length;i++)for(const key of ['bottom','top','height'] as const)expect(again[i][key]).toBeCloseTo(bounds[i][key],2);
 }
});
