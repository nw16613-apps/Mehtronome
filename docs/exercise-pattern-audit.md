# Exercise pattern and sequence audit

## Problem and resulting behaviour

The progression adapter rotated every generated sequence to a cell whose first note matched the backing root. This overrode the family's starting edge and reordered already alternating cells. Each chord slot also discarded its unused cells, so repeated harmony restarted short fragments.

The adapter now preserves the family's cell order, direction and register. Adjacent slots with the same harmony, scale/source and fingering continue through the sequence. A changed context starts at its own valid edge. Completed finite patterns restart on the next slot. Full positional runs can continue note by note across bars; discrete pattern cells stay complete, with unused slot time rendered as rests. Short-cell scope plays the next cell per slot.

## Additional corrections

- Alternating arpeggios reverse the existing cell's notes rather than solving a fresh fingering that can move registers.
- Directed arpeggio paths require their actual adjacent pitch intervals. Removed the independent-nearest-pitch fallback that could reverse direction, omit notes or invent octave leaps. Inversions and triad pairs omit unavailable complete paths rather than inventing them.
- Scale-pattern degree offsets retain octaves, fixing the compound ninth in 3–5–7–9 cells. Scale-based families select scale notes at the position edge even when the chord adds out-of-scale pitches.
- Combined down/up contours retain their descending-first start. Chromatic approach-arpeggio studies generate both requested legs.
- Diatonic enclosure neighbours follow the scale's actual half/whole steps. Approach-every-tone cells retain every required approach, including the correct side after a direction change.
- The last chromatic approach in a chord slot targets the actual next written cell. If it cannot fit that region, or there is no following non-looping target, the arpeggio ends on its chord tone instead of a dangling chromatic approach.
- Existing guidance now explains continuation. Groups-of-three/four headings no longer say Ascending for every direction.

## Validation

53 focused unit tests and 10 browser tests passed, plus TypeScript/Vite builds. The new integrity matrix exercises all 30 ordinary families and both aligned voice-leading families. Cases include essential ii–V–I, altered ii–V–I, Dorian modal movement and the twelve-root fourths cycle, in C, F-sharp and A, with fixed and changing frameworks and all four direction choices. Additional checks cover every mode, five frameworks and all three materials for alternating cells; compound ninths; enclosure neighbours; unavailable paths; chromatic resolution into real chord changes; repeated contexts and position changes.

Browser checks compare the reported up/down and down/up note sequences, continued second-bar notation, restart after a manual position change, playback highlighting, rendering across moving progressions, inspection, count-in, selected passages and loops. A browser fixture initially expected the wrong underlying geometry for Position II in A Dorian; it was corrected to the actual position-edge sequence. A historical root-first unit expectation was replaced because it encoded the defect.

The entire historical suite was not run: some old browser fixtures target controls removed during earlier UI simplification. Validation is local; private hosted publication is verified separately by deployment status.
