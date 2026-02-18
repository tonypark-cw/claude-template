---
name: prompt-review
description: Review prompts against Claude prompting best practices. Use when optimizing or reviewing system prompts or user prompts.
argument-hint: "[prompt text or file path]"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
---

# Prompt Review (Claude Best Practices)

## Input Handling

1. If `$ARGUMENTS` is a file path, Read it
2. If text, use as analysis target
3. If no argument, ask which prompt to review

## Checklist (7 items)

Score each item as pass/warn/fail:

| # | Item | Criteria |
|---|------|----------|
| 1 | **Clarity** | Specific action instruction? "Do X" vs "Could you X?" |
| 2 | **Context** | Motivation/background for why this is needed? |
| 3 | **Examples** | Example of desired output included? |
| 4 | **Format** | Output format (JSON, markdown, prose) specified? |
| 5 | **Constraints** | What NOT to do / patterns to avoid specified? |
| 6 | **Conciseness** | No unnecessary repetition or over-emphasis? |
| 7 | **Structure** | Logical sections via XML tags or headers? |

## Output Format

```
## Prompt Review Result

**Target**: [filename or "inline prompt"]
**Score**: X/7

### Item Scores
1. Clarity: pass [one-line comment]
2. Context: warn [one-line comment]
...

### Improvement Suggestions (priority order)
1. [highest impact improvement]
2. [second]
3. [third]

### Improved Prompt (optional)
[Draft reflecting improvement suggestions]
```

## Notes

- Review based on Anthropic official prompting guide
- Consider action-oriented phrasing over polite requests
- Excessive emphasis (IMPORTANT, CRITICAL) is usually unnecessary
