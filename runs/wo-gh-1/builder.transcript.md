ASCII Aurora is built. Both project checks pass on the final tree, and all 52 scenario tests pass, none of them changed.

**Checks I ran**
- Clean install and build (`npm install --no-audit --no-fund && npm run build`): exits 0 and prints `dist size: 31999 bytes`.
- `node tools/verify.mjs`: `verify: all 11 checks passed`.
- `node --test "tests/*.test.mjs"`: `# tests 52 # pass 52 # fail 0`.
- Captures with system Chrome 157 (headless, no GPU) wrote `evidence/stills/page-desktop.png`, `evidence/stills/page-mobile.png`, `evidence/stills/page-sound.png` and `evidence/captures.json`. All seven scenarios ran and passed:

| Capture | Aurora in top half | Bottom half | Other values |
| --- | --- | --- | --- |
| Desktop 1280x800 | 0.089 | 0.096 non black | 60 fps, about 9,100 letters, elapsed 4.6 s then 5.6 s |
| Mobile 390x844 | 0.073 | | no horizontal overflow |
| Sound 1280x800 | | | audioState "off" before the click, "on" after |

**What I tried by hand in Chrome**
- Tab moves through the three controls, each with a visible focus ring.
- Pause freezes the canvas exactly; Play resumes it.
- The Activity slider takes effect at once.
- Sound on, off, on works and the animation keeps running throughout.
- At 360 px nothing overflows.
- A shooting star appears with a diagonal trail.
- With reduced motion turned on, the page opens paused on a still frame.

**What changed while tuning**
- The first render had an almost invisible lake reflection. I added a third curtain band low in the sky and a faint glow above the treeline so the lake has something bright to reflect.
- At 360 px the footer wrapped to two lines. I shrank it to about 9.9 px at narrow widths so it stays one line, as the spec requires.
- `verify.mjs` first failed on `.wav` because a variable was named `band.waves`. I renamed it to `ripples`.

**Not verified or open**
- **Audio unheard:** headless Chrome has no audio device. I only confirmed the sound engine starts inside the click and switches state cleanly. Someone should listen once for level and mood.
- **Dim lake, faint trees:** the lake reflection is dark teal and the treeline shows only as a dark notch. Both come straight from the spec's fixed values: the 0.55 reflection scale, and a treeline colour (2,10,6) darker than the night sky.
- **Design doc mismatch:** `design/DESIGN.md` gives a different treeline colour (`#01030a`). I used the spec's value and left the design doc alone.
- **My own interpretations:**
  - ELAPSED keeps counting while paused.
  - The music runs on its own timers, separate from the single animation loop.
  - The first few lake rows sample the exact mirror row rather than one closer to the horizon.

The report is at `runs/wo-gh-1/builder.output.md` and contains every required literal. My comparison notes against the quality charter are in `runs/wo-gh-1/evidence/`.