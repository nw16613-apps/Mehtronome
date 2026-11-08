# External symbolic-model evaluation — first findings

Research checkpoint: 8 November 2026. The twelve-pass arranger is implemented;
external-model work now begins with an offline audition. No model inference has
been run yet and no model-generated parts are in the published app.

Implementation checkpoint: the [audition workbench](../tools/model-audition/README.md)
now exports both real study charts, writes baseline/primer/control MIDI, pins the
author implementation, and provides a local-checkpoint runner with seed/hash
receipts. CPU dependencies and the authors' MIDI/token conversions are verified.
Five fixture/MIDI unit checks pass. The environment proxy blocks Hugging Face
checkpoint downloads with HTTP 403; model generation and listening assessment
remain pending network access. The existing app has not changed in this phase.

The inspected AMT converter supplies fixed MIDI velocities. Its contribution
must therefore be assessed as note timing, lengths and instrument/pitch choices;
any later dynamic/articulation shaping by the app must be identified separately.

## Shortlist

| Candidate | Verified capability | Fit for this app |
| --- | --- | --- |
| Anticipatory Music Transformer, `stanford-crfm/music-medium-800k` | 360M-parameter symbolic model; its authors document generating accompaniment while preserving timed input/control events. Code and model card identify Apache 2.0. | First candidate: test whether future chord-control notes guide an ensemble across our exact changes. Chord symbols/extensions are not a native promise of perfect adherence. |
| SkyTNT `midi-model-tv2o-medium` | About 200M parameters, MIDI-event generation, published ONNX assets; model card identifies Apache 2.0. | Smaller comparison candidate for continuation from an authored multitrack primer. Exact future changes and style authenticity need measurement. |
| MIDI-LLM | Text-to-MIDI with musical/instrument/style prompts, based on Llama 3.2 1B; authors recommend 16 GB+ CUDA GPU memory. Llama community licence. | Secondary experiment if descriptive style control is inadequate in the first two; not the initial runtime choice. |

Primary sources:

- [Anticipatory model implementation and control examples](https://github.com/jthickstun/anticipation), [checkpoint card](https://huggingface.co/stanford-crfm/music-medium-800k).
- [SkyTNT implementation](https://github.com/SkyTNT/midi-model), [checkpoint card](https://huggingface.co/skytnt/midi-model-tv2o-medium).
- [MIDI-LLM implementation and hardware guidance](https://github.com/slSeanWU/MIDI-LLM), [licence](https://github.com/slSeanWU/MIDI-LLM/blob/main/LICENSE.md).

The first two model cards do not list an available hosted Inference Provider.
Downloadable weights do not supply free hosted compute. Initial generation should
run offline on available hardware, rather than adding a paid API, model downloads
to mobile playback, or a dependency on a public demo's availability.

## First audition

Use the original authored Blues and Legato Fusion study progressions, preserving
their suggested tempo, key, exact chord-change beats and full chord qualities.
Generate four reproducible 16-bar candidates per style with fixed recorded seeds:
bass, chordal part and supporting melodic part. Begin with current drums held
constant so differences in generated pitched parts can be assessed clearly;
evaluate generated percussion separately against the established grooves.

For AMT, encode the chart as sparse timed chord/control notes and supply a short
style-specific primer. Treat this as an experiment, not established chord-symbol
conditioning. Preserve an untouched MIDI and its provenance, then convert to the
app's beat/event representation. Identify control tracks separately so they are
not accidentally played as an extra accompaniment instrument.

Play the candidates through the same current sample palette, mixer, activity
level and tempo as the existing baseline. Compare instrument stems and ensemble
mixes, then compare transposed and edited-chart versions. Record chord/extension
adherence, phrase repetition, rests, voice leading, transitions, style identity,
generation time and how much harmonic repair is needed. Do not select a model
merely because it generates valid MIDI; heavy repair can erase the musical benefit.

First deliverable: an actual generated-versus-current Blues/Legato Fusion audition,
with model revision, seeds and original MIDI retained. Only approved phrases
should become vocabulary for the ordinary style selector. Temporary evaluation
controls belong in development tooling, not the main user workflow. There is no
assumption that a model trained on general MIDI can convincingly cover all twenty
styles without further curation or training.
