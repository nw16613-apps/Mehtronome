import {referenceBasePlan,referencePlanKey} from './reference-performances.js';
// Main-thread preparation: expensive composition never needs to run in the
// browser's real-time worklet. Fader/activity messages send only the stable key.
export function createReferencePreparation(compile=referenceBasePlan){
 let cached=null;
 const get=settings=>{const key=referencePlanKey(settings);if(cached?.key!==key)cached={key,plan:compile(settings)};return cached;};
 return {get,message(settings,deliveredKey){const prepared=get(settings);return prepared.key===deliveredKey?{key:prepared.key}:prepared;}};
}
