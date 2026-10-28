# Directional continuity across harmony and CAGED changes

Chord or scale changes adapt the pattern rather than resetting it to the top/bottom of the new position. Each generated directional cell records its sequence anchor and travel direction. The anchor is the structural point that advances through the exercise: the first note before alternating reversal, the resolution target for enclosures, or the first played note of a scale pattern. It is deliberately not the last played note of an arpeggio.

At a changed context, choose the nearest complete cell strictly ahead of the previous anchor in the ongoing direction. Preserve the remaining order of the new scale's cells and their internal intervals. If the new position cannot contain a continuing cell, a combined-direction pattern turns at the usable boundary; a one-way pattern restarts that leg at its edge. Adjacent identical contexts keep the existing cursor. Complete pattern cells still respect chord-slot durations; the time limit is unchanged.

Alternating diatonic, chord-tone and alternating pentatonic cells retain stroke phase even when the chosen new cell has different parity in its generated library. Positional arpeggios continue from the nearest valid next chord-tone pitch. Chromatic targets and approaches retain their resolution rules. Triad pairs retain A/B motif phase and choose new-register paths near the preceding note. Fixed exact grips retain their user-selected coordinates; sustained guide-tone voice leading retains its common-tone/nearest-voice behaviour. Arpeggio connections use directed inversion anchors across chord changes.

For the reported four bars (Am7, Am7, Bm7, Bm7), with Dorian guides and the same parent C geometry, descending tetrad anchors are now D74, C72, B71, A69, G-sharp68, F-sharp66, E64, D62. The first cell over Bm7 is G-sharp–E–C-sharp–A, instead of restarting on D74. Ascending continues through the same change from E52 into F-sharp54. All notes remain in the new scale and selected position.

Validation: 61 focused unit tests and 11 browser tests pass. The integrity/continuity matrix covers directional families in essential ii–V–I, altered ii–V–I, modal Dorian and twelve-root fourths progressions, multiple keys and fixed/changing CAGED geometries. Independent checks verify nearest forward anchors, boundary resets/turns, alternate phase, positional-note continuation, motif phase and inversion connections. Browser tests verify the exact reported notation, ascending counterpart, playback cursor/chord context, manual route changes, inspection, passage loops and mobile width. An initial playback fixture used main tempo without refreshing the exercise tempo; it now explicitly sets exercise tempo.

No storage format or saved position-route schema changes. The full-position/time-budget scope discussion remains separate from sequence continuity.

## Continuous range turns

Ascending/descending now specify the initial traversal leg. After the last
complete cell in that leg, progression exercises generate the opposite-direction
pattern, select its nearest continuing anchor and keep filling the slot. This
continues across repeated bars and changed scales/positions; alternating strokes
retain phase through each turn. Only an incomplete remaining beat budget causes
a rest. Short-cell scope still deliberately emits just one cell per slot.
Positional runs turn at their outer notes without duplicating that endpoint.
Exact grips and triad-pair motifs retain their existing fixed/motif behavior.
Chord-tone stack exercises use core root/third/fifth/seventh starting tones,
independently of extensions in the backing chord.

Regression coverage: `range-turns.test.js` checks long repeated traversals,
intact opposite forms, alternating phase, the reported minor-third progression,
core starting tones and short-cell scope. The wider pattern matrix accepts both
proper directional forms and checks bar-independent sequence continuation.

### Turn reference correction

Ordinary continuation still compares cell starting anchors. On reversal only,
the reference is now the outgoing cell's upper extent (ascending traversal) or
lower extent (descending traversal). This prevents comparing an ascending cell's
low root to a descending cell's high starting note. The structural extent is
independent of alternating stroke phase. This applies both within a chord slot
and when a changed harmony/position forces a turn. Exact-note regression tests
cover E–G–B–D → C–A–F♯–D and A–F♯–D–B → C–E–G–B in A Dorian,
including a turn across a bar boundary.
