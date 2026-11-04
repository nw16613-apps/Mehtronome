import {test,expect} from '@playwright/test';
test('tempo field fits all three digits at desktop and phone sizes',async({page})=>{
 test.setTimeout(90000);
 for(const width of [1440,1200,1100,768,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto('/');console.log('Checking tempo at',width);
  for(const bpm of ['100','188','240']){
   const field=page.locator('#bpm');await field.fill(bpm);await field.dispatchEvent('change');await field.blur();await expect(field).toHaveValue(bpm);
   const fit=await field.evaluate((el:HTMLInputElement)=>{const css=getComputedStyle(el),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!;ctx.font=`${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;return {text:ctx.measureText(el.value).width,available:el.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)};});
   expect(fit.text,`${width}px: ${bpm}`).toBeLessThanOrEqual(fit.available);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
 }
});
