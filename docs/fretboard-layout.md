# Fretboard explorer

The tab is named Fretboard and the page heading Fretboard explorer. Internal workspace IDs and stored navigation values remain unchanged.

The layout follows the shared chart slots, position controls, position tabs/thumbnails, Display/Overlay toolbar, selected-position diagram, active legend, overlay information and full-neck map. The primary diagram has a bounded desktop size; mobile tabs show readable position/shape/fret labels rather than tiny SVGs. The full-neck map starts collapsed on phones unless an explicit saved visibility choice exists. Focus view keeps the diagram and hides surrounding selectors.

Every direct position choice (thumbnail, previous/next, keyboard arrows or full-neck region) switches the selected chart slot to manual using the same route update. The automatic-route description explains this transition. Other chart slots retain their positions, including repeated chord symbols. Navigation locks during playback and unlocks after stopping.

The Display group contains diagram content, labels, chord voicing and focus. Melodic overlay chooses a pentatonic source or triad pair. Unavailable overlays are disabled. An active overlay hides ineffective voicing-stage actions, disables the retained voicing/content settings, and explicitly explains that switching it off restores those settings. Source notes/degrees and the currently relevant legend remain visible; longer application guidance is under Overlay details.

Voicing only / Voicing + scale describe the actual display. Strum chord and Practise arpeggio stay near the diagram; detailed voiced notes, bass, omissions and the complete written chord formula are optional. The arpeggio action still opens the full positional arpeggio in Exercises.

Validation: layout and focus, repeated-chord/manual-route persistence, playback locks, overlay restoration, audition and exercise navigation, all modern scale families, shared exercise inspection and four responsive palettes. Full-neck, grip, route, superimposition and modern-scale unit tests are checked. Four older seven-note geometry assertions in fretboard.test.js also fail on the unchanged published baseline with newer scale collections; this layout does not change fretboard geometry.
