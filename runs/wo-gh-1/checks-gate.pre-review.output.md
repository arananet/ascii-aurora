# Checks Gate: pre-review
Basis: builder_delta
Attempt: 1

# Check Commands
## Command 1: npm install --no-audit --no-fund && npm run build
Exit code: 0
Output:
```

up to date in 158ms

> ascii-aurora@1.0.0 build
> node build.mjs

dist size: 31999 bytes

```

## Command 2: node tools/verify.mjs
Exit code: 0
Output:
```
verify: ok (1) AURORA_STOPS defined once with 7 stops
verify: ok (2) stop 0.78 = (74,222,128)
verify: ok (3) ramp literal " .':;+*x%#@"
verify: ok (4) MIN_METEOR_MS = 6000, MAX_METEOR_MS = 14000, REFLECT_SCALE = 0.55
verify: ok (5) audio is synthesised, no audio file references
verify: ok (6) attribution anchor present once
verify: ok (7) HUD and control ids present
verify: ok (8) window.__asciiAurora exposed
verify: ok (9) dist/ holds index.html and the assets
verify: ok (10) no em or en dash in 7 authored files
verify: ok (11) only external reference is the attribution href
verify: all 11 checks passed

```

## Artifact validation

- builder report: runs/wo-gh-1/builder.output.md
- observed: present
- report source: station
- required literals declared: 17
  - present: 7111f490472a5669f299b588b284ae72205206eb
  - present: Base pin
  - present: ASCII Aurora
  - present: Made with ANVIL, an open source software factory.
  - present: https://anvil-landing-7x1.pages.dev
  - present: 74,222,128
  - present: S1
  - present: S2
  - present: S3
  - present: S4
  - present: S5
  - present: S6
  - present: S7
  - present: evidence/stills/page-desktop.png
  - present: evidence/stills/page-mobile.png
  - present: evidence/stills/page-sound.png
  - present: evidence/captures.json
- result: pass
