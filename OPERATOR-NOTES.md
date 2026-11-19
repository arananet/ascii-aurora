# Operator Notes

Operator authored. The ANVIL line never edits this file.

## Factory

- Factory spine pin: 4675a131eb9aa88097741dc3cdc9772c3db17550 (arananet/anvil-factory), checked out by the workflow at .anvil-factory as the runner spine only.
- Stations execute from this project's root through the vendored tools/dispatch_station.py and tools/claude_station.py, taken from the same factory ref.
- Pipeline: sdlc-default (see anvil.json). Mode: greenfield. Blueprint: static-site.
- Run cap: max_run_tokens 3500000 in anvil.yaml. Basis: Doom Fire wo-gh-2, a one page order of the same shape with capture evidence, measured 3,106,260 tokens under a 3,500,000 cap; the largest single stations on comparable page orders stay well below the cap.

## Gateway secret

- A dedicated AI Gateway Run token for this project ("ascii-aurora gateway (CI)") is minted through the vault Cloudflare credential and stored as the repo Actions secret CF_AIG_TOKEN. The value is never printed, committed or written to any file.
- The workflow maps CF_AIG_TOKEN into the station environment (ANTHROPIC_API_KEY and the cf-aig-authorization custom header), the same shape as doom-fire and c64-retro-hardware.

## Firing

- Work order: wo-gh-1, GitHub issue #1, file work-orders/issue-1.json.
- The vault PAT cannot dispatch workflows, so the run fires by pushing to branch anvil/run-ascii-aurora-wo-gh-1, which the workflow .github/workflows/anvil-execute-wo-gh-1.yml listens to.
- The run commits its evidence back to that branch and comments the report on issue #1. Nothing merges and nothing deploys: the result stops at the human gate.

## Status

- Filed: scaffold, spec, work order and workflow committed to main. Run not yet fired.
