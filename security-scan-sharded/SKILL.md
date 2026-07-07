---
name: security-scan-sharded
description: Use when asked to find security vulnerabilities, run a security scan, review security fixes, or assess a repository for exploitable issues.
metadata:
  short-description: Sharded security scan with validated findings
---

# Sharded Security Scan

Fan out the scan, then kill false positives before they reach the report.

## 1) Shard the repo
- Split by attack surface, not by directory size: input parsing, auth/session, file/path handling, child processes & shell, network/HTTP, deps & supply chain, secrets/config.
- One agent per shard. Each agent returns findings as `{file, line, severity, claim, exploit-scenario}` — a finding without a concrete exploit scenario is not a finding.

## 2) Validate every finding
- For each finding, spawn a skeptic agent whose only job is to REFUTE it: read the actual code path, check if input is already sanitized upstream, check reachability.
- Default to refuted when uncertain. Only CONFIRMED findings survive.

## 3) Supply chain pass
- `npm audit` / lockfile diff for known CVEs; flag install scripts (`preinstall`/`postinstall`) in deps; flag deps with `curl | sh` patterns or network access at install time.

## 4) Report
- Rank by severity, one line per finding: `severity — file:line — exploit scenario — suggested fix`.
- List explicitly what was scanned and what was skipped (no silent coverage gaps).

Notes:
- Fixes are a separate step — never mix fixing into the scan run.
- Re-runs after fixes: re-validate only the previously CONFIRMED findings.
