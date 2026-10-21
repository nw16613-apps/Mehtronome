# Recorded rhythm bank

A tight acoustic rock kit and warm fingerstyle electric bass, bundled with the browser app. The drums are **CC BY 4.0** and the bass is **CC0 1.0**; see [LICENSE-CC-BY-4.0](LICENSE-CC-BY-4.0), [LICENSE](LICENSE), and the full [recording credits](CREDITS.md).

- **Drums:** Wilkinson Audio Naked Drums. A Yamaha Recording Custom kit captured through Neve/API preamps supplies close-miked kick, snare, tom, hi-hat and ride recordings. Shorter, shaped shell and hat tails keep fusion and rock grooves articulate. Independent takes, soft snares, cross-sticks, toms, ride bell and crash prevent machine-gun repetition.
- **Bass:** Karoryfer Black And Blue Basses, Darkblack Washburn AB-95 neck pickup, played fingerstyle. Six sounding root pitches (MIDI 28, 33, 38, 43, 48, 52), each with two round robins. The sampler chooses a nearby real recording and interpolates playback at the required pitch.

The 36 files total 4,207,200 bytes (about 4.01 MiB), in broadly supported mono 32 kHz / 16-bit PCM WAV. Shell tails run from 0.48 to 1.15 seconds; cymbals last up to 3.5 seconds; bass recordings last 3.2 seconds. Small source-instrument tuning offsets are corrected to concert pitch. Short end fades prevent clicks, and peak levels stop near 0.85. Exact source revisions, original file paths, processing, sizes and hashes are documented in [CREDITS.md](CREDITS.md) and [sources.json](sources.json).

The browser fetches, decodes and resamples these files once before playback. Ready-to-read PCM is passed to the audio worklet; hits never fetch or decode. Browser caching reuses the fingerprinted recordings on subsequent visits. Synthesized rhythm is retained as the standalone-engine fallback.
