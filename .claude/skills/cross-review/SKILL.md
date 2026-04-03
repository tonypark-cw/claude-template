---
name: cross-review
description: 구현 후 Codex(GPT) 교차 코드 리뷰. git diff를 다른 모델에 전달하여 독립 리뷰 수신.
model: opus
effort: high
---

# /cross-review — Cross-Model Code Review

TRIGGER: "/cross-review", "교차 리뷰", "cross review", "크로스 리뷰"

## Prerequisites Check

Before starting, verify Codex CLI is available:
```bash
which codex 2>/dev/null || command -v codex 2>/dev/null
```

If Codex is NOT installed:
- Print: "Codex CLI not found. Install with `npm i -g @openai/codex` or skip cross-review."
- Offer fallback: Claude self-review using a different perspective (act as security reviewer, then as performance reviewer).
- Do NOT error out or fail.

## Steps

### 1. Collect Changes

```bash
git diff HEAD~1..HEAD --stat  # summary
git diff HEAD~1..HEAD          # full diff
```

If diff exceeds 500 lines:
- Summarize the diff (changed files + key changes per file)
- Send summary instead of full diff to Codex
- Note: "Full diff too large (N lines), sending summary"

### 2. Send to Codex

Use the codex:rescue agent to delegate the review:

```
Agent(subagent_type="codex:codex-rescue", prompt="""
Review this git diff for:
1. Security issues (injection, secrets, unsafe operations)
2. Code quality (error handling, edge cases, naming)
3. Design concerns (coupling, abstraction level, patterns)

Diff:
{diff_content}

Output format:
- SEVERITY (CRITICAL/HIGH/MEDIUM/LOW): description
- Overall: APPROVE / CONCERN / REJECT
""")
```

### 3. Process Codex Response

After receiving Codex's review:
- Present Codex's findings to the user
- For each CRITICAL/HIGH finding:
  - State whether you agree or disagree with specific reasoning
  - If you disagree, explain why with code evidence
- For MEDIUM/LOW findings: acknowledge and note

### 4. Resolution

- If both Claude and Codex APPROVE: report consensus
- If disagreement exists: present both positions, let user decide
- **Hard cap: 2 rounds maximum.** After round 2, present both final positions and stop.

## Output Format

```
## Cross-Review Report

### Codex Review
[Codex's findings]

### Claude's Response
- [finding]: AGREE / DISAGREE — [reason]

### Consensus
[APPROVED / NEEDS DISCUSSION — unresolved items]
```

## Fallback (No Codex)

If Codex unavailable, perform self-review with two passes:
1. **Security pass**: Review as if you're a security auditor
2. **Architecture pass**: Review as if you're reviewing someone else's code for the first time

This provides weaker but non-zero cross-checking.
