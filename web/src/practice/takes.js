export const TAKE_DB='mehtronome-takes-v1';
export const MAX_TAKES=10,MAX_TAKE_BYTES=25*1024*1024,MAX_TOTAL_BYTES=100*1024*1024;
export function takeExtension(type){return type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'webm';}
export function compareTime(elapsed,trimMs,duration){const at=Math.max(0,elapsed)+Math.max(0,trimMs)/1000;return at>=duration?null:at;}
export function validateTake(take,existing=[]){
 if(!take?.id||!(take.blob instanceof Blob)||!take.blob.size)throw new Error('No recorded audio was captured.');
 if(take.blob.size>MAX_TAKE_BYTES)throw new Error('This take exceeds 25 MB. Export it before making another.');
 const others=existing.filter(t=>t.id!==take.id);if(others.length>=MAX_TAKES)throw new Error('Ten takes are stored. Export/delete a take to make room.');
 if(others.reduce((n,t)=>n+t.blob.size,0)+take.blob.size>MAX_TOTAL_BYTES)throw new Error('The local take library exceeds 100 MB. Export/delete takes to make room.');
 return {...take,name:String(take.name||'Untitled take').slice(0,60),notes:String(take.notes||'').slice(0,1500),trimMs:Math.max(0,Math.min(10000,Number(take.trimMs)||0))};
}
export function openTakeStore(indexedDB=globalThis.indexedDB){
 if(!indexedDB)return Promise.reject(new Error('Local audio storage is unavailable.'));return new Promise((resolve,reject)=>{const req=indexedDB.open(TAKE_DB,1);req.onupgradeneeded=()=>req.result.createObjectStore('takes',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
}
export async function takeTransaction(db,mode,action){
 return new Promise((resolve,reject)=>{const tx=db.transaction('takes',mode),request=action(tx.objectStore('takes'));let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||new Error('Local audio storage failed.'));tx.onabort=()=>reject(tx.error||new Error('Local audio save was interrupted.'));});
}
