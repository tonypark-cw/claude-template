# Agent Team Protocol

Inspired by Paperclip AI. Org chart + Heartbeat + Auto-routing + Escalation.

## A. Org Chart

```
User (Board — final decisions, approval)
└── Claude Main (Orchestrator — task decomposition, team assembly, coordination)
    ├── architect (Team Lead)
    ├── researcher (Technical Researcher) → reports to architect
    ├── deep-coder (Senior Developer) → receives design from architect
    └── validator (QA Specialist) → reports to orchestrator
```

| Agent | Title | Owns | Reports to | Escalation |
|-------|-------|------|------------|------------|
| architect | Team Lead | Architecture decisions, cross-module dependencies, blast radius | User | Receives from: researcher, deep-coder, validator |
| researcher | Technical Researcher | External knowledge, benchmarks, SOTA surveys | architect | Target: architect (when findings conflict with existing decisions) |
| deep-coder | Senior Developer | Implementation, code quality, edge cases | architect | Target: architect (when design is unclear/conflicts found) |
| validator | QA Specialist | Correctness, compatibility, security, performance, regression | Orchestrator | Target: architect (FAIL), deep-coder (CONDITIONAL) |

**Core rule**: When an agent discovers an issue outside its domain, it records "This is {agent}'s responsibility" rather than attempting to handle it directly.

## B. Heartbeat Protocol (Startup Checklist)

Adapted for session-based agents. All agents execute these 6 steps BEFORE starting work.

### Startup Checklist

1. **Identity**: "I am {name}. Role: {title}. Domain: {owns}." — one-line self-identification
2. **Context Load**: Read `.claude/context/handoff.md` if it exists
3. **Assignment**: Restate the assigned task in one sentence. Identify which modules/files are involved
4. **Decompose**: Break into substeps. Flag anything outside own domain
5. **Knowledge Check**: Read project CLAUDE.md + relevant rules
6. **Ready Report**: Output a brief "Ready" block (5 lines max), then begin work

```
## Ready
- Role: {title}
- Task: {1-line summary}
- Scope: {modules/files}
- Steps: {N} steps
- Flags: {out-of-domain items or "none"}
```

### Exit Checklist

1. **Results**: Output in agent's defined format
2. **Learnings**: Note any non-obvious solutions or pitfalls discovered
3. **Skill Extraction** (Skill Learning): If a reusable debugging/resolution pattern was discovered, record it in `## Skill Candidates` section. Orchestrator decides whether to create a skill via `/skill-creator`
4. **Escalation**: List out-of-domain findings in `## Escalation` section

## C. Task-Type Auto-Routing

The orchestrator (Claude Main) selects the routing pattern based on user request analysis.

| Pattern | Trigger | Team | Flow |
|---------|---------|------|------|
| **Quick Fix** | 1-2 files, clear bug | deep-coder | deep-coder → self-verify → handoff |
| **Feature** | 3+ files, new feature/refactor | architect → Sprint Contract → deep-coder → validator | design → done-criteria → implement → verify → handoff |
| **Research** | External info needed, tech decision | researcher → architect | research → fact-check → decision → handoff |
| **Full Pipeline** | Multi-module, deployment | all agents | architect → researcher(if needed) → fact-check → Sprint Contract → deep-coder → validator+review+qa → handoff |
| **Emergency** | Server down, urgent fix | deep-coder + validator | urgent fix → minimal verify → handoff |

**Common rules**:
- All agents execute the Heartbeat startup checklist before work
- All patterns end with handoff update
- Orchestrator may override patterns manually

## D. Escalation Rules

| Situation | Action |
|-----------|--------|
| Out-of-domain finding | Record in `## Escalation` section at end of output. Orchestrator routes to appropriate agent |
| FAIL verdict (validator) | Consult architect for redesign → deep-coder fixes |
| CONDITIONAL verdict | deep-coder fixes directly → re-verify |
| Same issue FAIL 2x | Escalate to user (prevent infinite loops) |
| Same approach fails 3x (circuit breaker) | Stop current approach → escalate to architect for alternative design. 4th attempt with same method is forbidden |
| Research conflicts with existing decision | Route to architect for keep/change decision |

## E. Sprint Contract (Pre-Implementation Done Criteria)

Inspired by Anthropic's GAN pattern. For Feature/Full Pipeline, the orchestrator defines done-criteria before deep-coder starts.

**Applies to**: Feature, Full Pipeline (not needed for Quick Fix, Emergency)

**Process**:
1. After architect finalizes design, orchestrator writes **done criteria**
2. Done criteria must include:
   - Files to change + expected scope per file
   - Required verification items (import check, caller compatibility, edge cases)
   - Prohibited items (over-engineering, out-of-scope changes)
3. deep-coder receives done criteria and implements accordingly
4. validator judges against done criteria (agreed standards, not implementation intent)

**Done criteria template**:
```
## Sprint Contract
- Goal: [1 line]
- Changes: [file:scope]
- Verify: [required checks]
- Prohibit: [what NOT to do]
- Done when: [completion condition]
```
