export const PENTATONIC_FINGERINGS={pentThree:[3,3,3,3,3,3],pent31:[3,1,3,1,3,1],pent13:[1,3,1,3,1,3]};
export const isPentatonicFingering=kind=>Object.hasOwn(PENTATONIC_FINGERINGS,kind||'');
export const isScaleFingering=kind=>['caged','three'].includes(kind)||isPentatonicFingering(kind);
export const PENTATONIC_FINGERING_LABELS={pentThree:'Pentatonic · 3 notes per string',pent31:'Pentatonic · 3–1–3–1–3–1',pent13:'Pentatonic · 1–3–1–3–1–3'};
