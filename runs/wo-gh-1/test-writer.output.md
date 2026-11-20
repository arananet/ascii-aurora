# Test writer output: wo-gh-1

Spec: .openspec/specs/ascii-aurora/spec.md (S1 to S7). Framework: built in `node:test`, no added dependency. Run: `node --test "tests/*.test.mjs"`.

## Outcome

This is a re-fire. The tree at HEAD (3e8e8fc) already holds the scenario suite under tests/, written by this station in the earlier run. I reread it against the spec and kept it as is. Every scenario has named tests. The tests run the real artifacts: they read the real sources, run the real build.mjs and verify.mjs in a temp copy, and decode the real evidence PNGs. Each R9 rule also has a matching rejection case. I found nothing missing or wrong, so I added no tests and edited none. Writing a duplicate suite would only inflate the count.

## Scenario map

| Scenario | Test file | Tests |
| --- | --- | --- |
| S1 | tests/s1-build.test.mjs | package.json shape; build assembles dist/ and prints the measured byte count; build is repeatable; verify.mjs exits 0 on the real sources; verify.mjs exits non zero for 11 broken inputs (R9 items 5 to 9) and when dist/ is missing (16 tests) |
| S2 | tests/captures.test.mjs | desktop record in captures.json plus page-desktop.png re-decoded: top half aurora fraction > 0.02, bottom half non black > 0.01, no overflow, PNG 1280x800 |
| S3 | tests/captures.test.mjs | two desktop QA samples: letters >= 1500, fps >= 24, activity 1..100, elapsedSeconds delta >= 1, audioState "off" |
| S4 | tests/captures.test.mjs | sound capture: qaBeforeClick audioState "off", after the click "on", PNG 1280x800 |
| S5 | tests/s5-palette-constants.test.mjs | one AURORA_STOPS definition; exactly 7 stops equal to the spec, 0.78 = (74,222,128); exact RAMP literal; meteor and REFLECT_SCALE literals; verify.mjs rejects 9 broken variants (13 tests) |
| S6 | tests/s6-dashes-external-refs.test.mjs | no em or en dash in the 7 listed files; exactly one https reference in index.html, the attribution anchor; none under assets/; verify.mjs rejects a dash in each listed file and 7 extra or remote references; dashes only in excluded locations (runs/, .anvil-factory/, node_modules/, dist/, evidence/, README.md, packets) still pass (19 tests) |
| S7 | tests/captures.test.mjs | mobile record plus page-mobile.png re-decoded: no overflow, PNG 390x844, top half aurora fraction > 0.01 |

## Counts

- Baseline before this station: 52 tests (the existing suite, all scenario tests for this order).
- Added: 0. Edited: 0. Deleted or skipped: 0.

## Fail before build, for the right reason

- **Empty project** (only tests/ and package.json in a temp dir): 52 tests, 1 pass, 51 fail. The failures name the missing pieces: `missing artifact: index.html` (42), `missing artifact: assets/aurora.js` (4), `missing evidence/captures.json` (4). The one pass is the S1 package.json test, because the scaffold package.json already meets R1.
- **Real sources with a fake tools/verify.mjs** (`process.exit(0)`): 52 tests, 16 pass, 36 fail. Every verify rejection case fails, for example `S1: verify.mjs exits non zero when item 5: an .mp3 reference under assets/`. So a facade verifier cannot pass the suite.

## Against the current tree, and project checks

- `npm install --no-audit --no-fund && npm run build`: exit 0, prints `dist size: 31999 bytes`.
- `node tools/verify.mjs`: exit 0, `verify: all 11 checks passed`.
- `node --test "tests/*.test.mjs"`: `# tests 52`, `# pass 52`, `# fail 0`, `# skipped 0`.

## Not covered, and why

- S2, S3, S4 and S7 read evidence/ written by tools/shots.mjs with a system Chrome. The tests check the files that are committed. They do not launch a browser, because the spec makes captures evidence and never a check. Fresh evidence depends on the builder re-running shots.mjs.
- The spec gives no scenario for these bars, so no test covers them: grid columns, horizon percent, fringe colour, treeline height, wobble bound, meteor lifetime, chord hold, master gain, delay values and focus states. The spec writer flagged this as open point 2.
{"model": "claude-opus-5-5"}
