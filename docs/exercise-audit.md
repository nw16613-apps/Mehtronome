# Exercise audit — 13 November 2026

## Corrections

- Arpeggio-tone and non-diatonic scale-step interval choices retain their
  numeric interval. They no longer collapse into identical menu labels.
- Triad-pair Ascending/Descending contours apply to both triads. Return contours
  reverse the internal notes as well as the cell order.
- Triad pairs retain their three-note phase across bar boundaries instead of
  dropping the next note to insert a rest. Repeated chart slots keep the phrase
  going, including when the written eight-cell phrase finishes within a bar.
- Neck traversal with just one playable motif repeats the complete motif after
  exhausting both travel directions, rather than leaving the remaining bar empty.
- Entirely unavailable recipes show their reason without an all-rest score.
  Playback and export/print are unavailable until a playable recipe is selected.
- Legacy descending double-enclosure favourites migrate to the matching approach
  order instead of becoming the ascending enclosure.

## Musical constraints retained

A two-string scale cell has six pitches. Three consecutive diatonic triads can
require seven distinct pitches; that root motif genuinely cannot fit. Generation
must not omit a triad tone, shorten the root motif, or use an unselected string to
make it appear available. The same complete-cell rule applies to other materials.

Intentional enclosure target-alignment rests and the final measure's padding
remain. An unavailable chord slot retains its chart time and warning. These are
different from losing a note solely because a bar line divides a flowing motif.

## Coverage

The new `web/tests/exercise-audit.test.js` enumerates every scale/arpeggio-tone
sequence in horizontal and diagonal traversal; whole-arpeggio pairs, permutations,
repeated-tone orders and pedals in all five CAGED shapes; every enclosure recipe;
and every arpeggio-root sequence. It verifies theoretical note order, intact cells,
physical MIDI/string/fret correspondence, cell boundaries, bar-split equivalence,
and the relationship between generated notes and timed notation events.

The wider exercise suites cover linked 3NPS/arpeggio/drop/spread fingerings,
starting notes, harmony changes, position alternation, turning rules, favourites,
resolution, notation rests/brackets/captions/spacing, playback and tempo changes.
Older assertions that assumed reversing a written scale cell on the return leg,
triad-pair bar-end rests, or a fixed horizontal glyph coordinate were updated to
the current musical and spacing rules.

Six browser checks pass for unique interval labels, unavailable-score recovery,
position-order controls, both turning options, favourites and live playback.
Production build passes.

Recipe coverage is systematic; keys, modes, rhythm and UI combinations are
representative, not an exhaustive visual or listening review of every combination.
