---
name: handoff
description: 세션/에이전트 간 컨텍스트 전달용 핸드오프 문서 생성. 현재 작업 상태를 최소한의 문서로 압축하여 다음 세션이나 서브에이전트가 바로 이어서 작업 가능. TRIGGER when user says "/handoff", "핸드오프", "인수인계", "세션 정리", "hand off", "session summary".
model: sonnet
effort: low
---

# Handoff — Session/Agent Context Transfer

Record current state to `.claude/context/handoff.md`.
Next session/subagent reads this single file to restore context.

## PARA Document Format (30 lines max)

```markdown
# Handoff — {date}

## Projects (Active)
Current active work. Resume immediately in next session.

### {project/module}
- **Status**: {1-line summary}
- **Branch**: {branch}
- **Uncommitted**: {N} files
- **Next**:
  - [ ] {action 1}
  - [ ] {action 2}
- **Read**: {path1}, {path2}

## Areas (Ongoing)
Infrastructure/state that persists across sessions.

| Item | Status | Note |
|------|--------|------|
| {server/service} | {status} | {note} |

## Resources (Reusable)
Decisions/facts referenced repeatedly. Avoid re-researching each session.

- {decision/fact}: {summary} (source: {rules file or date})

## Archive (Done/Deferred)
Completed or deferred items from this session.

- [x] {completed task}
- [~] {deferred task} — reason: {why}
```

## Usage Patterns

### Pattern 1: Session Switch
```
Session A end: /handoff → handoff.md generated
Session B start: "Read handoff.md and continue"
```

### Pattern 2: Subagent Delegation
```
Main: create handoff-{module}.md
Agent(prompt="Read .claude/context/handoff-{module}.md and do X")
```

### Pattern 3: Team Agent Handover
```
Reviewer done → handoff-review.md
QA receives: "Read review results and test"
```

## Principles
1. **30 lines max** — PARA 4 sections combined. Use file paths instead of descriptions
2. **Self-contained** — Start work with no other docs needed
3. **Action-oriented** — "What to do next" matters more than "what was done"
4. **File paths required** — "Read this file" instead of abstract descriptions
