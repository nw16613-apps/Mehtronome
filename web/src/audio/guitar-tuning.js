// Instrument compensation belongs to playback, never to chart/score pitch.
export const GUITAR_TUNING_KEY='mehtronome-guitar-tuning';
export const GUITAR_TUNINGS=[['0','Standard · E A D G B E'],['-1','E♭ standard · E♭ A♭ D♭ G♭ B♭ E♭']];
export const normalizeGuitarTuning=value=>Number(value)===-1?-1:0;
export const guitarTuningRatio=value=>2**(normalizeGuitarTuning(value)/12);
