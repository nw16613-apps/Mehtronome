import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[2]||'http://127.0.0.1:4185/');await page.locator('article').nth(4).waitFor();assert.equal(await page.locator('article').count(),5);
 let files=0;
 for(const card of await page.locator('article').all())for(const mode of ['solo','mix']){
  await card.locator('select').selectOption(mode);
  for(const button of await card.locator('[data-source]').all()){
   await button.click();const handle=await card.locator('audio').elementHandle();
   await page.waitForFunction(el=>Number.isFinite(el.duration)&&el.duration>10&&el.readyState>=1,handle);
   assert.equal(await button.getAttribute('aria-pressed'),'true');
   await card.locator('audio').evaluate(async el=>{el.muted=true;await el.play();el.pause();el.currentTime=3;});files++;
  }
 }
 const card=page.locator('article').first();await card.locator('[data-source="current"]').click();
 await page.waitForFunction(el=>el.readyState>=1,await card.locator('audio').elementHandle());
 assert.ok(Math.abs(await card.locator('audio').evaluate(el=>el.currentTime)-3)<.2,'source switching preserves position');
 await card.locator('.restart').click();assert.ok(await card.locator('audio').evaluate(el=>el.currentTime)<1);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
 await page.screenshot({path:'/workspace/guitar-bass-round2-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'desktop overflow');
 assert.deepEqual(errors,[]);assert.equal(files,44);console.log('44 audio versions decoded and played; source-position switching, restart and mobile/desktop layouts passed.');
}finally{await browser.close();}
