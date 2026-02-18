# Model Strategy: Opus vs Sonnet

Use the right model for each task. Opus for judgment, Sonnet for execution.

## Decision Matrix

| Factor | Opus | Sonnet |
|--------|------|--------|
| Cost | ~5x | 1x |
| Speed | Slower | Faster |
| Judgment & analysis | Strong | Adequate |
| Pattern-based execution | Overkill | Ideal |
| Multi-file reasoning | Strong | Adequate |
| Repetitive generation | Wasteful | Efficient |

## When to Use Opus

Tasks requiring **judgment, analysis, or novel problem-solving**:

- Architecture decisions (multiple valid approaches, tradeoffs)
- Root cause analysis for non-obvious bugs
- Design strategy that affects multiple components
- Refactoring plans for tightly-coupled code
- Performance optimization (profiling interpretation + strategy)
- Cross-cutting changes spanning 5+ interdependent files
- Reviewing and challenging technical decisions

## When to Use Sonnet

Tasks with **established patterns or clear specifications**:

- CRUD operations following existing patterns
- Adding tests for existing code
- Data generation from templates
- Single-file bug fixes with obvious cause
- Documentation and comments
- Routine tool/feature registration (boilerplate)
- Running and interpreting test results
- Code formatting, linting, simple refactors

## Switching in Practice

```
# Switch to Sonnet for routine work
/model sonnet

# Switch to Opus for complex analysis
/model opus
```

## Project-Specific Customization

Add a `## Model Strategy` section to your project's `CLAUDE.md` with concrete examples:

```markdown
## Model Strategy

**Opus (30%)**: [list project-specific judgment tasks]
**Sonnet (70%)**: [list project-specific routine tasks]
```

Adjust the ratio based on your project's complexity profile:
- **Research/ML projects**: Opus 40% / Sonnet 60% (more analysis)
- **CRUD-heavy apps**: Opus 15% / Sonnet 85% (more pattern work)
- **Infra/DevOps**: Opus 25% / Sonnet 75% (moderate complexity)

## Anti-Patterns

- Using Opus for "everything just to be safe" — wastes cost and time
- Using Sonnet for multi-system debugging — may miss subtle interactions
- Switching models mid-task on interdependent changes — context loss risk
- Defaulting to Opus for code review — Sonnet handles pattern checks well
