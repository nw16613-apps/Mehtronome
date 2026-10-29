# Chord library and mixer workflow

Harmony movement (Evolving chord extensions and its blend cycle) now lives in
Sound Settings → Sustained harmony. Its existing controls/IDs and preset values
are retained; the Harmony page no longer repeats them.

The chord menus are grouped into Major, Minor, Dominant, Suspended,
Diminished & half-diminished, Augmented and Open fifth. Added 22 qualities:

- Major add9, add11, maj13, maj13♯11.
- Minor add9, add11, 6/9, 7(add11, no9), minor-major11, minor-major13.
- Dominant11, 7♯11, 13♯11, 7♭5, 7♯5, 9♯5, 7♭9♯5, 7♯9♭5, 7♯9♯5.
- 13sus4, 7sus4♭9, diminished triad.

Each has an explicit formula, recommended compatible guide, correct note spelling
and dedicated PIANO_VOICINGS layout for the sustained backing. New chord choices
use the existing grouped compatible-mode picker, chart storage and CAGED system.

Drums, bass, electric piano and melodic movement now remain enabled internally.
They start muted, and the mixer M button is the single control for adding/removing
a track. Instrument enable switches and console power buttons have been removed;
Sound Settings contains styles/patterns, with the mixer link for audibility.
Mute/solo/fader operation remains independent. Guided trio setups explicitly
unmute their three tracks; clear/modal setups leave backing tracks muted.

Legacy presets translate a disabled instrument into a muted channel even when
an old separate mute flag was false. Enabled instruments retain their saved mute
state. New presets store the always-enabled state and their mute flags. A muted
bass no longer reduces the pad foundation: that balance changes only with bass
audibility, without restarting the sounding chord when mute changes.

Validation covers formulas, mode compatibility and engine voices for each new
quality, family grouping, dedicated pad voicings, bass/pad balance, preset
migration, chart save/reload, actual audio on each channel's unmute, settings
location, and mobile/palette layout checks.
