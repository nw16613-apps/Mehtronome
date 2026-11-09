# One free audio-generation audition

Goal: test whether a full-audio model delivers a substantial improvement in
instrument realism and band performance over Mehtronome's current backing.
This is separate from the earlier symbolic/MIDI model tests. No AI audio has
been generated for this test yet, and normal app playback is unchanged.

## Ready input

`prepared/original-f-blues-guide.wav` is an original recording rendered through
the existing app instruments: 32 kHz stereo PCM, 100 BPM, 4/4 shuffle, 12 bars,
28.8 seconds. It contains drums, bass and comping; no melodic lead or vocals.
`prepared/guide.json` records the exact changes and WAV hash.

| Bars | Chord | Time span |
| --- | --- | --- |
| 1–4 | F9 | 0–9.6 s |
| 5–6 | B♭9 | 9.6–14.4 s |
| 7–8 | F9 | 14.4–19.2 s |
| 9 | C9 | 19.2–21.6 s |
| 10 | B♭9 | 21.6–24 s |
| 11 | F9 | 24–26.4 s |
| 12 | C9 | 26.4–28.8 s |

The YouTube example is a quality reference only; no audio from it was copied.
The source WAV is the **current arranger guide**, not an AI result.

## Run one actual test

Use the [official ACE-Step 1.5 demo](https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5)
if its available free quota permits a run. The published Space currently reports
ZeroGPU hardware; free availability, sign-in requirements and API access must be
checked at execution time. Do not activate paid hardware, buy credits or subscribe.

Inspect the current demo/API schema and use the guide as **source audio for a
cover**, rather than as a loose style reference. `request.json` records the
intended parameters and prompt. Run one seed, keep the actual result and time the
complete request, including queue and transfer time. Do not promise the model
will preserve the exact harmony; verify the produced audio afterwards.

If the hosted route is unavailable for free, report that. Do not install a large
CPU-only stack speculatively: this environment has no GPU and roughly 10 GB RAM.
Its suitability for local ACE-Step inference has not been established.

Match loudness for the comparison. Evaluate sound quality, instrumental gestures,
groove, phrase development, and the actual F9/B♭9/C9 changes at the times above.
Keep an untouched output even if later analysis or editing is necessary. Only
consider app integration after a listening result demonstrates useful improvement.

## Handover

This preparation is isolated on `experiment/free-audio-test`, so it does not
replace or reset work in the newer model-audition chat. That chat can import just
this folder from the branch without switching away from its working branch.

The older chat still receives an HTTP 403 CONNECT from the environment proxy for
Hugging Face. Its network-change tool is unavailable. The test must run in the
newer chat using the already updated environment, or after supported network
configuration changes. No network restrictions were bypassed.

Sources: [ACE-Step implementation](https://github.com/ace-step/ACE-Step-1.5),
[inference parameters](https://ace-step.github.io/ACE-Step-1.5/en/INFERENCE),
[installation/hardware guidance](https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/INSTALL.md).
