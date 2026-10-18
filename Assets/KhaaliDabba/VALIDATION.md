# Validation — current and historical checks

## Deliberate recipient and physical story pass — 18 October 2026

- Forced TypeScript compilation and refreshed runtime startup passed.
- New SIK doorstep targets were individually pinched for Meera, Uncle and Aunty. Each was reachable; recipient changes updated the name and left only the matching dotted trail enabled.
- An early lid pinch while the gift was unaddressed retained the `Who is it for?` prompt. It did not deliver the gift.
- Food→Meera, note→Aunty and chai→Uncle completed using pickup, actual drag/drop, explicit doorstep selection and lid return. The note was intentionally released outside first; it returned to its authored position and a subsequent pickup succeeded.
- Meera's book moved from local X=0.9 toward 1.35; her resident moved from study position (0.8, 0.5, 4.8) toward the meal (0.3, 0.5, 3.4). Object-framed before/after views were inspected.
- Uncle's separate chair moved from local Z=2 to 2.85. Aunty's spare place setting moved from local Z=0.1 to 0.75. Both were inspected in images and runtime transforms at two timestamps.
- The player invitation appeared at +11 seconds. The offered cup moved toward local (0, 9.5, 15), remained visible through the finale, and did not add a required action. `Evidence/a-place-for-you.png` shows “Tum bhi baitho.” and the offered cup; the image was read and visually reviewed.
- Replay hid the cup, doorstep targets and trails and restored book/chair transforms. Gift pickup worked on subsequent playthroughs, confirming the placed gift's disabled collider was restored.
- The revised automatic demo explicitly selected Uncle at 12:03:21.210, showed the player invitation at 12:03:36.212 and reached the finale at 12:03:38.640 after startup at 12:02:15.565: 83.1 seconds. Normal interactive mode was restored and saved through MCP. `Evidence/doorstep-demo-finale.png` records this run.
- `Evidence/doorstep-recipient-choice.png` records the named selection and warm trail. Current instructions are in README; earlier checks below describe previous versions.

These are Editor Preview checks. SDK batching, empty-avatar-URL and Markdown-asset converter warnings appeared during the session; no game runtime exception was observed. No unfamiliar-user usability study or hardware comfort/performance validation has been performed; no numerical judging improvement is claimed as measured.

## DJX narrative pass — 18 October 2026

Forced TypeScript compilation and refreshed runtime startup pass. This extends the earlier household-clue milestone:

- One Meera clue, with the other two undiscovered, enabled all three gifts without automatically selecting one.
- SIK pickup/drag/drop/lid return sent food to Meera. Only her plate was active during delivery. Her response preceded Aunty's acknowledgement, which preceded celebration and the finale. Runtime positions showed the initial delivery and later sharing at different timestamps.
- Exploring Meera, then Aunty, changed the pickup subtitle to `For Sharma Aunty`. The note reached Aunty's balcony first and produced her note-specific response before wider sharing.
- After replay, a single Uncle clue enabled gifts. Chai pickup named Iyer Uncle; his invitation animated from the dabba to his doorstep. Only he moved forward during the personal response. Later all three residents walked to the shared courtyard.
- Replay is hidden during the personal response, acknowledgement and early celebration, and becomes available with the final message.
- All three interactive gift paths reached the closing line. Startup remained free of game runtime exceptions. Existing SIK batching warnings about cursor/fingertip visuals still appear; on-device performance is unverified.
- `Evidence/djx-aunty-acknowledgement.png` was read and visually reviewed: Aunty's line is visible before gathering begins. `Evidence/djx-personal-chai-finale.png` records the final gathering. Full Preview and runtime-transform snapshots were inspected during the animation checks.
- The three-gift by three-resident response table exists in source; the three representative paths above were exercised. The other six combinations were not individually played end-to-end.
- The revised automatic demo completed: startup at 11:47:22.451, final line at 11:48:45.513, approximately 83.1 seconds. It visits Meera, Aunty, then Uncle and returns a chai invitation to Uncle. `demoMode` was restored to false through MCP and the project saved. `Evidence/djx-demo-finale.png` records the result. Automatic playback is editorial evidence, not proof of physical hand input; the manual SIK tests above cover input.

The most recent docs describe current behavior. Milestone 1 below and `MILESTONE_1.md` retain historical checks of the earlier three-clue gate. Device placement, stereo comfort, hand comfort, audio and sustained performance still require hardware.

## Original validation — 17 October 2026

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
