# Fretboard explorer

The tab is named Fretboard and the page heading Fretboard explorer. Internal workspace IDs and stored navigation values remain unchanged.

The page shows chart context, a parent Fingering selector (CAGED or modal 3NPS), complete parent scale positions, Material/source/Material fingering controls, Traversal, Display settings, material diagrams and the full-neck map. The parent catalogue always uses the complete current mode, independent of the chosen arpeggio or pentatonic. Parent diagrams remain visible on mobile. The full-neck map starts collapsed on phones unless an explicit saved visibility choice exists. Focus view hides the reference and surrounding selectors.

“Within parent position” filters the selected parent shape to the material notes. Dedicated pentatonic fingerings, alternating-string arpeggios and chord voicings have their own lower shape catalogue. Changing the parent reference leaves those dedicated shapes unchanged; returning to Within parent position uses the chosen parent. The parent system and reference selection persist separately from material geometry, and reference changes do not change a dedicated exercise's study identity.

Every direct CAGED material-position choice (parent thumbnail, previous/next, keyboard arrows or full-neck region) switches the selected chart slot to manual using the same route update. The automatic-route description explains this transition. Other chart slots retain their positions, including repeated chord symbols. Navigation locks during playback and unlocks after stopping.

Display settings contains labels, degree reference, chord voicing and focus. Pentatonics and triad pairs are chosen through the primary material/source controls; there is no independent melodic overlay. Pentatonic diagrams retain purple notes, a distinct pentatonic-root ring and the backing-root amber accent.

Alternating-string arpeggios allow up to a six-fret difference between notes on any one string, within frets 1–24. Reaches above four frets are labelled Wide stretch. Unavailable inversions remain listed with an explanation. Material headings name the actual triad/seventh counterpart rather than copying the accompaniment symbol.

Material-map region boundaries use the occupied frets of the displayed collection, clipped to the map range. Parent-scale-only notes do not extend a filtered arpeggio or pentatonic region. Empty visible regions are omitted; original parent geometry and exercise membership remain unchanged.

Position thumbnails and diagonal source-position previews contain one compact diagram each; they never contain member selectors or enlarged detail panels.

For multi-arpeggio sources, the position row is followed by member thumbnails and one enlarged selected arpeggio, with its bass inversion labelled. The same member supplies note colours, labels and the full-neck map: amber root, teal remaining tones. Position changes preserve the inspected member when it belongs to the source. Inspection is a display preference; Exercises continues to practise the selected source collection rather than silently filtering it to the inspected member.

“Degrees relative to” selects the collection root or current backing chord for both arpeggio and pentatonic labels. It is hidden when the selected collection and backing chord share a root, including Selected chord arpeggios; the saved preference is retained. It leaves notes, fingering coordinates and colours unchanged. The reference and inspected member persist locally, separately from exercise recipes. Dedicated alternating-string arpeggios retain the backing chord as the chord reference even when the physical fingering belongs to a different source member.

Voicing only / Voicing + scale describe the actual display. Strum chord and Practise arpeggio stay near the diagram; detailed voiced notes, bass, omissions and the complete written chord formula are optional. The arpeggio action still opens the full positional arpeggio in Exercises.

Validation: layout and focus, repeated-chord/manual-route persistence, playback locks, overlay restoration, audition and exercise navigation, all modern scale families, shared exercise inspection and four responsive palettes. Full-neck, grip, route, superimposition and modern-scale unit tests are checked. Four older seven-note geometry assertions in fretboard.test.js also fail on the unchanged published baseline with newer scale collections; this layout does not change fretboard geometry.

## Automatic position continuity

The region selector anchors the opening chord to its best-fitting displayed CAGED position. Subsequent choices favour small changes between neighbouring fret-window centres, with the original region retained only as a gentle preference. Dynamic programming evaluates the subsequent route from that fixed opening; later harmony cannot pull the opening to a different starting region. The score uses one fret of movement as its unit and weights the subsequent region-fit cost by 0.05, rather than applying full region-fit cost to every chord.

For Gm7 → B♭m7 → D♭m7 → Em7 in the Low region, the route is I/E (2–6) → V/G (3–7) → IV/A (3–8) → III/C (4–9). The former route pulled D♭m7 and Em7 back toward the nut as III/C and II/D. Position identities and parent-scale geometry remain distinct, so each route choice still refers to an actual displayed diagram. The same route drives Fretboard and Exercises. Manual choices, saved manual routes and the single-harmony region lookup remain intact.
