# Guitar tuning compensation

Sound Settings → Guitar tuning selects Standard (0) or E♭ standard (−1 semitone). The preference is stored separately in `mehtronome-guitar-tuning`, so loading a chart, study, style or practice preset does not change the user's instrument tuning.

Charts, keys, harmonic calculations, melodies, score spelling, TAB, string labels and physical fingering coordinates retain standard-tuning semantics. Displayed Am7/A Dorian therefore sounds A♭m7/A♭ Dorian with E♭ compensation, using the same displayed frets.

The playback layer applies the equal-tempered ratio `2 ** (-1 / 12)` to pad/motion oscillators, bass sample reads, comping/melody sample reads and modeled oscillators. Native guitar amp/cab processing receives these already-compensated instrument stems. Acoustic chord audition builds its plucked strings at the compensated pitches while retaining written chord metadata. Exercise and single-note audition buffers retain their written pitch and cache identity; their source playback rates apply the same offset once, with note gates and clock timing unchanged.

Drums, percussion, click frequencies, count-in, tempo and event scheduling remain unchanged. Live tuning is an immediate non-harmonic control and is retained in pending chart edits. Active exercise sources update their playback rates without restarting the exercise; queued settings carry the current global preference. A ringing acoustic chord preview stops when tuning changes and uses the new tuning on the next audition. The transport shows E♭ guitar while compensation is active; the fretboard explicitly identifies its standard-tuning view.

Validation measures audible fundamentals for sampled bass, comping, sustained harmony and acoustic audition; verifies sampler/melody clocks and written MIDI; compares click/drum output and beat messages bit-for-bit across every backing style; and checks pending live changes. Browser checks cover unchanged notation/TAB/chart key, persistence, one-time compensation, live exercise playback with/without accompaniment, and main backing transport continuity.
