I've written the tests for S1 to S7. All 52 fail right now, as they should before the build: each one fails because a file or the capture evidence doesn't exist yet, not because of an import or syntax error. Both project checks fail too, since the builder hasn't created anything yet.

**Files added** (under `tests/`, using Node's built-in test runner, no new dependency):
- `tests/helpers.mjs`: shared helpers. It copies the real sources into a temp folder, runs the real `build.mjs` and `tools/verify.mjs` there, and has a small PNG decoder so the tests can measure the screenshots themselves.
- `tests/s1-build.test.mjs`
- `tests/s5-palette-constants.test.mjs`
- `tests/s6-dashes-external-refs.test.mjs`
- `tests/captures.test.mjs`
- `tests/README.md`: how to run, the scenario map, and the formats the tests expect.

Run them with `node --test "tests/*.test.mjs"`.

**Scenario to test**

| Scenario | Tests |
| --- | --- |
| S1 | `s1-build`: checks `package.json` (name, private, module type, build script, `playwright-core` as the only devDependency, no runtime dependencies). Runs the real build in a temp copy: `dist/` holds the four files, the size it prints equals the measured `dist/` size, and a second build also works. `verify.mjs` exits 0 on the real sources, and exits non-zero for 12 broken inputs covering R9 items 5, 6, 7, 8 and 9. |
| S2 | `captures` "S2:": the desktop record in `captures.json` passes the thresholds, the PNG is exactly 1280x800, and the tests decode the PNG and measure the top and bottom halves themselves. |
| S3 | `captures` "S3:": two desktop QA samples with letters at least 1500, fps at least 24, activity between 1 and 100, elapsed time moving by at least 1 second, and sound off. |
| S4 | `captures` "S4:": the sound capture reads "off" before the click and "on" after it. |
| S5 | `s5-palette-constants`: `AURORA_STOPS` is defined once with exactly the 7 spec stops (0.78 is 74,222,128), the exact `RAMP` literal, and the meteor and reflection constants. `verify.mjs` must reject 9 broken versions of these (8 or 6 stops, a stop moved, a wrong value, a second definition, and so on). |
| S6 | `s6-dashes-external-refs`: no em or en dash in the 7 listed files, one URL in `index.html` (the attribution link, the only anchor), and none under `assets/`. `verify.mjs` must reject a dash in each listed file, an en dash, and 7 kinds of extra external reference. It must still pass when dashes appear only in excluded places (`runs/`, `.anvil-factory/`, `node_modules/`, `dist/`, `evidence/`, `README.md`, packet files). |
| S7 | `captures` "S7:": the mobile record shows no horizontal overflow and an aurora fraction above 0.01, the PNG is exactly 390x844, and the tests measure the pixels themselves. |

**Counts:** there were no tests before (0, no test layout existed). I added 52 and edited or removed none.

**Before-build result:** `# tests 52 # pass 0 # fail 52`. The causes: 42 missing `index.html`, 4 missing `assets/aurora.js`, 1 missing `package.json`, 1 missing `assets/`, and 4 missing `evidence/captures.json`. The full log is at `/tmp/tw-run.log`.

**Project checks now:**
- `npm install --no-audit --no-fund && npm run build` exits 254 (`Could not read package.json`).
- `node tools/verify.mjs` exits 1 (`Cannot find module .../tools/verify.mjs`).

**Things the builder needs to know:**
- **Coverage gaps:** I didn't leave any scenario out. S2, S3, S4 and S7 depend on `tools/shots.mjs` having produced `evidence/`, and Chrome is available here at `CHROME=/usr/bin/google-chrome`. If the captures end up NOT RUN, those four tests stay failing rather than being skipped. Neither project check runs this test suite.
- **Pixel rule:** the screenshot pixels are measured with my own colour rule, not the capture tool's, so made-up numbers in `captures.json` won't pass. I checked the decoder and the rule against a known Chrome screenshot and got the exact expected fractions.
- **Formats I had to choose:** the spec doesn't fix these, so the tests set them (all written down in `tests/README.md`):
  - The fields in `captures.json`: `name`, `file`, `viewport`, `title`, `horizontalOverflow`, `auroraFractionTop`, `nonBlackFractionBottom`, `qa[]`, and `qaBeforeClick` for the sound capture.
  - Screenshots taken at device scale factor 1.
  - `verify.mjs` checks `dist/` as the build left it and does not rebuild it.
  - The build prints the word "bytes" and the total byte size of `dist/` as an integer.
  - The colour stops are written as decimal numbers.
{"model": "claude-opus-5-5"}
