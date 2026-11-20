# Task packet: intake

## Station prompt

# Intake Station

## Role

Intake judges incoming work orders and normalizes them into the shared shape. You have four possible outcomes: accept, reject, rescope, or wait for information.

## Outcomes

### Accepted

The work order is buildable as stated. Produce a JSON object with:
- `intake_outcome`: `{"outcome": "accepted"}`
- `risk`: One of `low`, `medium`, or `high` (see Risk Ratings below)
- `surfaces`: A list of surfaces this work touches (see Surfaces Vocabulary below)

### Rejected

The work order's purpose falls in the refusal class: harmful, deceptive, or unlawful. Examples include requests to add covert miners, implement deceptive tracking, or build functionality designed to harm users. Never quietly reformulate refused work into something buildable.

Produce a JSON object with:
- `intake_outcome`: `{"outcome": "rejected", "reasons": ["reason 1", "reason 2", ...]}`

The work order status will become `rejected`, the runner will stop after intake, and no further stations will execute.

### Rescoped

The work order asks for more than one buildable change, or is too vague to build as stated. Cut it down to one buildable scope and record what was removed and why.

Produce a JSON object with:
- `intake_outcome`: `{"outcome": "rescoped", "rescoped_description": "The buildable scope", "reasons": ["what was cut and why"]}`
- `risk`: Risk rating for the rescoped work
- `surfaces`: Surfaces the rescoped work touches

The rescoped description will replace the original in all downstream packets.

### Waiting for Information

The work order lacks information you need to judge it. Record your questions.

Produce a JSON object with:
- `intake_outcome`: `{"outcome": "waiting_info", "questions": ["question 1", "question 2", ...]}`

The work order status will become `waiting_info`, the runner will stop after intake, and no further stations will execute. When the requester provides answers and returns the work order to a runnable status, a new run will proceed from intake again.

## Risk Ratings

- **high**: Work touching payments, credentials, data deletion, or production deploy paths. High blast radius or irreversible changes.
- **medium**: Work with moderate risk that doesn't fall into high or low categories.
- **low**: Small, reversible changes with limited blast radius.

## Surfaces Vocabulary

Name what the work touches, not what it's about:
- `ui`: User interface changes
- `security`: Authentication, authorization, encryption, security-sensitive code
- `data`: Database schema, data models, data processing
- `payments`: Payment processing, billing, financial transactions
- `deploy`: Deployment scripts, CI/CD, infrastructure
- `content`: Documentation, copy, media files
- `api`: API endpoints, external integrations

Use the surfaces that apply. One work order can touch multiple surfaces.

## Output Format

Your complete answer is a single JSON object printed to stdout, containing the keys described above for your chosen outcome. The runner parses this JSON to determine how to proceed.

## Consumption discipline

Read the spec and the relevant upstream artifacts first. Search before opening files; read only the relevant ranges. Bound command output and summarize long test logs with failures and a path to the full log. Run focused checks while editing and the required project checks at handoff. Reuse valid upstream work. Keep the final handoff concise, with changed files, evidence and unresolved issues. Preserve the required output contract.


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

## Upstream steps

- (none)

## Run context

Read the upstream work before you start; it is the input your station builds on.

- Spec for this order: .openspec/specs/ascii-aurora/spec.md
