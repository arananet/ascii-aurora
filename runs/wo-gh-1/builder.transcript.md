The ASCII Aurora build passes both project checks and all 52 tests, the captures are freshly regenerated, and the builder report is written to `runs/wo-gh-1/builder.output.md`.

The earlier attempt had already built the full page. I reread it against requirements R1 to R11 and the tests and found nothing to fix, so I changed no source code. The only files I changed are the evidence images, `evidence/captures.json`, and the measured numbers in the self-comparison files under `runs/wo-gh-1/evidence/`.

**Checks, run on the final tree:**
- **Install and build:** exits 0 and prints `dist size: 31999 bytes`.
- **`node tools/verify.mjs`:** `verify: all 11 checks passed`, including the 0.78 palette stop at `(74,222,128)`.
- **`CHROME=/usr/bin/google-chrome node tools/shots.mjs`:** wrote all three stills and `evidence/captures.json` with no console errors.
- **`node --test "tests/*.test.mjs"`:** 52 tests, 52 pass, 0 fail. I did not edit, skip or delete any test.

**Scenarios:** all seven (S1 to S7) were run and pass. From the desktop capture: aurora fraction in the top half 0.0893, non-black fraction in the bottom half 0.0958, about 9,100 letters per frame, 60 fps, and the elapsed-time samples 1 second apart. The Sound toggle went from "off" to "on". The mobile capture at 390x844 has no horizontal overflow. I looked at the desktop and mobile stills and they render as intended, footer link included.

**Not verified, or open:**
- **Audio:** nobody has listened to it, because headless Chrome has no sound device. Someone should listen once for level and mood.
- **Older checks:** the keyboard, pause, activity slider, 360 px and reduced-motion checks were done in the earlier attempt on the same code. I did not re-run them this time.
- **Lake and treeline:** the reflection is dim and the trees show only as a dark notch against the sky. Both come from values fixed in the spec.
- **Treeline colour:** `design/DESIGN.md` gives `#01030a`, but the code follows the spec's `(2,10,6)`. I left DESIGN.md unchanged.

The report contains every required literal, and none of the files I wrote contain an em or en dash.