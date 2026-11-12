# Shared fretboard fingering

Fretboard and Exercises share the selected fingering, source, starting degree/inversion, string set and register. The current featured shape supplies the exercise recipe automatically; opening Exercises no longer requires “Practise this shape”. Existing exercise-side selectors and favourites update that shared selection too.

CAGED retains its shared region/manual position route. Three-note-per-string scale and arpeggio patterns use the selected scale shape. Alternating per-string arpeggios use their selected shape's actual strings/frets. Progression generators accept a board/harmony provider so sequence continuity, cell boundaries and direction changes use the same existing rules without reconstructing CAGED geometry.

Changing exercise material can select chord tones within a scale shape without changing its fingering. Open spread/drop grips offer their supported exact-voicing traversal rather than fabricating missing closed-register pitches; incompatible pattern controls are omitted. Extended exact-shape favourites retain their written notes.

The passive selection callback keeps the recipe current even before visiting Exercises. Rendering uses the same selection during live backing playback. Restoring a favourite stops exercise audition before applying the recipe so the transport callback cannot overwrite it with the previous selection.

Validation: shared geometry and material/sequence model checks, unchanged sequence-continuity and progression checks, browser coverage for all six non-CAGED types, reverse selection/favourite restoration, material-first workflows and live backing playback.
