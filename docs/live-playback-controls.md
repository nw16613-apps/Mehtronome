# Editing during backing playback

Fretboard fingering, position, region, labels, mode-degree/inversion filters and display settings remain editable during main backing playback. Exercise playback retains its own locks; starting another audible exercise or chord audition still uses the separate transport controls.

Tempo, faders, mutes, click/accent and trainer controls apply to the current audio clock without resetting its phase. They also stay responsive while a new instrument bank is preparing.

Harmony, chart, loop, metre and backing-style changes are prepared first, then queued for the next downbeat in the currently sounding metre. Changes to a chart's layout, loading a new chart, or changing metre start the new form at beat one without adding another count-in. Transpositions, voicing changes and style changes preserve musical position when the chart layout is unchanged. New edits replace older pending requests.

The editor retains requested values. Musical displays, chord highlights and the playhead use the last audio-acknowledged settings snapshot until the downbeat change. The floating transport shows a transient pending/preparation status. Stop discards the queued audio operation; the edited chart remains ready for the next Play.

The engine applies an edit at the exact sample boundary and refreshes render-local instrument/gain references for the rest of that block. Normal audio blocks keep the allocation-free worklet path. Prepared arrangement plans and sound-bank retention travel with the queued change.

Validation: engine timing, tempo/mixer coalescing, cancellation/restart, new metre/form count-in handling and worklet allocation checks; browser playback through CAGED/per-string changes, transposition, progression loading, individual chord editing, backing-style changes, tempo and mobile controls; existing material-first exercise workflows.
