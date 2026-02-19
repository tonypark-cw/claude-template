---
name: session-resume
description: Recover previous session state. Reads progress report, git log, TODO, mistake log, and session history to summarize current status. Use at session start.
argument-hint: ""
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash
---

# Session Resume (State Recovery)

Quickly restore previous work state at new session start.

## Step 1: Read progress report

Read `docs/progress.md` first — this is the primary source for understanding where things left off.

## Step 2: Collect state files

Read these files in order (skip if missing):

1. `docs/progress.md` - daily progress (✅ 완료 / 🚧 진행중 / 📌 해야할 일)
2. `docs/todo.md` - task list with status
3. `docs/mistakes.md` - recent mistake log
4. `CLAUDE.md` - project rules

## Step 3: Check Git state

```bash
git log --oneline -15
git status
git diff --stat
```

## Step 4: Check memory

Read `~/.claude/projects/*/memory/MEMORY.md`

## Step 5: Check recent session history (if context is unclear)

If progress.md is outdated or missing, read recent session `.jsonl` files from `~/.claude/projects/*/` to reconstruct what was done:

```bash
ls -lt ~/.claude/projects/*/*.jsonl | head -5
```

Read the first/last 200 lines of the most recent session file to extract key context.

## Step 6: Output summary

```
## Session Resume

### Latest Progress (from docs/progress.md)
- ✅ [recent completions]
- 🚧 [in-progress items]
- 📌 [pending items]

### Git State
- Branch: [branch name]
- Recent commit: [commit message]
- Modified: [count]

### Suggested Next Steps
1. [highest priority from 📌 or 🚧]
2. [second]
```

## Rules

- Skip sections for missing files (not an error)
- `docs/progress.md` is the primary context source — read it FIRST
- Use Git state as secondary source of truth
- If progress.md and git state conflict, flag it
- Keep summary concise - readable in 30 seconds
