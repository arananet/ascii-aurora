I left the spec unchanged and wrote the station output to `runs/wo-gh-1/spec-writer.output.md`.

The spec at `.openspec/specs/ascii-aurora/spec.md` was filed by the owner, and the order lists `.openspec/` as protected, so this station can't edit it. This run is a re-fire: last run's spec-writer output had been deleted from the working tree. I checked the order against the spec again and nothing had changed, so I restored that output word for word. The file now matches the last commit and has no em or en dashes.

**Requirement and scenario ids written or changed:** none. The spec stays as filed, with R1 to R11 and S1 to S7.

**What the output file contains:**
- **Coverage map:** each order clause is mapped to its requirement and the scenarios that check it. All of R1 to R11 are covered by S1 to S7.
- **Clarifications for the builder,** all taken from the order and not new requirements:
  - the files the builder may write, and the protected files it must not touch;
  - what is out of scope (deployment, merging, any backend, new dependencies, extra page copy);
  - the dash scan reads only its explicit file list;
  - captures are evidence, never a check.
- **A palette conflict, settled in favour of the spec:**
  - `design/DESIGN.md` gives the treeline as `#01030a`, but spec R4 gives (2,10,6). The builder uses (2,10,6).
  - The design files also list cyan `#22d3ee`, which is not in AURORA_STOPS. It may appear in the page controls and HUD, but not in the scene.

**Decisions for the owner:**
1. **No out-of-scope or write-set section in the spec.** The station's definition of done asks for one. The order supplies both and the output restates them, but adding them to the spec needs an owner edit.
2. **Several bars have no scenario that checks them,** so only captures and review can hold the build to them:
   - grid of at least 100 columns, horizon at 60 to 64 percent, fringe colour;
   - treeline height, wobble limit, meteor lifetime, chord hold;
   - master gain, delay settings, focus states;
   - controls and footer never covering the horizon.

   If you want hard checks, some of these (gain, delay, horizon) could be added to verify.mjs as literals, but that is a spec change.
3. **"Small", "discreet" and "translucent" have no numbers.** These describe the HUD, chips and footer. Reviewers would have to use `design/tokens.json` as the reference.
4. **S2 doesn't define "aurora colour family".** The capture tool must record the rule it uses in `captures.json`.