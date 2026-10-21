# Recorded rhythm bank

A coherent acoustic drum kit and warm fingerstyle electric bass, bundled with the browser app. All recordings are **CC0 1.0**; see [LICENSE](LICENSE) and the full [recording credits](CREDITS.md).

- **Drums:** Virtuosity Drums, Austin McMahon / Versilian Studios. Matching overhead and close microphones give kick and snare body while retaining the room. Independent kick, snare, closed/open/pedal hi-hat and ride hits reduce repetition. Separate soft snare hits, cross-stick, toms, ride bell and crash support quieter details and fills.
- **Bass:** Karoryfer Black And Blue Basses, Darkblack Washburn AB-95 neck pickup, played fingerstyle. Six sounding root pitches (MIDI 28, 33, 38, 43, 48, 52), each with two round robins. The sampler chooses a nearby real recording and interpolates playback at the required pitch.

The 36 files total 4,814,384 bytes (about 4.59 MiB), in broadly supported mono 32 kHz / 16-bit PCM WAV. Cymbal tails last up to 3.5 seconds; bass recordings last 3.2 seconds. Small source-instrument tuning offsets are corrected to concert pitch. Recording preroll is removed, short end fades prevent clicks, and peak levels stop at 0.85. Exact source revisions, original file paths and processing are documented in [CREDITS.md](CREDITS.md) and [sources.json](sources.json).

The browser fetches, decodes and resamples these files once before playback. Ready-to-read PCM is passed to the audio worklet; hits never fetch or decode. Browser caching reuses the fingerprinted recordings on subsequent visits. Synthesized rhythm is retained as the standalone-engine fallback.
