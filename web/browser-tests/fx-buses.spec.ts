import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';
test('console send knobs sit above the faders, persist and move with the floating mixer without starting audio',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Original=window.AudioContext;(window as any).__fxContexts=0;window.AudioContext=class extends Original{constructor(options?:AudioContextOptions){super(options);(window as any).__fxContexts++;}};});
 await page.goto('/');await expect(page.locator('.mix-channel')).toHaveCount(6);await expect(page.locator('#space,#mute-space,[data-mix-channel=space]')).toHaveCount(0);await expect(page.locator('.channel-fx-sends input')).toHaveCount(18);
 await expect(page.locator('#fx-reverb-return,#fx-delay-return,#fx-reverb-b-return')).toHaveCount(0);
 await page.locator('#send-reverb-drums').fill('32');await page.locator('#send-reverb-drums').dispatchEvent('input');
 const knob=page.getByRole('slider',{name:'Comping Reverb B send',exact:true});await knob.focus();await knob.press('ArrowUp');await expect(knob).toHaveValue('1');
 const box=await knob.boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2-40,{steps:5});await page.mouse.up();await expect(knob).toHaveValue('29');
 await knob.dblclick();await expect(knob).toHaveValue('0');await knob.fill('45');await knob.dispatchEvent('input');
 await page.locator('#fx-reverb-b-type').selectOption('hall');await page.locator('#fx-delay-division').selectOption('quarterTriplet');
 for(const card of await page.locator('.mix-channel').all()){const send=await card.locator('.channel-fx-sends').boundingBox(),fader=await card.locator('.console-fader-bay').boundingBox();expect(send!.y+send!.height).toBeLessThanOrEqual(fader!.y+1);}
 expect(await page.evaluate(()=>(window as any).__fxContexts)).toBe(0);await page.reload();
 await expect(page.locator('#send-reverb-drums')).toHaveValue('32');await expect(page.locator('#send-delay-drums')).toHaveValue('0');await expect(page.locator('#send-reverbB-comping')).toHaveValue('45');await expect(page.locator('#fx-reverb-b-type')).toHaveValue('hall');await expect(page.locator('#fx-delay-division option')).toHaveCount(10);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-fx-v1')!));expect([saved.reverbReturn,saved.reverbBReturn,saved.delayReturn]).toEqual([100,100,100]);
 await page.locator('#mix-panel').screenshot({path:'/workspace/console-fx-desktop.png'});
 await page.locator('#mini-mixer').click();await expect(page.locator('#floating-mixer #send-reverbB-drums')).toBeVisible();await expect(page.locator('#floating-mixer #fx-reverb-b-type')).toBeVisible();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const card=page.locator('[data-mix-channel=drums]'),send=await card.locator('.channel-fx-sends').boundingBox(),fader=await card.locator('.console-fader-bay').boundingBox();expect(send!.y+send!.height).toBeLessThanOrEqual(fader!.y+1);
 await page.locator('#floating-mixer').screenshot({path:'/workspace/console-fx-mobile.png'});expect(errors).toEqual([]);
});
test('old single-reverb settings migrate without losing sends or enabling delay on drums',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-fx-v1',JSON.stringify({reverbType:'plate',delayDivision:'dotted',reverbReturn:25,delayReturn:50,sends:{drums:{reverb:30,delay:0},comping:{delay:40}}})));
 await page.goto('/');await expect(page.locator('#fx-reverb-type')).toHaveValue('plate');await expect(page.locator('#fx-reverb-b-type')).toHaveValue('plate');await expect(page.locator('#send-reverb-drums')).toHaveValue('30');await expect(page.locator('#send-reverbB-drums')).toHaveValue('0');await expect(page.locator('#send-delay-drums')).toHaveValue('0');await expect(page.locator('#send-delay-comping')).toHaveValue('40');
});
test('native reverb A, reverb B and modulated delay buses are isolated with fixed unity returns',async({page})=>{
 await page.route('**/__fx.js',route=>route.fulfill({contentType:'text/javascript',body:readFileSync(new URL('../src/audio/fx-buses.js',import.meta.url))}));await page.goto('/');
 const results=await page.evaluate(async()=>{
 const {createFxBuses,FX_CHANNELS,normalizeFxSettings}=await import('/__fx.js' as string),rows=[];
 for(const effect of ['reverb','reverbB','delay']){
  const rate=32000,c=new OfflineAudioContext(3,rate*3,rate),sources=Object.fromEntries(FX_CHANNELS.map((id:string)=>[id,{node:c.createGain()}])),fx=normalizeFxSettings({reverbType:'room',reverbBType:'hall'});fx.sends.drums[effect]=100;
  const bus=createFxBuses(c,c.createGain(),sources,fx);bus.setTempo(120);const merger=c.createChannelMerger(3);[bus.reverbReturn,bus.reverbBReturn,bus.delayReturn].forEach((r:GainNode,i:number)=>r.connect(merger,0,i));merger.connect(c.destination);
  const source=c.createBufferSource(),buffer=c.createBuffer(1,1,rate);buffer.getChannelData(0)[0]=.5;source.buffer=buffer;source.connect(sources.drums.node);source.start(.05);
  const audio=await c.startRendering();rows.push({returns:[bus.reverbReturn.gain.value,bus.reverbBReturn.gain.value,bus.delayReturn.gain.value],channels:Array.from({length:3},(_,i)=>{const pcm=audio.getChannelData(i);return {energy:pcm.reduce((n:number,v:number)=>n+v*v,0),first:pcm.findIndex((v:number)=>Math.abs(v)>1e-5)/rate,peak:pcm.reduce((n:number,v:number)=>Math.max(n,Math.abs(v)),0),late:pcm.slice(rate).reduce((n:number,v:number)=>n+v*v,0)};})});
 }
 return rows;
 });
 for(let effect=0;effect<3;effect++){expect(results[effect].returns).toEqual([1,1,1]);for(let channel=0;channel<3;channel++)expect(results[effect].channels[channel].energy)[effect===channel?'toBeGreaterThan':'toBe'](effect===channel?.00001:0);}
 expect(results[2].channels[2].first).toBeCloseTo(.3,2);expect(results[1].channels[1].late).toBeGreaterThan(results[0].channels[0].late);expect(results.flatMap(r=>r.channels).every(x=>x.peak<1)).toBe(true);
});
test('delay uses a native LFO and handles long divisions, tempo changes and resets without leaving oscillators running',async({page})=>{
 await page.route('**/__fx.js',route=>route.fulfill({contentType:'text/javascript',body:readFileSync(new URL('../src/audio/fx-buses.js',import.meta.url))}));await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {createFxBuses,FX_CHANNELS,normalizeFxSettings}=await import('/__fx.js' as string),c=new OfflineAudioContext(2,32000,32000),sources=Object.fromEntries(FX_CHANNELS.map((id:string)=>[id,{node:c.createGain()}]));
  let created=0,started=0,stopped=0;const depths:number[]=[],delays:DelayNode[]=[];const original=c.createOscillator.bind(c),createDelay=c.createDelay.bind(c);
  c.createOscillator=()=>{created++;const node=original(),start=node.start.bind(node),stop=node.stop.bind(node);node.start=(...args)=>{started++;start(...args);};node.stop=(...args)=>{stopped++;stop(...args);};const connect=node.connect.bind(node);node.connect=((target:any,...args:any[])=>{depths.push(target.gain.value);return (connect as any)(target,...args);}) as any;return node;};
  c.createDelay=(max)=>{const node=createDelay(max);delays.push(node);return node;};
  const fx=normalizeFxSettings(),bus=createFxBuses(c,c.destination,sources,fx);const asleep=created;fx.sends.comping.delay=50;fx.delayDivision='whole';bus.setTempo(30);bus.set(fx);const initial=delays[0].delayTime.value;bus.setTempo(120);bus.reset();
  fx.sends.comping.delay=0;bus.set(fx);bus.reset();return {asleep,created,started,stopped,depths,initial};
 });expect(result.asleep).toBe(0);expect(result.created).toBe(2);expect(result.started).toBe(2);expect(result.stopped).toBe(2);for(const depth of result.depths)expect(depth).toBeCloseTo(.0025,7);expect(result.initial).toBe(8);
});
