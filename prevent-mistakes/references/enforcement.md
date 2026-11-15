# Enforcing recurring mistakes

Use this when step 2 or the user's corrections show a mistake class that **recurs**: two or more instances in history, sibling code, review comments, or repeated corrections in this project. A single instance gets fixed in place and mentioned in the report.

## Pick the level

Work down the ladder and stop at the first level that makes the mistake fail loudly at a reasonable cost. In the report, say why each higher level did not fit.

1. **API or ownership boundary.** One owner per piece of state, one supported way per task. Hide internals so the wrong import fails. Replace hand-synced lists with one source of truth. Delete the old way an agent would otherwise copy.
2. **Types.** Make the bad state unrepresentable: distinct types for distinct units or IDs, exhaustive matches over enums, non-nullable where null is a bug, constructors that validate.
3. **Focused static check.** A lint rule, grep-based CI step, or compile-time assertion whose error message names the file, type, or function to use instead. When the pattern is already common, fail only on new occurrences (a ratchet), so the check lands without a mass rewrite.
4. **Behavioral test.** Asserts observable behavior through a public entry point. Fix or delete tests that pass when the behavior breaks, or fail when only internals change.
5. **Prose.** A line in the project's instruction file, only for judgment no tool can check. Nothing fails when an agent skips it.

Proportion: the enforcement should cost less than the mistakes it prevents. A small task gets the smallest level that works; a boundary redesign goes into the report as a proposal.

## Prove it

Show the new check failing on a real instance of the mistake: the commit that introduced it, a reverted copy of the bug, or a minimal reproduction of the past error. A check never seen failing is unproven. Run it with the same command locally and in CI when CI exists.

Exceptions go on the offending line, with a reason. Follow the project's convention for approvals and expiry if it has one.

## Where it lives

Everything project-specific stays in the project: the check in its tests or lint config, any rule text in its instruction file (`AGENTS.md`, `CLAUDE.md`, or whatever the repo uses). When the project keeps a rule table, pair each rule with what enforces it, and drop a rule once its mistake can no longer happen. The portable skill stays generic.
