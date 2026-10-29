# Exercises, Progress and Sound Settings review

The review follows the Harmony, Metronome & Mixer and Fretboard restructuring. Existing saved data formats and chart/position behavior are preserved.

## Findings and changes

- Exercises: saving exercise options was mixed into notation export actions, with raw internal names in the saved list. Move saved options beside the exercise definition, use readable names, explain that these options apply to the current chart and positions, and leave export actions at the bottom. Keep the established chord/position, diagram, exercise, notation, playback order. Use consistent Show/Hide diagram wording and a compact marker key. Disable trainer fields when inactive. Fix an unconditional reset that prevented automatic tempo increases for unaccompanied chart exercises; accompaniment still requires fixed tempo.
- Progress: saved setups, guided session setup and a manual checklist had overlapping names and unclear scope. Lead with Saved setups, distinguish load, save/update and backup, describe which settings are saved, and show the current working setup. Label checklist completion as self-reported, session times as estimates, and reset as applying to this checklist. Disable checklist editing during playback because its chord context can change. Keep existing browser storage and export/import compatibility.
- Sound Settings: large expanded settings groups lacked quick navigation and feedback about mixer state. Add instrument jump links, retain expanded panels, show read-only mute/solo/zero-level states, and open the existing mixer without navigating away. Clarify texture motion versus chord extensions, voicing movement versus hook amount, and melodic note rate. Disable hook/depth amount settings when their chosen mode does not use them, preserving their values. No instrument enable switches added.

## Verification

Production TypeScript/Vite build, targeted browser workflows and responsive checks cover the revised controls, saved setup updates, exercise option recall, real automatic tempo increases, shared mixer states and retained playback/selection workflows. Existing unrelated fretboard geometry failures are outside this layout change.

Exercise guitar playback now has a 0–100% level control in Playback. It feeds a shared gain before dry and reverb paths, so changes affect current and scheduled notes without restarting playback or modifying the backing mix. Exercise note auditions share the same level. The default preserves the previous loudness; the browser remembers the value independently of saved exercise material. A browser audio test measures audible output, silence at zero, restored output, uninterrupted looping, unchanged harmony level and persistence through rerender/reload.
