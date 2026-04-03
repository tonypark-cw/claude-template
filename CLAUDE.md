@AGENTS.md

# CLAUDE.md — Claude Code Specific Rules

## Core Principles

1. **Verify Before Acting** — Never assume without reading. If ambiguous, ask for clarification. Read code before modifying it.
2. **Simplicity First** — Build only what was requested. No speculative features, no premature abstractions.
3. **Surgical Changes** — Touch only what's necessary. Match existing style. Flag (don't fix) unrelated issues.
4. **Read Then Act** — All code changes follow GROUND→APPLY→VERIFY→ADAPT. See `rules/thinking-model.md`.
5. **Goal-Driven** — Define verifiable success criteria before starting. Commit to approach once decided.
6. **Safety First** — Investigate before deleting. Never use destructive actions as shortcuts.
7. **Efficient Execution** — Parallel tool calls when independent. Skip unnecessary summaries. Use subagents for isolation.

_These 7 principles apply to ALL projects using this template._

## Project Context

- **Project**: [YOUR PROJECT NAME]
- **Tech Stack**: [YOUR TECH STACK]
- **Language**: [RESPONSE LANGUAGE PREFERENCE]
- **Testing**: [Jest / Vitest / pytest / etc.]

## Communication

- Respond in the user's language
- Structured choices (tables, numbered lists) for decisions
- Concise, fact-based — no self-congratulation

## Rules Index

| File | Scope |
|------|-------|
| `rules/workflow.md` | TODO, progress, mistakes, session resume |
| `rules/team_protocol.md` | Agent team org chart, heartbeat, escalation |
| `rules/thinking-model.md` | GROUND→APPLY→VERIFY→ADAPT model |
| `rules/permission-layers.md` | 3-layer permission structure (Hooks > Prompts > Permissions) |
| `rules/subagent-guide.md` | When/how to use subagents (context firewall) |
| `rules/mcp-boundaries.md` | MCP tool boundaries and selection checklist |
| `rules/example-backend.md` | Backend patterns (template — customize) |
| `rules/example-frontend.md` | Frontend patterns (template — customize) |
