// These controls do not change the harmony, chart or instrument vocabulary.
export const LIVE_FIELDS=['bpm','click','harmony','drumsVolume','bassVolume','compingVolume','sequenceVolume','mutedChannels','trainerEnabled','trainerBars','trainerIncrement','trainerTarget','sessionSeconds','sessionFinishBar','subdivision','accent','beatAccents','clickSound','clickSwing','polyBeats','polyBase','countIn'];
const immediate=new Set(LIVE_FIELDS);
export const musicalSettingsKey=s=>JSON.stringify(Object.keys(s).filter(k=>!immediate.has(k)).sort().map(k=>[k,s[k]]));
export const chartLayoutKey=s=>JSON.stringify([s.progression,s.template,s.beats,s.liveChartRevision,s.loopEnabled,s.loopUnit,s.loopStart,s.loopEnd,s.loopBeatStart,s.loopBeatEnd,s.customProgression?.steps?.map(c=>[c.bars,c.beats])]);
export const liveSettingsPatch=s=>Object.fromEntries(LIVE_FIELDS.filter(k=>Object.hasOwn(s,k)).map(k=>[k,s[k]]));
