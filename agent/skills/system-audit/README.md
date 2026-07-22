# system-audit

A Pi skill that runs an exhaustive, adversarial pre-production architecture audit
of an entire Pi Agent ecosystem.

## Install / Location

Place this folder under one of Pi's skill directories, e.g.:

- `~/.pi/agent/skills/system-audit/`
- `~/.agents/skills/system-audit/`
- `.pi/skills/system-audit/` (project, after the project is trusted)

No dependencies or setup required. Discovery is automatic; the skill is exposed
as `/skill:system-audit`.

## Usage

```
/skill:system-audit
/skill:system-audit focus on security
```

Arguments after the command are appended as additional audit scope.

## What it does

The skill instructs the agent (acting as Principal Engineer / Staff Architect /
Technical Auditor) to audit the full project across 23 areas — architecture,
skills, extensions, workflows, routing, prompts, sessions, config, dependencies,
error handling, logging, performance, cost, security, technical debt, code
quality, docs, testing, and edge cases — and emit findings in a fixed format
(Severity, Category, Evidence, Why, Impact, Recommendation, Refactoring Priority),
followed by a Production Readiness review, ranked risks, refactoring roadmap,
future scalability estimate, and a Final Verdict.

The skill is read-only: it reports findings and does not modify project files
unless explicitly asked.

## Files

- `SKILL.md` — required skill definition + full audit protocol.
- `README.md` — this file.

## Reference

Format follows the [Agent Skills specification](https://agentskills.io/specification)
as implemented by Pi. `metadata` (version/author/category) lives in the SKILL.md
frontmatter; no separate manifest file is required.
