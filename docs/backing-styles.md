# Coordinated backing styles

Sound Settings presents a single Style selector instead of per-instrument sound, rhythm and riff controls. Metronome sound remains independent, and the existing chord-extension movement controls remain available. Instrument sound controls are retained inside a hidden compatibility container for saved setups; they cannot override the chosen style during a settings refresh.

| Style | Drums | Bass | Comping |
| --- | --- | --- | --- |
| Pop / rock | Straight backbeat | Root/fifth | Bright chord stabs |
| Traditional jazz | Swing ride | Walking chord tones | Crisp jazz syncopation |
| Fusion jazz | Syncopated fusion | Displaced sixteenths | Bright electric-tine accents |
| Blues | Shuffle | Chord-aware shuffle figure | Short swung responses |
| Motown | Driving backbeat | Melodic eighths | Clipped offbeat piano |
| Funk | Syncopated pocket | Funk chord-tone figures | Dry sixteenth-note stabs |
| Neo-soul | Spacious pocket | Spacious bass phrases | Articulate electric-key chords |
| Bossa nova | Light cross-stick | Syncopated root/fifth | Bossa chord rhythm |
| Latin | Latin groove | Anticipated tumbao | Interlocking chord accents |
| Ballad | Sparse drums | Gentle counterline | Longer, spacious chords |

Each arrangement also selects a repeatable melodic role/source, phrase length, register, density, development and interaction, plus a sustained harmony texture. The optional melodic track remains under mixer mute control. Patterns follow the current chord and scale guide rather than fixing pitches or replacing the user's chart. Related four-bar cells create answers instead of one identical bar repeated indefinitely.

The style does not alter the tempo, meter, key, chord progression, CAGED positions, metronome subdivision/swing, extension choices, levels, mute or solo. All backing tracks remain enabled; the mixer determines which tracks are audible. Changing style does not start playback. Active playback receives the new arrangement through the existing settings path.

The comping track is named Comping. New bright-key, bright-tine and clav-style synthesized voices use faster attacks, stronger upper partials and shorter releases than the old warm-tine default. They use the existing bounded oscillator pool and cached envelope factors. Older tones remain readable for compatibility. Jazz/blues swing is shared by drums, bass and comping; it does not change the metronome's own swing control.

Style selection persists locally and is included in saved/imported/exported practice setups. Older instrument-based setups infer a matching style from their drum, bass and comping choices while retaining mixer audibility. Explicit saved styles take precedence.

Validation covers catalog bindings, distinct rendered phrase signatures, multiple meters and chord changes, bounded audio, attack/partial/release measurements, shared sample-clock swing, legacy preset migration, persistence, no automatic audio start, preservation of chart/tempo/mix, live engine settings and responsive layouts.

## Chord-only comping

Comping never adds an isolated single-note hook between chord hits. Each attack has at least three simultaneous pitches, on the style's existing chord rhythm. Variation amount chooses among cached complete voicings; it does not add notes or change hit timing. All styles use chord-extension variations and inversions. Fusion and neo-soul also use related modal chord colours.

Base voicings retain the selected chord quality and a suitable written extension when present (the exercise seventh-chord limit does not apply to backing). Triads stay triads; two-tone chords use octave doubling without inventing a third or seventh. Compact inversions stay in the keyboard register. Seven-note modal alternatives use complete alternate-note triads sharing a third/seventh guide tone with the backing chord; every note belongs to the current scale. Other collection sizes retain actual chord inversions and only their available modal extensions. Future harmony is not played before its change.

The removed hook generator and single-note event path cannot be reactivated by old saved movement settings. The separate Melodic movement track and its mute, rhythm and note-source behavior are unchanged.

### Genre instruments

Each style also selects its comping instrument, bass bank and acoustic-kit treatment. Pop/rock uses clean electric guitar; blues uses the same recorded guitar with modest drive. Traditional jazz and Latin use acoustic piano; Motown uses clipped piano plus recorded tambourine; bossa uses nylon guitar. Ballad uses softened acoustic piano. Traditional jazz, bossa, Latin and ballad use plucked upright bass; the other styles use fingerstyle electric bass. Fusion and neo-soul retain electric tine keys; funk retains dry clav-style keys.

Jazz, bossa, Latin, neo-soul and ballad now use a separate CC0 Virtuosity club-jazz bank; pop/rock, blues, fusion jazz and Motown now use a separate Big Rusty studio bank; funk retains Wilkinson. Instrument banks load before transport, with at most four simultaneous decodes, and remain installed across restarts and live style changes. The comping sampler keeps the existing 32-voice bound and ages muted voices. Sample sources and licences ship at `/audio-credits.html`; source hashes and pitch centres are in `web/src/audio/samples/band/sources.json`.

The upright bank now uses soft single-note Meatbass pizzicato recordings selected for stronger fundamentals. Offline pitch correction and gentle overtone damping keep the bass line clear, with no extra worklet processing. Electric bass and the style assignments are unchanged.


## Mix reference and extension vocabulary

Every fader starts at 25% linear gain, displayed as −12.0 dB; double-click returns a fader to this reference. Source calibration is fixed before the faders. Piano, clean guitar, blues guitar, nylon guitar, tine and clav have individual trims so a style change does not make its comping disappear or leap forward. Electric bass, the metronome, drums and melodic movement have calibrated gains; the sustained pad sits further behind the rhythm section. A common 2 dB headroom allowance applies to dry buses. Ambient space stays a quieter reverb return. Saved setup levels, mute and solo choices still apply.

Calibration uses the actual shipped recordings, the same normalization as the browser loader, 20-second Am7/A Dorian renders at 100 BPM with every fader at −12 dB, EBU R128 integrated loudness, transient peaks and active-window RMS. `node scripts/measure-band-balance.mjs` reproduces the measurements (FFmpeg is an offline developer dependency). Across the ten arrangements, comping now measures about −35.7 to −37.5 LUFS, versus approximately −39.3 to −47.4 before calibration. Groove density, accents and the deliberately gentler jazz/ballad patterns remain musical differences; this is not runtime loudness normalization. Tests also check full-band reference headroom over minor, dominant-13 and major-9 harmony and meter accuracy after calibration.

The cached comping vocabulary has up to twelve complete voicings. Chord-extension movement includes mode-compatible 9ths, 11ths and 13ths, their alterations where available, and paired tensions in rootless voicings. Seventh chords retain their defining third/suspension and seventh; altered fifths are retained where they define the quality. Triads do not acquire an invented seventh. A natural 11 is avoided against a major third. Written extensions can vary among suitable subsets rather than being excluded from the vocabulary. The first hit states the base voicing and subsequent style-rhythm hits cycle through colours; no isolated-note hook or extra rhythmic attack is added. Pad extension motion remains separately controlled.


## Overall output

Master volume is a separate horizontal control in the shared mixer, so it also moves into the floating mixer. It changes the whole output, including the metronome, backing, room return, chord previews and exercise guitar, without changing any track fader. Its 0–100% listening level persists under `mehtronome-master-volume-v1` independently of charts and saved setups; default is 100%. Zero remains a deliberate remembered mute. Adjustments use a 20 ms gain ramp and do not start playback.

The existing transport fade feeds one native output chain: fixed +17 dB calibration → DynamicsCompressorNode (−3 dB threshold, zero knee, 20:1 ratio, zero attack, 120 ms release) → 4 dB safety headroom and the master listening gain → speakers. The safety allowance accounts for native compressor make-up gain and reconstructed peaks. No alternate dry path bypasses this stage. Everything uses the same native limiter latency; it does not add JavaScript sample processing or scheduling timers. Channel meters remain before the master stage, so turning Master down does not change the displayed instrument balance.

Output validation renders the real recorded band and native room convolution through this exact module in a 48 kHz OfflineAudioContext, then measures EBU R128 integrated loudness and true peaks with FFmpeg. Twenty-second reference fixtures at −12 dB per track are targeted around −17 to −19 LUFS depending on groove density; full-fader and isolated-click fixtures check peak protection separately. Sparse backing and click-only playback are not automatically raised to the full-band loudness target. This is fixed output calibration, not a song-by-song loudness normalizer.

The verified 48 kHz reference renders measure −17.1 to −19.2 LUFS across the ten styles, with true peaks no higher than −4.3 dBTP. The full-fader stress fixture, including a polyrhythm, reaches −2.0 dBTP; click-only full-level playback reaches −3.9 dBTP and retains its sparse loudness. These are measured browser output fixtures, not handset listening tests.

## Natural performance and evolving phrases

Backing now defaults to natural touch. Snare, rim, cymbal and chord attacks receive small, deterministic delays (below 20 ms, further bounded at fast tempos); kick downbeats and bass onsets remain exact. Velocity and note-length changes are restrained and style-aware, with a more laid-back snare/comping pocket for neo-soul. These changes never shift the metronome, harmony changes or count-in. Swing ride offbeats relax towards straighter eighths at faster tempos; blues retains its shuffle. All backing parts use the same tempo-dependent swing grid, including during tempo training.

Four-bar vocabulary is rearranged in longer phrases; the second quartet answers the first. Drums move between ride and flat ride in jazz, vary ghost notes, and use four distinct fill families. Fills replace subordinate hits and busy hats rather than piling on top of them. Short answers occur at selected four-bar ends; eight-bar ends and bar-aligned rehearsal-section/loop endings allow a two-beat answer. Loops shorter than four bars do not trigger form-based fills on every repeat. Form cues derive from the actual playback timeline, including the selected loop, while the pulse continues normally.

The new 38-recording, 4.16 MiB Virtuosity bank supplies velocity-sensitive kicks and snares, real cross-stick, toms, and several takes of ride/flat ride and hats. Fetching/decoding and sample-group preparation happen before playback; the worklet uses a bounded 24-voice drum pool. Full credits and reproducible derivative metadata ship with the source and at `/audio-credits.html`. Older saved setups automatically receive the improved backing without changing their chosen style, chart, faders or mute/solo settings.

## Revised pop/rock, blues, fusion jazz and Motown drums

These four styles use a genuinely separate 32-recording, 1.91 MiB CC0 Big Rusty bank. Selected moderate-strength close hits give a different kick/snare body from the previous Wilkinson samples. Style profiles control brightness and damping; blues and Motown are drier, while fusion lets the ride speak. The original Wilkinson samples remain available for funk and old standalone fixtures; club-jazz assignments remain intact.

Pop/rock now starts with kick on 1/3, snare on 2/4 and eighth-note hats, with occasional restrained kick pickups. Blues uses quarter-note kick, swung eighth hats and a dry backbeat. Motown uses a steady quarter-note kick and eighth-note tambourine, closed hats and short snare answers. Fusion jazz has its own `fusionRide` groove: syncopated kick, 2/4 snare, eighth-note ride, occasional bell and pedal hat. Funk keeps its existing `fusion` sixteenth pattern. Blues and Motown use their own small fill families, avoiding the generic rock tom runs. Existing bass and comping parts, chart settings, faders and mute/solo state are preserved.

## Modern tight sound revision

The five pop/rock, blues, fusion jazz, Motown and funk profiles now select the same modern hybrid sound-design bank, with funk receiving the shortest additional damping. This replaces the warm studio sound and the previous unchanged funk assignment. The new bank is rebuilt from the retained CC0 recordings with printed envelope/EQ/transient work, not runtime reverb or a renamed preset. It has snappier tuned snares, shorter kick and tom bodies, tighter hats and controlled cymbal tails, retaining real alternate takes and soft-hit layers. Its 32 runtime WAVs total 0.69 MiB and replace the 1.91 MiB studio bank in the loader. Existing grooves, bass, comping and the five club-kit styles retain their previous settings.

## Independent reverb and delay sends

Every mixer channel now has separate Reverb and Delay sends, including optional metronome and ambient-return sends. Both default to zero. Reverb offers Short room / Plate; delay offers eighth / dotted-eighth timing and follows the current playback tempo. Reverb return and Delay return are independent, 100% wet, with fixed safe delay feedback and filtered lows/highs. Existing dry levels, mute/solo and master limiting remain intact. Drums can have room reverb with delay at zero.

The sends use isolated post-fader, post-mute, post-gap stems, not copies of the combined backing bus. Current FX tails decay naturally after a source is muted; a zero return silences the corresponding bus. Stops/restarts clear old tails. Reverb type changes crossfade. Unused effects do not create convolution/delay processors; processors used earlier are disconnected after their tails. No-send playback skips stem rendering. FX controls move with the floating mixer, persist locally and are included in saved/imported/exported practice setups. Older setups without sends load dry.

## Live-fusion reference sound

Following the user’s Snarky Puppy reference, the five band styles replace the shortened hybrid bank with 32 real DRSKit acoustic recordings (CC BY 4.0). Pop/rock, fusion jazz and funk retain clear shell body and natural cymbal articulation; blues and Motown receive only modest additional damping. Quieter kick/snare layers and alternating takes retain ghost-note detail. Close/overhead microphone selection and gentle filtering provide definition without synthetic reinforcement or aggressive gating. Runtime assets total 1.97 MiB, decoded before playback at the existing bounded concurrency.

No changes were made to the groove or fill vocabulary, humanisation, bass/comping, independent FX sends, or the mobile performance work. The other five club-kit styles remain unchanged. Names shown in Sound Settings are Live acoustic / Live fusion / Live blues / Live soul / Live funk. Credits and reproducible source hashes ship in the source and `/audio-credits.html`. The reference describes the intended character, not an exact reproduction or official artist sample pack.

### Tighter live kick

Only the five live kick WAVs were refined after the user requested less boom: reduced sub/bass resonance and a shorter smooth tail, with the recorded attack and reference peak retained. The full-strength kicks now reach 95% of their energy in about 59–63 ms (previously 126–140 ms); soft kicks in about 102–105 ms (previously 176–203 ms). Snare, hats, cymbals, toms, patterns, fills, FX and instrument balances remain unchanged. All processing is offline, adding no mobile runtime work.

## Faster first play and on-demand recordings

First play no longer fetches/decodes all 127 recordings. The audible mix determines the exact bank: synthesized metronome/harmony/melodic tracks require no WAVs; a full pop/rock drum-bass-guitar band needs 49 rather than 127. Muted tracks, zero-volume tracks and other styles are excluded. Selecting sounds while idle can fetch their encoded bytes quietly before play, without creating an AudioContext or decoding. Worklet module preparation and required-sample preparation run in parallel.

The loader caches encoded files per sample and decoded PCM per sample/rate, deduplicates overlapping requests, and caps network and decode work at four concurrent tasks each. New contexts reuse downloads; transfers receive fresh PCM copies. Failed requests can retry. Switching style or unmuting waits for the required recordings before applying that audio configuration; stale requests cannot overwrite newer selections. New banks merge into the worklet without resetting active voices or the playback clock. Previously loaded banks remain installed for immediate reuse. No background bank decoding is performed during playback unless the user requests new sounds.

Checks cover no-WAV first playback, selective instrument requests, repeated-start reuse, transfer safety, retries, concurrency and active-voice preservation, plus live mixer/style changes, FX and mobile playback. In the browser fixture, default playback requested zero WAVs, unmuting pop/rock comping requested its five guitar samples, and a subsequent stop/start requested no additional WAVs.
