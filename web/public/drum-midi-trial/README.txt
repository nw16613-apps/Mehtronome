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

Changes: select original beat positions 8–41, replace beats 28–32 with a separately
played fill in the MIDI+fill version, preserve note timestamps and raw velocities,
map Roland notes to the app's sampled kit articulations, and render with one fixed
gain per clip for RMS level matching. No MIDI quantization or added humanization,
compression, reverb or delay. Eight bars plus a resolving beat and natural tail.
Continuous hi-hat pedal openness is reduced to played note articulation, and
middle/floor tom pitches share the app's low-tom sound. Original MIDI is unmodified.

Current app clips use the existing authored arranger. The listening trial does
not replace normal app backing. Each style uses the same kit and tempo for all
versions. Sample credits: /audio-credits.html
Reproduction scripts: prepare-drum-midi-trial.py and render-drum-midi-trial.mjs.
