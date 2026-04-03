# Subagent Guide — Context Firewall

This document supplements `team_protocol.md` (agent roles and escalation). On conflict, `team_protocol.md` takes precedence.

## Core Principle

Subagents exist for **context isolation**, not role separation. The primary value is keeping the main context window clean so the orchestrator can make better decisions.

## When to Use Subagents (Defaults)

- **Context is growing large** — delegate detail-heavy work (file exploration, test execution) to a subagent, receive a summary back
- **Independent parallel work** — multiple files/modules with no shared state can be processed simultaneously
- **Verification needs objectivity** — validator/evaluator in a separate context avoids confirmation bias from the implementation context
- **Risky exploration** — use worktree isolation so failed experiments don't pollute the main branch

## When NOT to Use Subagents (Warnings)

- **Tightly-coupled changes** — if frontend and backend must be modified in lockstep within the same function/API, keeping them in one context reduces coordination overhead
- **Simple tasks** — 1-2 file changes don't justify the orchestration cost
- **Shared state needed** — if the subagent needs to know what happened 5 messages ago, it's cheaper to keep it in the main context

## Prompting Rules

1. **Pass only the relevant CLAUDE.md path** — never inject the full parent context
2. **Inline critical rules** in the prompt — the subagent may not read CLAUDE.md thoroughly
3. **Return summaries, not raw output** — subagent results should compress, not expand, the main context
4. **Specify output format** — tell the subagent exactly what structure to return

```
Agent(prompt="""
[Critical Rules]
- DB: SELECT only, no DDL
- Model files: never commit
[Context]
Read {project}/CLAUDE.md for details
[Task]
...
[Output Format]
Return: summary (3 lines), files changed, issues found
""")
```

## Anti-Patterns

| Pattern | Problem | Alternative |
|---------|---------|-------------|
| Frontend agent + Backend agent | Coordination cost exceeds benefit | Single agent for coupled changes |
| Inject full conversation history | Destroys context firewall | Pass task description + relevant file paths only |
| Return raw tool output to main | Main context bloat | Subagent summarizes before returning |
| Subagent for every small task | Orchestration overhead | Direct tool calls for simple work |
