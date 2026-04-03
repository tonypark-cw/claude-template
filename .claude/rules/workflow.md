# Workflow Rules

## Task Management

- **TODO required**: write task list in `docs/todo.md` at work start (date + order + completion criteria)
- **Mistake log**: record mistakes in `docs/mistakes.md` (situation/mistake/cause/fix/lesson)
- **Progress report**: update `docs/progress.md` at session end
- Break large tasks into smaller ones, record in TODO, check off one by one

## Progress Report Format

- **When**: update `docs/progress.md` at every session end
- **Format**: completed / in-progress / next, grouped by module/area
- Completed: only actual deliverables (not setup chores)
- In-progress: currently running or partially done (include metrics if applicable)
- Next: actionable items, concise
- Newest entry on top, one entry per day

## Session Resume

At new session start, read these files and summarize current state:
- `docs/progress.md` (latest daily progress)
- `docs/todo.md` (pending tasks)
- `docs/mistakes.md` (recent mistakes)
- `git log --oneline -5`, `git status` (code state)
- Format: last work → pending items → next step suggestion

## Context Strategies

4 strategies for managing context across sessions:
1. **Persist** — save to files (handoff.md, todo.md, progress.md)
2. **Select** — load only what's needed for current task
3. **Summarize** — compress large context before it fills the window
4. **Decompose** — break into subagents for isolated execution
