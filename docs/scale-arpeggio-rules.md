# Scale sequences and arpeggios: current musical contract

This pass covers the Scale sequences and Arpeggios entries. It adds no licks or chord workshops. The chart, scale guide and per-slot CAGED positions remain the sources of truth.

## Definitions

Numbers below describe ordered scale steps relative to a cell's starting degree, unless explicitly described as written chord tones. The octave wraps after the actual collection length, not always seven notes.

| Exercise | Complete cell / material | Progression anchor |
| --- | --- | --- |
| Scale in thirds | Steps 1–3 | First note |
| Scale in fourths | Steps 1–4 | First note |
| Scale in sixths | Steps 1–6 | First note |
| Groups of three | Steps 1–2–3 | First note |
| Groups of four | Steps 1–2–3–4 | First note |
| Diatonic 1–3–2–4 | Steps 1–3–2–4 | First note |
| Diatonic 1–2–3–5 | Steps 1–2–3–5 | First note |
| Positional scale | Every distinct available scale pitch in the selected CAGED shape, in pitch order | Rearticulate a shared endpoint at a changed context; otherwise nearest pitch ahead, reversing at the available range limit |
| Positional arpeggio | Balanced: seven consecutive written chord-tone pitches for triplets (six up/six down); nine for eighths and sixteenths (eight up/eight down). Full position with turnaround: alternating twelve-note ascending and descending forms, each with a turnaround near its destination edge | Phrase ordinal phase; nearest fitting window at a context change |
| Harmonized scale | Alternate scale notes: 1–3–5 or 1–3–5–7 | First note of the directed stack |
| Alternating diatonic arpeggios | Same scale stacks; alternate the played up/down contour of successive cells | Structural first note before alternating reversal |
| Arpeggios from core chord tones | Same scale stacks, restricted to roots among the core chord tones through the seventh (all tones if shorter) | First note of the directed stack |
| Alternating arpeggios from core chord tones | Same restricted stacks; alternating played contours | Structural first note before alternating reversal |
| Selected-chord inversions | Rotate up to three or four core written chord tones; use every fitting register. A shorter chord uses all its tones | First note of the directed rotation |

Downward scale sequences negate their scale-step offsets. Downward harmonized cells reverse the tertian stack and move its upper starting anchor down through the region. Core-chord-tone cells keep their underlying chord-tone roots while reversing contour/order. Inversion names describe the rotated cell's lower chord tone, not a change to the backing bass.

On five-, six- and eight-note collections, thirds/fourths/sixths menus use scale-step wording and Material uses 3/4-note stacks: counting collection steps does not guarantee an ordinary third, triad or seventh chord. Inversions remain based on the actual written chord; their material menu says “Up to N chord tones”. Labels use a consistent collection-aware vocabulary for a mixed chart. Saved ninth-material choices migrate to seventh material.


## Continuation and timing

- Start from the first complete cell available at the requested edge. Never fabricate notes to fill a gap in the diagram.
- Missing interior pitches exclude only the affected complete cells. Later valid cells remain available, with exact theoretical intervals intact.
- Repeated harmony, scale and geometry retain the sequence cursor; bar boundaries do not restart it.
- For cell-based families, at a changed harmony or position, select the nearest complete cell ahead of the previous structural anchor in the current travel direction. Alternating contour phase follows emitted cells, including across changes.
- At the usable range limit, generate the opposite-direction form and continue from the nearest valid anchor to the outgoing upper/lower extent. A cell's final played note is not a general-purpose traversal anchor.
- Harmonized scale in Continuous pattern keeps the cell note ordinal across slot boundaries. An unchanged context resumes the same stack; a changed scale or position selects the fitting directed stack whose next unplayed tone is nearest the old next tone, preserving the ordinal. A completed cell then advances normally. No unused bar tail is introduced merely because three/four does not divide the slot capacity.
- Other cell families retain their complete-cell slot policy. Only an insufficient remaining time budget produces a rest. One-cell scope deliberately leaves the rest of the slot silent. Positional arpeggios retain their sixteen-note phrase phase across bars and context changes; see `positional-phrase-boundaries.md`.
- Notation, TAB, note audition and exercise playback consume the same generated notes. Written chord-tone spelling is used for positional arpeggios; scale sequences retain the scale guide's spelling.

## Findings and fixes

1. Scale and harmonized generators previously stopped at the first unavailable cell, losing valid cells above/below a missing interior pitch. They also had fixed iteration caps. Both now enumerate the actual available anchors and retain every exact complete cell.
2. Inversions previously generated only one occurrence of each rotation. This caused premature reversals despite remaining usable register. They now enumerate every complete anchor, in both directions.
3. Full positional arpeggios inherited scale spelling even for enharmonically different written chord tones. They now use the selected chord's spelling and interval labels.
4. Menu text still called non-seven-note stacks triads/tetrads/ninths and non-diatonic pairs thirds/fourths/sixths. Contextual menu labels now match the established scale-step behavior, with precise chord-based wording for inversions and core-tone roots.

5. Loading five-, six- or eight-note charts could fail while generating the label of an unavailable seven-note progression template, leaving stale exercise notation. That label is now calculated only for its supported major/minor modes. Browser coverage loads every scale family from Harmony and regenerates scale and inversion notation.

## Verification

The new independent oracle constructs theoretical pitches across MIDI octaves before restricting them to the diagram. It does not call the generator to predict expected cells. It covers all scale families, all twelve roots and all five CAGED shapes for scale sequences, every material/direction for harmonized and core-tone stacks, and every chord type and shape for inversions and full positional arpeggios. Exact-note tests cover an interior gap, the upper-register inversion turn and bar-independent cursor/alternating phase. Existing nearest-continuation and range-turn matrices check ii–V–I, altered, modal and twelve-root fourths charts, fixed/changing positions, and finite slot budgets. Browser tests cover notation, controls, selected passages, guitar level and audio playback.

## Starting chart

Fresh sessions now open four separately selectable one-bar Am7 slots in A Dorian (16 beats in 4/4). The single-chord template also creates four tonic slots using the current selected chord and scale. The mode’s suggested chord remains available as before; saved charts and the remembered working draft are not rewritten. Each repeated bar retains an independent manual CAGED position and corresponding exercise notation.

The initial exercise is Positional arpeggio (nine-note span), Sixteenth notes, Continuous pattern, Upward first. Saved exercise options remain explicit user choices and are not rewritten.

Validation result: production TypeScript/Vite build and 11 focused unit files passed. Twenty-three targeted browser scenarios were validated, with the continuity fixture rerun after explicitly selecting its material-based study under the new positional default. The full historical suite is not claimed: older adaptive-exercise fixtures still target the retired pedal control and the former location of guided setup. Hosted publication is checked through deployment status; browser validation is local.


### Plain positional scale

Positional scale is the first option under Scale sequences. It uses the selected harmony's scale guide and every distinct available scale pitch in its CAGED diagram, retaining the real string/fret coordinates and scale spelling. Duplicate unisons are played once. Starting direction chooses the first range edge; continuous traversal turns at the opposite edge without doubling the endpoint. It flows across bar lines and retains direction through chord, mode and position changes, selecting the nearest pitch ahead, or reversing only if no forward pitch fits.

Material is hidden because this exercise is neither a stacked chord nor an arpeggio. The arpeggio-specific balanced-span and triplet-turnaround choices do not restrict the scale range. Eighths, triplets and sixteenths change timing without changing pitch-order rules. One run per chord continues to the next range boundary and leaves unused slot time as rests. Saved exercise options and CAGED captions support the new study. The default exercise remains Positional arpeggio.

Tests cover all scale families, twelve keys, five shapes, both directions, all rhythms, real notes/spelling, repeated bars, changed roots/qualities/modes/positions, one-run scope, notation captions, saved options, playback and mobile width.


### Shared-boundary entry

At a changed chord, scale or CAGED position, an incoming traversal may rearticulate a shared lowest or highest pitch. For the reported Am7 Position II to Cm7 Position I example, Am7 ends on C48; Cm7 now begins on the same C48 (low E string, fret 8), then D50, E♭51, F53. It no longer skips that entry C because a strictly lower/higher note is unavailable.

This single-note traversal exception applies only when the actual preceding sounded note and the outgoing structural anchor both equal the incoming endpoint/entry note. Interior shared notes still use forward continuation, unchanged contexts retain their cursor, and ordinary range turns do not double their endpoint. Multi-note patterns, including closed chromatic motifs, retain their existing cell stepping and anchor-based sequence progress; the final note of an arpeggio cannot override its structural anchor. Alternating contours retain their existing phase rules. The positional arpeggio phrase engine already supports shared entries within its fixed phrase phase and is unchanged.

Explicit tests exercise the reported note/string/fret/time, shared upper and lower boundaries in every scale family and key across changed CAGED positions, unchanged-range continuity, multi-note pattern-anchor safety, and notation/playback at the reported chord change.


### Pending scale turns through changes

Shared endpoint rearticulation alone does not preserve a traversal when its next note is the old range endpoint. The continuation engine now retains two pieces of scale state: whether the next step reaches that endpoint, and whether the endpoint has already sounded and the following step reverses direction. At a changed harmony/position, the former enters the corresponding new endpoint; the latter reverses before selecting the next new-scale pitch. Mid-range continuation still chooses the nearest forward pitch. Unchanged contexts keep the original cursor and endpoint rules.

This prevents the reported eight-bar A/C/E♭/F♯ Dorian chart from inserting D♭–C or C♯–B fragments before climbing. With the shown Position II/I/V/III route, the four entries are B47, C48, C48 and B47. Each region has seventeen pitches and retains its 32-note ascent/descent cycle. Broader scale/cardinality changes retain their available full range and are not forced into a restricted span.

Regression coverage compares every note of all four two-bar groups, the later E♭m7 and F♯m7 entries, and their peak times in the actual browser notation, in addition to every scale family/key/changed-position pair at pending upper and lower turns. Multi-note sequence families and positional arpeggio phrase rules are unchanged.


## Arpeggio material capped at the seventh

Positional and selected-chord arpeggios use written core tones through degree seven. Ninths, elevenths and thirteenths—including altered extensions—do not enlarge these exercise arpeggios. Altered fifths/sevenths, suspended second/fourth qualities, sixth chords and diminished sevenths keep their defining tones. Triads remain triads; add9/add11 chords reduce to their core triad; no missing seventh is invented. Repeated octave roots are deduplicated.

Scale-harmonized and core-tone-rooted stacks offer triads or seventh/four-note material only. A cell's degrees are relative to its own root: a diatonic seventh-chord cell can still contain an upper colour relative to the backing root. Chromatic approach notes remain approach notes rather than extra chord extensions. Non-heptatonic collections retain their explicit three/four-note stack terminology.

The Ninth chords material choice and 3-to-9 arpeggios exercise are removed. Saved 'extensions' material maps to 'seventh'; saved 'upperstructure' exercises map to Harmonized scale. Raw legacy material requests also cap at four harmonic tones.

Harmony's chord definitions, audio, chart symbols, chosen scale guide, fretboard voicings and positional scales retain their full content. Only exercise arpeggio material is filtered. Degree metadata may still describe a note's relationship to the full backing chord. A shared core-tone helper preserves pitch/spelling/interval alignment without mutating the source harmony.

Tests cover every chord type in twelve roots and five CAGED positions, altered/suspended/sixth/diminished qualities, extended/core chord equivalence, all positional rhythms and directions, unchanged source chord definitions, material capping, removed controls, saved-option migration, retained extended chart symbols and exercise playback.


## Harmonized-scale review

The existing generator already builds exact alternate-scale-step triads/seventh chords, uses the active scale guide rather than blindly transposing, continues by the nearest structural anchor through changes, and reverses at the usable complete-cell boundary. Those rules and the reviewed descending Am7-to-Bm7 notes remain unchanged.

The review found that whole-cell-only slot packing broke continuity for triads and for short/irregular chord durations: it left rests and restarted the next cell from its beginning. Harmonized scale in Continuous pattern now carries a zero-based cell offset. A continuing stack can span bar lines. At a context change within that stack, compare the next unplayed tone with the same ordinal of all complete directed stacks in the incoming diagram; use the nearest candidate, breaking ties by the existing directed library order. Play its remainder, then advance through that library. This preserves note phase and rhythm while all sounded notes use the incoming scale and actual CAGED frets. A change between completed cells retains the existing nearest-forward-anchor rule.

A range turn occurs after completing the last usable stack, rather than clipping a stack at the chart boundary. The opposite form uses the existing outgoing-extent rule. No fixed bar-length ascent/descent is imposed on these overlapping stacks. One-cell scope still deliberately plays a complete cell followed by space; other exercise families keep their current packing policy. The backing chart and its extensions are unchanged.

Group metadata records fragment offsets and complete cell sizes so previews identify continued material and captions count cell segments accurately. Timing guidance explains flow and adaptation instead of promising rests after every partial cell.

Independent reference tests construct theoretical scale pitches before restricting stacks to the diagram. They cover every mode, twelve roots, five shapes, triads/sevenths, both directions and all three subdivisions, with arbitrary slot splits and range turns. Additional tests cover exact mid-cell changes, mixed minor/dominant/major/harmonic-minor/pentatonic harmony with changed shapes, actual frets, and one-cell scope. Browser checks cover the written triad continuation, continuous timestamps, no unintended rests, playback across the change, and mobile width.

Three older test expectations were confirmed to fail on the pre-change source: retired ninth-material labels, retired 3-to-9 output, and old positional guidance text. They now assert the already-established seventh-chord cap, migration to harmonized scale, and current core-tone wording.
