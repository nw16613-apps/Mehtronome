# CAGED chord voicings

Recommended chord grips derive from the standard movable major shapes, in low-E-to-high-E string order:

| Framework | Skeleton |
| --- | --- |
| C | × 3 2 0 1 0 |
| A | × 0 2 2 2 0 |
| G | 3 2 0 0 0 3 |
| E | 0 2 2 1 0 0 |
| D | × × 0 2 3 2 |

Resolve the chord framework with `cagedPositionFor(board)`. The geometry of a parent-scale box is not necessarily the chord framework (A Dorian Position I/E uses geometry D).

Transpose the skeleton to its root on the standard bass string, alter notes for the selected harmony, and prefer the fuller, least-displaced playable shape. Keep that anchor root and the skeleton's available strings. For ordinary chords the lowest sounded note is the root; an explicit slash bass must be respected or no grip is offered. Fragments must retain the quality-defining third/suspension, seventh and altered fifth/sixth, where present. Optional extension omissions are disclosed. There is no unrelated compact-voicing fallback.

Grips sound three to six strings, use a four-fret grid (maximum fret difference three), and require at most four finger groups. A barre cannot cross a muted or lower-fretted string. These are mechanical playability checks, not a promise of equal comfort for every extension or hand; C/G-family fragments can still need individual musical review.

A chord alteration may lie outside a scale's per-string fingering while remaining inside the assigned position's overall fret range. Such chord notes are added only to grip rendering. Do not alter the original board, CAGED identity, scale traversal or exercise pitches. The same recommendation supplies the Fretboard overlay, notation diagrams and exact-pitch chord audition. Audition accepts up to six notes.

Verification includes the exact five major shapes in all twelve keys, familiar E/A/D minor and seventh forms, all chord qualities and all catalogue modes across keys/positions, rendering of supplemental chord notes, unchanged source boards, chord diagrams/exports, and full-grip audition in the browser.
