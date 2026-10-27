# Musical review — options 1–4

This pass reviews the working musical model and adds usable practice material and audio tools. GitHub Pages/main remains unchanged; development stays on the guided-practice branch and owner-private preview.

## Musical decisions and corrections

- CAGED geometry continues to use the correct parent scale family. Related modal harmonies share their parent pitch map; the root framework/position identity follows the inspected chord. Tests cover physical string/fret/MIDI consistency, actual root/chord flags and five distinct position identities for every selectable chord in all 12 keys.
- Chord-tone interval data now retains its chord spelling, including altered fifths and compound extensions. A chromatic chord note outside the selected guide no longer falls back to an unrelated enharmonic interval label such as flat 6 for an augmented fifth. Scale-guide labels remain distinct where appropriate.
- Root-bass shell templates cannot represent an inverted slash bass. Such a slot is explicitly unavailable rather than strumming a differently based chord under a slash label. Drop 2/drop 3 candidates must match the requested actual bass pitch class; an unsupported/outside bass leaves an explained gap. No substitute bass is invented.
- Third/seventh shells deliberately omit fifths/extensions, with omissions listed. Four-part drop reductions retain the existing stated selection policy and disclose omissions. No anatomical fingering validation or authoritative finger numbers are claimed.
- Deliberate outside scale guides remain available with the compatibility explanations from the previous pass. A shared modal guide is not silently replaced just because the chord root changes.

## Layout and practice flow

Source chords, omissions and voice movement now sit under a single foldable reference in both voicing workshops. The open/closed preference is retained between studies and visits. The musical score and primary controls stay separate, so reference material can be folded away while practising. Workshop controls use a responsive grid, and mobile actions have larger tap targets. Existing themes and sound-settings expansion behavior are retained. Waveforms and input meters follow the palette.

## Authored practice material

The two existing original forms remain available. New forms:

- **Minor ii–V–i resolution:** eight bars, half-diminished ninth ii (Locrian natural 2), dominant flat ninth V (Phrygian dominant), then minor-sixth i with melodic-minor guidance. The linked exercise starts with shell guide-tone approaches; complete one-bar phrases leave the rest of each longer chord slot open.
- **Dorian conversation:** sixteen bars alternating tonic minor 13 and IV dominant 13. The two local guides share the tonic Dorian pitch collection. The linked exercise uses the top voice on a fixed drop-2 string set, with a two-bar question/answer followed by space in each four-bar chord slot.

Each has a practice brief and **Load & practise study** action that configures the matching exercise without autoplay. They remain editable and transpose with the tonic. Ordinary Load preserves the chart-editing workflow. Personal chart storage remains a harmonic form; journal entries capture the wider exercise/session setup.

New written forms for drop studies: **Offbeat answer** starts after an eighth rest and holds across a beat; **Two-bar call and response** develops the opening with a lower held answer in bar two. The latter requires eight beats per chord in 4/4; shorter slots rest with an explanation. All/restricted parts retain the chosen physical strings; rhythms and durations are tested in every key. New recipe choices survive favourites/journal validation.

## Audio tools

Recording now shows an input peak meter while capture is active, with no microphone monitoring sent to the speakers. Meter setup occurs only after an explicit recording request. The selected take's waveform supports click/tap start-point selection, mirrored by the accessible numeric trim field; Save take details persists it. The trim range now covers a complete three-minute take. Decoded samples are reduced to a small peak summary and are not retained. The waveform identifies the edited take, which can differ from the currently compared A/B take. Palette changes repaint it. If decoding is unavailable, original audio export/playback and numeric trim remain available.

Ear training has **Foundation** and **Extended** levels. Foundation retains four core seventh qualities and one/two-semitone movement. Extended adds minor-major, diminished and augmented-major sevenths, larger intervals up to an octave, and six-string pitch-location practice. Scores/reveals are saved separately for each activity and level. Only first answers count; repeated reveals do not duplicate skips. Strong Foundation results suggest trying Extended but never change the level automatically. Unavailable browser storage is labelled session-only.

Alignment remains a manual trim, not automated device-latency calibration. Meter values are digital peaks, not a calibrated acoustic loudness measurement. Real interfaces, phones and Bluetooth require hands-on checks; automated recording checks use a synthetic input through the browser's real MediaRecorder, Web Audio, IndexedDB and playback APIs.

## Validation

All 50 unit-test files passed. New coverage includes all-key CAGED pitch/identity consistency, requested basses across shell/drop shapes, altered interval labels, new phrase rhythms/string restrictions, new chart forms, graded quiz answers/history validation and waveform transients/trim bounds. Focused browser checks cover new study setup defaults, source folding, mobile overflow, requested slash bass, persisted ear results, waveform decoding/trimming/theme repaint, recording consent/release/export/A-B comparison and existing workshop/inspection/repertoire workflows. Production builds include TypeScript validation. This is focused workflow coverage; historical full-browser-suite migration remains separate work.
