# Builder report: wo-gh-1, ASCII Aurora

Base pin: 7111f490472a5669f299b588b284ae72205206eb (factory base pin; repository HEAD at build time 96e61ff).

## What changed

| File | Serves |
| --- | --- |
| `package.json`, `package-lock.json` | R1: name ascii-aurora, private, type module, build script `node build.mjs`, only devDependency playwright-core 1.65.1 (pinned), no runtime dependencies |
| `build.mjs` | R1, S1: rebuilds dist/ from index.html and assets/, prints `dist size: N bytes` |
| `index.html` | R6, R7: canvas, title "ASCII Aurora", controls row (sound-toggle, activity-slider, pause-toggle), HUD dl (hud-fps, hud-letters, hud-activity, hud-elapsed), one footer anchor. Empty inline favicon (`data:,`) so the browser makes no favicon request |
| `assets/styles.css` | R2, R6, R7: fixed full viewport canvas, no scroll, translucent chips with hover/active/pressed/focus-visible/disabled states, 44 px targets, HUD top right (top left below controls at 640 px and narrower), one line footer |
| `assets/aurora.js` | R2 to R6: RAMP, AURORA_STOPS (7 stops, once), MIN_METEOR_MS = 6000, MAX_METEOR_MS = 14000, REFLECT_SCALE = 0.55; three sine centreline curtain bands with drifting rays and violet fringe; activity envelope; twinkling stars dimmed by aurora; meteors; conifer treeline 2 to 4 cells; lake with 0.8 compression, at most 2 cell wobble and per cell shimmer; one rAF loop; HUD updated every 250 ms; `window.__asciiAurora` |
| `assets/audio.js` | R8: WebAudio engine, AudioContext built only on first `start()` from the Sound click handler; detuned pad chords A2/F2/C3/G2 through a lowpass, 8 s each with 2.6 s attack and 3.2 s release overlaps; pentatonic bells (A C D E G, octaves 4 and 5) sine plus partial, exponential decay, every 2.5 to 6 s; delay 0.45 s with feedback 0.35; master gain 0.16. Off suspends the context |
| `tools/verify.mjs` | R9, S1, S5, S6: the 11 R9 assertions in order, exits 1 at the first failure; dash scan by explicit list; dash characters written as `\u` escapes |
| `tools/shots.mjs` | R10: serves dist/ (path confined to dist/), playwright-core with `CHROME`, three stills at device scale 1 after 4.5 s warm up, captures.json with measured pixel fractions from the PNGs |
| `evidence/` | R10 outputs (below) |
| `runs/wo-gh-1/evidence/*.comparison.json` | Quality Charter self comparison (no anchors in this run) |

No test was edited, skipped or deleted. Nothing outside the authorised surface was touched (README.md, brain/, design/, .openspec/ untouched).

## Verification (final tree)

- `npm install --no-audit --no-fund && npm run build` from an empty node_modules and dist: exit 0, prints `dist size: 31999 bytes`
- `node tools/verify.mjs`: `verify: all 11 checks passed`, exit 0
- `CHROME=/usr/bin/google-chrome node tools/shots.mjs` (Chrome 157.0.8103.50, headless, no GPU): wrote the three stills and evidence/captures.json, no console errors recorded
- `node --test "tests/*.test.mjs"`: `# tests 52 # pass 52 # fail 0`

Palette check result: verify step (2) `stop 0.78 = (74,222,128)`; the S5 test confirms all 7 stops match the spec exactly and that 0.78 is 74,222,128.

Attribution: the footer reads "Made with ANVIL, an open source software factory." as the only anchor, href https://anvil-landing-7x1.pages.dev (verify steps 6 and 11).

Build dist size line: `dist size: 31999 bytes`

## Scenarios

| Scenario | Status | Evidence |
| --- | --- | --- |
| S1 | RUN, pass | clean install + build exit 0, `dist size: 31999 bytes`, verify exit 0 |
| S2 | RUN, pass | evidence/stills/page-desktop.png: auroraFractionTop 0.0894 (> 0.02), nonBlackFractionBottom 0.0959 (> 0.01), horizontalOverflow false |
| S3 | RUN, pass | desktop qa samples: letters 9131 / 9158, fps 60 / 60, activity 73 / 75, elapsedSeconds 4.6 then 5.6, audioState off |
| S4 | RUN, pass | evidence/stills/page-sound.png: qaBeforeClick audioState "off", after click "on", label "Sound: On" |
| S5 | RUN, pass | verify steps 1 to 4; S5 tests reject 9 broken variants |
| S6 | RUN, pass | verify steps 10 and 11; S6 tests reject dashes in each listed file and 7 extra reference kinds, pass with dashes only in excluded paths |
| S7 | RUN, pass | evidence/stills/page-mobile.png at 390x844: horizontalOverflow false, auroraFractionTop 0.0729 (> 0.01) |

All capture values are in evidence/captures.json. The tests measure the PNGs again with their own pixel rule and pass.

## Exercised as a user (Chrome, ad hoc script outside the repo)

- Tab order: sound-toggle, activity-slider, pause-toggle, each with a visible teal focus ring (looked at the capture).
- Pause by keyboard Enter: canvas pixels identical across 1 s, label "Play"; Play resumes motion.
- Slider arrows to 10: effective activity 12 percent immediately; set to 100: 100 percent.
- Sound on, off, on: audioState on / off / on, animation kept running while sound toggled.
- 360x640: scrollWidth 360, scrollHeight 640, footer one line (44 px tall).
- Shooting star seen in a frame about 7 to 11 s in: `@` head with a diagonal `*`, `+`, `.` trail.
- prefers-reduced-motion: page opens paused on a still frame (label "Play"); motion starts only on Play.

## Unmet, unverified, open

- Audio was not listened to: headless Chrome ran it with no audio device. What was checked: the context starts in the click handler, audioState changes, nothing throws. A human should listen once for level and mood.
- The lake reflection is dim (dark teal). That follows from the spec's REFLECT_SCALE 0.55 on the same stops. The treeline colour (2,10,6) is darker than the night ground (3,7,17), so the conifers show only as a dark notch against aurora or airglow. Both follow the spec values; the gaps are recorded in the comparison files.
- design/DESIGN.md gives the treeline as `#01030a`; the spec's (2,10,6) was used. I did not change DESIGN.md.
- Interpretation choices: ELAPSED is wall time since page start and keeps counting while paused (the scene clock, meteors and envelope freeze). The audio score uses its own setTimeout scheduler; the animation has only the rAF loop. For the first few lake rows, `floor(0.8 d)` samples the mirror row itself instead of a closer one.
- The footer is 0.66rem (about 9.9 px) at 640 px and narrower so it stays one line at 360 px.
- Pixel fractions vary slightly run to run with the activity envelope and the random meteor timing.
{"model": "claude-opus-5-5"}
