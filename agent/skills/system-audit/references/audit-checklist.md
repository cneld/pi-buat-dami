# Audit Checklist & Methodology

On-demand companion to `SKILL.md`. Load this when you need the concrete,
repeatable procedure for auditing a large Pi ecosystem — especially one
expected to grow to 100+ skills/extensions. The methodology leans on
**context-mode** so the raw bytes of the audited codebase stay out of your
conversation memory and only derived findings come back.

> Rule of thumb for tool choice (strict hierarchy):
> **ctx_batch_execute > ctx_execute > ctx_execute_file > ctx_search**
> Web pages → **ctx_fetch_and_index** then **ctx_search**.
> Index reusable docs → **ctx_index**. Inspect state → **ctx_stats** /
> **ctx_doctor**. Maintain → **ctx_upgrade** / **ctx_purge**.

---

## 0. Context-Mode Tooling Hierarchy

Use the highest tool in the hierarchy that can answer the question. This keeps
your reasoning budget free for judgement, not raw file dumps.

| Need | Tool | Why |
|------|------|-----|
| 3+ related shell greps / multi-file scans / git log+diff+blame | `ctx_batch_execute` | Parallel I/O; auto-indexes output; inline `queries` return matched sections in the same round trip |
| Derive an answer FROM data (counts, filters, parses, compares) | `ctx_execute` | Code runs in sandbox; only `console.log` output returns |
| Know something ABOUT one file (LoC, pattern matches, structure) without reading it | `ctx_execute_file` | `FILE_CONTENT` stays in sandbox; only the answer prints |
| Recall previously indexed content / session memory | `ctx_search` | BM25 + trigram ranking across indexed sources |
| Web page / spec needed for wiring or API accuracy | `ctx_fetch_and_index` → `ctx_search` | Page bytes never enter context; only sections return |
| Reusable reference docs (API specs, READMEs) | `ctx_index` | Persistent, retrievable by section |
| Check context consumption / savings | `ctx_stats` | Shows token budget spent |
| Diagnose context-mode install | `ctx_doctor` | Health check |
| Upgrade context-mode | `ctx_upgrade` | Self-update |
| Wipe knowledge base (destructive) | `ctx_purge` | Confirm scope first |

**Anti-patterns:** do not `read` a 700 KB log and mentally compute — run code
over it. Do not `bash` a web search and guess versions — `pi-worker-search` /
`ctx_fetch_and_index`. Do not keep raw output in context when only the finding
is needed.

---

## 1. Pre-Audit Reconnaissance (do this first)

```bash
# Inventory the whole tree once; let ctx_batch_execute index it.
ctx_batch_execute(
  commands: [
    {label:"tree", command:"find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | sort"},
    {label:"skills", command:"find . -name SKILL.md -not -path '*/node_modules/*'"},
    {label:"extensions", command:"find . -path '*extensions*' -name '*.ts' -o -name 'extension.json' | head -200"},
    {label:"pkg", command:"cat package.json; echo '---'; ls node_modules 2>/dev/null | head"},
    {label:"git", command:"git log --oneline -20"}
  ],
  queries:["skill inventory","extension inventory","dependency list","recent changes"],
  concurrency: 5
)
```

Record the component count. If it already trends toward 100+ skills/extensions,
escalate scalability findings automatically.

---

## 2. Per-Area Checklist

Tick each box. For every open box that reveals a defect, emit a finding block
(see `SKILL.md` → REQUIRED OUTPUT FORMAT).

### Architecture
- [ ] Layer boundaries respected (no UI calling DB directly, etc.)
- [ ] No circular dependencies (`ctx_execute` over import graph)
- [ ] Cohesion high / coupling low per module
- [ ] Abstractions have ≥2 real consumers or are flagged as YAGNI

### Folder Structure
- [ ] Naming consistent and discoverable
- [ ] Flat enough to scale to 100+ entries without collision
- [ ] Clear separation: skills / extensions / workflows / prompts / config

### Skills
- [ ] Every `SKILL.md` has valid frontmatter (`name`, `description` ≤1024)
- [ ] No two skills with conflicting instructions for the same trigger
- [ ] No duplicate logic across skills (grep shared phrases via `ctx_search`)
- [ ] Prompt injection surface reviewed (skills can execute code)
- [ ] Naming consistency (`system-audit`, not `SystemAudit`)

### Extensions
- [ ] Extension API used per documented contract
- [ ] State/session handling has cleanup
- [ ] Error handling present; no silent failures
- [ ] Logging adequate; no resource leaks (open handles, listeners)

### Workflows
- [ ] No infinite loops / missing exit conditions
- [ ] Every branch has validation + fallback
- [ ] No duplicate execution or unnecessary model switching
- [ ] Hidden dependencies between workflows documented

### Routing System
- [ ] Routing decisions deterministic and observable
- [ ] Fallback strategy defined for provider/model failure
- [ ] Cost-aware role assignment
- [ ] Extensible without editing core

### Prompt Engineering
- [ ] Prompts consistent and maintainable (shared fragments?)
- [ ] No prompt duplication (centralize via references/)
- [ ] Context bloat bounded (progressive disclosure used)
- [ ] Injection resistance verified

### Session Management
- [ ] Lifecycle: create → use → cleanup
- [ ] Persistence + rehydration correct
- [ ] No unbounded memory growth
- [ ] State consistency under concurrent access

### Configuration
- [ ] Env vars documented; no hardcoded secrets
- [ ] Sensible defaults; invalid assumptions flagged
- [ ] Config consistency across environments

### Dependency Management
- [ ] No unused dependencies
- [ ] No tight coupling to a single version
- [ ] Version risks (peer deps, ranges) noted

### Error Handling
- [ ] Exceptions caught at boundaries
- [ ] Recovery / retry logic present where needed
- [ ] Failures propagate, never swallowed silently

### Logging
- [ ] Structured, leveled, debuggable
- [ ] No missing critical logs, no excessive noise

### Performance
- [ ] No slow/duplicate processing paths
- [ ] Expensive LLM calls justified
- [ ] Context efficiency (no redundant reloads)
- [ ] Memory/latency bottlenecks noted

### Cost Efficiency
- [ ] Routing avoids premium models where cheap suffices
- [ ] Token waste (re-summarization, context reload) flagged
- [ ] OpenRouter/provider cost opportunities listed

### Security
- [ ] API keys in env / secret store, never in code or logs
- [ ] Sensitive data not exposed in prompts/artifacts
- [ ] Unsafe execution gated by permission boundaries
- [ ] Input validation at trust boundaries

### Technical Debt
- [ ] Current debt enumerated with source
- [ ] Long-term impact estimated
- [ ] Refactoring priority assigned

### Code Quality
- [ ] Dead/duplicate code removed or flagged
- [ ] No overengineering (interfaces with one impl)
- [ ] No underengineering at trust/security boundaries

### Documentation
- [ ] No missing/outdated/inconsistent docs for public surfaces

### Testing Strategy
- [ ] High-risk areas (routing, security, sessions) have tests
- [ ] Untested workflows listed

### Edge Cases
- [ ] User-misuse scenarios enumerated
- [ ] Every workflow mentally broken (bad input, partial failure)

---

## 3. Scaling the Audit (100+ skills/extensions)

When the inventory is large:
1. Use `ctx_batch_execute` to fan out per-area greps in parallel.
2. Use `ctx_execute_file` per suspicious file to derive the finding without
   loading the whole file.
3. Index repeated reference material with `ctx_index` so you don't re-read it.
4. Group findings by component; rank by Refactoring Priority.
5. If context is tight, run `ctx_stats` to confirm savings; `ctx_purge` only
   when you intentionally reset (confirm scope first).

---

## 4. Output Assembly

Emit findings in the format from `SKILL.md`, then the FINAL REVIEW
(Production Readiness, Highest Risk Areas, Refactoring Roadmap, Future
Scalability, Final Verdict). State explicitly which areas passed inspection and
why. Never stop at obvious issues — keep auditing until no further meaningful
findings remain.
