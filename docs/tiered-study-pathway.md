# Tiered CAGED study pathway — first pilot

Available at the top of Progress as **Dorian · minor 7**. This organises existing chart, CAGED and exercise functionality; it adds no new exercise generators, ear-training prompts, practice instructions or readiness gates.

1. Single-chord vamp: one minor-7 chord with Dorian, selected CAGED position and existing material.
2. Same sound, different keys: every chord remains minor 7 / Dorian. Choose the same CAGED framework throughout, or automatic positions in a fixed fretboard region. Root orders include minor thirds. One interval cycle closes after its actual number of distinct roots; All 12 roots visits every pitch class without duplicate roots.
3. Progressions and turnarounds: ii–V, ii–V–I or vi–ii–V–I. The chosen minor-7 root remains ii, so A gives Am7–D7–Gmaj7 with G as the chart key. The vi chord uses Aeolian, ii Dorian, V Mixolydian and I Ionian.

Material includes positional scale, core arpeggio, existing scale sequences and arpeggio sequences. Choosing a tier or field only previews a study; **Load study** replaces the working chart and selects the matching exercise and CAGED route. The chart Undo history retains the previous chart, key and route. Loading retains tempo, backing style and mixer choices, selects backed exercise looping and does not start playback.

A compact loaded-study bar links Chart, Fretboard, Exercises and Pathway. Changes to the chart, material or route mark the setup as modified; navigation alone does not reload the study. Reload study explicitly restores the loaded configuration. Ending study navigation leaves the chart in place.

Optional Studied marks are manual and scoped to the tier, starting root, material, durations, position/region and relevant progression choices. They are saved in this browser alongside the last pathway selection, independently of the previous checklist. No completion percentage implies measured performance. Previous guided setups and checklist remain available under Other practice tools. Saved setups and the existing journal are retained.

This pilot is restricted to the Dorian/minor-7 starting pathway; other modes and chord-quality pathways have not been added.

Validation: 22 targeted model/generator/exercise checks passed, including all 12 roots, root-cycle coverage, compatible turnaround harmony and stored marks. Nine distinct browser workflows passed across pathway loading, persistence, Undo, playback locking, normal backing and the existing progression generator. Desktop/phone views inspected; TypeScript/Vite build passed. Backing sound/DSP files are unchanged, including the louder swell trim.
