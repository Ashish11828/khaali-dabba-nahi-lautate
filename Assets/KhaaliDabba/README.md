# Khaali Dabba Nahi Lautate

A spatial Indian storytelling game for SPECS 27, authored in Lens Studio 5.24.1.

## Play

1. On glasses, look at a clear, flat table within arm's reach. Hold still, then pinch when the placement ring appears. Release before opening the dabba.
2. Target the steel lid and pinch. Read Sharma Aunty's note.
3. Pinch all three besan laddoos. The miniature mohalla rises from the empty dabba.
4. Notice a household clue: Meera's untouched noodles beside her study book, Iyer Uncle's two cups and empty chair, or Sharma Aunty's extra plate. Pinch it for a personal response and warm ring. Gifts appear after your first discovery; exploring the other clues is optional. Pinch the upper part of a house for a hint.
5. Pick up food, a note, or a chai invitation. Every gift is valid for every resident. Carry it into the dabba and release; the golden ring also provides a targeted placement action.
6. Pinch a glowing doorstep to choose the recipient. A warm dotted trail and the person's name confirm your choice. Pinch another doorstep to change it. The lid cannot send the dabba until you have chosen a person.
7. Pinch the raised lid. Meera puts her book aside, Uncle pulls the spare chair closer, or Aunty moves the extra place setting toward you. Your chosen resident responds, then Aunty acknowledges the gesture before the neighborhood celebration. A cup comes toward you: “Tum bhi baitho.” The diya appears with the closing line and starts a new playthrough.

Normal play is untimed; allow about 3–4 minutes to read and explore. SIK supplies hand targeting and pinch on glasses and mouse interaction in Editor. No eye-tracking claim is made.

## DJXHack demo

Enable `demoMode` on `KhaaliDabbaGame` for an approximately 85-second automatic story using a chai invitation for Iyer Uncle. Disable for interactive play. The interactive opening remains the primary demo: lid, three laddoos, then the miniature reveal. Demo mode is an editorial presentation, not proof of hand interaction or real table detection.

## Authoring

- `Dabba • Tabletop` is the movable content origin; local Y=0 is the tabletop.
- `Story • Instructions` holds the restrained spatial subtitle group.
- `KhaaliDabbaGame.ts` owns story state, animations, and object interactions.
- `KhaaliGeometry.ts` builds smooth lathed steel and food plus batched architectural details. Lid, doors, residents, and gifts remain articulated.
- `KhaaliDabbaPlacement.ts` uses WorldQuery horizontal surface hits at 5 Hz with stability and pinch-release guards. A horizontal hit is not semantic recognition of a table.
- `KhaaliDabbaUI.ts` owns the UIKit subtitle layout and handwritten note.
- `GeneratedSFX/` contains six original sample-free CLAD audio assets and a PCM verification report.

The Editor explicitly uses authored placement. Physical table scanning, tracking stability, hand comfort, audio latency, and sustained performance still require testing on glasses.

## Dialogue

Welcome: “Naye aaye ho na? Ghar ka bana hai. — Sharma Aunty”

Reminder: “Arre beta, khaali dabba nahi lautate!”

Closing: “Dabba khaali tha. Rishta nahi.”

Noto Sans Devanagari is imported for Hindi text. Local speech synthesis was unavailable; spoken Hindi is not included. Optional narration audio inputs allow recorded dialogue to be added without changing the story. Music and household-inspired sound effects are present.

## Validation

See `VALIDATION.md` for the checks actually completed and remaining hardware checks.
