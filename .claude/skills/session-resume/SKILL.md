---
name: session-resume
description: Recover previous session state. Reads progress.txt, git log, TODO, and mistake log to summarize current status. Use at session start.
argument-hint: ""
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash
---

# Session Resume (State Recovery)

Quickly restore previous work state at new session start.

## Step 1: Collect state files

Read these files in order (skip if missing):

1. `progress.txt` - free-form progress notes
2. `docs/todo.md` - task list with status
3. `docs/mistakes.md` - recent mistake log
4. `CLAUDE.md` - project rules

## Step 2: Check Git state

```bash
git log --oneline -15
git status
git diff --stat
```

## Step 3: Check memory

Read `~/.claude/projects/*/memory/MEMORY.md`

## Step 4: Output summary

```
## Session Resume

### Last Work
- Recent commit: [commit message]
- Changed files: [file list]

### Pending Tasks
- [ ] [from todo.md or git diff]

### Current State
- Branch: [branch name]
- Staged: [count]
- Modified: [count]
- Untracked: [count]

### Suggested Next Steps
1. [highest priority task]
2. [second]
```

## Rules

- Skip sections for missing files (not an error)
- Use Git state as the source of truth
- Keep summary concise - readable in 30 seconds
