---
name: audit-harness
description: 하네스 경량화 감사. 미사용 훅/규칙 식별, 중복 규칙 병합, 고아 파일 정리.
model: sonnet
effort: medium
---

# /audit-harness — Harness Audit & Cleanup

TRIGGER: "/audit-harness", "/audit", "하네스 감사", "하네스 정리", "harness cleanup"

## Steps

### 1. Inventory Collection

Read and catalog:
- `.claude/rules/*.md` — list each file with line count
- `.claude/hooks/*.js` — list each file
- `.claude/settings.local.json` — extract which hooks are actually registered
- `.claude/context/hook-stats.json` — read activation counts per tool
- `.claude/context/failure-log.jsonl` — read failure patterns

### 2. Analysis

Produce a report with these sections:

**Orphan Files**: hooks/*.js files NOT registered in settings.local.json → delete candidates.

**Low-Activity Hooks**: hooks registered but with 0 activations in hook-stats.json. Note: a guard hook with 0 activations may mean no dangerous commands were attempted (good), not that the hook is useless. Flag but don't auto-recommend deletion for security hooks.

**Duplicate Rules**: rules/*.md files with >80% content overlap → merge candidates. Use Grep to find shared phrases across files.

**Rules Volume**: total line count of all rules/*.md files. If >500 lines, suggest compression or merging.

**Repeated Failures**: failure-log.jsonl entries with count >= 3 → candidates for new rules or hooks (Layer 2 → Layer 1 promotion per permission-layers.md).

### 3. Output Format

```
## Harness Audit Report

### Inventory
- Rules: N files, M total lines
- Hooks: N files (N registered, N orphan)
- Skills: N

### Orphan Files
- [file]: not registered in settings → DELETE?

### Low-Activity Hooks
- [hook]: 0 activations (security: KEEP / non-security: REVIEW)

### Duplicate Rules
- [file1] ↔ [file2]: N% overlap → MERGE?

### Rules Volume
- Total: M lines (threshold: 500)

### Repeated Failures (promote to L1?)
- [pattern]: N occurrences → suggest [rule/hook]

### Recommendations
1. [action]
2. [action]
```

### 4. Execution

Do NOT delete files automatically. Present the report and wait for user approval on each action.

After user approves:
- Delete orphan files
- Merge duplicate rules
- Create new rules/hooks for repeated failures
- Update settings.local.json if hooks removed
