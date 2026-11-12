# Shared fretboard fingering

Fretboard and Exercises share the selected fingering, source, starting degree/inversion, string set and register. The current featured shape supplies the exercise recipe automatically; opening Exercises no longer requires “Practise this shape”. Existing exercise-side selectors and favourites update that shared selection too.

CAGED retains its shared region/manual position route. Three-note-per-string scale and arpeggio patterns use the selected scale shape. Alternating per-string arpeggios use their selected shape's actual strings/frets. Progression generators accept a board/harmony provider so sequence continuity, cell boundaries and direction changes use the same existing rules without reconstructing CAGED geometry.

Changing exercise material can select chord tones within a scale shape without changing its fingering. Spread/drop grips support traversal, ordered chord-tone pairs, permutations, repeated-tone orders, starting-tone pedals and chromatic approaches/enclosures. These use the selected grip's actual strings and frets rather than fabricating closed-register pitches. Unsupported scale-run controls and irrelevant octave/root-sequence controls are omitted. Extended exact-shape favourites retain their written notes.

The shared catalogue provides six pairs, six permutations, eighteen four-note repeated-tone orders and three pedals for triads; four-tone voicings provide twelve pairs, twenty-four permutations, 144 five-note repeated-tone orders and four pedals. Chromatic preparations stay on each target voice's string, within frets 1–24. Exercise diagrams expand to include preparatory notes while retaining the original grip for voicing highlights. Favourites distinguish the physical fingering and normalize unavailable register variations.

The passive selection callback keeps the recipe current even before visiting Exercises. Rendering uses the same selection during live backing playback. Restoring a favourite stops exercise audition before applying the recipe so the transport callback cannot overwrite it with the previous selection.

Interval-pair sequences (seconds through octaves, including chord-tone sequences) reverse from the reached pitch boundary, entering one collection step inward without repeating the apex. They do not reverse from the outgoing pair's starting anchor, which would skip valid return pairs. This structural boundary is independent of cell-order variations; complete cells and their phase continue across bars.

Validation: shared geometry and material/sequence model checks, unchanged sequence-continuity and progression checks, browser coverage for all six non-CAGED types, reverse selection/favourite restoration, material-first workflows and live backing playback.
