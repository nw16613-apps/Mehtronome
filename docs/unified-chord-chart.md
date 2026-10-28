# One chord-chart workflow

Harmony uses a chord sheet for single-chord and multi-chord practice. The app always starts with the Single-chord chart template: four bars of Am13 at the A Dorian tonal centre. The key, mode and chord controls change this tonic vamp; it never introduces other roots. The saved personal progression is preserved separately and can be selected from the template menu.

“New single-chord chart” uses the current chord quality and scale guide at the chart's tonal centre, over four bars. It is also available in the floating chart selector. “Edit a copy”, clicking a chord or Add chord opens an editable personal progression, titled My progression. Add chord copies the previous chord's root, spelling, quality, scale guide, duration and bass, without inventing a harmonic change. Delete chord is beside Add chord; the last remaining chord cannot be deleted. Undo restores deletions and edits.

Older presets and guided setups with `progression: false` are converted at the control-to-settings boundary to the four-bar tonic template. The root, chord and scale guide are preserved. Stored preset files and saved personal charts are not rewritten on load. The engine and file reader retain the legacy static-harmony representation for compatibility. Old mode buttons remain hidden internal compatibility targets.

Validation covers the four-bar tonic template in every mode and key, startup after saved custom work, playback across the repeat boundary, root/mode changes, exact chord copying including slash bass and beat durations, delete/undo, legacy presets and linked exercises. Existing chart-history, repertoire, manual-route and workspace checks cover surrounding workflows.
