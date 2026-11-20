# Tests for wo-gh-1 (ASCII Aurora)

Framework: the built in Node test runner (`node:test`), no added dependency.

Run all scenario tests from the repository root:

    node --test "tests/*.test.mjs"

The capture tests read `evidence/`, so produce it first:

    npm install --no-audit --no-fund && npm run build && CHROME=/usr/bin/google-chrome node tools/shots.mjs

## Scenario map

| Scenario | File | What it exercises |
| --- | --- | --- |
| S1 | tests/s1-build.test.mjs | real package.json; real build.mjs run in a temp copy (dist/ contents, printed byte count equals the measured dist size, repeat build); real tools/verify.mjs exits 0, and exits non zero for one broken input per R9 item 5, 6, 7, 8, 9 |
| S2 | tests/captures.test.mjs | evidence/captures.json desktop record, plus the real page-desktop.png decoded and re-measured |
| S3 | tests/captures.test.mjs | desktop QA samples in captures.json (letters, fps, activity, elapsedSeconds delta) |
| S4 | tests/captures.test.mjs | sound capture QA before and after the Sound toggle click |
| S5 | tests/s5-palette-constants.test.mjs | real assets/aurora.js palette, ramp and constants; verify.mjs rejects each broken variant |
| S6 | tests/s6-dashes-external-refs.test.mjs | real authored files scanned for dashes and URLs; verify.mjs rejects a dash in each listed file and every extra external reference, and ignores excluded locations |
| S7 | tests/captures.test.mjs | evidence/captures.json mobile record, plus the real page-mobile.png decoded and re-measured |

## Contracts the tests rely on

verify.mjs: run as `node tools/verify.mjs` with the working directory at the
project root (the tests run it inside a temp copy holding index.html, assets/,
build.mjs, package.json, tools/verify.mjs, tools/shots.mjs and a built dist/).
It checks dist/ as left by the build; it does not rebuild it.

build.mjs: run as `node build.mjs`; its stdout carries the word "bytes" and the
dist size as an integer equal to the sum of the byte sizes of all files under
dist/.

evidence/captures.json written by tools/shots.mjs (screenshots at device scale
factor 1, so PNG size equals the viewport for a page that does not scroll):

    {
      "captures": [
        {
          "name": "desktop" | "mobile" | "sound",
          "file": "evidence/stills/page-desktop.png",
          "viewport": { "width": 1280, "height": 800 },
          "title": "<document.title>",
          "horizontalOverflow": false,
          "auroraFractionTop": 0.0,
          "nonBlackFractionBottom": 0.0,
          "qaBeforeClick": { ... },          // sound capture only
          "qa": [ { "fps": 0, "letters": 0, "activity": 0, "audioState": "off", "elapsedSeconds": 0 } ]
        }
      ]
    }

The desktop record holds two `qa` samples taken one second apart. Extra fields
(for example the colour family rule used) are allowed.

Independent pixel rule used by the tests when re-measuring the PNGs: aurora
colour family means g >= 60, g > r + 25 and b <= g + 20; non black means
max(r, g, b) > 30.
