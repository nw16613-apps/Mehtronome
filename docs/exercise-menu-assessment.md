# Exercise menu assessment

The generator now traverses a position continuously and turns automatically.
Menu choices must describe the actual remaining decisions.

| Control | Assessment and change |
| --- | --- |
| Exercise | Removed Selected chord group / Exact grip notes and Voice leading group / Guide-tone lines / Arpeggio connections. Full positional arpeggio is now in Arpeggios alongside the diatonic studies. Scale sequences, Chromatic language and Superimpositions remain distinct musical families. |
| Direction | Four choices were redundant for continuous directional exercises. Replaced with Starting direction: Upward first / Downward first. These describe the initial traversal, not a promise that every cell ascends forever. Alternating studies retain their stroke alternation. |
| Triad-pair direction | Retained four distinct choices under Cell contour. This family repeats a motif, and its combined contours change the written cells rather than just the initial traversal. |
| Material | Show only when the generator uses triad / tetrad / ninth size: harmonized and alternating arpeggios, chord-tone stacks, inversions, approach arpeggios and every-tone approaches. Hide for fixed interval/group patterns, positional runs, fixed enclosures, 3–5–7–9, triad pairs and pentatonics. Preserve the last choice when hidden. |
| Source | Remains contextual; labelled Triad pair or Pentatonic source. Choices describe actual pitch palettes. |
| Pentatonic Pattern | Retain distinct patterns; shown only for pentatonics. Other exercise families already encode their pattern in the Exercise choice. |
| Rhythm | Keep eighths, eighth-note triplets and sixteenths: each changes both subdivision and the number of complete cells that fit. Clarify the triplet label. |
| Scope | Full position incorrectly promised exhaustive range coverage in a finite chord slot. Rename to Continuous pattern / One cell per chord; positional arpeggio uses One run per chord. Scope controls amount, not note material or direction. |
| Display / Size | Retain in View; change notation presentation without changing generated pitch content. |
| Position navigation / Region / Selected position | Retain in Chord & position; determine the available physical region independently of exercise pattern. |

Compatibility: old Exact grip favourites/presets open Full positional arpeggio;
retired voice-leading studies open Harmonized scale. Legacy up-down / down-up
values map to the equivalent upward/downward starting choice, except triad pairs,
where those contours remain distinct. Guitar's Practise this shape link and the
built-in shape/jazz goals now open retained exercises. Stored presets are not
bulk-rewritten or deleted.

Validation: exercise-options unit/browser tests check grouping, removed entries,
material visibility, direction counts and migration, scope labels, notation and
mobile overflow. Existing pattern, range-turn, chord continuity and playback
regressions remain applicable.
