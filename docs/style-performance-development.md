# Performance development across all backing styles

The eight-bar phrasing approach approved for Blues and Legato Fusion now covers
all twenty styles. Choose a style and use the normal Play controls: no additional
arrangement, source-library or audition options are required. The two approved
performances retain version 1; the other eighteen use version 2.

`style-performance-vocabulary.js` contains eighteen original eight-bar melodic
and chordal parts. `style-performance.js` adapts them to the actual chart before
playback, then the existing global pitch/voicing planner follows the changes and
cadential destinations. Statement, Development, Contrast and Return have related
motifs, different rhythmic placement, voicing gestures, dynamics and lengths.
This is a finite, repeating authored vocabulary with algorithmic adaptation,
not an external AI model generating unlimited new performances.

| Style | Chordal performance | Melodic character |
| --- | --- | --- |
| Pop / rock | Ringing guitar figures and upper answers | Clear chord-tone hooks with held endings |
| Traditional jazz | Syncopated shells and small piano voicings | Swing-aware guide-tone calls and replies |
| Fusion jazz | Open electric-key voicings and displaced accents | Connected modal phrases with changing entrances |
| Blues | Approved damped/ringing two- and three-note guitar | Approved shuffle call and answer |
| Motown | Clipped offbeat piano, varying upper voices | Eighth-note hook development |
| Funk | Short upper clav voicings on a sixteenth-note groove | Compact syncopated motifs and rests |
| Neo-soul | Open electric-key holds, gaps and upper answers | Connected, lyrical stepwise lines |
| Bossa nova | Ringing two-bar nylon pattern with voicing changes | Light melodic phrases and held replies |
| Cuban son | Two-bar guajeo phase, alternating upper voicings | Phrases aligned to the two-bar cycle |
| Ballad | Open sustained piano with room between entries | Longer arrivals and breathing space |
| Jazz waltz | Small piano voicings in three beats | Flowing three-beat calls and answers |
| Afro-Cuban 6/8 | Short repeating figures on the existing six-eighth grid | Connected lines over the compound pulse |
| Samba | Two-bar guitar accents with changing upper voices | Light pickups and quick answering figures |
| Second-line | Small piano voicings and syncopated replies | Shuffled phrases and parade-style pickups |
| Reggae | Short upper skanks remain on the offbeats | Spacious hook-and-answer phrases |
| Slow soul / 12/8 | Open sustained chords and triplet replies | Connected triplet phrasing with held endings |
| Boogaloo | Repeating syncopated keyboard figure with upper answers | Compact blues-influenced calls and replies |
| Modern straight jazz | Open voicings and asymmetrical chord entrances | Connected straight-eighth phrases |
| Hard rock | Root/fifth riffs alternate damped and ringing strokes | Strong motifs with sustained answers |
| Legato Fusion | Approved wide, sustained guitar swells | Approved connected phrases and held arrivals |

Defining bass and drum parts remain the foundation: walking/two-feel, tumbao,
slash bass, reggae one-drop, son clave, samba and compound-metre beds are retained.
Bass lengths and accents are shaped to each style. Optional phrase-ending toms
can answer in melodic gaps; foundational percussion does not move to accommodate
a melody. Groove ostinatos retain their metric phase in every pass, while their
voicing, length and weight develop. Non-ostinato chord replies end before the
audible melody re-enters. Supporting still selects whole phrase windows and
leaves more room than Featured; saved activity and mixer choices are preserved.

The free recorded palette, Sonor kit and sustained Harmony controls are retained.
Damped/ringing articulations change the played sample release envelope. Connected
melody uses actual note lengths and overlap, including the existing flute/guitar
sample transitions. Reference source scores remain immutable. Preparation stays
outside the audio callback; activity and fader messages reuse the cached score.

## Verification

- 34 audio, composition, source-library and worklet checks passed, including all
  twenty styles rendered through recorded sounds with finite output/headroom.
- Eight browser workflows passed, including switching all twenty styles through
  the ordinary controls and mobile audio; affected workflows were rechecked after
  the final reply-length adjustment.
- Tests cover eight-bar rhythmic variety, real rests, per-style phrase identity,
  native groove timing, source/cache immutability, slash bass and held notes
  across split changes and a seven-beat loop.
- The dry mix audit covers all twenty styles and eleven kit profiles at 12 kHz,
  with effects disabled. It checks level consistency and clipping on its test
  vamp; its maximum peak was -3.37 dBFS. The [full audit](study-performance-mix-audit.json)
  does not establish subjective realism or cover every chart/FX setting.
- Browser builds include TypeScript validation. No new samples or dependencies.

The deterministic four-pass performance repeats. Future external-model work is
separate; this release makes no claim to use Suno or another music model.
