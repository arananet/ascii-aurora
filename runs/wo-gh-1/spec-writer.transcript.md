I left the spec unchanged. It already exists at `.openspec/specs/ascii-aurora/spec.md`, which the order names as the spec to implement, and the order lists `.openspec/` as protected and never edited. I wrote my check of the order against it to `runs/wo-gh-1/spec-writer.output.md`.

**Requirement and scenario ids written or changed:** none.

**Coverage:** I went through the order line by line. Every clause from R1 to R11 is in the spec, and each requirement is checked by at least one of the scenarios S1 to S7. The builder report contents the order asks for ("Base pin", the S1 to S7 table, the evidence file names, `74,222,128`, the footer text and link, the dist size line) are not spec requirements. The work order's required literals cover them, and the checks gate enforces them.

**Notes for the builder, taken from the order rather than added as requirements:**
- **Write set and out of scope:** the spec doesn't state these. I copied the allowed paths, the protected paths and the out-of-scope items from the order into the output file.
- **Treeline colour:** `design/DESIGN.md` gives `#01030a` but spec R4 gives (2,10,6). The spec takes precedence, so the builder uses (2,10,6).

**Open points for the owner:**
1. The spec has no Out of scope or write set section, which this station's definition of done asks for. Adding one means editing a protected file, so it's your call.
2. Several bars are only backed by captures and review, with no scenario that tests them:
   - the grid width at 1280 px and the horizon position
   - the treeline height and the reflection wobble
   - the shooting star lifetime and the chord hold time
   - the master gain and the delay settings
   - the focus states, and the controls and footer never covering the horizon

   If you want any of these to be hard checks, the spec needs to add them.
3. "Small", "discreet" and "translucent" for the HUD, chips and footer have no sizes or opacities. Reviewers would have to judge them against `design/tokens.json`.
4. S2 and S7 don't define "aurora colour family". The capture tool should write down the rule it uses in `captures.json`.