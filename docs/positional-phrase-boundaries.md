# Balanced positional arpeggio phrases

The reported Am7 chart uses Position II for bars 1–2 (geometry C), then Position III for bars 3–4 (geometry A). Both regions contain nine distinct arpeggio pitches. At sixteenths, eight pitch steps each way produce a sixteen-note cycle, with the upper note beginning beat 3.

The original adapter ended bar 2 on E52 on the A string, then skipped E52 when it became the new region's low-string boundary. Starting bar 3 on G55 displaced the phrase. A first correction allowed that boundary to be rearticulated. The subsequent user choice makes a restricted nine-note span, rather than the entire available range, the standard for this exercise across positions.

## Current rule

- Use seven consecutive available chord-tone pitches for eighth-note triplets, or nine for eighths and sixteenths, retaining their actual physical coordinates, spelling and written intervals. The complete pitch library remains unchanged for the diagram and other generators.
- Upward-first starts with the lowest available window; downward-first starts with the highest. Repeated contexts retain their chosen window.
- A nine-note span produces the ordinal cycle 0 1 2 3 4 5 6 7 | 8 7 6 5 4 3 2 1 (mirrored for downward-first). There are no duplicated turning notes.
- Preserve the phrase cursor across bars and changes of position or harmony. Choose among fitting windows by continuing pitch direction where possible, then nearest register. Choosing a window never skips ahead in the phrase or changes its ordinal phase.
- At sixteenths, each eight-note half lasts two beats. Eighths retain nine pitches and make four beats per half. Triplets use seven pitches: the ordinal cycle 0 1 2 3 4 5 | 6 5 4 3 2 1 gives six notes per half, two beats each way and one complete phrase per 4/4 bar. This change does not alter subdivision semantics or force unrelated exercise families into a sixteen-note template.
- A region with fewer than the requested seven or nine available chord pitches uses its full shorter span and explicitly reports the shorter phrase. It does not invent pitches, leave the selected diagram or silently pad repeated notes.
- Continuous scope repeats the cycle. One-run scope includes its turning note, then rests for the remaining slot time. Notation, TAB and playback use the same emitted notes and timing.

The corrected third and fourth bars are E52 G55 A57 C60 E64 G67 A69 C72 | E76 C72 A69 G67 E64 C60 A57 G55. Bar 3 starts on string 6, fret 12; its upper E starts at beat 3. The downward-first mirror has the same timing.

## Presentation

The menu calls the exercise Positional arpeggio, avoiding the claim that every outer pitch is played. The linked diagram reports the selected span, register and half-phrase length; chord-tone markers outside that span are faded. Positional score captions say Arpeggio rather than counting scheduling fragments as “2 cells” or “3 cells”.

## Verification

Exact-note tests retain the original example and downward-first mirror. All twelve roots and five Am7 positions repeat nine-pitch, sixteen-note cycles for sixteenths and seven-pitch, twelve-note cycles for triplets in both directions. Every chord type at three roots is checked through every position-to-position transition, including partial-bar entry, with an independent triangular-wave phase oracle. Triplet transitions also cover changing chord types and roots. Smaller spans, complete slot durations, all subdivisions, bar-independent continuation and the existing scale/arpeggio matrices remain covered. Browser checks compare the exact low-string entry, top-note time, TAB, all five positions and directions, span labels/faded markers, diagram context, playback, looping and guitar volume.

Validation result: the production build and eight focused unit files passed. Fifteen browser scenarios were validated across the phrase, scale-family, chart and playback suites; the three positional scenarios were rerun after strengthening the outside-span marker styling.


## Full position with turnaround (triplets)

The Phrase selector offers Balanced phrase and Full position with turnaround for positional arpeggios at eighth-note triplets. Balanced remains the default; the choice is included in saved exercise options and remembered while changing rhythms, but only affects triplets.

Full position uses every distinct available chord-tone pitch. Let N be the number of pitches: a complete sweep contains 2(N−1) notes, without doubled endpoints. For the usual nine- or ten-pitch seventh-chord positions, append a smaller sweep from the initial edge to reach 24 notes (eight beats, two bars of 4/4). Nine pitches give 16+8; ten give 18+6. Mirror both sweeps for downward-first.

The ending uses the first R/2+1 pitches from the starting edge, where R is the number of remaining notes. Its outgoing and returning legs also omit doubled endpoints. The next phrase begins at the original edge. Smaller ranges can repeat legal sweeps until the block is full; a range requiring more than 24 notes uses the next complete 24-note block. No pitches are invented or taken outside the selected position.

The global note cursor continues through chord and position changes, including changes in the shorter sweep. Each new context rebuilds its own full-range phrase at that same ordinal phase; it does not restart at the chord boundary. This prioritizes complete range and formula alignment over choosing a different register window. One-run scope plays only the initial leg through its turning note, then rests as before.

Tests cover exact sweeps in all twelve Am7 keys, all positions and both directions, changing chords/positions at one-, two- and four-beat boundaries, and every chord type's available range. Browser tests compare both consecutive two-bar phrases, the selected full range, rhythm switching, and mobile overflow.
