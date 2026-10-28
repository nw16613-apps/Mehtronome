# Workspace layout review

Scope: Metronome & Mixer, Harmony, Guitar, Progress and Sound Settings. Exercises retains its recent workflow. This is a feature-branch/private-preview change; the GitHub Pages deployment stays unchanged.

## Decisions

| Workspace | Problem | Result |
| --- | --- | --- |
| Metronome & Mixer | Rhythm tools and tempo shortcuts were separated from the pulse, while the optional goal launcher appeared first. | Main pulse first; metre/subdivision, swing and polyrhythm under Rhythm; shortcuts near tempo. Session length and tempo/gap training remain separate. Guided setup follows the main tools. Console graphics and floating docking remain intact. |
| Harmony | Backing selection appeared below other controls; library operations interrupted the chart; custom chord, chart and duration settings were mixed. | Current context, Backing, Key/mode/chord, Progression chart, Harmony movement, Chord & scale reference, chart library and optional scale lookup/help. Editor separates Chart, Selected chord, and Duration/rehearsal mark. Chart library separates original studies, saved charts, saving and backup. |
| Guitar | View controls were hidden while large duplicated context preceded the diagrams. | Combined chord/position selector, Shapes & overlays, visible Diagram/Labels/Focus controls, position diagrams and full-neck map. Scale/fingering explanations and legend sit in one reference disclosure. |
| Progress | Loading, saving and destructive actions competed in one preset row; session planning and completion controls lacked clear boundaries. | Separate Load saved setup, Save current setup and Backup groups. Learning path separates session planning from its checklist; reset is below the checklist/library. |
| Sound Settings | Drums, bass and piano occupied one uneven block, with enable switches elsewhere; instrument controls had inconsistent hierarchy. | Separate Metronome, Sustained harmony, Drums, Bass, Electric piano and Melodic movement groups. Each optional instrument has its existing enable switch beside its sound controls. All existing sound disclosures stay expanded by default. Mixer channel enable buttons remain available, with no duplicate switch row beneath the faders. |

## Behaviour retained

Existing control IDs and nodes are moved rather than copied. Musical settings, engine scheduling, presets, chart formats, learning-path records, CAGED routes, chord audition, sound options and the shared mixer remain in use. Instrument enable changes use the mixer-level update path even when the underlying checkbox is in Sound Settings, preserving running exercise tempo/audio.

No new educational activities, instruments, recording tools or removed workshops are introduced. Theme colours are unchanged; new groups use existing palette variables.

## Validation

Production TypeScript/Vite build, targeted musical-state/storage tests and current browser workflows. Browser scope includes pulse tools/subdivisions and presets, real mixer meters/mute/faders/docking, chart editing/history and repertoire transfer, CAGED manual/automatic routing, Exercises regression, every revised workspace at desktop/tablet/mobile widths and all four palettes. Synthetic/browser audio checks do not establish physical-device audio fidelity. The historical full browser suite remains separate maintenance work.

Final checks: production build passed; 35 focused browser workflows passed; the additional four-palette/mobile/unique-control-ID check passed; all four targeted unit-test files passed. Rendered Metronome & Mixer, Harmony, Guitar, Progress and Sound Settings were inspected. These are scoped current-workflow results, not a claim that the historical full browser suite is green.
