# External model audition workbench

This tooling is separate from the app. No inference API, extra UI or model-generated
parts have been added to playback. The exported baseline and primer are explicitly
labelled **current-arranger**; generated files can only be produced by running the
actual downloaded model. Untouched output and any future edited material must stay
separate.

## Current checkpoint

- CPU runtime installed at `/workspace/amt-venv` (PyTorch 2.6.0+cpu).
- Original 16-bar Blues and Legato Fusion inputs prepared at
  `/workspace/ai-auditions`, with a four-bar primer and twelve bars for generation.
- Full chord qualities, exact chart beats, suggested BPM and Blues swing retained.
- Upstream model implementation checked out and inspected at
  `/workspace/model-tools/anticipation`, revision
  `af37397922665a0fb8d474d7988b0f3755a38d45`.
- Author tokenization, control separation and pitch/instrument MIDI roundtrips
  verified; model class imports successfully. This is **not** an inference test.
- Model weights are unavailable: the environment proxy rejects the request to
  `huggingface.co` with HTTP 403 CONNECT. Generation has not run.

Prepared snapshots under `prepared/` are inputs and preflight receipts, not model
output. They are small development artifacts and are never loaded by the website.

## Reproduce preparation

Create an isolated environment, install CPU torch from its official index, then
the remaining packages from `requirements.txt`. The authors' original Transformers
pin uses a tokenizer without a Python 3.12 wheel; this workbench uses 4.57.1.
Imports and tokenization are verified, but checkpoint inference compatibility is
still unverified until the model weights can be downloaded.

```sh
git clone https://github.com/jthickstun/anticipation.git /workspace/model-tools/anticipation
git -C /workspace/model-tools/anticipation checkout af37397922665a0fb8d474d7988b0f3755a38d45
node web/scripts/export-model-audition.mjs /workspace/ai-auditions/fixtures SOURCE_COMMIT_SHA
/workspace/amt-venv/bin/python tools/model-audition/audition.py /workspace/ai-auditions/fixtures/blues.json --output /workspace/ai-auditions/blues --check --upstream /workspace/model-tools/anticipation
```

Repeat `--check` for `legatoFusion.json`. `SOURCE_COMMIT_SHA` identifies the
arranger used to export the inputs. Unit checks:

```sh
node --test --test-isolation=none web/tests/model-audition-fixtures.test.js
/workspace/amt-venv/bin/python tools/model-audition/test_audition.py
```

## Download and generate, after network access is enabled

The model is public; no API key or paid service is required. The environment must
allow `huggingface.co` and its model-file delivery hosts. Hugging Face downloads
may redirect to `*.hf.co` / `*.xethub.hf.co`. This is a network-settings change;
shell escalation does not override the proxy allowlist.

```sh
/workspace/amt-venv/bin/python tools/model-audition/download_checkpoint.py /workspace/model-checkpoints/amt
/workspace/amt-venv/bin/python tools/model-audition/audition.py /workspace/ai-auditions/fixtures/blues.json --output /workspace/ai-auditions/blues --checkpoint /workspace/model-checkpoints/amt --revision PINNED_MODEL_SHA --upstream /workspace/model-tools/anticipation --seeds 1729 --timeout 300
```

The download receipt supplies `PINNED_MODEL_SHA`. Start with one seed; measure
CPU generation time before running all four seeds and the second style. Each run
keeps untouched raw MIDI, beat-based note events, per-instrument mapping, seed,
checkpoint file hashes, declared model revision, upstream revision and runtime.
A timeout or missing/empty result is a failure, not a successful audition.

Generated instruments not matching the requested role programs are labelled
`unmapped`; they are not silently assigned to a track or thrown away. Preserve
those notes for review. The control instrument is separate from the audible
tracks; AMT returns the generated event stream without control tokens.

## What still needs musical validation

AMT's event representation includes onset, duration and instrument/pitch. Its
MIDI converter supplies a fixed velocity of 72. Therefore it cannot by itself
provide the expressive velocities/articulations previously discussed. Compare
phrasing first, then evaluate any app-derived dynamics separately and label them
accurately. Timed chord-note controls are an experiment, not a guarantee of exact
chord-symbol, extension or stylistic adherence.

No harmonic repair is applied to raw outputs. Once inference is available, assess
actual chord adherence, repetition, phrase space and ensemble interaction; only
then render candidate and baseline stems through the app's identical current
sounds. No generated vocabulary should enter ordinary playback before that
audition and review.

Sources: [author implementation](https://github.com/jthickstun/anticipation),
[checkpoint card](https://huggingface.co/stanford-crfm/music-medium-800k).
