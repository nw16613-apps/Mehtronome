# Exercise ending bar

The displayed and playable exercise appends one bar after the generated pattern. The ending uses the nearest core chord tone through the seventh from the final assigned CAGED board, with the selected chord's spelling and altered/suspended/sixth tones. If the last pitch is already a chord tone, rearticulate that pitch and hold it. Equal pitch distances prefer a root, then the existing string and the lower pitch. Never invent a fret outside the final board.

The ending is one duration-aware event. In 4/4 it is a whole note; other meters use ordinary note values and ties as needed. Notation, TAB, SVG export, selection, audition and the playback cursor share its index and pitch. The audio buffer and release use the full bar duration, including slow tempos beyond the ordinary short-note buffer cap.

Append the ending after bar alignment and any existing complete-chart repeats. Preserve the generated pattern events and groups without alteration. Keep the ending out of editable chord/position route cards: it inherits the last assigned position and is not a new chart chord.

Exercise accompaniment uses a private custom-progression copy of the displayed slot durations and holds the final chord through the ending. The loop returns to the first chord after that bar; one-shot playback finishes after the full bar. This copy preserves slash bass and scale pitch collections and never writes to the user's chart or saved progression. Held-chord studies use the same duration-aware plan path.

Verification covers nearest-pitch choice, board bounds, unchanged pattern/chart data, all rhythms, representative progressions/keys/positions, wrapped chart loops, multiple meters, whole/tied-note rendering, exact audio durations, actual engine chord timing, export, phone layout and backed playback through the ending.
