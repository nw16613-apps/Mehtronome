# Harmony workflow layout

The page groups chart-wide choices before editing: progression source, chart title, chart key, new single-chord chart and the five visible save/update/delete/export/import actions. Help distinguishes automatically retained working drafts from explicitly updated named charts, and chart transposition from editing one chord root.

The sheet and editor sit side by side from 1200 px; narrower screens place the editor immediately after the sheet and loop controls. Undo/Redo stay with the sheet; Add/Duplicate/Delete/Move stay with the selected chord. The editor identifies the starting bar and, for changes within a bar, the beat. Selected chord beats have a distinct background and accessible pressed state even when neighbouring chord symbols are identical.

Duration belongs to the selected chord. Rehearsal marks are optional. The chord/scale reference is collapsible, and its former Exercise selector is labelled Highlight (Scale / Chord tones). Copy progression as text is distinct from chart backup export. Repeated audition instructions are hidden in favour of the single instruction beside the sheet.

Existing chart payloads, save/update semantics, shared loop state, audition and transposition are retained. Existing controls/listeners are moved rather than duplicated. Mobile chart buttons wrap into compact rows.

Validation covers repeated-chord selection, independent chord edits versus whole-chart transposition, duplicate/delete, rehearsal marks, saved charts and backup transfer, section loops, playback locking and four palettes at mobile/tablet/desktop sizes. Production build and chart/progression/repertoire unit tests are also checked.
