# Whole-tone, augmented, pentatonic and blues guides

Six added guides use the existing chord-first picker and chart/exercise workflow:

- Whole tone: 1–2–3–♯4–♯5–♭7.
- Augmented (minor third–semitone): 1–♭3–3–5–♭6–7.
- Major pentatonic: 1–2–3–5–6.
- Minor pentatonic: 1–♭3–4–5–♭7.
- Major blues: major pentatonic plus ♭3.
- Minor blues: minor pentatonic plus ♭5.

Whole tone, augmented and the existing diminished guides are grouped under
Symmetric scales. Pentatonic scales and Blues scales have their own groups.
Strict matching still requires all written chord tones: whole tone is offered
for 7♯5 / 9♯5 / 7♭5, not plain dominant seven. Minor blues is available for minor
seven; its common dominant-seven application is contextual, not a strict match,
and is not silently added as an exception to the chord picker.

The pentatonic guides are full scale contexts rather than only overlays or
five-note sources. Their five root-position frames use two notes per string,
with five distinct boxes in every key. The source palettes deduplicate identical
pentatonics, and fall back to the complete five-note guide when no distinct
five-note reduction exists. Triad-pair options are disabled where no valid
non-overlapping pair exists; an obsolete selected pair falls back to a retained
exercise rather than producing an empty view.

Actual cardinality drives octave wrapping and sequence continuation. Five-note
stacks traverse the five-note collection; six-note alternate stacks repeat their
first pitch class at the fourth note. Whole-tone/augmented alternate-note triads
are labelled augmented. Other reduced-scale reference stacks are named by a
recognized triad quality or honestly labelled scale-step stacks, never invented
seventh chords. Repeated-note arpeggio cells also receive stack labels. Seven-note
exercise labels and existing eight-note handling remain intact.

Validation covers all six formulas/spellings, every tonic and CAGED frame,
five distinct pentatonic boxes, strict chord matching, note-source palettes,
finite audio, golden octave-boundary groups and mixed 5/6/7/8-note charts.
Browser checks cover all six guides, diagrams, references, exercise availability,
playback through mixed scales, saved-chart reload and mobile width.
