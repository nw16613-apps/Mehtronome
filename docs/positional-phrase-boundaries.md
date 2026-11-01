# Positional arpeggio traversal

The reported Am7 chart uses Position II for bars 1–2 (geometry C), then Position III for bars 3–4 (geometry A). Both regions contain nine distinct arpeggio pitches. At sixteenths, eight pitch steps each way produce a sixteen-note cycle, with the upper note beginning beat 3.

The original adapter ended bar 2 on E52 on the A string, then skipped E52 when it became the new region's low-string boundary. Starting bar 3 on G55 displaced the phrase. A first correction allowed that boundary to be rearticulated. The subsequent user choice makes a restricted nine-note span, rather than the entire available range, the standard for this exercise across positions.

## Current rule

- Use up to nine consecutive available core chord-tone pitches at every subdivision, retaining their actual physical coordinates, spelling and written intervals. The complete pitch library remains unchanged for the diagram and other generators.
- Every upward-first context uses the lowest available nine-note span; every downward-first context uses the highest. This boundary rule applies again at every chord/position change, not only the opening.
- A nine-note span produces the ordinal cycle 0 1 2 3 4 5 6 7 | 8 7 6 5 4 3 2 1 (mirrored for downward-first). There are no duplicated turning notes.
- Preserve the phrase cursor across bars and changes of position or harmony. Choose the fixed boundary span independently of the preceding pitch; proximity must not shift the span and skip its outer note. Changing spans never skips ahead in the phrase or changes its ordinal phase.
- At sixteenths, each eight-note half lasts two beats. Eighths retain nine pitches and make four beats per half. Triplets keep the same eight attacks per half, taking 8/3 beats each way. Turns flow across bar lines; no run restarts or padding notes force the pattern into a whole number of bars.
- A region with fewer than the requested nine available chord pitches uses its full shorter span and explicitly reports the shorter phrase. It does not invent pitches, leave the selected diagram or silently pad repeated notes.
- Continuous scope repeats the cycle. One-run scope includes its turning note, then rests for the remaining slot time. Notation, TAB and playback use the same emitted notes and timing.

The corrected third and fourth bars are E52 G55 A57 C60 E64 G67 A69 C72 | E76 C72 A69 G67 E64 C60 A57 G55. Bar 3 starts on string 6, fret 12; its upper E starts at beat 3. The downward-first mirror has the same timing.

## Presentation

The menu calls the exercise Positional arpeggio, avoiding the claim that every outer pitch is played. The linked diagram reports the selected span, register and half-phrase length; chord-tone markers outside that span are faded. Positional score captions show the assigned CAGED position when it changes, rather than scheduling-fragment counts.

## Pattern start and saved settings

Pattern start rotates the same cycle to the selected structural chord-degree occurrence. All subdivisions expose the same available starts. The former triplet Phrase selector, seven-pitch balanced variants, cycling windows and full-position overlapping runs are retired. Older saved phrase values now use the ordinary traversal while preserving explicit starting degrees and direction. No composed triplet sequence is added.

## Verification

Exact-note tests retain the reported example and its downward-first mirror. All twelve roots, five positions, catalogue modes and chord qualities are checked for valid pitch order and range. New triplet checks cover complete scalar cycles, arpeggio parity with straight subdivisions, all available degree starts, mixed chord/mode/position changes, bar-independent continuation and exact timestamps. Existing eighth/sixteenth regressions remain intact. Browser checks cover notation/TAB, menu stability, saved options, triplet numeral placement, linked diagrams, playback and phone layout.

For the reported Gm7/D, B♭m7/E, D♭m7/G and Em7/A positions, upward-first starts on low-E frets 6 (B♭), 6 (B♭), 7 (B) and 7 (B). A Gm7/G position starts on low-E fret 13 (F). The default is the lowest chord pitch, not necessarily the root. Explicit Pattern start remains a degree-based rotation of the same fixed span, for every rhythm.
