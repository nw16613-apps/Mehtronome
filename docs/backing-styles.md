# Coordinated backing styles

Sound Settings presents a single Style selector instead of per-instrument sound, rhythm and riff controls. Metronome sound remains independent, and the existing chord-extension movement controls remain available. Instrument sound controls are retained inside a hidden compatibility container for saved setups; they cannot override the chosen style during a settings refresh.

| Style | Drums | Bass | Comping |
| --- | --- | --- | --- |
| Pop / rock | Straight backbeat | Root/fifth | Picked guitar figure |
| Traditional jazz | Swing ride | Walking chord tones | Piano comping and guide voices |
| Fusion jazz | Syncopated fusion | Displaced sixteenths | Electric-key vamp |
| Blues | Shuffle | Chord-aware shuffle figure | Shuffle guitar riff |
| Motown | Driving backbeat | Melodic eighths | Offbeat piano figure |
| Funk | Syncopated pocket | Funk chord-tone figures | Interlocking clav riff |
| Neo-soul | Spacious pocket | Spacious bass phrases | Held keys with a moving inner voice |
| Bossa nova | Light cross-stick | Syncopated root/fifth | Thumb-and-chord guitar pattern |
| Latin | Latin groove | Anticipated tumbao | Two-bar piano montuno |
| Ballad | Sparse drums | Gentle counterline | Spacious broken piano chords |

Each arrangement also selects a repeatable melodic role/source, phrase length, register, density, development and interaction, plus a sustained harmony texture. The optional melodic track remains under mixer mute control. Patterns follow the current chord and scale guide rather than fixing pitches or replacing the user's chart. Related four-bar cells create answers instead of one identical bar repeated indefinitely.

The style does not alter the tempo, meter, key, chord progression, CAGED positions, metronome subdivision/swing, extension choices, levels, mute or solo. All backing tracks remain enabled; the mixer determines which tracks are audible. Changing style does not start playback. Active playback receives the new arrangement through the existing settings path.

The comping track is named Comping. New bright-key, bright-tine and clav-style synthesized voices use faster attacks, stronger upper partials and shorter releases than the old warm-tine default. They use the existing bounded oscillator pool and cached envelope factors. Older tones remain readable for compatibility. Jazz/blues swing is shared by drums, bass and comping; it does not change the metronome's own swing control.

Style selection persists locally and is included in saved/imported/exported practice setups. Older instrument-based setups infer a matching style from their drum, bass and comping choices while retaining mixer audibility. Explicit saved styles take precedence.

Validation covers catalog bindings, distinct rendered phrase signatures, multiple meters and chord changes, bounded audio, attack/partial/release measurements, shared sample-clock swing, legacy preset migration, persistence, no automatic audio start, preservation of chart/tempo/mix, live engine settings and responsive layouts.

## Harmony and part voicings

Comping uses a style-specific accompaniment figure with single notes, octave pairs, dyads, chord fragments and complete chords. The part follows the current written chord and mode. Compact chord/extension vocabularies remain the harmonic source for its full voicings and upper fragments. Legacy direct-engine pattern settings retain the previous block-chord behavior; normal style selection explicitly selects the new part engine.

Base voicings retain the selected chord quality and suitable written extensions. Two-tone chords use their actual pitch classes; no missing third or seventh is invented. Fragments can omit chord members while the rest of the figure supplies the harmony. Pitches are prepared per harmony/voicing before rendering. At a chart change, incompatible ringing notes fade over 25 ms; common tones can continue. Subsequent notes use the new chord without shifting the riff’s rhythmic position. Voicing changes favor nearby shapes and colour changes happen between two-bar phrases.

### Genre instruments

Each style also selects its comping instrument, bass bank and acoustic-kit treatment. Pop/rock uses clean electric guitar; blues uses the same recorded guitar with modest drive. Traditional jazz and Latin use acoustic piano; Motown uses clipped piano plus recorded tambourine; bossa uses nylon guitar. Ballad uses softened acoustic piano. Traditional jazz, bossa, Latin and ballad use plucked upright bass; the other styles use fingerstyle electric bass. Fusion and neo-soul retain electric tine keys; funk retains dry clav-style keys.

Jazz, bossa, Latin, neo-soul and ballad now use a separate CC0 Virtuosity club-jazz bank; pop/rock, blues, fusion jazz and Motown now use a separate Big Rusty studio bank; funk retains Wilkinson. Instrument banks load before transport, with at most four simultaneous decodes, and remain installed across restarts and live style changes. The comping sampler keeps the existing 32-voice bound and ages muted voices. Sample sources and licences ship at `/audio-credits.html`; source hashes and pitch centres are in `web/src/audio/samples/band/sources.json`.

The upright bank now uses soft single-note Meatbass pizzicato recordings selected for stronger fundamentals. Offline pitch correction and gentle overtone damping keep the bass line clear, with no extra worklet processing. Electric bass and the style assignments are unchanged.


## Mix reference and extension vocabulary

Every fader starts at 25% linear gain, displayed as −12.0 dB; double-click returns a fader to this reference. Source calibration is fixed before the faders. Piano, clean guitar, blues guitar, nylon guitar, tine and clav have individual trims so a style change does not make its comping disappear or leap forward. Electric bass, the metronome, drums and melodic movement have calibrated gains; the sustained pad sits further behind the rhythm section. A common 2 dB headroom allowance applies to dry buses. Saved setup levels, mute and solo choices still apply.

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

## Console FX sends

Every mixer strip has rotary Reverb A, Reverb B and Delay sends above its fader. Sends default to zero, follow the track fader/mute/solo/gap, and retain the dry route. Each knob supports vertical dragging (Shift for fine adjustment), native keyboard arrows/Home/End and double-click to zero. Phone layouts place the same knobs above their horizontal faders. Controls move intact into the floating mixer.

Reverb A and B have separate Room, Chamber, Plate and Hall type selectors. Their independent convolvers have different decay/damping/predelay profiles and share cached impulse buffers only when the chosen type matches. Type changes crossfade. Both reverb returns and the delay return are fixed at unity (100%) and are fully wet; there are no return sliders. Old send values and type choices persist; old return levels are deliberately superseded by the requested fixed 100% returns. All three buses stay dry in older setups with no sends, and the second reverb's sends default to zero.

The filtered feedback delay has gentle native sine modulation at 0.3 Hz and ±2.5 ms. Ten tempo-synced choices cover sixteenths, dotted sixteenths, eighth triplets, eighths, dotted eighths, quarter triplets, quarters, dotted quarters, half notes and whole notes. The delay supports an eight-second whole note at 30 BPM, and its feedback remains fixed at 28%. Tempo follows current playback, including exercises and tempo training. Convolution/delay/LFO processors are created only when needed; unused processors sleep after their tails, and reset stops old oscillators and discards tails. All wet audio uses the protected master output.

The redundant fixed Harmony room / Ambient space return has been removed. Six source channels remain, with Reverb A, Reverb B and Delay as the only external FX buses. Harmony and melodic movement have their own sends; exercise guitar and chord previews use the Harmony sends. Exercise guitar is summed into that FX source after its own guitar-volume control while retaining its independent dry path. The console has six stereo meters, and click-only playback with zero sends creates no convolution nodes. Old room fader/mute/send fields are ignored when loading older setups; existing A/B/delay choices and sends are preserved.

## Live-fusion reference sound

Following the user’s Snarky Puppy reference, the five band styles replace the shortened hybrid bank with 32 real DRSKit acoustic recordings (CC BY 4.0). Pop/rock, fusion jazz and funk retain clear shell body and natural cymbal articulation; blues and Motown receive only modest additional damping. Quieter kick/snare layers and alternating takes retain ghost-note detail. Close/overhead microphone selection and gentle filtering provide definition without synthetic reinforcement or aggressive gating. Runtime assets total 1.97 MiB, decoded before playback at the existing bounded concurrency.

No changes were made to the groove or fill vocabulary, humanisation, bass/comping, independent FX sends, or the mobile performance work. The other five club-kit styles remain unchanged. Names shown in Sound Settings are Live acoustic / Live fusion / Live blues / Live soul / Live funk. Credits and reproducible source hashes ship in the source and `/audio-credits.html`. The reference describes the intended character, not an exact reproduction or official artist sample pack.

### Tighter live kick

Only the five live kick WAVs were refined after the user requested less boom: reduced sub/bass resonance and a shorter smooth tail, with the recorded attack and reference peak retained. The full-strength kicks now reach 95% of their energy in about 59–63 ms (previously 126–140 ms); soft kicks in about 102–105 ms (previously 176–203 ms). Snare, hats, cymbals, toms, patterns, fills, FX and instrument balances remain unchanged. All processing is offline, adding no mobile runtime work.

## Faster first play and on-demand recordings

First play no longer fetches/decodes all 127 recordings. The audible mix determines the exact bank: synthesized metronome/harmony/melodic tracks require no WAVs; a full pop/rock drum-bass-guitar band needs 49 rather than 127. Muted tracks, zero-volume tracks and other styles are excluded. Selecting sounds while idle can fetch their encoded bytes quietly before play, without creating an AudioContext or decoding. Worklet module preparation and required-sample preparation run in parallel.

The loader caches encoded files per sample and decoded PCM per sample/rate, deduplicates overlapping requests, and caps network and decode work at four concurrent tasks each. New contexts reuse downloads; transfers receive fresh PCM copies. Failed requests can retry. Switching style or unmuting waits for the required recordings before applying that audio configuration; stale requests cannot overwrite newer selections. New banks merge into the worklet without resetting active voices or the playback clock. Previously loaded banks remain installed for immediate reuse. No background bank decoding is performed during playback unless the user requests new sounds.

Checks cover no-WAV first playback, selective instrument requests, repeated-start reuse, transfer safety, retries, concurrency and active-voice preservation, plus live mixer/style changes, FX and mobile playback. In the browser fixture, default playback requested zero WAVs, unmuting pop/rock comping requested its five guitar samples, and a subsequent stop/start requested no additional WAVs.

## Space in the accompaniment

The new parts keep chord attacks restrained and use individual voices to create the figure. They range from sparse held piano to a more active Cuban montuno, with lower note velocities for the denser figures. Repeated two-bar contours include rests. Non-Latin parts leave the final beat of a larger phrase answer clear; Cuban and Brazilian cycles retain their orientation. The instrument uses the existing 32-voice bound and shared sample clock, with no additional samples or first-play downloads.

## Style-specific ensemble phrases

Melodic movement now has a distinct four-bar accompaniment vocabulary for every style, rather than sharing the same percentage-spaced note grid. Phrases include complete rests and repeat recognisable ideas. They use the current chord/mode, and cadential responses choose a current chord tone toward the next root rather than sounding an incompatible future chord early. Jazz/blues eighths follow the drum swing; jazz swing relaxes at faster tempos. Lower density leaves whole bars free. Bossa and son preserve two-bar pairs. Existing custom pattern-library sequencing remains available to legacy setups.

| Style | Bass / comping | Melodic movement |
| --- | --- | --- |
| Pop / rock | Steadier root/fifth bass, longer clean-guitar chord holds | Clean-guitar chord-tone answers |
| Traditional jazz | Walking upright bass, sparse piano extensions | Acoustic-piano third/seventh phrases with swing |
| Fusion jazz | Displaced bass, ride/bell pocket, electric-key accents | Displaced electric-tine modal motif |
| Blues | Shuffled chord-aware bass and short guitar responses | Driven-guitar pentatonic call and answer |
| Motown | Mainly eighth-note melodic bass and clipped piano | Short clean-guitar eighth-note hook |
| Funk | Clipped syncopated bass and sparse clav chords | Dry single-note clav syncopations |
| Neo-soul | Spacious electric bass and tine voicings | Narrow, spacious electric-tine counterline |
| Bossa nova | Root/fifth bass with longer main tones, sparse nylon chords | Nylon-guitar answers in two-bar phrases |
| Latin · Cuban son | Fifth on 2-and, root on 4 sustained across held-chord downbeats; new harmony stated on its change | Short acoustic-piano guajeo fragments in a stable two-bar orientation |
| Ballad | Gentle bass counterline, soft piano chord holds | Longer soft-piano notes and wide rests |

The approved live drum sounds and non-Latin core grooves remain. Bossa has a quiet samba-derived bass-drum ostinato (1, 2-and, 3, 4-and), even eighths, light shaker and a consistent two-bar cross-stick response. Cuban son has 2–3 son clave (bar 1: 2, 3; bar 2: 1, 2-and, 4), conga marcha with open tones on 4 and 4-and, and long/short güiro strokes. A quiet bell section opens alternate eight-bar phrases; a small muted-conga pickup adds an answer without replacing clave or conga open tones. Generic tom/snare fills and four-bar cell reordering never interrupt these Latin ostinatos. These are specific 4/4 practice arrangements; other meters clip/repeat the cells and are not presented as traditional odd-meter grooves.

Sixteen acoustic VCSL percussion recordings add about 327 KiB. Only audible Latin drums request them (bossa requests only the two shaker takes). Including the required club-kit hits, Latin drums load 16 files and bossa loads nine, rather than the entire 38-file jazz bank. Style melodic tracks share the existing piano/guitar sample banks or use the existing synthesized tine/clav voices; they load their bank when audible even if comping is muted. Sample merge/reset preserves playback, FX sends remain independent, and muted melodic parts advance their clock without scheduling hidden notes. The melodic sampler has eight bounded voices and reuses the comping renderer, with no additional real-time decoding or effects. Source paths, pinned revision, licence and hashes are in `samples/latin/sources.json`; the CC0 licence and reproducible builder ship with the source.

## Accompaniment parts and ostinatos

`audio/accompaniment.js` defines actual note-role figures for all ten styles. Pop/rock picks ringing guitar notes over a lower dyad. Jazz mixes spaced piano voicings, shells and guide notes. Fusion has a displaced electric-key vamp, blues a shuffled double-stop riff, Motown an offbeat piano figure, and funk a single-note/dyad clav motif. Bossa alternates lower thumb notes and upper chords; Cuban son alternates octaves, guide dyads and single-note turns in a fixed two-bar montuno. Ballad piano spreads the chord over separate attacks. Neo-soul holds a backing layer for most of the bar while a separate inner voice moves to a nearby mode-compatible colour and returns.

Independent voice groups allow an inner note to change without retriggering or releasing the backing chord. Repeated notes release their preceding copy smoothly. Parts retain their contour through transposition and chord changes, with all pitches drawn from the current harmony/mode. Shorter meters clip/repeat the 4/4 vocabulary. The Sound Settings part descriptions name the actual figure.

When a riff part is audible, Melodic movement leaves the earlier bars to that part and provides a short answer near the phrase end. Muting Comping restores the melodic track’s broader phrase activity. Both tracks retain their own mixer fader, mute/solo and FX sends.

Validation covers every chord quality across roots, pitch ranges, octave/dyad/single-note content, repeating contours, independent held voices, current-harmony notes, block-size identity, cached pitch maps, melodic interaction, live style and exercise settings, unchanged sample loading, and native output headroom. Solo Comping to hear the part clearly.

## Written part variations

Every style now has five related parts: the main figure, development, thinner response, answering phrase and turnaround. These contain different written note roles, register choices, chord fragments and rhythmic figures; timing/velocity humanisation and voicing variation can both be disabled without removing those musical differences. New prepared roles include lower thirds, upper fifths, inverted guide dyads and additional independent inner-voice targets.

A cached 32-bar arrangement selects whole two-bar phrases, revisits the theme and introduces space and answers between developments. Jazz also revisits both halves of its four-bar theme. Chart-ending cues select a turnaround. Bossa and Cuban son retain their first/second-bar orientation and thumb/octave anchors in every part; the drum/clave patterns are untouched. Each variant is bounded to at most seven attacks per bar, and the thinner parts use fewer notes. Turnarounds can contain a deliberate pickup instead of suppressing all accompaniment on the last beat.

The new choices reuse the existing harmonic pitch maps, instrument samples, mixer and FX settings. Phrase cells are prepared once, and selection does not allocate pattern arrays or use random note decisions in the audio callback. Disabling `backingVariation` retains the original stable figure. Tests verify actual note/rhythm changes with humanisation and voicing movement off, thinner sections, current-mode pitches, preserved Latin/Brazilian anchors, deterministic restarts, chart-ending cues and native audio headroom.

### Arrangement auditions

Legato Fusion and Blues offer **Compare arrangements** in Backing styles.
A keeps the existing backing; B selects an authored, reviewed phrase library
(`web/src/audio/audition-arrangements.js`), not an external generation service.
The 16-bar fusion and 12-bar blues forms coordinate comping, bass, drums and
melodic questions/answers. The blues form follows the chart's actual harmony;
it does not substitute a standard twelve-bar progression.

Both versions use the same instrument patches, faders, sends, tempo, chord
chart and humanisation. A/B requests take effect at the next musical barline;
**Restart from beginning** starts the selected version from the beginning of
the current chart/loop with the existing count-in. Other styles keep A, and
changing styles returns the audition selector to A. The trial is for four
beats per bar; other meters keep A and explain how to enable B. Audition
selection is temporary and is not saved into practice presets.

Phrase material uses harmonic roles and diatonic offsets. Existing pitch
resolution follows chord qualities/scale guides, voice leading and actual
changes; no audio/network request is needed. Supporting/Countermelody/Featured
still controls the melodic part. Mixer mute/solo remains the way to hear an
individual part. Focused tests cover complete forms, harmonic membership,
barline switching through mixer updates, reset, audio block independence,
real-sample headroom, and the two-style mobile browser workflow.

### Sound-library comparison

**Sound library → Expanded recordings** is independent of arrangement A/B and
applies across all styles to drums, bass, comping and melodic movement. New
sessions default to Expanded; Original sounds preserves the previous timbres.
The preference survives reload, style changes and new saved setups. Older
presets without this control restore Original sounds to retain their sound.

New electric guitar recordings select actual soft/medium takes and recorded
short articulations, while electric bass selects soft/medium-soft/strong
plucks. Upright alternates real soft plucks. Piano/nylon use more pitch zones.
Electric keys use recorded Wurlitzer, clav uses a recorded clav-style synth,
and flute uses acoustic recordings. Organ uses a richer synthesized drawbar
model; other modeled leads and the harmony pad remain synthesized. Source
labels update to avoid describing sampled Wurlitzer as a tine/Rhodes piano.

Muted tracks request no samples. Decoding/fetching remains limited to four
concurrent operations. Encoded recordings have a 24 MiB cache budget and
decoded recordings a 48 MiB budget per device sample rate. Worklet settings
retain only samples required by the current audible setup, preserving buffers
referenced by already sounding notes; identical retain requests do no work.
Sound-library changes wait for required samples before updating playback.
Mix levels, sends, arrangement choices and the sample clock stay intact.
