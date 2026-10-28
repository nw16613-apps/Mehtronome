# Integrated progression options

Harmony has one Choose a progression selector, grouped into Single chord, Jazz, Modal, Parallel movements, Diatonic, Original studies, My saved charts and Working copy. The floating transport uses the same menu and selection. The separate Repertoire section, original-study selector and Load buttons are removed.

Choosing a template or original study immediately opens an editable custom working copy in the existing chart model. The original remains available and unchanged. Studies retain their descriptions and rehearsal sections. New single-chord chart is in this same chart section. The initial A Dorian two-bar chart remains the default; initial construction does not overwrite the previous working draft in browser storage.

The chart title is the single naming field. Save chart creates a new saved item; Update saved chart changes only the explicitly selected saved item. Editing a saved chart does not update its stored version automatically. After an ordinary template/study copy is edited, the menu identifies it as the current working chart. Presets and guided setups release any previously selected saved-chart association, and older template-based setups are materialized as editable copies.

Delete saved chart, Export and Import are under Manage charts. Deleting a saved item retains the working chart. Imports add copies with fresh IDs and validate before changing storage. The existing repertoire JSON format and storage key are retained, including legacy charts with different library/internal titles; a loaded working copy uses the saved item's name without rewriting storage until Update.

Template/study identifiers are UI source choices. The audio worklet still receives the existing custom-progression payload, avoiding a separate audio definition registry. The old template control remains hidden for preset/engine compatibility.

Validation covers grouped choices, editable originals, explicit saving/updating, reload, deletion, backups, invalid imports, the floating selector, playback stopping, legacy stored charts, manual CAGED routes, pattern sequencing, undo/redo, section loops, mobile widths and all four palettes. Historical browser checks were migrated from removed selectors to the unified visible menu.
