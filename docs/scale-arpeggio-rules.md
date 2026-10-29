# Scale sequences and arpeggios: current musical contract

This pass covers the seven Scale sequences and seven Arpeggios entries. It adds no licks or chord workshops. The chart, scale guide and per-slot CAGED positions remain the sources of truth.

## Definitions

Numbers below describe ordered scale steps relative to a cell's starting degree, unless explicitly described as written chord tones. The octave wraps after the actual collection length, not always seven notes.

| Exercise | Complete cell / material | Progression anchor |
| --- | --- | --- |
| Scale in thirds | Steps 1–3 | First note |
| Scale in fourths | Steps 1–4 | First note |
| Scale in sixths | Steps 1–6 | First note |
| Groups of three | Steps 1–2–3 | First note |
| Groups of four | Steps 1–2–3–4 | First note |
| Diatonic 1–3–2–4 | Steps 1–3–2–4 | First note |
| Diatonic 1–2–3–5 | Steps 1–2–3–5 | First note |
| Full positional arpeggio | Every distinct written chord-tone pitch available in the diagram, including written extensions | Last played pitch; runs can cross bars |
| Harmonized scale | Alternate scale notes: 1–3–5, 1–3–5–7 or 1–3–5–7–9 | First note of the directed stack |
| Alternating diatonic arpeggios | Same scale stacks; alternate the played up/down contour of successive cells | Structural first note before alternating reversal |
| Arpeggios from core chord tones | Same scale stacks, restricted to roots among the first four written chord tones (all tones if shorter) | First note of the directed stack |
| Alternating arpeggios from core chord tones | Same restricted stacks; alternating played contours | Structural first note before alternating reversal |
| Selected-chord inversions | Rotate the first three, four or five written chord tones; use every fitting register. A shorter chord uses all its tones | First note of the directed rotation |
| 3-to-9 arpeggios | Existing interpretation retained: scale steps 3–5–7–9 from successive scale degrees | First played note |

Downward scale sequences negate their scale-step offsets. Downward harmonized cells reverse the tertian stack and move its upper starting anchor down through the region. Core-chord-tone cells keep their underlying chord-tone roots while reversing contour/order. Inversion names describe the rotated cell's lower chord tone, not a change to the backing bass.

On five-, six- and eight-note collections, thirds/fourths/sixths menus use scale-step wording and Material uses 3/4/5-note stacks: counting collection steps does not guarantee an ordinary third, triad, seventh or ninth chord. Inversions remain based on the actual written chord; their material menu says “Up to N chord tones”. Labels use a consistent collection-aware vocabulary for a mixed chart. Internal option IDs and saved-option compatibility are unchanged.

The 3-to-9 choice overlaps harmonized tetrads under its present interpretation. Whether to redefine it as the current backing chord's 3rd–5th–7th–9th is a separate, explicit musical decision; this pass does not silently change that meaning.

## Continuation and timing

- Start from the first complete cell available at the requested edge. Never fabricate notes to fill a gap in the diagram.
- Missing interior pitches exclude only the affected complete cells. Later valid cells remain available, with exact theoretical intervals intact.
- Repeated harmony, scale and geometry retain the sequence cursor; bar boundaries do not restart it.
- At a changed harmony or position, select the nearest complete cell ahead of the previous structural anchor in the current travel direction. Alternating contour phase follows emitted cells, including across changes.
- At the usable range limit, generate the opposite-direction form and continue from the nearest valid anchor to the outgoing upper/lower extent. A cell's final played note is not a general-purpose traversal anchor.
- Pattern cells stay complete within each chord slot. Only an insufficient remaining time budget produces a rest. One-cell scope deliberately leaves the rest of the slot silent. Continuous positional arpeggios may continue note by note across bars.
- Notation, TAB, note audition and exercise playback consume the same generated notes. Written chord-tone spelling is used for positional arpeggios; scale sequences retain the scale guide's spelling.

## Findings and fixes

1. Scale and harmonized generators previously stopped at the first unavailable cell, losing valid cells above/below a missing interior pitch. They also had fixed iteration caps. Both now enumerate the actual available anchors and retain every exact complete cell.
2. Inversions previously generated only one occurrence of each rotation. This caused premature reversals despite remaining usable register. They now enumerate every complete anchor, in both directions.
3. Full positional arpeggios inherited scale spelling even for enharmonically different written chord tones. They now use the selected chord's spelling and interval labels.
4. Menu text still called non-seven-note stacks triads/tetrads/ninths and non-diatonic pairs thirds/fourths/sixths. Contextual menu labels now match the established scale-step behavior, with precise chord-based wording for inversions and core-tone roots.

5. Loading five-, six- or eight-note charts could fail while generating the label of an unavailable seven-note progression template, leaving stale exercise notation. That label is now calculated only for its supported major/minor modes. Browser coverage loads every scale family from Harmony and regenerates scale and inversion notation.

## Verification

The new independent oracle constructs theoretical pitches across MIDI octaves before restricting them to the diagram. It does not call the generator to predict expected cells. It covers all scale families, all twelve roots and all five CAGED shapes for scale sequences, every material/direction for harmonized and core-tone stacks, and every chord type and shape for inversions and full positional arpeggios. Exact-note tests cover an interior gap, the upper-register inversion turn and bar-independent cursor/alternating phase. Existing nearest-continuation and range-turn matrices check ii–V–I, altered, modal and twelve-root fourths charts, fixed/changing positions, and finite slot budgets. Browser tests cover notation, controls, selected passages, guitar level and audio playback.

## Starting chart

Fresh sessions now open four separately selectable one-bar Am7 slots in A Dorian (16 beats in 4/4). The single-chord template also creates four tonic slots using the current selected chord and scale. The mode’s suggested chord remains available as before; saved charts and the remembered working draft are not rewritten. Each repeated bar retains an independent manual CAGED position and corresponding exercise notation.

The initial exercise is Full positional arpeggio, Sixteenth notes, Continuous pattern, Upward first. Saved exercise options remain explicit user choices and are not rewritten.

Validation result: production TypeScript/Vite build and 11 focused unit files passed. Twenty-three targeted browser scenarios were validated, with the continuity fixture rerun after explicitly selecting its material-based study under the new positional default. The full historical suite is not claimed: older adaptive-exercise fixtures still target the retired pedal control and the former location of guided setup. Hosted publication is checked through deployment status; browser validation is local.
