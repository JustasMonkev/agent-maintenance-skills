# Todo first-draft experiment

## Frozen before implementation

Model: gpt-6.1-sol, fresh-context subagents, two runs per condition. Same task.md,
empty project directory, runtime/tool availability, and acceptance suite. Each
agent owns one project; no shared edits or visibility into other submissions.
Both conditions may reason and write tests normally. Only the treatment receives
the lean-first skill and an explicit instruction to use it before implementation.
Both receive finish-with-evidence. No iterative hinting from evaluator failures.

The parent prepares tests without reading implementations. They cover domain
semantics, immutable state, IDs after removal/reload, empty and duplicate titles,
filter scope, malformed snapshots, and actual browser interactions including
failed storage, hostile title text, keyboard operation and narrow layout.

Each submitted first draft is hashed before evaluation. Failures remain in the
benchmark; any later repaired app would be separately labelled. The frozen skill
is tested unchanged across both treatment runs. Later skill changes, if any,
must be distinguished from the tested version.

## Measures

- Correctness: common checks passed/failed with concrete failure output.
- Edge-case reasoning: stated decisions and their observable implementation.
- Clarity: condition-blinded review of production files only; concrete duplication,
  boundaries and unnecessary machinery, not a line-count beauty contest.
- Cost: dispatch-to-submission wall time and file/line footprint, with proof-only
  files separated. Dollar/token cost is unavailable unless actual usage is exposed.
- Adherence: actual Lean files, compiler executions, proof results, and trace or
  contract checks; merely mentioning the skill does not count as use.

Report every run, including mixed results. Two runs per arm on one deliberately
specified small app are a pilot, not statistical evidence of general improvement.
Shared detailed requirements and possible toolchain/library familiarity are
limitations. Timings include agent/tool overhead, not solely human design effort.
