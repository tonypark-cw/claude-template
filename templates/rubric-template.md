# Evaluation Rubric

## Scoring Guide

| Score | Label | Meaning |
|-------|-------|---------|
| 5 | Excellent | Exceeds expectations, no issues |
| 4 | Good | Minor issues only, production-ready |
| 3 | Acceptable | Meets minimum bar, some improvements needed |
| 2 | Needs Work | Notable gaps, not production-ready |
| 1 | Unacceptable | Fundamental problems, must be fixed |

Passing threshold: all criteria >= 3. Any criterion <= 2 → FAIL.

---

## Criteria

### 1. Correctness
Does the implementation produce the right output?

| Score | Anchor |
|-------|--------|
| 5 | All logic is correct, edge cases handled, no wrong outputs |
| 3 | Core logic is correct, minor edge case gaps |
| 1 | Wrong output for normal inputs |

---

### 2. Completeness
Are all requirements met?

| Score | Anchor |
|-------|--------|
| 5 | All P0 and P1 requirements implemented |
| 3 | All P0 requirements implemented, P1 may be missing |
| 1 | One or more P0 requirements missing |

---

### 3. Code Quality
Is the code readable, DRY, and well-named?

| Score | Anchor |
|-------|--------|
| 5 | Clean, idiomatic, DRY, clear naming throughout |
| 3 | Readable with minor issues (duplication, naming inconsistency) |
| 1 | Hard to follow, significant duplication, poor naming |

---

### 4. Security
Are there vulnerabilities?

| Score | Anchor |
|-------|--------|
| 5 | No security issues found |
| 3 | No critical issues; minor concerns acceptable |
| 1 | Hardcoded secrets, SQL injection, or sensitive file exposure |

---

### 5. Performance
Are there obvious bottlenecks?

| Score | Anchor |
|-------|--------|
| 5 | Efficient algorithms and data structures, no bottlenecks |
| 3 | Acceptable performance for expected load |
| 1 | Obvious bottleneck (e.g., N+1 query, blocking I/O in hot path) |

---

### 6. Test Coverage
Do meaningful tests exist?

| Score | Anchor |
|-------|--------|
| 5 | Core logic, edge cases, and error paths all tested |
| 3 | Happy path covered, edge cases missing |
| 1 | No meaningful tests |

---

## Customization Notes

- **Add criteria**: Copy a criterion block above and adjust anchors to match project standards.
- **Remove criteria**: Delete the block and update the passing threshold comment.
- **Adjust weights**: The evaluator agent scores each criterion equally by default. To weight criteria differently, add a `Weight` column and note it in the rubric.
- **P0 acceptance criteria**: Define these in `docs/prd.md`. The evaluator will check every P0 criterion independently of this rubric.
- **Project-specific anchors**: Replace generic anchor text with concrete examples from the codebase (e.g., "5: uses project logger, not print()" for Code Quality).
