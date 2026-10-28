# One chord-chart workflow

Harmony no longer asks the player to choose pedal chord versus progression. A fresh setup is a one-bar, one-chord editable chart. Adding chords, setting bar/beat durations, selecting chart loops, using templates and saving to the chart library all use the existing progression path.

“New single-chord chart” starts from the current chord and its scale guide. It is also available in the floating chart selector. Undo restores the previous chart. The last edited personal chart remains available after reload. The top-level key transposes the chart; the selected-chord editor changes its chord, scale guide, duration and bass.

Older presets and guided setups with `progression: false` are converted at the control-to-settings boundary to a single custom chart. The root, chord and scale guide are preserved. This conversion does not rewrite stored preset files or overwrite the saved personal chart on load; subsequent edits/saves use the unified representation. The engine and file reader retain the legacy static-harmony representation for compatibility. Its old mode buttons are hidden and retained only as internal compatibility targets.

Validation: dedicated browser checks cover single-chord editing, durations, repeated playback, adding/removing chords, save/reload, templates, undo/redo, the floating shortcut, mobile width, legacy pedal presets and linked exercise diagrams/notation. Existing chart-history, repertoire, manual-route and workspace checks cover the surrounding workflows.
