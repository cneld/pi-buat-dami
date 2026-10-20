---
name: init
description: "Initialize project context like Claude Code's /init — scan the codebase, detect the tech stack and conventions, and generate a CLAUDE.md at the repo root so future sessions understand the project automatically. Also builds a Graphify knowledge graph of the repo. Use when the user runs /init, says 'initialize the project', 'set up project context', 'generate CLAUDE.md', or 'scan this repo for context'."
metadata:
  short-description: Generate CLAUDE.md + graphify graph for the current repo
---

# /init — Project Context Initialization

Mirrors Claude Code's `/init`. Goal: produce a repo-local `CLAUDE.md` that
future sessions read automatically, plus a Graphify knowledge graph for
relational/structural queries.

This skill is **repo-scoped**, not user-scoped. `CLAUDE.md` and the graph live
in the repo (not in the user's Second Brain vault). The user's personal profile
stays in `Pi Profile.md`.

## Prerequisites

- The target is a git repo (preferred) or at least a project directory.
- `graphify_build` is available (it is — call it as a tool, not via shell).

## Step 0 — Resolve the repo root

```bash
cd "<repo-or-cwd>"
git rev-parse --show-toplevel 2>/dev/null || echo "<use cwd>"
```

Use the git top-level if found; otherwise use the current working directory.
All generated files go there. Never write outside the repo root.

If already inside the user's home with no repo, ask which project to init.

## Step 1 — Scan the codebase

Gather facts WITHOUT reading large source files into context. Use shell:

```bash
cd "<repo-root>"
echo "=== tree (2 levels, no noise) ==="
find . -maxdepth 2 -not -path '*/.git/*' -not -path '*/node_modules/*' \
  -not -path '*/.venv/*' -not -path '*/dist/*' -not -path '*/build/*' \
  | sort | head -200

echo "=== file counts by type ==="
find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' \
  | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -30

echo "=== key config files present? ==="
ls -1 package.json pyproject.toml requirements.txt go.mod Cargo.toml \
  pom.xml build.gradle composer.json Gemfile README* Makefile \
  docker-compose.yml Dockerfile .eslintrc* .prettierrc* tsconfig.json \
  2>/dev/null
```

Then read the small, high-signal files to extract commands and conventions:
- `README*`, `package.json` (`scripts`), `pyproject.toml` (`[tool.poetry.scripts]` /
  `[project.optional-dependencies]`), `Makefile`, `docker-compose.yml`.
- Config: `.eslintrc*`, `.prettierrc*`, `tsconfig.json`, `.editorconfig`,
  `rustfmt.toml`, `pyproject.toml` `[tool.*]` — these reveal style conventions.
- Entry points: `main.*`, `index.*`, `app.*`, `cmd/`, `src/main`.

Do NOT open every source file. Detect structure and conventions from filenames,
configs, and counts.

## Step 2 — Build the knowledge graph (Graphify)

Call the `graphify_build` tool with the repo root path. This extracts
entities/relationships and produces `graphify-out/graph.json`.

After it finishes, make sure the graph artifacts are ignored by git:

```bash
cd "<repo-root>"
grep -q '^graphify-out/' .gitignore 2>/dev/null || echo 'graphify-out/' >> .gitignore
```

(If `.gitignore` doesn't exist, create it with that one line.)

## Step 3 — Generate CLAUDE.md

Write `CLAUDE.md` at the repo root. Structure it exactly like Claude Code's
output (sections below). Keep it concise and factual — derived ONLY from what
the scan revealed, not invented.

If `CLAUDE.md` already exists, READ it first and MERGE: keep the user's existing
content, fill only missing sections, do not delete their notes.

### CLAUDE.md template

```markdown
# <Project Name>

<One or two sentence description of what this project is and does.>

## Tech Stack
- Language(s): <e.g. TypeScript, Python>
- Framework(s): <e.g. Next.js, FastAPI>
- Package manager: <npm / pypi / cargo / go mod>
- Runtime / infra: <Node 20, Docker, Postgres, etc.>

## Project Structure
<Brief map of the important directories and what they contain.>

## Build / Run / Test Commands
- Install: <command>
- Dev server: <command>
- Build: <command>
- Test: <command>
- Lint / Format: <command>

## Conventions
- Style: <eslint + prettier / black / rustfmt — from configs>
- Naming: <from observed files>
- Entry point(s): <file/path>

## Notes
<Any non-obvious context: why a framework was chosen, gotchas, env vars needed.>
```

Fill each section from Step 1 evidence. If a section can't be determined, omit
it rather than guessing.

## Step 4 — Report

Summarize what was generated:
- Path to `CLAUDE.md` (repo-local).
- Graphify graph location (`graphify-out/graph.json`) and that it's gitignored.
- The detected stack in 1 line.

Tell the user: future sessions in this repo will auto-read `CLAUDE.md`, and they
can query the graph with `graphify_query` / `graphify_explain`.

## Notes

- This is repo-local by design. Don't put repo contents into `Pi Profile.md`.
- For cross-repo / personal memory, the user's Second Brain vault is separate.
- Keep `CLAUDE.md` short; it is read on every session, so brevity matters.
