# Validation — 17 October 2026

Project: `HACKPROJECT/HACKPROJECT.esproj`, Lens Studio 5.24.1, Spectacles target, SPECS 27 Interactive preview.

## Passed

- TypeScript compilation and runtime startup after fixing UIKit pre-initialization registration.
- SIK simulated hand pinch opens the lid. Three individual laddoo pinches remove the sweets and trigger the animated miniature reveal.
- Each of the three houses receives a pinch and displays its resident's story.
- All three gestures can be picked up, dragged into the dabba, and released; a separate lid pinch produces the matching ending.
- Chai: gathering props and extra cups. Food: shared plates. Note: balcony keepsakes. All show glowing windows and animated residents.
- An outside drop returns the note to its starting position with a retry instruction; a subsequent valid drop succeeds.
- Replay diya resets the experience. The opening and all three houses pass again after replay.
- Automatic demo: final message logged at 21:57:58.519 after startup at 21:56:41.430, approximately 77.1 seconds. Normal interactive mode restored afterward.
- Six audio WAVs verified as nonempty 44.1kHz stereo PCM16 with no clipping; see `../GeneratedSFX/audio_verification.json`. Audio tracks are wired to low-latency cues and low-power loops.
- Hindi font imported and assigned; Devanagari dialogue confirmed in runtime Text properties.
- Screenshots visually inspected: food, note, chai and automatic finale in `Evidence/`.

## Fixes made during validation

- Disabled UIKit auto-discovery before explicit runtime layout item registration.
- Reversed lid surface winding to expose its top correctly.
- Increased subtitle size and added warm outline contrast; moved the raised lid to the side to avoid covering the story.
- Used tangible target colliders for SIK ray targeting; non-drag actions fire on completed pinch so moving/disabling a target does not interrupt its release.
- Re-enabled house colliders after reveal and tightened gift drop acceptance to the dabba's local horizontal radius and height.
- Added placement pinch release/cooldown guard, visible scanning reticle, and table-relative subtitle position.

## Still requires glasses / final production work

- Actual WorldQuery physical-table hits, hand comfort, tracking stability, stereo readability, audio perception and sustained frame rate. Editor uses an explicit authored placement and does not prove real surface detection.
- Native Hindi voice recordings. Local Hindi TTS was unavailable; optional welcome/reminder/final voice inputs are provided and deliberately left unassigned.
- Visuals use lightweight articulated procedural geometry. This is a playable stylized prototype, not a photoreal scanned asset set.
- Occasional SDK cursor/fingertip batching warnings appeared in Editor; no game runtime exceptions occurred in the final interactive runs. Hardware performance has not been certified.
- Normal play is untimed and paced for reading/exploration; a 3–4 minute completion time is a design target, not a user-study measurement.

## Evidence

- `Evidence/chai-ending.png`
- `Evidence/food-ending.png`
- `Evidence/note-ending.png`
- `Evidence/demo-finale.png`
