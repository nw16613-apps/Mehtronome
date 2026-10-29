# Positional arpeggio boundaries across CAGED changes

The reported Am7 chart uses Position II for bars 1–2 (geometry C), then Position III for bars 3–4 (geometry A). Both regions have nine distinct arpeggio pitches. At sixteenths, eight pitch steps each way produce a sixteen-note cycle, with the upper note beginning beat 3.

Before this fix, bar 2 ended on E52 on the A string. On entering Position III, no lower tone was available, so the adapter reversed upward. Its strict next-higher-pitch search then skipped E52 on the low E string and began on G55. This put the top E one sixteenth early and displaced the repeated phrase.

A changed context that forces reversal now rearticulates the boundary when that boundary equals the last sounded pitch. Ordinary within-position turns retain their strict continuation and do not duplicate endpoints. All other forward entries retain nearest-pitch continuity; there is no bar-wide reset or hard-coded E/fifth rule.

The corrected third and fourth bars are E52 G55 A57 C60 E64 G67 A69 C72 | E76 C72 A69 G67 E64 C60 A57 G55. Bar 3 starts on string 6, fret 12; its upper E starts at beat 3. The mirrored downward-first transition retains the equivalent high-boundary entry.

Positional notation captions now say Arpeggio rather than counting implementation fragments as “2 cells” or “3 cells”. A run carried through a bar boundary is one continuous exercise regardless of how its pieces are scheduled.

Validation covers all five positions in both directions, every root for full-range coverage and non-duplicating ordinary turns, every chord type at three roots for position-to-position shared-boundary entries, all three subdivisions, exact event times, and the mirrored high-boundary example. Five browser tests and seven focused unit files passed, alongside the production build. The browser checks compare the exact low-string entry, top-note time, TAB, phrase repetition, diagram context, playback, looping and guitar volume.

Full positional arpeggio still uses every available chord-tone pitch. Regions with ten pitches naturally have a different cycle length from nine-pitch regions. Fixing all legs to two beats would require a separate restricted-span phrasing decision; this change does not remove pitches or force a nine-note window.
