# Task packet: reviewer-design

## Station prompt

# Reviewer Design

## Role
Judge interface output against the project's own design system: its design tokens, component and layout rules, motion rules, and quality bars.

## Inputs
- design system (tokens, rules, quality bars from design/DESIGN.md and design/tokens.json)
- interface output (HTML, React components, CSS, user-facing pages, or other interface artifacts)

## Outputs
- review (JSON format with verdict and findings)

## Rules
- Work only from the inputs listed above and the work order in the packet.
- If the project has no design system (no design/DESIGN.md), your verdict MUST be `changes_requested` with a finding stating that no design system exists for the project.
- If the project has a design system, review the interface output against:
  - Design tokens: Are the correct colors, typography, spacing values being used?
  - Component and layout rules: Do components follow the documented patterns?
  - Motion rules: Does any animation or transition follow the motion guidelines?
  - Quality bars: Does the interface meet the stated quality bars for visual hierarchy, scale contrast, spacing rhythm, and responsive behavior?
- **Authority**: The project's own design system (design/DESIGN.md, design/tokens.json) is the authority for this project. The Design knowledge section in your packet (when present) is reference material that the design system may draw from. On any conflict between the project's design system and the knowledge base, the project's design system wins. A deviation from the knowledge base alone is never a finding; a deviation from the project's design system is.
- Focus on the design system the project has defined. Do not impose external design opinions or preferences that are not documented in the project's design system.
- A design token marked as "TODO" or placeholder means the project hasn't defined that value yet. Flag missing values as findings only if the interface output actually uses undefined tokens.
- Findings should be specific and actionable: cite which quality bar was violated, which token was used incorrectly, or which rule was not followed. When referencing the Design knowledge base in a finding or suggestion, name the specific knowledge entry (e.g., "metrics-blue palette", "data-dense style", "accessibility guideline for contrast").
- Your verdict must be one of: `pass`, `fail`, or `changes_requested`.
- Produce the output as a JSON object, not as chat text.

## Output Format

For visual runs (when Quality Charter is present in your packet), return a JSON object with dual-section structure:

{
  "station": "reviewer-design",
  "verdict": "pass | fail | changes_requested",
  "compliance": {
    "verdict": "pass | fail | changes_requested",
    "findings": [
      "Design system compliance findings (tokens, rules, component patterns)"
    ]
  },
  "quality": {
    "verdict": "pass | fail | changes_requested",
    "findings": [
      "Quality findings comparing output against reference anchors and charter criteria"
    ],
    "anchor": "path/to/anchor/file or 'charter floor only' when no anchors"
  }
}

For non-visual runs (no Quality Charter in packet), return the simple structure:

{
  "station": "reviewer-design",
  "verdict": "pass | fail | changes_requested",
  "findings": [
    "Specific finding with reference to design system rule or quality bar"
  ]
}

### Dual-Section Review (Visual Runs)

For visual runs:

1. **Compliance section**: Judge design system adherence - tokens, component patterns, layout rules, motion guidelines.

2. **Quality section**: Judge visual quality by comparing the output against reference anchors and charter criteria. This is a separate judgment from compliance.
   - When reference anchors are present: Compare the output against the anchors. Name gap categories from the charter criteria (materials, light, scale, contact for physical products; stated criteria for games/illustrations).
   - When no anchors: Judge against charter floor alone.
   - Cite the anchor used in comparison or state "charter floor only" when no anchors available.

The overall verdict is the stricter of the two section verdicts. An output can pass compliance but fail quality, and such a case must be reported as changes_requested or fail at the overall level.

**Same-Subject Identity Consistency (S7)**: When the work order declares an `identity_reference` for runs producing multiple related visual outputs, the quality section may extend beyond individual anchor evaluation to include same-subject identity consistency verification across deliverable outputs. Your packet will specify this requirement when applicable. You must verify that all outputs maintain identical subject identity traits enumerated in the work order (examples for physical products: finish, detail colors, mounting or attachment, proportions and markings; stated equivalents apply for other product types). Divergence in these traits constitutes a quality failure even when each output individually meets anchor criteria. Such failures must name the specific output and trait in your findings, with ruling and evidence recorded in the quality section. This verification is part of quality section judgment, not a separate verdict.

### Quality Criteria by Product Type

When judging quality section findings, name specific criteria gaps:

**Physical products**: materials, light, contact, scale
**Games/Illustrations**: Apply the project's stated standard from the design system

The station field must equal "reviewer-design", and both the overall verdict and section verdicts must be one of pass, fail, or changes_requested.

## Examples

Example 1: No design system exists
- verdict: changes_requested
- finding: "No design system exists for this project. The project must define design/DESIGN.md and design/tokens.json before interface output can be reviewed against design standards."

Example 2: Interface violates quality bar
- verdict: changes_requested
- findings:
  * "Quality bar violation: Scale Contrast - The button text has only 2.8:1 contrast ratio against its background, failing the minimum 4.5:1 requirement stated in the quality bars."
  * "Token usage: The page uses hardcoded color '#FF5733' instead of the defined primary color token."

Example 3: Interface meets design system
- verdict: pass
- findings: (empty list)


<!-- source: design/DESIGN.md -->
## Project design

### Design tokens

```json
{
  "colors": {
    "accent": "#2dd4bf",
    "aurora-core": "#4ade80",
    "aurora-cyan": "#22d3ee",
    "aurora-peak": "#bbf7d0",
    "aurora-violet": "#a78bfa",
    "background": "#030711",
    "error": "#e2483d",
    "info": "#7fa8c9",
    "primary": "#4ade80",
    "secondary": "#0e2a3f",
    "shadow": "#01030a",
    "success": "#8fbf6a",
    "surface": "#060b18",
    "surface-raised": "#0b1526",
    "text": "#f8fafc",
    "text-secondary": "#94a3b8",
    "warning": "#ffb454"
  },
  "layout": {
    "breakpoint-desktop": "1200px",
    "breakpoint-mobile": "640px",
    "breakpoint-tablet": "900px",
    "max-width": "100%"
  },
  "motion": {
    "duration-base": "4000ms",
    "duration-fast": "900ms",
    "duration-slow": "14000ms",
    "easing-enter": "ease-out",
    "easing-exit": "ease-in",
    "easing-standard": "ease-in-out"
  },
  "spacing": {
    "scale": [
      "4px",
      "8px",
      "16px",
      "24px",
      "40px",
      "64px"
    ],
    "unit": "8px"
  },
  "typography": {
    "font-family-base": "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
    "font-family-heading": "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
    "font-family-mono": "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
    "font-size-base": "15px",
    "font-size-scale": "1.25",
    "line-height-base": "1.5",
    "line-height-heading": "1.15"
  }
}
```


## Spec

<!-- source: .openspec/specs/ascii-aurora/spec.md -->
# ASCII Aurora: an aurora borealis drawn in ASCII characters as a single static page

Status: filed for wo-gh-1
Slug: ascii-aurora

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
One static page, in English, that renders an animated aurora borealis entirely in ASCII characters in the browser: a night sky of letters, undulating teal, green and cyan aurora ribbons with vertical rays, white stars, an occasional shooting star, a dark treeline silhouette at the horizon, and a lake below that reflects the aurora with shimmer. A live HUD reports fps, letters rendered, aurora activity and elapsed time. The page also synthesises its own original ambient soundtrack with WebAudio; there are no audio files. The mood reference is the ASCII aurora renders shared by dwcminh.ascii, a Python generated aurora over a lake with live statistics and a dreamcore, liminal atmosphere. The page is the whole product: no backend, no framework, no runtime dependencies.

## Requirements

- R1, structure and build. The page sources live at the repository root: index.html, assets/styles.css, assets/aurora.js and assets/audio.js. package.json (name ascii-aurora, private, type module) declares the build script "node build.mjs" and exactly one devDependency, playwright-core, used only by the capture tooling. No runtime dependencies. The page loads no external network resources at runtime: no CDN scripts, no webfonts, no remote images, no external audio files. The single permitted external reference is the attribution link of R7, which is an anchor href and loads nothing. build.mjs assembles dist/ from index.html and assets/ and prints the dist size in bytes. The build stays: npm install, then npm run build. The built dist/ is a static site deployable to Cloudflare Pages as is; deployment itself is out of scope for this work order.

- R2, the scene and the grid. A canvas fills the viewport. The scene is a grid of monospace character cells computed from the canvas size and a fixed cell size: at a 1280 px wide viewport the grid has at least 100 columns, and the cell height keeps the monospace aspect so glyphs are not stretched. The page background is the night colour (3,7,17), the body margin is zero, and the page never scrolls, on desktop or on mobile viewports down to 360 px wide. The horizon sits at 62 percent of the grid height (between 60 and 64 percent): sky above it, lake below it. Each frame, every cell resolves to one glyph and one colour, and the frame is drawn as text on the canvas. Brightness maps to glyph density through exactly this ramp, defined once as data in assets/aurora.js: RAMP = " .':;+*x%#@" (11 glyphs, space first, @ last). The animation runs on requestAnimationFrame and targets a stable 60 fps, never running a second timer loop.

- R3, the aurora. At least two aurora curtain bands cross the sky. Each band is a centreline whose vertical position is a sum of sine waves over the column and time, so the ribbons undulate, drift and ripple. Brightness inside a band falls off with distance below its top edge, and vertical rays modulate the brightness with a higher frequency pattern over the columns that drifts with time, so rays brighten, fade and shimmer. A violet fringe colour (167,139,250) tints the topmost rows of each band. Brightness maps to colour through exactly this gradient, defined once as data in assets/aurora.js as AURORA_STOPS with exactly 7 stops: 0.00 (3,7,17); 0.20 (4,32,38); 0.40 (13,84,74); 0.60 (20,150,110); 0.78 (74,222,128); 0.90 (45,212,191); 1.00 (187,247,208). A slow activity envelope, a mix of sines with different periods, drives the effective activity between 1 and 100 percent; the envelope scales band brightness, ray contrast and band height together, so the sky breathes. The Activity slider of R6 sets the base level the envelope modulates around.

- R4, stars, shooting stars and the treeline. Stars are fixed random positions in the sky, drawn as the glyphs ".", "+" or "*" in near white (248,250,252) at low brightness, each twinkling on its own phase; aurora brightness in front of a star dims the star, never the reverse. A shooting star event spawns on a randomised interval: the constants MIN_METEOR_MS = 6000 and MAX_METEOR_MS = 14000 are defined in assets/aurora.js and the next spawn is always scheduled between them. A shooting star is a bright head glyph with a short fading trail crossing the sky diagonally and living at most about one second. The treeline is a jagged silhouette band 2 to 4 cells tall sitting on the horizon line, drawn with the glyphs "^" and "#" in the colour (2,10,6), forming conifer shapes of varying heights; it is darker than both the sky above and the lake below.

- R5, the lake reflection. Lake rows mirror the sky about the horizon with vertical compression: each lake row samples a sky row closer to the horizon than its mirror distance, so the reflection is squashed toward the horizon line. Reflected brightness is scaled by the constant REFLECT_SCALE = 0.55 defined in assets/aurora.js, reflected colours come from the same AURORA_STOPS gradient, and each lake row is offset horizontally by a slow sine wobble of at most 2 cells plus a per cell shimmer that randomly dims individual glyphs, so the reflection shimmers and never moves in lock step with the sky. The treeline has no reflection.

- R6, the HUD and the controls. The HUD is one small monospace block in a top corner, dark and translucent, with four live readouts whose values are measured, never static text: FPS (frames per second, averaged over the last 30 frames), LETTERS (the number of non space glyphs drawn in the last frame), AURORA (the current effective activity as a whole percent), and ELAPSED (mm:ss since the page started). The readout elements carry the ids hud-fps, hud-letters, hud-activity and hud-elapsed in index.html, and the values update at least twice per second. Three controls, small and discreet, in a single row of dark translucent chips at the top of the page, positioned so they never cover the horizon line: (a) a Sound toggle button with id sound-toggle, labelled "Sound: Off" while silent and "Sound: On" while playing, which starts and stops the music of R8; (b) an Activity slider with id activity-slider, labelled Activity, setting the base activity of R3 from 10 to 100, taking effect immediately; (c) a Pause/Play button with id pause-toggle that freezes and resumes the animation completely. All controls are real button and input elements with visible text labels and visible focus states, usable by touch and keyboard. The page exposes a QA state object on window.__asciiAurora with the live fields fps, letters, activity, audioState ("off" or "on") and elapsedSeconds, updated every frame or at least twice per second.

- R7, page composition and attribution. The page carries only: the canvas, the HUD of R6, the controls row of R6, a small title reading "ASCII Aurora", and exactly one footer line at the very bottom of the page reading "Made with ANVIL, an open source software factory." rendered as a link to https://anvil-landing-7x1.pages.dev. The footer sits over the darkest part of the lake, small and translucent, and never covers the horizon. No other visible copy, no images, and no other links.

- R8, the music. assets/audio.js holds an original ambient soundtrack engine synthesised entirely with WebAudio: no audio files, no samples, no streamed media, and no copyrighted material. The engine creates its AudioContext only inside the Sound toggle handler of R6, so sound never starts before a user gesture and the browser autoplay policy is honoured; toggling off suspends or closes the context and sets audioState back to "off". The score is generative and slow: pad chords built from detuned oscillators through a lowpass filter with slow attack and release, cycling through the chord roots A2 110.00 Hz, F2 87.31 Hz, C3 130.81 Hz and G2 98.00 Hz, each chord held about 8 seconds with crossfades; sparse bell tones drawn from the A minor pentatonic scale (A, C, D, E, G) in the fourth and fifth octaves, each a sine with a harmonic and an exponential decay, scheduled every 2.5 to 6 seconds; and a feedback delay (delay time 0.45 seconds, feedback 0.35) that gives the tones a liminal, backrooms space. The master gain stays at or below 0.2. The music never starts or stops the animation, and the animation never starts the music.

- R9, verification. tools/verify.mjs (plain node, no dependencies) asserts the following, exiting non zero at the first failure: (1) assets/aurora.js contains exactly one AURORA_STOPS definition holding exactly 7 stops; (2) the stop at 0.78 equals (74,222,128); (3) assets/aurora.js contains the exact ramp literal " .':;+*x%#@"; (4) assets/aurora.js contains the literals MIN_METEOR_MS = 6000, MAX_METEOR_MS = 14000 and REFLECT_SCALE = 0.55; (5) assets/audio.js contains "AudioContext" and "createOscillator", and no file under assets/ contains any of the strings ".mp3", ".wav", ".ogg" or ".m4a"; (6) index.html contains the attribution of R7 exactly once: the text "Made with ANVIL, an open source software factory." inside an anchor whose href is exactly "https://anvil-landing-7x1.pages.dev"; (7) index.html carries the four HUD ids hud-fps, hud-letters, hud-activity, hud-elapsed and the three control ids sound-toggle, activity-slider and pause-toggle; (8) assets/aurora.js contains "window.__asciiAurora"; (9) after the build, dist/index.html exists and dist/ holds index.html and the assets/ files; (10) no em dash or en dash character appears in the authored files, scanned by explicit list only: index.html, assets/styles.css, assets/aurora.js, assets/audio.js, build.mjs, tools/verify.mjs, tools/shots.mjs (README.md is operator authored and excluded; runs/, .anvil-factory/, node_modules/, dist/, .git/ and evidence/ are excluded wherever they live); (11) the only http:// or https:// reference in index.html is the single attribution href of R7, and the files under assets/ contain no http:// or https:// reference at all.

- R10, evidence captures. tools/shots.mjs serves dist/ and captures the built page with playwright-core and the system Chrome named by the CHROME environment variable: evidence/stills/page-desktop.png (1280x800, full page, after at least 4 seconds of warm up), evidence/stills/page-mobile.png (390x844, full page, after at least 4 seconds of warm up) and evidence/stills/page-sound.png (1280x800, taken after clicking the Sound toggle). It also writes evidence/captures.json recording, per capture: the viewport, the page title, whether horizontal overflow was detected, the fraction of pixels in the aurora colour family in the top half of the frame, the fraction of non black pixels in the bottom half of the frame, and the QA state read from window.__asciiAurora (fps, letters, activity, audioState, elapsedSeconds, sampled twice one second apart for the desktop capture). If Chrome cannot run, the builder records the captures as NOT RUN in its report with the tool error quoted verbatim; a capture is never fabricated.

- R11, attribution and protected files. The footer line of R7 is required on the page; it is the standing attribution the project owner ordered for every ANVIL built project. README.md is operator authored and stays untouched by the line. The project is Apache 2.0 (LICENSE). The inspiration credit for the ASCII aurora renders of dwcminh.ascii lives in the README and in brain/project.md, not on the page, whose only copy is what R7 lists.

## Scenarios

- S1: Given a clean checkout, when npm install and npm run build run, then dist/ is assembled, the build prints the dist size in bytes, and node tools/verify.mjs exits 0.
- S2: Given the built page served locally, when the desktop capture is taken after warm up, then the aurora fills the top half of the frame (aurora colour family fraction above 0.02), the lake reflection shows in the bottom half (non black fraction above 0.01), and no horizontal overflow is recorded.
- S3: Given the desktop capture, when captures.json is read, then letters is at least 1500, the averaged fps is at least 24, activity is between 1 and 100, and the two elapsedSeconds samples differ by at least 1, proving the HUD values are live.
- S4: Given the built page, when the Sound toggle is clicked in the sound capture, then window.__asciiAurora audioState reads "on" in captures.json, and it read "off" before the click.
- S5: Given the palette and constants defined in assets/aurora.js, when verify.mjs reads them, then it finds exactly 7 AURORA_STOPS stops, the 0.78 stop equal to (74,222,128), the exact ramp literal, and the meteor and reflection constants of R9.
- S6: Given the authored files listed in R9, when verify.mjs scans them, then no em dash or en dash character is present and the only external reference is the single attribution href.
- S7: Given the mobile capture at 390x844, when captures.json is read, then no horizontal overflow is recorded and the aurora colour family fraction in the top half is above 0.01.


## Diff summary


## File access allowlist

This packet may only embed content from:
- design/DESIGN.md
- design/tokens.json
- .openspec/specs/ascii-aurora/spec.md

## Work order

- id: wo-gh-1
- kind: feature
- title: Build ASCII Aurora: an aurora borealis in ASCII characters as a single static page, with live HUD and synthesised music
- source: github-issue
- description: Implement the spec in .openspec/specs/ascii-aurora/spec.md: ASCII Aurora, a single static page in English that renders an animated aurora borealis entirely in ASCII characters, with a live HUD and an original ambient soundtrack synthesised with WebAudio. Pipeline for this order is sdlc-default (see anvil.json). Mode: greenfield. Domain: static site.

Build, per the spec requirements:

R1, structure and build: page sources at the repository root (index.html, assets/styles.css, assets/aurora.js, assets/audio.js); package.json (name ascii-aurora, private, type module) with build script "node build.mjs" and exactly one devDependency, playwright-core, for the capture tooling only; no runtime dependencies; the page loads no external network resources at runtime (the only permitted external reference is the attribution anchor href of R7, which loads nothing). build.mjs assembles dist/ from index.html and assets/ and prints the dist size in bytes. dist/ is deployable to Cloudflare Pages as is; deployment is out of scope for this order.

R2, scene and grid: a canvas filling the viewport, a monospace character grid (at least 100 columns at 1280 px wide), night background (3,7,17), no scrolling, mobile down to 360 px. Horizon at 62 percent of the grid height (60 to 64 percent): sky above, lake below. Brightness maps to glyph density through the exact ramp RAMP = " .':;+*x%#@" (11 glyphs). One requestAnimationFrame loop targeting a stable 60 fps.

R3, the aurora: at least two curtain bands whose centrelines are sums of sine waves over column and time; brightness falls off below each band's top edge; vertical rays modulate brightness with a higher frequency drifting pattern; violet fringe (167,139,250) on the topmost band rows. Colour comes from AURORA_STOPS, exactly 7 stops defined once as data: 0.00 (3,7,17); 0.20 (4,32,38); 0.40 (13,84,74); 0.60 (20,150,110); 0.78 (74,222,128); 0.90 (45,212,191); 1.00 (187,247,208). A slow activity envelope (mixed sines) drives effective activity between 1 and 100 percent and scales brightness, ray contrast and band height together; the Activity slider sets the base it modulates around.

R4, stars, shooting stars, treeline: fixed random star positions drawn as ".", "+" or "*" in (248,250,252), twinkling on individual phases, dimmed by aurora in front of them. Shooting star spawns scheduled with MIN_METEOR_MS = 6000 and MAX_METEOR_MS = 14000 defined in assets/aurora.js; a bright head with a short fading diagonal trail living at most about one second. The treeline is a jagged band 2 to 4 cells tall on the horizon, glyphs "^" and "#" in colour (2,10,6), conifer shapes of varying heights.

R5, lake reflection: lake rows mirror the sky about the horizon with vertical compression toward the horizon line; reflected brightness scaled by REFLECT_SCALE = 0.55 defined in assets/aurora.js; colours from the same AURORA_STOPS; per row horizontal sine wobble of at most 2 cells plus per cell shimmer dimming; the treeline has no reflection.

R6, HUD and controls: one small dark translucent monospace HUD block in a top corner with four measured live readouts: FPS (averaged over the last 30 frames), LETTERS (non space glyphs drawn in the last frame), AURORA (effective activity, whole percent), ELAPSED (mm:ss). Element ids hud-fps, hud-letters, hud-activity, hud-elapsed; values update at least twice per second. Three controls in one row of dark translucent chips at the top, never covering the horizon: a Sound toggle button (id sound-toggle, labelled "Sound: Off" / "Sound: On"), an Activity slider (id activity-slider, labelled Activity, base activity 10 to 100, immediate effect), and a Pause/Play button (id pause-toggle) freezing and resuming the animation completely. Real button and input elements, visible labels and focus states, touch and keyboard usable. The page exposes window.__asciiAurora with live fields fps, letters, activity, audioState ("off" or "on") and elapsedSeconds.

R7, composition and attribution: only the canvas, the HUD, the controls row, a small title reading "ASCII Aurora", and exactly one footer line at the very bottom reading "Made with ANVIL, an open source software factory." as a link to https://anvil-landing-7x1.pages.dev, sitting over the darkest part of the lake and never covering the horizon. No other visible copy, no images, no other links.

R8, music: assets/audio.js synthesises an original ambient soundtrack entirely with WebAudio: no audio files, no samples, no streamed media, no copyrighted material. The AudioContext is created only inside the Sound toggle handler (no sound before a user gesture); toggling off suspends or closes it and returns audioState to "off". Generative score: pad chords from detuned oscillators through a lowpass filter, roots A2 110.00 Hz, F2 87.31 Hz, C3 130.81 Hz, G2 98.00 Hz, each held about 8 seconds with crossfades; sparse bell tones from the A minor pentatonic scale (A, C, D, E, G) in octaves 4 and 5, sine plus harmonic with exponential decay, every 2.5 to 6 seconds; a feedback delay (0.45 seconds, feedback 0.35) for the liminal space. Master gain at or below 0.2. Music and animation never start or stop each other.

R9, verification: tools/verify.mjs (plain node) asserting exactly the spec's R9 list, exiting non zero at the first failure. Its dash scan covers the authored files by explicit list only and explicitly excludes runs/, .anvil-factory/, node_modules/, dist/, .git/, evidence/ and any harness written packet wherever it lives. Its external reference check permits exactly one https reference in index.html, the attribution href, and none under assets/.

R10, evidence: tools/shots.mjs serving dist/ and capturing with playwright-core and the system Chrome named by the CHROME environment variable: evidence/stills/page-desktop.png (1280x800), evidence/stills/page-mobile.png (390x844), evidence/stills/page-sound.png (1280x800, after clicking the Sound toggle), each after at least 4 seconds of warm up, plus evidence/captures.json recording per capture the viewport, page title, horizontal overflow, aurora colour family fraction in the top half, non black fraction in the bottom half, and the window.__asciiAurora QA state (sampled twice one second apart on the desktop capture). If Chrome cannot run, record the captures NOT RUN in the builder report with the tool error quoted verbatim; never fabricate a capture.

R11, attribution: the R7 footer is required and is the standing attribution the project owner ordered for every ANVIL built project; README.md is operator authored and stays untouched. The dwcminh.ascii inspiration credit lives in the README and brain/project.md, not on the page.

Scenario accounting, required in the builder report: the builder report (runs/wo-gh-1/builder.output.md) must carry a line beginning "Base pin" carrying the full factory base pin 4675a131eb9aa88097741dc3cdc9772c3db17550, a scenario table with one line per scenario S1, S2, S3, S4, S5, S6, S7 marked RUN or NOT RUN, the evidence file names evidence/stills/page-desktop.png, evidence/stills/page-mobile.png, evidence/stills/page-sound.png and evidence/captures.json, the palette check result carrying the literal 74,222,128, the attribution literal "Made with ANVIL, an open source software factory." with its link https://anvil-landing-7x1.pages.dev, and the build's dist size line. The work order declares required_literals for these strings; a report missing any of them fails the checks gate by design.

Calibration note: max_run_tokens is 3500000 in anvil.yaml for this project. Basis: Doom Fire wo-gh-2, a one page order of the same shape carrying capture evidence, measured 3,106,260 tokens under a 3,500,000 cap and completed its build with counted reviews on its second attempt; OntoBrain wo-gh-1, an approved full gate run on this factory, measured 2,373,123 tokens total with a largest station of 856,156. A 3,500,000 cap leaves headroom above every single station measured on comparable page orders and matches the figure prescribed for this order. max_packet_tokens 48000 and max_runtime_turns 40 are the proven project values carried from doom-fire.

Authorised surface: index.html, assets/, build.mjs, package.json, package-lock.json, tools/verify.mjs, tools/shots.mjs, design/, tests/, evidence/, and the run's own records under runs/. Protected and never edited: anvil.json, anvil.yaml, .github/, .openspec/, brain/, work-orders/, tools/dispatch_station.py, tools/claude_station.py, README.md, LICENSE, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, .gitignore, BLUEPRINT.md, PIPELINES.md, status/, OPERATOR-NOTES.md.

Guardrails: no new npm dependencies beyond playwright-core as a devDependency; the build stays npm install then npm run build; the checks in anvil.json run without a GPU; rendered captures are evidence, never a check; no em dash or en dash character in any produced authored file; each reviewer writes its review to the authoritative review file named in its packet, and prose outside that file is not a review. This run merges nothing and deploys nothing; the result stops at the human gate.

GitHub issue: https://github.com/arananet/ascii-aurora/issues/1
- risk_hints: 
- status: new

## Loopback feedback (attempt 3 of 3)

This is a re-review. The previous attempt was sent back by checks-gate to builder. Judge the work as it is now, and check that each finding below is resolved; do not pass a finding that is still open.

Reason: Gate checks failed; artifact validation: Builder report artifact runs/wo-gh-1/builder.output.md is missing. Required literal not found in full in the builder report: 4675a131eb9aa88097741dc3cdc9772c3db17550 Required literal not found in full in the builder report: Base pin

- # Checks Gate: pre-review
  Basis: builder_delta
  Attempt: 2
  
  # Check Commands
  ## Command 1: npm install --no-audit --no-fund && npm run build
  Exit code: 254
  Output:
  ```
  npm error code ENOENT
  npm error syscall open
  npm error path /home/runner/work/ascii-aurora/ascii-aurora/package.json
  npm error errno -2
  npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/home/runner/work/ascii-aurora/ascii-aurora/package.json'
  npm error enoent This is related to npm not being able to find a file.
  npm error enoent
  npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-11-20T06_12_51_759Z-debug-0.log
  
  ```
  
  ## Command 2: node tools/verify.mjs
  Exit code: 1
  Output:
  ```
  node:internal/modules/cjs/loader:1433
    throw err;
    ^
  
  Error: Cannot find module '/home/runner/work/ascii-aurora/ascii-aurora/tools/verify.mjs'
      at Function._resolveFilename (node:internal/modules/cjs/loader:1430:15)
      at defaultResolveImpl (node:internal/modules/cjs/loader:1040:19)
      at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1045:22)
      at Function._load (node:internal/modules/cjs/loader:1216:25)
      at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
      at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
      at node:internal/main/run_main_module:36:49 {
    code: 'MODULE_NOT_FOUND',
    requireStack: []
  }
  
  Node.js v22.23.4
  
  ```

## Craft skills

Curated craft guidance resolved for this station and this work order. Order of authority: the work order and its spec, then the project design system and decisions, then promoted practices, then these skills. Where a skill conflicts with any of those, the skill yields. Apply what fits the work in front of you; a skill is a bar to meet, not a checklist to recite.

### Skill: design-md

A DESIGN.md is a plain text design system document at the project root: how the project looks and feels, written for agents to read. AGENTS.md says how to build; DESIGN.md says how it should look. In this factory's authority order a project DESIGN.md is part of the project design system, so it beats every skill, including this one. interface-design teaches how to design; this skill teaches how to work with the document that records the design.

**When the project has a DESIGN.md**
- Read it before designing or building, all of it, and build from its tokens: colors, type, spacing, shapes, components and their states. Where it is silent, interface-design fills the gap; where it speaks, it wins.
- Never improvise a token the document already defines, and never copy another brand's DESIGN.md over the project's own. A named brand file is a reference for format and depth only, unless the work order itself names that brand as the design anchor.
- When the built page and the document disagree, the document is the bug report: fix the page, or record the intended change by updating the document in the same change. Never drift silently.

**When a visual project has none, draft one**
- Draft DESIGN.md at the project root from the project's real decisions (the brief, the brain, the tokens already in code), in the Stitch format the awesome-design-md collection uses: Overview; Colors (brand and accent, surface, text, semantic); Typography (families, hierarchy, principles); Layout (spacing system, grid and container, responsive strategy, breakpoints, touch targets); Elevation and depth; Shapes (radius scale, image geometry); Components (buttons, cards, inputs, navigation, signature components, each with states); Do and Don't lists.
- Write values, not adjectives: hex colors, pixel sizes, ratios and named rules an agent can check. Mark anything not yet decided as a placeholder instead of inventing a decision.
- A drafted DESIGN.md is a proposal until the project adopts it; say so in the report. Do not draft one for a one-off page the project will not revisit.

**Reviewing against it**
- reviewer-design: check the captures against the document section by section (colors, typography, layout, components, the Don't list) and cite the section in each finding.
- A page that follows its DESIGN.md and still looks wrong is a document problem: report it as one. Do not fail the builder for obeying the system of record.

The format and the worked examples come from VoltAgent's awesome-design-md collection (MIT), which holds a DESIGN.md extracted from more than eighty production websites. The collection is referenced as the format reference, not vendored: its files are other brands' design systems, and copying one in as a factory default would fight every project's own system.

### Skill: explainer-video

One idea, one short video, two layers. The content method governs what each scene's animation must obey; the production pipeline governs how the video is made. They compose: the pipeline renders what the method specifies, and the method alone is enough when a capable model renders the animation from one prompt. This skill is for the explainer format only: media-production remains the general media skill (quality bar, inspection, delivery, provenance) and applies alongside it. Where the two overlap, this skill states the format rules and media-production states everything else.

**Inputs**
- A text that has to be visualized (a script, a narration, a section of an article), or simply a concept to explain. Paste the whole text into the prompt; do not summarize it first.
- The output is a short video that explains one idea. If the text carries several ideas, split it and make one video per idea.

**The prompt (content method)**
Paste this block to a capable model, with the text or concept where marked. This layer is model-agnostic: any model that can build and render the animation from one prompt can run it, and the skill names no model for it.

```
Turn the text below into a short animated explainer video.

Style: flat, minimal 2D animation on a black background. Build it from recurring simple elements: circles and dots, thin lines, simple icons. On-screen labels are large, bold and short. Subtitles carrying the narration run under the animation.

Follow these instructions, in order:
1. First propose one visual action per block of the text, as a short list. Build the animation only after that, from the list.
2. Use at most four words per scene on screen, apart from the subtitles.
3. Turn ideas into actions: show things happening, not concepts sitting still.
4. Draw the analogies in the script literally. If the text says "a needle in a haystack", draw an actual needle in hay.
5. Show magnitudes with scale, and focus on what matters.
6. Keep elements across scenes, so the viewer sees how they transform.
7. Synchronize each key action with the corresponding spoken word.
8. Leave a clear final image at the end of each scene, and hold it.

Text to visualize:
[paste the text, or state the concept to explain]
```

**The review point**
- The proposal list from instruction 1 is the checkpoint. Read it before the build starts: one action per block, each action drawable, no block skipped, no action that needs more than four on-screen words. Correct the list, not the finished video.
- Record the proposal list with the station output, so a reviewer can check the video against what was proposed.

**Production pipeline**
When the video is produced as a repeatable line rather than a single generation, build the factory once and run every video through it, in this order:
1. Set up: install Claude Code and have it prepare Node and FFmpeg.
2. Voice: get an ElevenLabs API key, so the videos have voice.
3. References: feed it reference videos, the ones whose result you want to match, so it knows what to aim at. Reject references that do not match the target.
4. Engine: have it build an engine with HyperFrames that draws each frame with code and assembles them into a video.
5. Rules from references: have it extract the rules from those reference videos: how they hook in the first second, when scenes change, where each sound hit lands.
6. Review loop: review every video and correct what fails. The named failure modes are six-fingered hands, eyes leaving the face, and subtitles arriving late. Loop until it comes out right the first time.

**Motion techniques (hard requirement, both layers)**
Scenes draw and build themselves, not by camera movement over a finished image. Strokes draw on along their path (SVG stroke-dashoffset or canvas equivalent); elements build one at a time in narration order, outline before fill; lines (cables, trails, timelines) trace themselves. Time it from the words: transcribe the narration locally (faster-whisper) and land each draw-on on the word that names it. A generated still is look and layout reference, or background only under drawn foreground action; pan or zoom (Ken Burns) over a full-frame still as primary motion fails this skill.

**Check the result against the method**
- Scenes carry at most four words on screen besides the subtitles; labels are large and bold.
- Analogies are drawn literally; magnitudes are shown by scale; the same elements persist and transform across scenes instead of being replaced.
- Key actions land on the spoken word they belong to, and every scene ends on a clear final image that holds.
- On pipeline output: voice is present, subtitles land on time, and hands, eyes and faces survive inspection.

**Provenance**
- Content method by Alan Daitch (@alandaitch), taught in an Instagram reel published around 2026-11-03: https://www.instagram.com/reel/DfSzHquzV1v/
- Extracted from the video itself; the full prompt lives in its comments, which were not accessible, so the skill carries the method as spoken and shown on screen. The model named in the reel could not be verified, so the content layer names no model.
- Production pipeline from the reel "Cómo montar tu fábrica de reels con Claude code" by @unminutodeporques (Un minuto de porqués), published 2026-11-10: https://www.instagram.com/reel/DfkY1E1AYW_/
- Also extracted from the video itself; the tool names (Claude Code, ElevenLabs, HyperFrames, FFmpeg) were confirmed from on-screen text. The reference-rules document shown was not legible, so the only rules claimed from it are the three it names: the first-second hook, scene-change timing and sound-hit placement. The account sells a packaged folder; this skill does not depend on it.
- Motion layer (2026-11-15), restated, nothing copied or vendored: draw-on mechanics from iart-ai/explainer-video-skills (MIT); word cueing from owlinthebarnai/video-studio-kit (no license file; technique only); frame-deterministic drawing from illodev/drawn-by-code (MIT).

### Skill: image-to-code

This skill applies when the work order supplies the visual target as images: owner reference photographs, screenshots, mockups, or an approved generated image pack (in this factory, art generated first and approved before the line integrates it). The reference is the visual contract. interface-design still governs where the reference is silent; the spec governs what is built.

**Analyze before coding**
- Treat each reference as a specification, not a mood. Extract, in writing, before any code: the readable text exactly as shown (headlines, labels, button text); the typography (families or their character, size and weight relationships, line counts, alignment); the spacing logic (gaps between headline, text and actions, card padding, gutters, section cadence); the colors (background, panels, accent, text hierarchy, borders, image treatment); the components (button shapes and hierarchy, cards, dividers, radius, shadows); the layout structure and section order.
- Work section by section from large, readable references. If a detail is too small or unclear to extract, say so and resolve it from a closer reference or a fresh generated detail image. Never guess a label, a number or a color the reference does not show.

**Implement without drift**
- Build the extracted system, not a reinterpretation: preserve layout logic, spacing rhythm, section order, typography mood and component family. Do not simplify distinctive sections into generic rows, compress generous spacing into dense layout, or replace strong type with a plain hierarchy.
- One extracted system across the whole page: no per-section palettes and no second design language halfway down.
- Resolve missing details in this order: the visible design language, the layout and spacing logic, the component family, the mood; only then the most implementation-friendly faithful choice. Record each resolution the reference forced you to invent.

**Verify against the reference**
- Render the build and place captures beside the reference at the same widths. Compare text, type scale, spacing, color and components section by section; name every gap plainly in the report and fix what the order's budget allows, largest gap first.
- The goal is faithful translation into real, working frontend: not a pixel-perfect trace, and never the reference image pasted in as the page. Do not lift the reference's photographs, logos or copy into the product unless the work order supplies them as the project's own material.

Adaptation note: upstream (image-to-code, in Leonxlnx/imagegen-skills) is written for an agent that generates the design images itself inside Codex. In this factory the images arrive with the work order or from the approved pack, so this entry carries its analysis, extraction and anti-drift discipline and drops the generation-side rules. The verbatim upstream text is vendored under third_party/image-to-code/.

### Skill: web-design-guidelines

Audit only. Judge the built files against the rules below and report findings grouped by file, one per line, as `path:line - finding`. State the issue and the location; skip explanation unless the fix is not obvious. A file with no findings is marked pass. Do not rewrite the page; the builder fixes findings on the next round.

The rules are distilled from Vercel's Web Interface Guidelines (command.md, vendored pinned under third_party/web-interface-guidelines/, MIT), so a verdict is reproducible instead of fetched fresh at review time. They extend web-engineering, which the builder already holds; where a rule repeats it, treat the repetition as the audit form of the same bar. Framework wording is translated: a rule written for React components applies to whatever builds the same element.

**Accessibility and focus**
- Icon-only buttons carry an aria-label; decorative icons are aria-hidden. Form controls have a label or aria-label. Async updates (toasts, validation) use aria-live polite.
- Semantic elements before ARIA: button for actions, a for navigation, never a div with a click handler. Headings in order h1 to h6; a skip link reaches main content; anchored headings have scroll-margin-top.
- Every interactive element shows a visible focus, :focus-visible rather than :focus, never an outline removed without a replacement. Compound controls group focus with :focus-within. Sticky bars never cover the focused element.

**Forms**
- Inputs have autocomplete and a meaningful name, the correct type and inputmode. Paste is never blocked. Labels are clickable. Spellcheck is off on emails, codes and usernames.
- The submit button stays enabled until the request starts, then shows progress. Errors sit inline next to their field and the first error takes focus on submit. Placeholders end with the ellipsis character and show the expected pattern. Warn before navigation loses unsaved changes.

**Animation, typography, content**
- prefers-reduced-motion is honored with a reduced variant or none. Animate transform and opacity only; never transition: all; list the properties. Motion over 5 seconds next to other content has pause, stop or hide.
- Use the ellipsis character and curly quotes, not three dots or straight quotes. Number columns use tabular figures. Headings use text-wrap balance or pretty.
- Containers survive long content (truncate, line clamp or break words); flex children that must shrink carry min-width 0. Empty states render designed, not broken.

**Images, performance, navigation**
- Images declare width and height; below the fold they lazy load; the critical above-fold image is prioritized. Prefer muted looping video over an animated GIF, with a still alternative.
- Lists over about 50 items use content-visibility or virtualization before reaching for a library. No layout reads in render paths; DOM reads and writes are batched. CDN and asset domains are preconnected; critical fonts preload with font-display swap.
- The URL reflects state (filters, tabs, pagination, open panels) and stateful views deep-link. Links are real links that survive cmd-click and middle-click. Destructive actions ask for confirmation or offer undo, never fire immediately.

**Touch, layout, theming, locale**
- touch-action manipulation; the tap highlight set on purpose; modals and drawers contain overscroll. Full-bleed layouts respect safe-area insets. Layout comes from flex and grid, not JS measurement.
- Dark themes set color-scheme and a theme-color meta that matches the background; native selects get explicit colors. Dates, numbers and currency go through Intl formatters, never hardcoded formats; language is detected from Accept-Language, not IP. Brand names and identifiers are marked translate no.

**Copy in the interface**
- Active voice, second person, specific labels (Save API Key, not Continue), numerals for counts. Error messages name the fix or the next step, not only the problem. Title case on headings and buttons.

**Flag on sight**
- Zoom disabled (user-scalable no or maximum-scale 1), paste blocked, transition: all, an outline removed without replacement, click handlers on a div or span, images without dimensions, unlabelled inputs or icon buttons, hardcoded date or number formats, autofocus without a clear reason, an animated GIF where video fits.

## Design knowledge

**Authority**: The project's own design system (design/DESIGN.md, design/tokens.json) is the authority for this project. The knowledge base below is reference material that the design system may draw from. On any conflict, the project's design system wins. A deviation from the knowledge base alone is not a finding; a deviation from the project's design system is.

**Note**: No product type slice matched. General guidelines only.

### Product Type: Undeclared

No specific product type declared. Using general guidelines only.

### UX Guidelines

**Accessibility:**
- Maintain minimum 4.5:1 contrast ratio for normal text, 3:1 for large text (18pt+)
- Touch targets must be at least 44x44px on mobile devices

**Feedback:**
- Loading states should appear after 300ms delay to avoid flashing
- Provide immediate visual feedback for user actions

**Forms:**
- Form fields should have clear labels and validation feedback
- Error messages should explain what went wrong and how to fix it

**Hierarchy:**
- Establish clear visual hierarchy using size, weight, and color
- Important actions should be visually prominent and easy to locate

**Motion:**
- Keep animation durations between 200-400ms for most transitions
- Provide reduced motion alternatives for users with vestibular sensitivity

**Responsive:**
- Test layouts at mobile (320-768px), tablet (768-1024px), and desktop (1024px+) breakpoints
- Avoid horizontal scrolling on standard viewports

**Spacing:**
- Use consistent spacing scale throughout (e.g., 4px, 8px, 16px, 24px, 32px)
- Group related elements together with whitespace separating distinct sections


## Quality Charter

Product type: interface

Observable criteria:

- **Hierarchy**: One clear focal point per view; size, weight and space rank everything else beneath it
- **Typography**: A deliberate type scale and measure; body text reads comfortably and headings carry the voice
- **Layout**: A consistent spacing scale and alignment grid; nothing overflows or collides from 360 px to wide desktop
- **Color**: A restrained palette used with intent; text contrast of at least 4.5:1 and one accent that means something
- **States**: Interactive elements show hover, focus, active and disabled states; empty, loading and error views are designed
- **Character**: The page has a point of view that fits its subject; it does not read as an unstyled template


## Reference Anchors

⚠️ **WARNING**: This run has no reference anchors.

The review will proceed under the charter floor alone.

