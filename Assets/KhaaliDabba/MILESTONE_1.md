# Milestone 1 — three interactive household clues

Implemented and checked in Lens Studio 5.24.1, SPECS 27 Interactive Preview, 18 October 2026.

## Experience

The lid, three laddoos and miniature reveal retain their existing flow. After the reveal, pinch the household details rather than completing house visits:

| Household | Spatial clue | Response |
| --- | --- | --- |
| Meera | Full noodle bowl, open exercise book and pencil | The bowl lifts slightly; she admits she misses home. |
| Iyer Uncle | Two chai cups and an empty chair | The second cup moves toward the spare seat; he invites you to sit. |
| Sharma Aunty | An extra plate and spoon beside a served plate | The empty place setting slides toward you; she makes room at dinner. |

A warm ring remains after a clue is noticed. Revisit freely. Upper house facades give hints without advancing discovery. After three distinct discoveries, the original gifts unlock. This milestone deliberately retains that gate; gift-specific personal consequences belong to the next milestone.

## Verification

- Forced TypeScript compilation succeeded; refreshed runtime started with no reported errors.
- SIK Preview pinches opened the lid and removed all three laddoos; clues appeared only after the miniature reveal.
- All three upper-facade house hints were reachable; visiting the houses alone left every discovery ring off and all gifts hidden.
- All three clue pinches produced the intended dialogue and persistent ring. Motion was inspected in object-framed captures and runtime transforms at two timestamps per clue.
- Repeating Meera's clue did not unlock gifts while Aunty's clue was still undiscovered.
- Both Meera → Uncle → Aunty and Aunty → Uncle → Meera discovery orders unlocked gifts correctly.
- Initial testing exposed a final-pinch carry-through into a newly enabled gift. Added a 0.6-second unlock delay; the retest retained the final clue's dialogue, kept the return ring hidden and left all three gifts available without selecting one.
- Food pickup, drag into the dabba, release and lid return reached the existing food ending and finale.
- An outside note drop restored its authored position and showed the retry instruction. A subsequent valid note drop and lid return reached the existing note ending and finale.
- Replay restored all three laddoos, cleared all discovery rings and hid clues and gifts until the next reveal.
- Existing chai consequence and automatic demo routing were preserved in source; a full chai/demo run was not repeated for this milestone.
- Visual review caught an instruction overflowing its subtitle row; shortened the new instructions and reviewed a fresh screenshot.

Editor warnings included `Node not found in the tree` while importing the evidence image and `Cannot find converter for type MarkdownAsset` while synchronizing documentation. Replay still succeeded after the documentation import. No game runtime exception was observed. A first automated drag attempt omitted the held object's identity and was rejected by the interaction tool; the correctly targeted retry passed.

## Evidence and limits

`Evidence/milestone-1-household-clues.png` is a fresh full Preview capture showing the three discovered clues and gift availability. Object-isolated before/after captures were reviewed inline during verification.

Local MCP works. Account sign-in remains unresolved; account-dependent knowledge-base, package and publishing tools were not used. This is Editor verification, not proof of physical surface placement, stereo comfort, real hand comfort, audio perception or sustained device performance.
