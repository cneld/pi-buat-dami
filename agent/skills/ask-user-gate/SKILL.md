---
name: ask-user-gate
description: "Decision gate for @juicesharp/rpiv-ask-user-question. You MUST use this before ambiguous requirements, high-impact architecture/product/security decisions, destructive actions, package installs, or multiple valid implementation paths. Uses ask_user_question to collect explicit user choice before proceeding."
metadata:
  short-description: Decision gate using ask_user_question
---

# Ask User Gate

Use this skill to stop guessing and ask the user before consequential decisions.

This skill is about **decision control**, not casual chat. It pairs with the `ask_user_question` tool from `@juicesharp/rpiv-ask-user-question`.

## Non-negotiable rule

Call `ask_user_question` before proceeding when **any** of these are true:

1. The next step changes architecture, schema, API contracts, deployment strategy, security posture, data storage, auth, or permissions.
2. The action is hard/costly to undo: destructive command, migration, large refactor, dependency/package install, deleting files, production-facing behavior change.
3. Requirements, constraints, success criteria, target files, or user preference are unclear, conflicting, or missing.
4. Multiple valid implementation paths exist and the trade-off depends on user preference.
5. You are about to assume something that materially changes implementation, cost, UX, or risk.

Do **not** ask for trivial choices. Do **not** ask if the user already gave an explicit decision for the exact trade-off.

## Required handshake

### 1) Detect boundary

Classify the current step internally as:

- `clear` — no gate needed
- `ambiguous` — requirements/preference unclear
- `high_stakes` — risky/costly/destructive/security/architecture decision
- `both`

If not `clear`, continue.

### 2) Gather evidence first

Before asking, inspect relevant files, docs, logs, or package info so the user is not deciding blind.

### 3) Ask focused questions

Use `ask_user_question` with:

- 1 question for a normal decision
- up to 4 questions only when they are truly related and independent
- 2-4 concrete options per question
- short `header` text, max 16 chars
- concise option labels, max 60 chars
- option descriptions that explain trade-offs
- `multiSelect: true` only when multiple choices can validly be selected
- previews only when visual/code comparison materially helps

Never invent option labels for built-in escape rows — the runtime reserves exactly `Other`, `Type something.`, and `Next`.

### 4) Commit the decision

After the user answers:

1. Restate the chosen direction in one short sentence.
2. State what will be done next.
3. Proceed using that decision.

### 5) Re-open only for new ambiguity

Ask again only if materially new uncertainty appears. Avoid confirmation loops.

## Anti-overasking budget

- Max 1 `ask_user_question` call per decision boundary in normal cases.
- Max 2 calls for the same boundary if the first answer is cancelled/unclear.
- Never ask the same trade-off again without new evidence.

If attempt 2 is needed, narrow the choices:

- `Use recommended` — proceed with the agent's recommended option
- `Choose another` — user provides a custom direction
- `Stop for now` — pause work

After attempt 2:

- If the user answered (not cancelled): commit their choice normally.
- If the user cancelled both attempts:
  - For `high_stakes` or `both`: **ask via plain chat text** (not the tool — the tool budget is exhausted) and wait for explicit direction before proceeding. Do not guess, do not default.
  - For `ambiguous` only: if the user says "your call", proceed with the most reversible default and state assumptions.

## Good use examples

### Architecture/package decision

```ts
ask_user_question({
  questions: [{
    question: "Which ask-user package should we standardize on?",
    header: "Package",
    options: [
      { label: "pi-ask-user", description: "Simpler, includes bundled decision-gate skill" },
      { label: "rpiv question", description: "Richer questionnaire UI, needs custom gate skill" }
    ]
  }]
})
```

### Multi-select scope decision

```ts
ask_user_question({
  questions: [{
    question: "Which hardening items should we implement now?",
    header: "Scope",
    multiSelect: true,
    options: [
      { label: "Rate limits", description: "Protects endpoints from abuse" },
      { label: "Audit logs", description: "Tracks sensitive actions" },
      { label: "Input schema", description: "Rejects invalid payloads early" }
    ]
  }]
})
```

## Anti-patterns

- Asking before reading obvious local context.
- Asking broad “what should I do?” questions with no options.
- Asking about formatting/preferences that do not affect outcome.
- Asking repeatedly to avoid making a low-risk reversible call.
- Continuing after cancelled/unclear answers for high-stakes work.
