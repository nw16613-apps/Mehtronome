# Metronome and mixer workflow

Pulse & playback groups BPM, Tap, saved tempos and the shared session transport. The current chord/scale follows the shared harmony state, and the play control explicitly starts all unmuted tracks. When an exercise is playing or preparing, the main transport mirrors that state and stops/cancels the exercise rather than starting overlapping session playback. Rhythm groups metre/subdivision, editable beat accents and their beat-one/reset controls, with Swing/Polyrhythm underneath. Custom accents disable the beat-one shortcut until reset, with an explicit status message.

Desktop retains the seven-channel console beside a wider pulse panel. At phone widths, the same channel DOM and controls become compact rows with native horizontal volume sliders, readable Mute/Unmute/Solo buttons and level/state readouts. Desktop logarithmic fader dragging is retained; compact sliders use native horizontal interaction. Moving the mixer into its floating panel preserves values, mute/solo state and listeners. Ambient space remains a labelled FX return, separated visually from instruments.

Session & training contains an optional timer with explicit Unlimited/Fixed duration choices and the existing tempo/gap trainers. The original minute value remains the persisted source of truth, so older presets need no schema migration. Guided session setup moves to Progress; its setup and navigation behaviour are retained.

Compatibility fix: chart redraws preserve the shared loop controls even when section buttons are absent (older single-chord presets). Removing them during a redraw otherwise broke later preset and guided setup operations.

Validation includes tap/shortcuts/accents, audio-clock timer completion, large beat display, preset round trips, audible backing mute behaviour, desktop fader gain taper, mobile pointer input, floating mixer persistence, guided setup, selected harmony, shared loops and desktop/tablet/mobile layouts across palettes. Production build and pulse/mixer/preset unit tests are checked.

Follow-up: session timer controls are permanently visible, with internal Session & training divider rules removed. The mixer scale and rail endpoints now follow the fader indicator centre, accounting for half the cap height, so maximum travel aligns with 0 dB and minimum travel aligns with −∞. Gain taper and keyboard behavior are unchanged. Browser checks cover endpoint geometry and clicking the unity mark in both mixer layouts at 900px and 1440px.
