import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PRACTICE_TASKS,PRACTICE_GROUPS,curriculumKey,completedCount,practicePlan,modeProgress} from '../src/practice/curriculum.js';

test('practice curriculum keeps progress separate for every root, mode and chord',()=>{
  const dorian=curriculumKey({root:'A',mode:'dorian',chord:'Am13'});
  const melodic=curriculumKey({root:'A',mode:'melodicminor',chord:'AmMaj9'});
  const otherChord=curriculumKey({root:'A',mode:'dorian',chord:'Am7'});
  assert.notEqual(dorian,melodic);assert.notEqual(dorian,otherChord);
  const records={[dorian]:['listen','colour'],[otherChord]:['listen']};
  assert.equal(modeProgress(records,'A','dorian'),2);
  assert.equal(modeProgress(records,'A','melodicminor'),0);
});

test('session plan chooses the next unfinished tasks within the time budget',()=>{
  const completed=['listen','colour'];
  const plan=practicePlan(completed,15);
  assert.ok(plan.tasks.length>0);assert.ok(plan.minutes<=15);
  assert.ok(plan.tasks.every(task=>!completed.includes(task.id)));
  assert.equal(completedCount(PRACTICE_TASKS.map(task=>task.id)),PRACTICE_TASKS.length);
  assert.deepEqual(practicePlan(PRACTICE_TASKS.map(task=>task.id),20).tasks,[]);
});

test('compact checklist groups preserve all original completion IDs exactly once',()=>{
 const ids=PRACTICE_GROUPS.flatMap(group=>group.items.map(item=>item.id));
 assert.equal(PRACTICE_GROUPS.length,4);assert.equal(new Set(ids).size,ids.length);assert.deepEqual([...ids].sort(),PRACTICE_TASKS.map(item=>item.id).sort());
 const saved=['listen','position-III','connect-34','improvise'];assert.equal(completedCount(saved),4);assert.ok(saved.every(id=>ids.includes(id)));
});
