# Checks Gate: pre-review
Basis: builder_delta
Attempt: 1

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
npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-11-20T06_12_51_319Z-debug-0.log

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

## Artifact validation

- builder report: runs/wo-gh-1/builder.output.md
- observed: missing
- report source: none
- required literals declared: 17
  - MISSING: 4675a131eb9aa88097741dc3cdc9772c3db17550
  - MISSING: Base pin
  - MISSING: ASCII Aurora
  - MISSING: Made with ANVIL, an open source software factory.
  - MISSING: https://anvil-landing-7x1.pages.dev
  - MISSING: 74,222,128
  - MISSING: S1
  - MISSING: S2
  - MISSING: S3
  - MISSING: S4
  - MISSING: S5
  - MISSING: S6
  - MISSING: S7
  - MISSING: evidence/stills/page-desktop.png
  - MISSING: evidence/stills/page-mobile.png
  - MISSING: evidence/stills/page-sound.png
  - MISSING: evidence/captures.json
- result: fail
- finding: Builder report artifact runs/wo-gh-1/builder.output.md is missing.
- finding: Required literal not found in full in the builder report: 4675a131eb9aa88097741dc3cdc9772c3db17550
- finding: Required literal not found in full in the builder report: Base pin
- finding: Required literal not found in full in the builder report: ASCII Aurora
- finding: Required literal not found in full in the builder report: Made with ANVIL, an open source software factory.
- finding: Required literal not found in full in the builder report: https://anvil-landing-7x1.pages.dev
- finding: Required literal not found in full in the builder report: 74,222,128
- finding: Required literal not found in full in the builder report: S1
- finding: Required literal not found in full in the builder report: S2
- finding: Required literal not found in full in the builder report: S3
- finding: Required literal not found in full in the builder report: S4
- finding: Required literal not found in full in the builder report: S5
- finding: Required literal not found in full in the builder report: S6
- finding: Required literal not found in full in the builder report: S7
- finding: Required literal not found in full in the builder report: evidence/stills/page-desktop.png
- finding: Required literal not found in full in the builder report: evidence/stills/page-mobile.png
- finding: Required literal not found in full in the builder report: evidence/stills/page-sound.png
- finding: Required literal not found in full in the builder report: evidence/captures.json
