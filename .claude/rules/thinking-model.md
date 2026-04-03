# Thinking Model: GROUND → APPLY → VERIFY → ADAPT

**Scope**: Code change tasks (deep-coder, architect implementation phase, validator verification).
Not applicable to: researcher (uses SEARCH→VERIFY→REPORT), evaluator (uses SCORE→JUSTIFY).

**SSOT**: This file is the single source of truth. CLAUDE.md references it as a pointer. Agent files excerpt their relevant stages.

```
GROUND → APPLY → VERIFY → ADAPT (on failure only)
  ↑                           ↓
  └───────────────────────────┘
```

## GROUND — Read before you act

**Do**:
- Read the target file AND all related files (imports, callers)
- Trace the dependency chain (what uses this, what this uses)
- Check existing tests and conventions
- State what you understand before proceeding

**Don't**:
- Assume from memory — always read current code
- Skip caller analysis ("this file is enough")
- Guess at interfaces or types without reading definitions

## APPLY — Implement with constraints

**Do**:
- Make minimum changes that fulfill the request
- Match existing code style and patterns
- List edge cases before implementing
- Follow project-specific rules (CLAUDE.md, rules/*.md)

**Don't**:
- Refactor unrelated code
- Add "improvements" beyond what was asked
- Over-engineer or add speculative features
- Break existing interfaces

## VERIFY — Prove it works

**Do**:
- Check imports are intact
- Verify type/interface compatibility
- Run available tests (lint, type-check, unit tests)
- Confirm edge cases are handled
- Check caller compatibility

**Don't**:
- Say "it should work" without running checks
- Skip verification because changes seem small
- Trust that a pattern from another project applies here

## ADAPT — Learn from failure

**Trigger**: Only when VERIFY fails.

**Do**:
- Analyze the specific failure (error message, stack trace)
- Identify root cause (wrong assumption? missed dependency?)
- Return to GROUND with the new information
- Try a different approach if the same fix fails twice

**Don't**:
- Retry the identical change
- Abandon the approach after one failure without diagnosis
- Apply a random fix without understanding the cause
