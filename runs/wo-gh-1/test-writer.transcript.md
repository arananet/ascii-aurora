I kept the existing test suite as is and wrote my report to `runs/wo-gh-1/test-writer.output.md`. This is a re-fire: the 52 scenario tests under `tests/` from the earlier run already cover S1 to S7. I reread them against the spec and found nothing missing or wrong, so I added, edited or deleted none.

**Scenario to test map**

| Scenario | Test file | What it checks |
| --- | --- | --- |
| S1 | `tests/s1-build.test.mjs` (16 tests) | package.json; a real build of `dist/` that prints the measured byte count; a repeat build; `verify.mjs` exits 0; 12 broken inputs it must reject |
| S2 | `tests/captures.test.mjs` | desktop entry in `captures.json`, plus the colour fractions re-measured from `page-desktop.png` |
| S3 | `tests/captures.test.mjs` | the two desktop readings: letters, fps, activity, and elapsed time moving by at least 1 second |
| S4 | `tests/captures.test.mjs` | sound reads "off" before the Sound click and "on" after it |
| S5 | `tests/s5-palette-constants.test.mjs` (13 tests) | the 7 colour stops, including 0.78 = 74,222,128; the glyph ramp; the meteor and reflection constants; 9 broken variants it must reject |
| S6 | `tests/s6-dashes-external-refs.test.mjs` (19 tests) | no em or en dash in the 7 listed files; the attribution link is the only external reference; dashes in excluded folders are ignored |
| S7 | `tests/captures.test.mjs` | mobile entry, plus the colour fraction re-measured from `page-mobile.png` |

**Do the tests fail without the build?**
- **Only the tests and package.json:** 1 of 52 pass and 51 fail. Each failure names what is missing (`index.html`, `assets/aurora.js`, `evidence/captures.json`). The one pass is the package.json test, which the scaffold file already meets.
- **Real files but a `verify.mjs` that always exits 0:** 36 of 52 fail. A fake checker can't pass the suite.

**Project checks on the current tree**
- **Build:** `npm install --no-audit --no-fund && npm run build` exits 0 and prints `dist size: 31999 bytes`.
- **Verify:** `node tools/verify.mjs` exits 0 with `verify: all 11 checks passed`.
- **Tests:** `node --test "tests/*.test.mjs"` gives `# tests 52`, `# pass 52`, `# fail 0`, `# skipped 0`.

**What isn't covered**
- **Capture scenarios (S2, S3, S4, S7):** these tests read the screenshots and `captures.json` already in `evidence/`. They don't open a browser, because the spec treats captures as evidence, not a check. Fresh results need the builder to run `tools/shots.mjs` again.
- **Bars with no spec scenario:** column count, horizon position, fringe colour, treeline height, wobble, meteor lifetime, chord timing, master gain, delay values and focus states have no tests. The spec writer already flagged this as an open point for the owner.