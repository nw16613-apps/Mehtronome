import {test,expect,type Page} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {SAMPLE_FILES} from '../src/audio/sample-manifest.js';

/** Observe the real worklet buses and sample-transfer order without changing playback. */
async function observeAudio(page:Page) {
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    const state=(window as any).__audioUpgrade={messages:[],banks:[],processors:0,analysers:{}};
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);state.processors++;
        for(const [bus,index] of [['click',0],['pad',1],['dry',2]] as const){
          const analyser=context.createAnalyser();analyser.fftSize=2048;
          this.connect(analyser,index);state.analysers[bus]=analyser;
        }
        const splitter=context.createChannelSplitter(2);this.connect(splitter,1);
        for(const [index,id] of ['left','right'].entries()){const analyser=context.createAnalyser();analyser.fftSize=2048;splitter.connect(analyser,index);state.analysers[id]=analyser;}
        const post=this.port.postMessage.bind(this.port);
        this.port.postMessage=(data:any,transfer?:Transferable[])=>{
          state.messages.push(data.type);
          if(data.type==='drum-kit')state.banks.push(Object.fromEntries(Object.entries(data.kit).map(([id,pcm]:[string,any])=>{
            let peak=0,finite=true,energy=0;
            for(const value of pcm){peak=Math.max(peak,Math.abs(value));energy+=value*value;finite&&=Number.isFinite(value);}
            return [id,{length:pcm.length,peak,finite,energy}];
          })));
          if(transfer)post(data,transfer);else post(data);
        };
        const createGain=context.createGain.bind(context);let gains=0;
        context.createGain=()=>{
          const gain=createGain();
          if(gains++===0){const analyser=context.createAnalyser();analyser.fftSize=2048;gain.connect(analyser);state.analysers.master=analyser;}
          return gain;
        };
      }
    };
  });
}

async function peak(page:Page,bus='master') {
  return page.evaluate(bus=>{
    const analyser=(window as any).__audioUpgrade.analysers[bus] as AnalyserNode|undefined;
    if(!analyser)return 0;
    const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);
    let maximum=0;for(const value of values)maximum=Math.max(maximum,Math.abs(value));
    return maximum;
  },bus);
}

async function measure(page:Page,milliseconds=600) {
  return page.evaluate(async milliseconds=>{
    const analysers=(window as any).__audioUpgrade.analysers as Record<string,AnalyserNode>;
    const result:Record<string,{peak:number;energy:number;count:number;finite:boolean}>={};
    const finish=performance.now()+milliseconds;
    do{
      for(const [bus,analyser] of Object.entries(analysers)){
        const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);
        const stats=result[bus]||={peak:0,energy:0,count:0,finite:true};
        for(const value of values){stats.peak=Math.max(stats.peak,Math.abs(value));stats.energy+=value*value;stats.count++;stats.finite&&=Number.isFinite(value);}
      }
      await new Promise(resolve=>setTimeout(resolve,30));
    }while(performance.now()<finish);
    return Object.fromEntries(Object.entries(result).map(([bus,stats])=>[bus,{peak:stats.peak,rms:Math.sqrt(stats.energy/stats.count),finite:stats.finite}]));
  },milliseconds);
}

async function stopBand(page:Page) {
  await page.locator('#play').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__audioUpgrade.analysers.master.context.state)).toBe('suspended');
}

async function fastBand(page:Page) {
  await page.locator('#count-in').uncheck();
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();
  await page.locator('#drums').check();await page.locator('#bass').check();
}

test('recorded drum and bass banks load before playback and are reused after stopping',async({page})=>{
  const errors:string[]=[],failed:string[]=[],waves:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>failed.push(request.url()));
  page.on('response',response=>{if(/\.wav(?:\?|$)/.test(response.url())&&response.ok())waves.push(response.url());});
  await observeAudio(page);await page.goto('/');await fastBand(page);
  await page.locator('#play').click();await expect(page.locator('#play-status')).toContainText('Playing');
  await expect.poll(()=>peak(page,'dry')).toBeGreaterThan(.005);
  const first=await page.evaluate(()=>{const state=(window as any).__audioUpgrade;return {banks:state.banks,messages:state.messages};});
  expect(first.banks).toHaveLength(1);
  const bank=first.banks[0] as Record<string,{length:number;peak:number;finite:boolean;energy:number}>;
  expect(Object.keys(bank).sort()).toEqual(Object.keys(SAMPLE_FILES).sort());
  expect(Object.keys(bank).filter(id=>id.startsWith('bass')).length).toBeGreaterThanOrEqual(3);
  for(const id of ['kick','snare','hat','ride','rim'])expect(bank[id]).toBeDefined();
  for(const sample of Object.values(bank)){
    expect(sample.finite).toBe(true);expect(sample.length).toBeGreaterThan(500);
    expect(sample.peak).toBeGreaterThan(.01);expect(sample.peak).toBeLessThanOrEqual(1);
    expect(sample.energy).toBeGreaterThan(0);
  }
  expect(first.messages.indexOf('drum-kit')).toBeLessThan(first.messages.indexOf('start'));
  const loaded=waves.length;expect(new Set(waves).size).toBe(new Set(Object.values(SAMPLE_FILES).map(url=>url.pathname)).size);
  await stopBand(page);await page.locator('#play').click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  expect(await page.evaluate(()=>(window as any).__audioUpgrade.banks.length)).toBe(1);
  expect(waves.length).toBe(loaded);
  await stopBand(page);
  expect(failed).toEqual([]);expect(errors).toEqual([]);
});

test('sampled grooves and evolving backing stay audible, stereo and bounded at full mixer levels',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await observeAudio(page);await page.goto('/');await fastBand(page);
  for(const id of ['click','harmony','drums-volume','bass-volume','sequence-volume','space'])await page.locator(`#${id}`).fill('100');
  await page.locator('#sequence').check();await page.locator('#sequence-density').fill('100');
  await page.locator('#play').click();await expect(page.locator('#play-status')).toContainText('Playing');
  const levels:any[]=[];
  for(const [drums,bass,sound] of [
    ['straight','fifths','bloom'],['shuffle','roots','warm'],['swing','walk','strings'],
    ['halftime','funk','atmosphere'],['bossa','bossa','air'],
    ['straight','fifths','glass'],['swing','walk','velvet'],
  ]){
    await page.locator('#drum-groove').selectOption(drums);await page.locator('#bass-pattern').selectOption(bass);
    await page.locator('#sound').selectOption(sound);
    const stats=await measure(page);levels.push({drums,bass,sound,...stats});
    for(const values of Object.values(stats)){expect(values.finite).toBe(true);expect(values.peak).toBeLessThan(1);}
    expect(stats.dry.rms).toBeGreaterThan(.001);expect(stats.pad.rms).toBeGreaterThan(.001);expect(stats.master.rms).toBeGreaterThan(.005);
    await expect.poll(()=>page.evaluate(()=>{
      const {left,right}=(window as any).__audioUpgrade.analysers;
      const a=new Float32Array(left.fftSize),b=new Float32Array(right.fftSize);left.getFloatTimeDomainData(a);right.getFloatTimeDomainData(b);
      let difference=0;for(let i=0;i<a.length;i++)difference=Math.max(difference,Math.abs(a[i]-b[i]));return difference;
    })).toBeGreaterThan(.0001);
  }
  const levelsPath=test.info().outputPath('audio-levels.json');
  await writeFile(levelsPath,JSON.stringify(levels,null,2));
  await test.info().attach('audio-levels.json',{path:levelsPath,contentType:'application/json'});
  // A suspended context produces no output; analysers retain their last frame.
  await stopBand(page);
  await expect(page.locator('#error')).toBeHidden();expect(errors).toEqual([]);
});

test('count-in and silent gaps still mute the new samples and chord previews keep rhythm silent',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await observeAudio(page);await page.goto('/');await fastBand(page);
  await page.locator('#beats').selectOption('3');await page.locator('#count-in').check();
  await page.locator('#click').fill('0');await page.locator('#harmony').fill('0');
  await page.locator('#gap-enabled').check();await page.locator('#gap-play').selectOption('1');await page.locator('#gap-mute').selectOption('1');
  await page.locator('#play').click();await expect(page.locator('#play-status')).toContainText('Count-in');
  expect(await peak(page,'dry')).toBe(0);
  await expect(page.locator('#play-status')).toContainText('Playing');await expect.poll(()=>peak(page,'dry'),{intervals:[20,30,50],timeout:500}).toBeGreaterThan(.005);
  await expect(page.locator('#play-status')).toContainText('Gap');await expect.poll(()=>peak(page),{intervals:[20,30,50],timeout:600}).toBeLessThan(.000001);
  await stopBand(page);await page.locator('#harmony').fill('50');
  await page.locator('.grip-preview').first().click();await expect(page.locator('#grip-preview-status')).toBeVisible();
  await expect.poll(()=>peak(page,'pad')).toBeGreaterThan(.005);
  expect(await peak(page,'dry')).toBe(0);
  await page.locator('.grip-preview').first().click();await expect(page.locator('#grip-preview-status')).toBeHidden();expect(errors).toEqual([]);
});

test('a failed instrument download is visible and pressing Start retries successfully',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  let failedOnce=false;
  await page.route(/\.wav(?:\?|$)/,async route=>{
    if(!failedOnce){failedOnce=true;await route.fulfill({status:503,body:'sample temporarily unavailable'});}
    else await route.continue();
  });
  await observeAudio(page);await page.goto('/');await fastBand(page);
  await page.locator('#play').click();await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toContainText(/sample|instrument|load|download/i);
  expect(await page.evaluate(()=>(window as any).__audioUpgrade.banks.length)).toBe(0);
  await page.locator('#play').click();await expect(page.locator('#play-status')).toContainText('Playing');
  await expect.poll(()=>peak(page,'dry')).toBeGreaterThan(.005);
  await expect(page.locator('#error')).toBeHidden();await stopBand(page);expect(errors).toEqual([]);
});
