export const PRESET_KEY = 'mehtronome-practice-presets-v1';
export const PRESET_CONTROLS = [
  'bpm','beats','count-in','subdivision','accent','key','quality','sound','chord','template',
  'exercise','click','harmony','space','sequence','sequence-source','sequence-register','sequence-pattern','sequence-rate','sequence-density',
  'sequence-swing','sequence-volume','drums','bass','drum-groove','bass-pattern','drums-volume','bass-volume',
  'fret-labels','audition','highlight-mode','show-grip',
  'gap-enabled','gap-play','gap-mute','gap-target','loop-enabled','loop-start','loop-end',
  'trainer-enabled','trainer-bars','trainer-increment','trainer-target','featured-position','position-region',
  'theory-view','theory-choice',
  // Retained so older exported presets can migrate their Position I choice to
  // the shared Explore control when imported.
  ...['I','II','III','IV','V'].flatMap(position=>[`theory-view-${position}`,`theory-choice-${position}`]),
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


export const PRESET_FILE_FORMAT = 'mehtronome-practice-presets';
export const MAX_PRESET_FILE_BYTES = 512 * 1024;

function transferItems(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('The file does not contain any practice presets.');
  if (items.length > 50) throw new Error('You can save up to 50 presets. Delete some presets before importing.');
  return items.map((item, index) => {
    const invalid = () => new Error(`Preset ${index + 1} is invalid. Export the presets again from Mehtronome.`);
    if (!item || typeof item !== 'object' || Array.isArray(item)
      || typeof item.id !== 'string' || !item.id.trim() || item.id.length > 80
      || typeof item.name !== 'string' || !item.name.trim() || item.name.trim().length > 60
      || !item.controls || typeof item.controls !== 'object' || Array.isArray(item.controls)
      || item.progression !== undefined && typeof item.progression !== 'boolean') throw invalid();
    const controls = {};
    for (const id of PRESET_CONTROLS) {
      if (!Object.hasOwn(item.controls, id)) continue;
      const value = item.controls[id];
      if (typeof value !== 'boolean' && !(typeof value === 'string' && value.length <= 120)) throw invalid();
      controls[id] = value;
    }
    if (!Object.keys(controls).length) throw invalid();
    return {id:item.id, name:item.name.trim(), progression:item.progression === true, controls};
  });
}

/** A portable file also accepts the older local-storage envelope on import. */
export function exportPresets(items) {
  if (!items.length) throw new Error('Save a practice preset before exporting.');
  const clean = transferItems(items);
  return JSON.stringify({format:PRESET_FILE_FORMAT,version:1,items:clean}, null, 2);
}

/**
 * Merge a transfer file without replacing existing presets or mutating inputs.
 * ID collisions receive new IDs, even if a file is imported more than once.
 */
export function importPresets(raw, existing = [], makeId = () => crypto.randomUUID()) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).byteLength > MAX_PRESET_FILE_BYTES) {
    throw new Error('Choose a preset JSON file smaller than 512 KB.');
  }
  let data;
  try { data = JSON.parse(raw.replace(/^\uFEFF/, '')); }
  catch { throw new Error('This file is not valid JSON. Choose a Mehtronome preset export.'); }
  if (!data || typeof data !== 'object' || data.version !== 1
    || data.format !== undefined && data.format !== PRESET_FILE_FORMAT) {
    throw new Error('This preset file format is not supported. Choose a Mehtronome preset export.');
  }
  const incoming = transferItems(data.items);
  if (existing.length + incoming.length > 50) {
    throw new Error(`You can save up to 50 presets. Make room for ${incoming.length} imported preset${incoming.length === 1 ? '' : 's'} first.`);
  }
  const used = new Set(existing.map(item => item.id));
  let suffix = 1;
  for (const item of incoming) {
    if (used.has(item.id)) {
      let replacement;
      // Bound retries when callers provide a faulty ID factory.
      for (let attempt = 0; attempt < 16; attempt++) {
        const candidate = makeId();
        if (typeof candidate === 'string' && candidate.trim() && candidate.length <= 80 && !used.has(candidate)) {
          replacement = candidate;
          break;
        }
      }
      if (!replacement) {
        do { replacement = `imported-preset-${suffix++}`; } while (used.has(replacement));
      }
      item.id = replacement;
    }
    used.add(item.id);
  }
  return {items:[...existing,...incoming],imported:incoming.length};
}
