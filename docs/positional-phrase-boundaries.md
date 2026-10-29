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

The Phrase selector offers Balanced phrase and Full position with turnaround for positional arpeggios at eighth-note triplets. It follows Exercise, Starting direction, Rhythm and Scope, preserving their order and grid locations. Balanced remains the default; the choice is saved with exercise options and remembered while changing rhythms, but only affects triplets.

Full position alternates directional forms every bar of 4/4: twelve triplets for the ascending form plus upper turnaround, then twelve for the descending form plus lower turnaround. Downward-first mirrors this order. A position change at the start of the second bar uses the new position's descending form rather than restarting upward. The global note cursor also carries the directional and turnaround phase through mid-bar changes of chord or position.

For nine pitches, the ascending ordinal form is 0 1 2 3 4 5 6 7 | 8 7 6 7. For ten pitches it is 0 1 2 3 4 5 6 7 8 | 9 8 7. Reverse the pitch ordering for the descending form. These cover the entire range and turn near the destination edge. They replace the previous full up/down sweep followed by an unrelated smaller sweep at the starting edge. No pitch is invented or taken outside the region.

The outgoing traversal reserves the endpoint for the turnaround or next form. Larger ranges round each directional form to the next twelve-note block; smaller ranges use bounded neighbouring chord tones near the destination edge. One-run scope retains its limited traversal rather than forcing a complete repeating phrase.

Exact tests cover all twelve Am7 keys, all five positions, both starting directions, and partial-bar changes. Browser tests cover notation/TAB, full-position range, alternating forms, menu geometry, and mobile width. Positional notation captions now carry the CAGED position and shape for each chord occurrence, including repeated harmony. Triplet numbers are centered over the beat's beams and follow their height; space below the chord headings prevents collisions.
