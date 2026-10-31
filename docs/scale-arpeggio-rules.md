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
| Positional arpeggio | Up to nine consecutive core chord-tone pitches, ascending and descending without repeating endpoints, at every rhythm | Phrase ordinal phase; nearest fitting window at a context change |
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

Material is hidden because this exercise is neither a stacked chord nor an arpeggio. All subdivisions retain these full-range traversal rules. Triplets add no overlapping runs or padding. The low-level One run per chord API retains the ordinary unpadded traversal. One run per chord continues to the next range boundary and leaves unused slot time as rests. Saved exercise options and CAGED captions support the new study. The default exercise remains Positional arpeggio.

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



## Eighth/sixteenth scale form boundaries through position changes

The reported A Dorian eighth-note I → II → III → IV chart exposed a lost traversal step. Bar 1 played A45–A57; entering Position II preserved the accepted nearby B59, but its local pitch index was one step behind the form’s elapsed subdivision. After bar 2 ended on B71, the old generator still treated bar 3 as ascending: C72–D74–E76–F♯78 before reversing. Bar 3 must instead begin the new descending form directly on Position III’s upper F♯78 (high E, fret 14). B-string fret 13 is C72 and is not this shape’s highest note.

Continuous eighth/sixteenth positional scales now retain a separate count of attacks remaining in the current form, initially the available pitch count minus one. A nearest-pitch entry at a chord/position change preserves that count. When it reaches zero, enter the opposite form at the incoming position’s actual upper/lower boundary. For the standard 17-pitch range, this is sixteen attacks per direction: two bars at eighths or one bar at sixteenths. Different ranges retain their actual available lengths rather than assuming seventeen pitches universally. An actual earlier range limit can still force a turn, and its progress is recalculated from the new directed range. Ordinary unchanged-context turns skip an already sounded endpoint; changed contexts retain the established shared-entry exception.

The accepted first two bars remain A–B–C–D–E–F♯–G–A and B–C–D–E–F♯–G–A–B. Bar 3 is now F♯–E–D–C–B–A–G–F♯. Each chart slot keeps its assigned CAGED position. The low-level one-run API, arpeggios and other sequence families keep their existing policies. Triplets now share the same positional traversal rules as straight subdivisions.

Regression checks cover the exact screenshot’s MIDI pitches, note names, high-E fret 14 at beat 8, notation/TAB, playback and linked Position III diagram; the original triplet I–II–III–IV entry; mirrored and unchanged-context traversals; nearest entries and scheduled boundary transitions across all scale families, keys and shapes; shared boundaries without doubled endpoints; and the earlier complete parallel-minor chart.




## Positional arpeggio starting-note variations

Pattern start offers Shape default plus the first occurrence of each chord-degree role in the starting direction (at most four tones), labelled with degree/name/octave/string/fret. Higher-octave duplicates are hidden; older saved higher occurrences migrate to the first occurrence of the same degree. It rotates the existing cycle without moving its window or altering its note order, range, endpoint policy or duration. Starting direction orders the choices from the starting edge inward. With nine pitches, the sixteen-attack cycle still takes eight beats; choosing the second note rotates by one eighth note. The control changes where the ascent/descent lands within the bars, not the underlying pattern.

The selected written chord-degree role and occurrence are retained through chord/position changes: a minor third follows the major third on a major chord, and altered fifths/sevenths follow the new chord quality. Occurrences are counted from the selected direction’s starting edge. Existing nearest-window selection retains the original unrotated reference line, so selecting a starting note rotates the same windows rather than choosing different ranges. Unavailable occurrences use the nearest octave of that degree; absent degrees (such as a third on a suspended chord) use the shape default, with explicit guidance. Pattern start is saved/restored with exercise options/history and applies to every rhythm. All subdivisions use the same rotation; no special triplet Phrase selector remains.

## Continuous exercises and positional scale starts

Scope is removed from the exercise interface. Restored short-cell/one-run presets normalize to continuous/full playback; low-level generators retain their existing short-cell API for compatibility. Pattern start is shared by positional scales and arpeggios, offering Shape default and structural chord degrees (root, third, fifth, seventh or the chord’s actual suspended/sixth tones).

For scales at every subdivision, the selected degree sets the initial traversal entry. The existing continuity engine then carries the scale across bars, modes and CAGED changes without restarting at each chord. The initial leg ends at the ordinary range boundary; subsequent turns retain the established behavior. Eighths, sixteenths and triplets share this rule and the same available degree starts.

## Continuous groups of three and four

Scale groups use consecutive scale steps with adjacent anchors: 1–2–3 / 2–3–4, or 1–2–3–4 / 2–3–4–5. Matching arpeggio groups use consecutive selected-chord core pitches through the seventh: for Am7, A–C–E / C–E–G, or A–C–E–G / C–E–G–A. Triads wrap through their actual tones across octaves, without inventing a seventh. Extensions remain in backing/chart symbols but are excluded from these arpeggio libraries.

All four group studies stream cells through bar/slot boundaries. A split inside a group retains its note ordinal and adapts the remaining tones to the closest fitting incoming group. Complete cells are generated from theoretical scale/chord steps before restricting them to the selected CAGED board; missing interior tones do not get compressed away. After the last complete fitting group, the sequence switches to its descending/ascending counterpart. Rhythm controls attack spacing, not group size. Positional scale and arpeggio phrase engines are unchanged.

## Natural positional triplets

Positional scales and arpeggios primarily teach CAGED positions. Triplets use the same pitch order, span, Pattern start semantics and endpoint policy as eighths and sixteenths. Only timing changes: three attacks per beat. Do not add overlapping runs, neighbour turns, repeated padding notes or bar-aligned restarts. Turns fall naturally inside beats and across bar lines.

Scales retain every distinct available scale pitch. Arpeggios retain the established span of up to nine consecutive core chord-tone pitches, with smaller spans for shorter chords. A nine-pitch arpeggio has sixteen attacks per cycle, taking 16/3 beats at triplets. Starting direction mirrors traversal. Ordinary turns play the endpoint once before stepping back. Incoming chords and assigned positions use the established family continuation logic.

The Phrase selector and special triplet engines are removed. Saved Balanced span, Cycling spans, Full-position runs and older numbered variations now use natural traversal, retaining an explicitly saved Pattern start and direction. Available structural degree starts no longer depend on fitting fixed-length runs. Controls retain their layout across rhythm selections.

For A Dorian Position II with the minor-third scale start, bar 1 plays C48 through G67; bar 2 continues A69, B71, C72, D74, C72, B71… rather than restarting at A-string G55. At eighths or sixteenths the same pitch stream has different bar placement.

Verification covers independent scale cycles in all catalogue modes, twelve keys, five positions and both directions; equal-note-count comparisons across rhythms, mixed chords/modes/positions and degree starts; every arpeggio chord quality; split-slot continuity; retired saved settings; exact notation timing; playback and phone layout. Existing eighth/sixteenth examples are retained. Composed triplet sequences are deferred.
