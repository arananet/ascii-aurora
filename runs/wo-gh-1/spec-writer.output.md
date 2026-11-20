# Spec writer output: wo-gh-1

Spec for this order: .openspec/specs/ascii-aurora/spec.md (named by work_orders/wo-gh-1.json spec_path).

## Outcome

The spec file already exists, was filed by the owner for wo-gh-1, and the work order lists .openspec/ as protected and never edited. I did not change it. I checked the order line by line against it. The spec covers every requirement in the order. Each requirement R1 to R11 has at least one scenario S1 to S7 that names it or checks it. Below are the coverage map, the clarifications the builder must follow, and the points the owner must decide.

Requirement and scenario ids written or changed by this station: none (the spec stays as filed).

## Coverage map (order clause to spec)

| Order clause | Spec requirement | Scenario(s) that check it |
| --- | --- | --- |
| R1 structure, package.json, one devDependency, no runtime deps, no external loads, build prints dist size | R1 | S1 (build, size line, verify exit 0), S6 (external refs) |
| R2 canvas, grid at least 100 cols at 1280 px, bg (3,7,17), no scroll to 360 px, horizon 60 to 64 percent, RAMP, one rAF loop | R2 | S2, S7 (no overflow), S5 (ramp literal), S3 (fps at least 24) |
| R3 two or more bands, rays, violet fringe (167,139,250), AURORA_STOPS 7 stops, activity envelope 1 to 100 | R3 | S5 (7 stops, 0.78 = 74,222,128), S2 and S7 (aurora colour fraction), S3 (activity range) |
| R4 stars, MIN_METEOR_MS 6000, MAX_METEOR_MS 14000, treeline 2 to 4 cells, (2,10,6) | R4 | S5 (meteor constants), S2 (capture evidence) |
| R5 reflection, REFLECT_SCALE 0.55, wobble at most 2 cells, shimmer, no treeline reflection | R5 | S5 (constant), S2 (bottom half non black fraction above 0.01) |
| R6 HUD ids, measured values, update at least 2 per second, three control ids, labels, window.__asciiAurora | R6 | S3 (live values, elapsedSeconds samples differ by at least 1), S4 (audioState), verify item 7 and 8 under S1 |
| R7 composition, title, single footer link | R7 | S6 (single https href), verify item 6 under S1 |
| R8 WebAudio only, context only in toggle handler, score, delay 0.45 and 0.35, master gain at most 0.2 | R8 | S4 (off before click, on after), verify item 5 under S1 |
| R9 verify.mjs list, explicit file list dash scan, exclusions, external ref rule | R9 | S1, S5, S6 |
| R10 shots.mjs, three stills, captures.json fields, NOT RUN rule | R10 | S2, S3, S4, S7 |
| R11 attribution required, README untouched, inspiration credit off page | R11, R7 | S6, verify item 6 under S1 |
| Builder report accounting (Base pin, S1 to S7 table, evidence names, 74,222,128, attribution literal and link, dist size line) | Work order required_literals (not a spec requirement) | Checked by the checks gate against runs/wo-gh-1/builder.output.md |

## Clarifications binding on the builder (taken from the order, not new requirements)

1. Allowed write set (the order states it and the spec does not): index.html, assets/, build.mjs, package.json, package-lock.json, tools/verify.mjs, tools/shots.mjs, design/, tests/, evidence/, and runs/wo-gh-1/.
2. Protected, never edited: anvil.json, anvil.yaml, .github/, .openspec/, brain/, work-orders/, tools/dispatch_station.py, tools/claude_station.py, README.md, LICENSE, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, .gitignore, BLUEPRINT.md, PIPELINES.md, status/, OPERATOR-NOTES.md.
3. Out of scope: deployment to Cloudflare Pages, merging, any backend, any new npm dependency other than playwright-core as a devDependency, and any visible copy other than what R7 lists.
4. The R9 dash scan reads only its explicit file list. Because of that, runs/, .anvil-factory/, node_modules/, dist/, .git/, evidence/ and harness written packets are excluded wherever they live, as the order requires.
5. Rendered captures are evidence, never a check. The anvil.json checks must pass without a GPU or a browser.
6. Palette conflict resolved in favour of the spec. design/DESIGN.md gives the treeline as #01030a, and spec R4 gives (2,10,6), which is #020a06. The spec has higher authority, so the builder uses (2,10,6). DESIGN.md also lists cyan #22d3ee, which is not one of the AURORA_STOPS. Cyan may appear in UI chrome, but the scene colours come only from AURORA_STOPS, the violet fringe, the star colour and the treeline colour.

## Open points the owner must decide

1. The spec has no Out of scope or write set section, which the spec writer definition of done asks for. The order supplies both, and they are restated above. Adding them to the spec needs an owner edit, because .openspec/ is protected.
2. Several bars have no checking scenario, so they rest on capture evidence and review rather than on a test: grid at least 100 columns at 1280 px, horizon at 60 to 64 percent, fringe colour, treeline height 2 to 4 cells, wobble at most 2 cells, meteor lifetime "about one second", chord hold "about 8 seconds", master gain at most 0.2, delay 0.45 and 0.35, focus states, and the controls and footer never covering the horizon. If the owner wants hard gates, verify.mjs or the test writer could check the gain, delay and horizon constants as literals. That would be a spec change.
3. "Small", "discreet" and "translucent" for the HUD, chips and footer have no numeric size or opacity in the spec. design/tokens.json is the reference that reviewers should hold the build to.
4. S2 sets the aurora colour family fraction threshold but does not define "aurora colour family". The capture tool must state the rule it uses (for example, pixels within a tolerance of any non background AURORA_STOPS colour or the violet fringe) in captures.json so that reviewers can read the result.
{"model": "claude-opus-5-5"}
