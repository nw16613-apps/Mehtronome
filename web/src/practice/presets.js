export const PRESET_KEY = 'mehtronome-practice-presets-v1';
export const PRESET_CONTROLS = [
  'bpm','beats','count-in','subdivision','accent','key','quality','sound','chord','template',
  'exercise','click','harmony','space','sequence','sequence-pattern','sequence-rate','sequence-density',
  'sequence-swing','sequence-volume','drums','bass','drum-groove','bass-pattern','drums-volume','bass-volume',
  'fret-labels','voicing-type','voicing-strings','voicing-labels','audition','highlight-mode',
  'gap-enabled','gap-play','gap-mute','gap-target','loop-enabled','loop-start','loop-end',
];
export function readPresets(raw) {
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.items)) throw new Error('Saved presets could not be read.');
  return data.items.slice(0,50).filter(item => item && typeof item.id === 'string' && item.id.length <= 80
    && typeof item.name === 'string' && item.name.trim() && item.controls && typeof item.controls === 'object')
    .map(item => ({id:item.id,name:item.name.trim().slice(0,60),progression:item.progression === true,
      controls:Object.fromEntries(PRESET_CONTROLS.filter(id => typeof item.controls[id] === 'boolean'
        || typeof item.controls[id] === 'string' && item.controls[id].length <= 120).map(id => [id,item.controls[id]]))}));
}
export function writePresets(storage, items) {
  if (items.length > 50) throw new Error('You can save up to 50 presets. Delete one to make room.');
  storage.setItem(PRESET_KEY,JSON.stringify({version:1,items}));
}
