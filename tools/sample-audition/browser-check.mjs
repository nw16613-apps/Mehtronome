// Uses the app's existing development dependency; no new browser install.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../web/package.json',import.meta.url));
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[2]||'http://127.0.0.1:4184/');
 await page.locator('article').nth(4).waitFor();assert.equal(await page.locator('article').count(),5);
 for(const card of await page.locator('article').all()){
  for(const mode of ['solo','mix']){
   await card.locator('select').selectOption(mode);
   for(const source of ['current','candidate']){
    await card.locator(`[data-source="${source}"]`).click();
    await page.waitForFunction(el=>Number.isFinite(el.duration)&&el.duration>10&&el.readyState>=1,await card.locator('audio').elementHandle());
    assert.equal(await card.locator(`[data-source="${source}"]`).getAttribute('aria-pressed'),'true');
    await card.locator('audio').evaluate(async el=>{el.muted=true;await el.play();el.pause();el.currentTime=3;});
   }
  }
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
 await page.setViewportSize({width:1440,height:1000});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'desktop overflow');
 assert.deepEqual(errors,[]);console.log('Five cards; twenty audio sources decoded and played; mobile/desktop layouts passed.');
}finally{await browser.close();}
