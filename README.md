# Suggested skills

Reusable agent skills for common software maintenance, research, and review workflows.

## Skills

| Skill | Purpose |
|---|---|
| `audit-docs` | Verify documentation claims against the actual codebase. |
| `grade-skill` | Evaluate an agent skill with a rubric and realistic task prompts. |
| `monitor-upstream` | Track upstream repository changes that may affect a local fork or wrapper. |
| `prior-art-search` | Search for existing projects and libraries before building something new. |
| `security-scan-sharded` | Coordinate a sharded security review and validate findings. |
| `update-deps-verify` | Update dependencies in safe batches with verification after each batch. |


## Assumptions

Some skills assume access to common development tools such as `gh`, `npm`, Git, and an agent environment that can run parallel/subagent review tasks. If a required tool is unavailable, adapt the command while preserving the workflow.

## License

MIT — see [LICENSE](LICENSE).
