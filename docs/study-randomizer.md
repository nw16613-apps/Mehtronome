# Study randomiser

The Study page has a preview-only randomisation action and a collapsed settings area. Load study applies the preview. Undo randomisation restores earlier previews (up to twenty this session); Use tier template returns to the tier's ordinary progression controls. Generated charts, pools and repeat settings survive browser reloads alongside the existing Study selection.

- Tier 1 chooses a different eligible key, preserving the selected quality/mode.
- Tier 2 shuffles eligible roots at exactly the requested slot count, retaining one quality/mode. A deck visits selected roots before repeating; it does not force a twelve-slot chart. Free root draws are optional.
- Tier 3 offers independent qualities with compatible mode pools, or related changes using the existing Harmony generator's vocabulary, tonality and harmonic-variety controls. Eligible roots apply to independent chords; eligible keys apply to related changes. Incompatible or empty pools report an error without replacing the preview.
- Tier 4 transposes the selected complete form, preserving chord changes, durations, sections, written melody/reference metadata and the matching backing style.

Fixed regions remain fixed. Manual per-slot position routes carry forward, cycling the existing route when a newly generated chart has more slots. Passes and material choices remain in effect; the existing chart-size cap still applies.

Optional automatic changes happen after the selected number of complete repetitions. Normal backing playback uses an engine beat boundary that stops before a note from another old-chart cycle starts; exercise playback waits for the full exercise, including its resolution. The next chart is prepared and playback restarts with the same tempo and exercise options. There is a brief preparation pause, and the existing count-in choice is honoured. Stop cancels continuation; the study-session bar can disable random changes while leaving ordinary playback running. Editing the loaded chart/route outside Study disables continuation until the study is reloaded.

Validation covers seeded generation, strict mode/chord compatibility, exact slot counts, form/melody preservation, storage, manual routes, beat boundaries with and without count-in, real browser controls, automatic backing and exercise repeats, and stop behaviour.

# Static-vamp comping

The shortest-path voice-leading solver previously settled on one minimum-cost grip when every harmony target was identical. Static vamps now choose a two-bar conversation among complete compatible voicings, inversions and registers; available extensions come from the selected scale. The existing style articulation then shapes those voicings. Power-chord styles retain root/fifth identity. Rhythm, chord quality and mode stay the same. Changing progressions retain their existing whole-chart voice-leading path. Tests exercise all twenty styles with major, minor and dominant seventh vamps, plus full recorded mixes and deterministic rendering.
