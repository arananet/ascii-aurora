# Builder report: wo-gh-1, ASCII Aurora

Base pin: 7111f490472a5669f299b588b284ae72205206eb (factory base pin; repository HEAD at build time 3e8e8fc).

## Outcome of this attempt

This is a re-fire. HEAD already held the full implementation from the earlier builder attempt of this order. I reread it against the spec R1 to R11 and the test suite, and found no spec gap that needed a code change. So I kept the sources as they are. On the final tree I re-ran the project checks, the suite and the capture tool. The only files this attempt regenerated are the evidence files (stills and captures.json) and the measured numbers in runs/wo-gh-1/evidence/*.comparison.json.

## What is in the tree, and the requirement each file serves

| File | Serves |
| --- | --- |
| `package.json`, `package-lock.json` | R1: name ascii-aurora, private, type module, build script `node build.mjs`, the only devDependency is playwright-core 1.65.1 (pinned), no runtime dependencies |
| `build.mjs` | R1, S1: rebuilds dist/ from index.html and assets/ and prints `dist size: N bytes` |
| `index.html` | R6, R7: the canvas, the title "ASCII Aurora", the controls row (sound-toggle, activity-slider, pause-toggle), the HUD dl (hud-fps, hud-letters, hud-activity, hud-elapsed) and one footer anchor. The favicon is an empty inline `data:,` so no network request is made |
| `assets/styles.css` | R2, R6, R7: a fixed full viewport canvas, no scrolling, translucent chips with hover, active, pressed, focus-visible and disabled states, 44 px targets, the HUD top right (moved top left under the controls at 640 px and narrower), a one line footer |
| `assets/aurora.js` | R2 to R6: RAMP, AURORA_STOPS (7 stops, defined once), MIN_METEOR_MS = 6000, MAX_METEOR_MS = 14000, REFLECT_SCALE = 0.55; three curtain bands with sine centrelines, drifting rays and a violet fringe; the activity envelope; twinkling stars dimmed by the aurora; shooting stars living 900 ms; a conifer treeline 2 to 4 cells tall; the lake with 0.8 compression, a wobble of at most 2 cells and per cell shimmer; one rAF loop; the HUD refreshed every 250 ms; `window.__asciiAurora` |
| `assets/audio.js` | R8: WebAudio engine. The AudioContext is built only on the first `start()`, called from the Sound click handler. Detuned pad chords on A2, F2, C3 and G2 go through a lowpass, 8 s each, with overlapping 2.6 s attacks and 3.2 s releases. Pentatonic bells (A C D E G, octaves 4 and 5) are a sine plus a partial with exponential decay, every 2.5 to 6 s. Delay 0.45 s, feedback 0.35, master gain 0.16. Turning Sound off suspends the context |
| `tools/verify.mjs` | R9, S1, S5, S6: the 11 R9 assertions in order, exit 1 at the first failure. The dash scan uses an explicit file list, and the dash characters are written as `\u` escapes |
| `tools/shots.mjs` | R10: serves dist/ (paths confined to dist/) and drives playwright-core with `CHROME`. Takes three stills at device scale 1 after a 4.5 s warm up, then writes captures.json with pixel fractions measured from the PNGs |
| `evidence/` | R10 outputs, regenerated in this attempt |
| `runs/wo-gh-1/evidence/*.comparison.json` | Quality Charter self comparison (this run has no anchors); measured values updated to this attempt's captures |

No test was edited, skipped or deleted. Nothing outside the authorised surface was touched. README.md, brain/, design/ and .openspec/ are unchanged.

## Verification (final tree, this attempt)

- `npm install --no-audit --no-fund && npm run build`: exit 0, prints `dist size: 31999 bytes`
- `node tools/verify.mjs`: all 11 items `ok`, last line `verify: all 11 checks passed`, exit 0
- `CHROME=/usr/bin/google-chrome node tools/shots.mjs` (Google Chrome 157.0.8103.50, headless, no GPU): exit 0, last line `shots: wrote evidence/captures.json`, no console errors recorded
- `node --test "tests/*.test.mjs"`: `# tests 52`, `# pass 52`, `# fail 0`, `# skipped 0`

Palette check result: verify item (2) prints `stop 0.78 = (74,222,128)`. The S5 tests confirm that all 7 stops match the spec exactly and that the 0.78 stop is 74,222,128.

Attribution: the footer reads "Made with ANVIL, an open source software factory." It is the only anchor on the page, with href https://anvil-landing-7x1.pages.dev (verify items 6 and 11).

Build dist size line: `dist size: 31999 bytes`

## Scenarios

| Scenario | Status | Evidence |
| --- | --- | --- |
| S1 | RUN, pass | install and build exit 0, `dist size: 31999 bytes`, verify exit 0 |
| S2 | RUN, pass | evidence/stills/page-desktop.png: auroraFractionTop 0.0893 (> 0.02), nonBlackFractionBottom 0.0958 (> 0.01), horizontalOverflow false |
| S3 | RUN, pass | desktop QA samples: letters 9132 then 9154, fps 60 then 60, activity 73 then 75, elapsedSeconds 4.8 then 5.8 (delta 1.0), audioState off |
| S4 | RUN, pass | evidence/stills/page-sound.png: qaBeforeClick audioState "off", after the click "on", label "Sound: On" |
| S5 | RUN, pass | verify items 1 to 4; the S5 tests reject 9 broken variants |
| S6 | RUN, pass | verify items 10 and 11; the S6 tests reject a dash in each listed file and 7 kinds of extra reference, and still pass when dashes appear only in excluded paths |
| S7 | RUN, pass | evidence/stills/page-mobile.png at 390x844: horizontalOverflow false, auroraFractionTop 0.0725 (> 0.01) |

Every capture value is in evidence/captures.json. The capture tests decode the PNGs again, apply their own pixel rule and pass.

## Visual check

I looked at page-desktop.png and page-mobile.png from this attempt. Teal and green curtains with violet fringes fill the sky. The lake holds a dimmer, wobbling reflection. The title, the chips and the HUD sit in the top band above the horizon. The footer is one line over the darkest water. Nothing overflows at 390 px.

## Exercised as a user

The behaviour checks below were done in the earlier builder attempt of this order with an ad hoc Chrome script, on the same sources. They were not re-run in this attempt:

- Tab order is sound-toggle, activity-slider, pause-toggle, and each shows a visible teal focus ring.
- Pause from the keyboard freezes the canvas, and Play resumes it.
- The slider changes effective activity immediately.
- Sound toggled on, off, on gives audioState on, off, on, and the animation keeps running throughout.
- At 360x640 there is no scroll.
- A shooting star appears about 7 to 11 s in.
- Under reduced motion the page opens paused on a still frame.

## Unmet, unverified, open

- Nobody has listened to the audio. Headless Chrome has no audio device. What was checked: the context is created in the click handler, audioState changes, and nothing throws. A human should listen once for level and mood.
- The lake reflection is dim, dark teal at most. That follows from the spec's REFLECT_SCALE 0.55 on the same stops.
- The treeline colour (2,10,6) is darker than the night ground (3,7,17). The conifers therefore show only as a dark notch against aurora or airglow. Both values come from the spec, and the gaps are recorded in the comparison files.
- design/DESIGN.md gives the treeline as `#01030a`; the code uses the spec's (2,10,6). DESIGN.md is unchanged.
- Choices the spec left open:
  - ELAPSED is wall time since page start and keeps counting while paused. The scene clock, meteors and envelope freeze.
  - The audio score uses its own setTimeout scheduler; the animation has only the rAF loop.
  - For the first few lake rows, `floor(0.8 d)` samples the mirror row itself rather than a closer one.
- At 640 px and narrower the footer is 0.66rem (about 9.9 px), so it stays on one line at 360 px.
- The pixel fractions vary a little from run to run with the activity envelope and the random meteor timing.
{"model": "claude-opus-5-5"}
