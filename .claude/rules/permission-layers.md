# 3-Layer Permission Structure

Harness controls are organized in three layers. Higher layers override lower ones.

## Layer 1 — Hooks (System Enforcement)

Hooks execute automatically. The agent cannot bypass them. Use for rules that **must never be violated**.

| Hook | Event | Enforcement |
|------|-------|-------------|
| `guard.js` | PreToolUse (Bash) | BLOCK: rm -rf, force push, hard reset, git add . / ASK: branch -D, publish, chmod 777 |
| `stop-gate.js` | Stop | BLOCK: JSON/JS/Python syntax errors in changed files |
| `check-file-header.js` | PostToolUse (Write/Edit) | BLOCK: missing // header on .ts/.js files |
| `check-line-limit.js` | PostToolUse (Write/Edit) | BLOCK: files exceeding 80 lines |
| `pre-compact.js` | PreCompact | Side-effect: saves state snapshot |
| `session-start.js` | SessionStart | Side-effect: injects context via additionalContext |

**When to use Layer 1**: The rule is critical AND the agent has repeatedly violated it through prompts alone, OR violation is unrecoverable (data loss, security breach).

## Layer 2 — Prompts (Natural Language Guidance)

Prompts guide the agent's behavior. The agent reads and follows them, but can theoretically violate them.

| File | Scope |
|------|-------|
| `CLAUDE.md` Core Principles | Universal behavior guidelines |
| `rules/thinking-model.md` | GROUND→APPLY→VERIFY→ADAPT workflow |
| `rules/workflow.md` | TODO, progress, mistakes management |
| `rules/team_protocol.md` | Agent team org chart, heartbeat, escalation |
| Agent definitions (`.claude/agents/*.md`) | Role-specific protocols |

**When to use Layer 2**: The rule requires understanding context or judgment. Examples: "match existing code style", "present alternatives before implementing".

## Layer 3 — Permissions (Access Control)

Permissions restrict what tools an agent can use.

| Setting | Location | Effect |
|---------|----------|--------|
| `permissions.allow` | `settings.json` | Tools allowed without asking |
| `permissions.deny` | `settings.json` | Tools always blocked |
| `tools` in agent frontmatter | `.claude/agents/*.md` | Tools available to that agent |
| `disallowedTools` in agent frontmatter | `.claude/agents/*.md` | Tools blocked for that agent |

**When to use Layer 3**: Restricting an agent's capabilities by role. Example: validator cannot Write/Edit.

## Promotion Rule

When an agent repeatedly violates a Layer 2 rule (same mistake 2+ times across sessions):

1. Identify the specific violation pattern
2. Write a hook (Layer 1) that detects and blocks it
3. Keep the Layer 2 rule as explanation (why the hook exists)
4. Record the promotion in `docs/mistakes.md`

## Decision Guide: Where Does a New Rule Go?

```
Is violation unrecoverable (data loss, security)?
  → YES → Layer 1 (Hook)
Does the rule restrict tool access by role?
  → YES → Layer 3 (Permission)
Does the rule require judgment or context?
  → YES → Layer 2 (Prompt)
Has the rule been violated repeatedly via prompts?
  → YES → Promote to Layer 1
Default → Layer 2
```
