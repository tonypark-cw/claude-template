# Context Engineering Strategies

Context quality = result quality. Manage context systematically with 4 strategies.

## 1. Persist

Don't let context evaporate. Save it to files.

### What to Save

| Target | File | Format | When |
|--------|------|--------|------|
| Overall progress | `progress.txt` | Free text | Before session end |
| Key decisions | `MEMORY.md` | Structured markdown | After important decisions |
| Task/test state | `tests.json` | JSON | After test runs |
| Mistake log | `docs/mistakes.md` | Mistake log format | When mistakes happen |
| TODO list | `docs/todo.md` | Checklist | At task start/completion |

### Rules

- Always save current state to file before context window refresh
- Use git commits as checkpoints - maintain rollback capability
- Update progress.txt every 30 minutes during long sessions

---

## 2. Select

Don't include everything. Pick only what's relevant to the desired result.

### Selection Principles

- **Intent-based**: provide different context based on query intent
- **Relevance ranking**: sort search results by score, include top N only
- **Noise removal**: exclude duplicates, outdated data, irrelevant information

### Example

```
Bad:  "Read all files here and analyze"
Good: "Read src/auth/middleware.ts and jwt.ts,
       analyze the token validation flow"
```

---

## 3. Summarize

As context accumulates, noise increases. Periodically summarize and refresh.

### When to Summarize

| When | Action |
|------|--------|
| After task unit completion | One-line summary in progress.txt |
| Mid-session (30 min) | 3-line summary of done/remaining |
| Session end | Update MEMORY.md + final progress.txt |
| Before context compression | Save key decisions in structured format |

### Template

```
## Session Summary (YYYY-MM-DD)

### Completed
- [specific deliverables]

### In Progress
- [current state and blockers]

### Next Steps
- [priority-ordered tasks]

### Key Decisions
- [why you decided that way]
```

---

## 4. Decompose

Don't give large tasks at once. Break into smaller tasks.

### Decomposition Principles

- **Single responsibility**: one request = one clear deliverable
- **Dependency order**: prerequisite tasks first
- **Verifiable**: each task must have clear completion criteria

### Example

```
Bad:  "Refactor the entire auth pipeline"

Good: Break it down:
1. Analyze current structure of auth/middleware.ts (read only)
2. Extract JWT validation into separate module
3. Add refresh token rotation logic
4. Verify existing tests still pass
```

### Rules

- Write tasks as **verb + object + completion criteria**
- **1-3 files** modified per task is the right size
- Record decomposed tasks in docs/todo.md, check off one by one

---

## How the 4 Strategies Interact

```
User Request
    |
    v
[4. Decompose] -- break into tasks -- docs/todo.md
    |
    v (per task unit)
[2. Select] -- pick relevant context
    |
    v
[Claude executes task]
    |
    v
[3. Summarize] -- summarize result -- progress.txt
    |
    v
[1. Persist] -- save state permanently -- MEMORY.md / git
```

Key: **Decompose -> Select -> Execute -> Summarize -> Persist** cycle repeats.
