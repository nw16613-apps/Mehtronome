# Chord-first scale guide selection

The chart editor's Selected chord group now combines the former standalone
scale explorer with chord editing. Chord type determines the scale-guide menu;
strict matches are grouped under Major scale, Melodic minor and Harmonic minor.
Every offered mode contains every explicitly written chord tone modulo octave.
This is a compatibility criterion, not a ranking of harmonic tension.

Am7 offers Dorian, Phrygian and Aeolian among its matches, but never Phrygian
dominant (which contains a major third). Am13 additionally requires natural 13,
so Aeolian is excluded. Plain dominant seven does not list Altered as a strict
match because Altered omits its natural fifth; selecting an altered dominant
chord makes its strict matches available.

Changing chord type preserves a compatible selected mode, otherwise chooses
the existing recommended guide when compatible, or the first strict match.
Root, bass and duration edits do not silently alter the scale guide. The UI
retains old saved/imported incompatible guides as a disabled, explicitly labelled
current value with the compatibility explanation and repair button. Those values
are not selectable alternatives, and stored charts are not bulk-rewritten.

The former standalone root/quality picker, result cards and use-mode actions
have been removed. Root, chord, guide and bass remain together in Selected chord.

Validation: strict grouping and selection tests cover every chord in CHORDS;
browser checks cover compatible preservation, incompatible chord changes,
extensions, altered harmony, parent-scale groups, saved-chart repair and mobile
width, plus existing chart editing/repertoire/undo flows.
