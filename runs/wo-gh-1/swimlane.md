# Swimlane

Routing: 4 reviewers (reduced panel, 2 routed out)

**Cost**: No measured steps (4 executed steps)

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | executed | 7947.096 | runs/wo-gh-1/intake.output.md | null |
| spec-writer | executed | 50295.803 | runs/wo-gh-1/spec-writer.output.md | null |
| test-writer | executed | 248327.677 | runs/wo-gh-1/test-writer.output.md | null |
| builder | executed | 654976.54 | runs/wo-gh-1/builder.output.md | null |
| checks-gate | passed | 355.722 | runs/wo-gh-1/checks-gate.pre-review.output.md | null |
| reviewer-spec | budget_exceeded | 0 | - | null |

## Decision

- Approver: The pipeline has no approver step, so no reviews were aggregated into a verdict.
- Human gate: No approver verdict was produced by this pipeline and no risk hints matched (scanned: auth, payments, data-deletion, production-deploy, secrets, publishing), so no human is required.
