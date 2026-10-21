import {expect,test} from '@playwright/test';
import {openReference} from './open-reference';

test('a progression can follow the nearest CAGED positions in a chosen fretboard region',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await openReference(page);
  await page.locator('#progression').click();
  await page.locator('#template').selectOption('major251');
  await page.locator('#featured-position').selectOption('path');

  const route=page.locator('#position-path>button');
  await expect(page.locator('#position-path-guide')).toBeVisible();
  await expect(route).toHaveCount(3);
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveCount(5);
  await expect(route.first()).toHaveClass(/current/);

  const assertRecommendedPosition=async(index:number)=>{
    const numeral=(await route.nth(index).locator('span').textContent())!.replace('Position ','');
    await expect(page.locator('#guitar-diagrams .position-card').first()).toHaveAttribute('data-position',numeral);
    await expect(page.locator('#guitar-diagrams .featured-position')).toHaveAttribute('data-position',numeral);
  };
  await assertRecommendedPosition(0);
  await route.nth(1).click();
  await expect(route.nth(1)).toHaveClass(/current/);
  await expect(page.locator('#guitar-context')).toHaveText('G7alt');
  await assertRecommendedPosition(1);

  const middle=await route.allTextContents();
  await page.locator('#position-region').selectOption('high');
  const high=await route.allTextContents();
  expect(high).not.toEqual(middle);
  for(const text of high)expect(text).toMatch(/Position I{1,3}|Position IV|Position V/);

  for(const width of [760,390]){
    await page.setViewportSize({width,height:900});
    await expect(page.locator('#position-path-guide')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('nearest-position mode is only available for chord progressions',async({page})=>{
  await openReference(page);
  expect(await page.locator('#featured-position option[value="path"]').evaluate(option=>(option as HTMLOptionElement).disabled)).toBe(true);
  await expect(page.locator('#position-path-guide')).toBeHidden();
  await page.locator('#progression').click();
  expect(await page.locator('#featured-position option[value="path"]').evaluate(option=>(option as HTMLOptionElement).disabled)).toBe(false);
  await page.locator('#featured-position').selectOption('path');
  await page.locator('#pedal').click();
  await expect(page.locator('#featured-position')).toHaveValue('all');
  await expect(page.locator('#position-path-guide')).toBeHidden();
});
