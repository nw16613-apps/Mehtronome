import {openReference} from './open-reference';
import {test,expect} from '@playwright/test';

test('grip overlay keeps the established fingerings, labels fingers and mutes, and follows the current chord',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await openReference(page);
  await expect(page.locator('#show-grip')).toBeChecked();await expect(page.locator('.grip-preview')).toHaveCount(5);
  for(const position of ['I','II','III','IV','V']){
    const card=page.locator(`[data-position="${position}"]`);
    const count=await card.locator('.grip-note').count();expect(count).toBeGreaterThanOrEqual(3);expect(count).toBeLessThanOrEqual(4);
    await expect(card.locator('.grip-finger')).toHaveCount(count);await expect(card.locator('.grip-mute')).toHaveCount(6-count);
    await expect(card.locator('.grip-help')).toContainText('Omitted: G');
  }
  await expect(page.locator('.grip-note').first()).toHaveCSS('opacity','1');
  await expect(page.locator('.fret-note:not(.grip-note)').first()).toHaveCSS('opacity','0.3');
  const coordinates=()=>page.locator('#guitar-diagrams .fret-note').evaluateAll(notes=>notes.map(n=>[n.getAttribute('data-string'),n.getAttribute('data-fret'),n.getAttribute('data-pc')]));
  const before=await coordinates();await page.locator('#show-grip').uncheck();
  await expect(page.locator('.grip-ring')).toHaveCount(0);await expect(page.locator('.grip-preview')).toHaveCount(0);expect(await coordinates()).toEqual(before);
  await page.locator('#show-grip').check();expect(await coordinates()).toEqual(before);
  await page.locator('#quality').selectOption('mixolydian');await expect(page.locator('#guitar-parent')).toContainText('F major');
  await expect(page.locator('#guitar-diagrams .grip-tones').first()).toContainText('B♭');
  await page.locator('#progression').click();await page.locator('#template').selectOption('major251');await page.locator('#audition').uncheck();
  await page.locator('#progression-strip>button').nth(1).click();await expect(page.locator('#guitar-context')).toHaveText('G7alt');
  await expect(page.locator('.grip-preview')).toHaveCount(5);
  for(const palette of ['dark','midnight','paper','plum','slate','light']){
    await page.locator('#palette').selectOption(palette);
    await expect(page.locator('.grip-ring').first()).toHaveCSS('fill','none');
    expect(await page.locator('.grip-ring').first().evaluate(n=>getComputedStyle(n).stroke)).not.toBe('none');
    await expect(page.locator('.grip-finger text').first()).toHaveCSS('font-size','9px');
  }
  for(const width of [1440,760,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  expect(errors).toEqual([]);
});

test('clicking a grip strums exact pitches, rings after release, and supports keyboard and retrigger',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;(window as any).__gripMessages=[];
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);
        const pad=context.createAnalyser(),rhythm=context.createAnalyser(),click=context.createAnalyser();this.connect(pad,1);this.connect(rhythm,2);this.connect(click,0);
        (window as any).__gripAudio={pad,rhythm,click};
        const post=this.port.postMessage.bind(this.port);
        this.port.postMessage=(data:any,transfer?:Transferable[])=>{(window as any).__gripMessages.push(data);if(transfer)post(data,transfer);else post(data);};
      }
    };
  });
  await openReference(page);await page.locator('#sequence').check();await page.locator('#drums').check();await page.locator('#bass').check();
  const button=page.locator('[data-position="III"] .grip-preview');
  const expected=await page.locator('[data-position="III"] .grip-note').evaluateAll(notes=>notes.map(n=>[40,45,50,55,59,64][Number(n.getAttribute('data-string'))]+Number(n.getAttribute('data-fret'))));
  await button.click();await expect(page.locator('#grip-preview-status')).toBeVisible();
  expect(await page.evaluate(()=>(window as any).__gripMessages.filter((d:any)=>d.type==='audition').at(-1).notes)).toEqual(expected);
  expect(await page.evaluate(()=>(window as any).__gripMessages.filter((d:any)=>d.type==='audition').at(-1).acoustic)).toBe(true);
  const peak=(bus:string)=>page.evaluate(bus=>{const a=(window as any).__gripAudio[bus] as AnalyserNode;const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);return Math.max(...data.map(Math.abs));},bus);
  await expect.poll(()=>peak('pad')).toBeGreaterThan(.005);expect(await peak('click')).toBe(0);expect(await peak('rhythm')).toBe(0);
  await page.waitForTimeout(250);await expect(page.locator('#grip-preview-status')).toBeVisible();
  expect(await peak('pad')).toBeGreaterThan(.001);
  await button.click();await expect(page.locator('#grip-preview-status')).toBeVisible();
  await button.focus();await page.keyboard.press('Space');await expect(page.locator('#grip-preview-status')).toBeVisible();
  await page.keyboard.press('Enter');await expect(page.locator('#grip-preview-status')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>(window as any).__gripMessages.filter((d:any)=>d.type==='audition').length)).toBe(4);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('#grip-preview-status')).toBeHidden();await page.keyboard.up('Enter');
  await expect.poll(()=>peak('pad')).toBeLessThan(.0001);
  await button.click();await expect(page.locator('#grip-preview-status')).toBeVisible();
  await page.locator('#quality').selectOption('dorian');await expect(page.locator('#grip-preview-status')).toBeHidden();await page.mouse.up();
  await page.locator('#count-in').uncheck();await page.locator('#play').click();await expect(page.locator('#play-status')).toContainText('Playing');
  for(const b of await page.locator('.grip-preview').all())await expect(b).toBeDisabled();
  await page.locator('#play').click();expect(errors).toEqual([]);
});

test('touch tap strums and rings until its natural tail ends',async({page})=>{
  await openReference(page);await page.setViewportSize({width:390,height:844});
  const button=page.locator('[data-position="IV"] .grip-preview');await button.scrollIntoViewIfNeeded();
  const box=await button.boundingBox(),point={x:box!.x+box!.width/2,y:box!.y+box!.height/2};
  const session=await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
  await expect(page.locator('#grip-preview-status')).toBeHidden();
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.locator('#grip-preview-status')).toBeVisible();
  await expect(page.locator('#grip-preview-status')).toBeHidden({timeout:10000});

});

test('changing diagrams before a strum loads prevents a stale note',async({page})=>{
  await page.addInitScript(()=>{
    (window as any).__gripMessages=[];
    const Context=window.AudioContext;
    window.AudioContext=class extends Context{
      constructor(options?:AudioContextOptions){super(options);const add=this.audioWorklet.addModule.bind(this.audioWorklet);
        this.audioWorklet.addModule=async(...args)=>{await new Promise<void>(resolve=>{(window as any).__finishGripLoad=resolve;});return add(...args);};}
    };
    const Node=window.AudioWorkletNode;
    window.AudioWorkletNode=class extends Node{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){super(context,name,options);const post=this.port.postMessage.bind(this.port);
        this.port.postMessage=(data:any,transfer?:Transferable[])=>{(window as any).__gripMessages.push(data.type);if(transfer)post(data,transfer);else post(data);};}
    };
  });
  await openReference(page);const button=page.locator('[data-position="I"] .grip-preview');await button.click();
  await expect.poll(()=>page.evaluate(()=>typeof (window as any).__finishGripLoad)).toBe('function');await page.locator('#quality').selectOption('dorian');
  await page.evaluate(()=>(window as any).__finishGripLoad());
  await expect.poll(()=>page.evaluate(()=>(window as any).__gripMessages.includes('stop'))).toBe(true);
  expect(await page.evaluate(()=>(window as any).__gripMessages.includes('audition'))).toBe(false);
  await expect(page.locator('#grip-preview-status')).toBeHidden();
});

test('guitar strums feed stereo reverb controlled by Ambient space',async({page})=>{
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);
        const create=context.createGain.bind(context);let count=0;
        context.createGain=()=>{
          const gain=create();
          if(count++===1){
            const split=context.createChannelSplitter(2),left=context.createAnalyser(),right=context.createAnalyser();
            gain.connect(split);split.connect(left,0);split.connect(right,1);
            (window as any).__guitarWet=[left,right];
          }
          return gain;
        };
      }
    };
  });
  await openReference(page);await page.locator('#space').fill('0');
  const button=page.locator('[data-position="III"] .grip-preview');await button.click();
  const wet=()=>page.evaluate(()=>{
    const channels=((window as any).__guitarWet as AnalyserNode[]).map(a=>{const values=new Float32Array(a.fftSize);a.getFloatTimeDomainData(values);return values;});
    return {peak:Math.max(...channels[0].map(Math.abs)),difference:Math.max(...channels[0].map((v,i)=>Math.abs(v-channels[1][i])))};
  });
  await page.waitForTimeout(150);expect((await wet()).peak).toBe(0);
  await page.locator('#space').fill('75');
  await expect(page.locator('#grip-preview-status')).toBeVisible();
  await expect.poll(async()=>(await wet()).peak).toBeGreaterThan(.001);
  await expect.poll(async()=>(await wet()).difference).toBeGreaterThan(.001);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await expect(page.locator('#grip-preview-status')).toBeHidden();
});
