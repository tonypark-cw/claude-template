# CLAUDE.md - Project Rules

## Grand Principles

### 1. Ask Before Acting
- If the instruction is ambiguous, incomplete, or has multiple interpretations, **ALWAYS ask for clarification before proceeding**
- Never silently assume intent. Present options with tradeoffs and let the user decide

### 2. Think Before Coding
- Before writing code, state: what you understand, assumptions, and approach
- If multiple valid approaches exist, present them briefly and ask which to pursue
- Push back if a simpler solution exists

### 3. Simplicity First
- Build only what was requested. No speculative features, no premature abstractions
- Minimum code that solves the problem
- **80-line rule**: single file exceeding 80 lines must be split into logical modules
- **File header comment**: every file must start with a one-line `//` comment describing its role

### 4. Surgical Changes
- Touch only what's necessary to fulfill the request
- Match existing code style, even if suboptimal
- Don't refactor unrelated code
- Flag (but don't fix) unrelated issues you notice

### 5. Goal-Driven Execution
- Convert vague tasks into verifiable success criteria before starting
- State what success looks like, then work toward it
- Once approach is decided, commit to it. Don't re-question decisions without direct contradiction

### 6. Codebase Awareness (STOP & EXPLAIN)
- Always know the overall file structure and each file's role
- If user's understanding conflicts with actual code behavior, **stop all work immediately** and explain the situation first
- Check a file's role in the overall structure before modifying it

### 7. Plan-Review Loop
- All work follows **plan -> review -> fix -> review** cycle
- Present plans before writing code; get user approval
- After implementation, review results; if issues found, re-plan

### 8. No Guessing
- **Never speculate** about code you haven't read
- If the user mentions a specific file, read it before responding
- When uncertain, investigate first, assert later
- Cross-verify across multiple sources; state confidence level when low

### 9. State Management
- Track progress with `docs/progress.md` for daily work reporting
- Use git commits as checkpoints (enable rollback)
- Never abandon work due to context limits - save state and continue
- Save current state to memory/files before context window refreshes

### 10. Efficient Execution
- Use subagents only when parallelization/isolation is needed
- Execute independent tool calls in parallel
- Skip unnecessary summaries after tool calls; move to next task
- Clean up temporary files/scripts after work completion

### 11. Safety First
- Hard-to-reverse actions (file deletion, force push, DB drop) **require user confirmation**
- Actions visible to others (PR, code push, messages) also need confirmation
- Never use destructive actions as shortcuts to bypass obstacles
- **DB 인프라 조작 금지**: DB 스키마/카탈로그 수정(CREATE/DROP/ALTER TABLE, UPDATE system catalogs, CREATE/DROP GRAPH, CREATE EXTENSION 등) 절대 불가. DB 인프라 이슈 발견 시 DB 관리자에게 요청할 SQL만 제공하고, 직접 실행하지 않음. 코드에서는 SELECT(읽기)만 허용.

## Context Splitting

Split domain-specific rules into `.claude/rules/*.md` files.
CLAUDE.md stays compact (index only). See `docs/guides/context-splitting.md`.

Example rules files in `.claude/rules/`:
- `example-backend.md` — Backend API + DB patterns
- `example-frontend.md` — Frontend component patterns

## Project Context

- **Project**: [YOUR PROJECT NAME]
- **Tech Stack**: [YOUR TECH STACK]
- **Language**: [RESPONSE LANGUAGE PREFERENCE]
- **Module System**: [CommonJS / ESM / etc.]
- **Testing**: [Jest / Vitest / etc.]

## Communication Rules

- Respond in [your preferred language] when the user writes in [that language]
- When presenting choices, use structured format (tables, numbered lists)
- For security-sensitive operations, always verify first
- Be concise and direct - fact-based progress reports without self-congratulation
- Avoid excessive markdown: prefer flowing prose over short bullet lists

## Workflow Rules

- **TODO required**: write task list in `docs/todo.md` at work start (date + order + completion criteria)
- **Mistake log**: record mistakes in `docs/mistakes.md` (situation/mistake/cause/fix/lesson)
- **Progress report**: update `docs/progress.md` at session end (details below)
- **4 strategies**: Persist -> Select -> Summarize -> Decompose (details: `docs/guides/context-engineering.md`)
- **Model strategy**: Use Opus for judgment, Sonnet for execution (details: `docs/guides/model-strategy.md`)
- Check `docs/todo.md`, `docs/mistakes.md`, and `docs/progress.md` at session start
- Break large tasks into smaller ones, record in TODO, check off one by one
- **Auto session resume**: at new session start, read these files and summarize current state:
  - `docs/progress.md` (latest daily progress), `docs/todo.md` (pending tasks), `docs/mistakes.md` (recent mistakes)
  - `git log --oneline -5`, `git status` (code state)
  - Session history: `~/.claude/projects/*/` recent `.jsonl` files (for context recovery)
  - Format: last work -> pending items -> next step suggestion

### Progress Report Rules

- **When**: update `docs/progress.md` at every session end
- **Format**: ✅ 완료 / 🚧 진행중 / 📌 해야할 일, grouped by module/area
- **완료**: only actual deliverables (not setup chores or infrastructure)
- **진행중**: currently running or partially done (include metrics if applicable)
- **해야할 일**: next actionable items, concise
- **Context recovery**: if current session context is unclear, read recent session `.jsonl` files from `~/.claude/projects/*/` to reconstruct what was done
- Newest entry on top, one entry per day
