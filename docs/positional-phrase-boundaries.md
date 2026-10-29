# Nine-note positional arpeggio phrases

The reported Am7 chart uses Position II for bars 1–2 (geometry C), then Position III for bars 3–4 (geometry A). Both regions contain nine distinct arpeggio pitches. At sixteenths, eight pitch steps each way produce a sixteen-note cycle, with the upper note beginning beat 3.

The original adapter ended bar 2 on E52 on the A string, then skipped E52 when it became the new region's low-string boundary. Starting bar 3 on G55 displaced the phrase. A first correction allowed that boundary to be rearticulated. The subsequent user choice makes a restricted nine-note span, rather than the entire available range, the standard for this exercise across positions.

## Current rule

- Use nine consecutive available chord-tone pitches, retaining their actual physical coordinates, spelling and written intervals. The complete pitch library remains unchanged for the diagram and other generators.
- Upward-first starts with the lowest available nine-note window; downward-first starts with the highest. Repeated contexts retain their chosen window.
- A nine-note span produces the ordinal cycle 0 1 2 3 4 5 6 7 | 8 7 6 5 4 3 2 1 (mirrored for downward-first). There are no duplicated turning notes.
- Preserve the phrase cursor across bars and changes of position or harmony. Choose among fitting windows by continuing pitch direction where possible, then nearest register. Choosing a window never skips ahead in the phrase or changes its ordinal phase.
- At sixteenths, each eight-note half lasts two beats. Other subdivisions retain the same pitch pattern: eighths make four beats per half; triplets make eight notes per half. This change does not alter subdivision semantics or force unrelated exercise families into a sixteen-note template.
- A region with fewer than nine available chord pitches uses its full shorter span and explicitly reports the shorter phrase. It does not invent pitches, leave the selected diagram or silently pad repeated notes.
- Continuous scope repeats the cycle. One-run scope includes its turning note, then rests for the remaining slot time. Notation, TAB and playback use the same emitted notes and timing.

The corrected third and fourth bars are E52 G55 A57 C60 E64 G67 A69 C72 | E76 C72 A69 G67 E64 C60 A57 G55. Bar 3 starts on string 6, fret 12; its upper E starts at beat 3. The downward-first mirror has the same timing.

## Presentation

The menu calls the exercise Positional arpeggio, avoiding the claim that every outer pitch is played. The linked diagram reports the selected span, register and half-phrase length; chord-tone markers outside that span are faded. Positional score captions say Arpeggio rather than counting scheduling fragments as “2 cells” or “3 cells”.

## Verification

Exact-note tests retain the original example and downward-first mirror. All twelve roots and five Am7 positions repeat nine-pitch, sixteen-note cycles in both directions. Every chord type at three roots is checked through every position-to-position transition, including partial-bar entry, with an independent triangular-wave phase oracle. Smaller spans, complete slot durations, all subdivisions, bar-independent continuation and the existing scale/arpeggio matrices remain covered. Browser checks compare the exact low-string entry, top-note time, TAB, all five positions and directions, span labels/faded markers, diagram context, playback, looping and guitar volume.

Validation result: the production build and eight focused unit files passed. Fifteen browser scenarios were validated across the phrase, scale-family, chart and playback suites; the three positional scenarios were rerun after strengthening the outside-span marker styling.
