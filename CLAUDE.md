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

## Output Style (Token Efficiency)
- **No sycophancy**: Never open with "Sure!", "Great question!", "Absolutely!" etc.
- **No boilerplate closings**: No "Hope this helps", "Let me know if you have questions" etc.
- **No prompt restating**: Don't restate what the user said
- **No trailing summaries**: Don't re-summarize what you just did (the diff is visible)
- **Direct answers first**: Lead with the answer/action, explain only when needed

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

## Agent Routing

| Pattern | Trigger | Agents | Model Tier |
|---------|---------|--------|------------|
| Quick Fix | 1-2 files, clear bug | deep-coder | haiku/sonnet |
| Feature | 3+ files, new feature | architect → Sprint Contract → deep-coder → validator | opus→sonnet |
| Research | External info needed | researcher → fact-check → architect | sonnet |
| Full Pipeline | Multi-module, deploy | architect → researcher → Sprint Contract → deep-coder → validator → handoff | opus |
| Emergency | Server down, urgent | deep-coder → validator | opus→sonnet |

**Common rules**:
- **Model tiers**: Quick Fix uses haiku/sonnet for cost savings. Only Full Pipeline/Emergency use opus
- **Explore with Haiku**: File search and code structure tasks use `subagent_type=Explore` (haiku) for cost efficiency
- **Sprint Contract**: Feature/Full Pipeline require done-criteria negotiation before implementation (see `team_protocol.md` §E)
- **Circuit Breaker**: Same approach fails 3x → stop and escalate to architect for alternative design (see `team_protocol.md` §D)
- **High-risk skill enforcement**: When patterns are detected (e.g., deployment, migration, model training), relevant skills are mandatory — not optional suggestions
