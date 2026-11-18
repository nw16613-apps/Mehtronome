Drum performance listening trial — Mehtronome

MIDI source: Groove MIDI Dataset v1.0.0, Google LLC and contributors.
https://magenta.withgoogle.com/datasets/groove
Licensed CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

Citation: Jon Gillick, Adam Roberts, Jesse Engel, Douglas Eck, and David Bamman.
Learning to Groove with Inverse Sequence Transformations. ICML, 2019.

Original files retrieved via Git from this pinned dataset mirror:
https://github.com/zharry29/drums-with-llm/tree/476adbc938a600eaca26bbb02648e6127b5eca64/groove
The official ZIP download was unavailable. Its full-archive checksum was not
independently verified. performances.json retains the original source path,
performance ID and individual SHA256 of every bundled original MIDI file.

Round 2 changes: choose two alternative continuous takes per style. Source beats
16-0.125 through 49 are retained, including a short pickup before the first beat.
The current arranger receives the same lead-in. Original note timestamps and raw
velocities are preserved, Roland notes are mapped to app kit articulations, and
one fixed gain per clip matches RMS levels. No fill is separately spliced into
this round. There is no MIDI quantization or added humanization, compression,
reverb or delay. Eight bars are followed by a resolving beat and natural tail.
Continuous hi-hat pedal openness is reduced to played note articulation, and
middle/floor tom pitches share the app's low-tom sound. Original MIDI is unmodified.
Round 1 source metadata is retained in round1-performances.json and its clip
manifest in round1-manifest.json. Those original rendered clips remain archived.

Current app clips use the existing authored arranger. The listening trial does
not replace normal app backing. Each style uses the same kit and tempo for all
versions. Sample credits: /audio-credits.html
Reproduction scripts: prepare-drum-midi-trial.py and render-drum-midi-trial.mjs.
