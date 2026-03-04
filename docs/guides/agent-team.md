# Agent Team — Parallel Multi-Agent Development

Multiple Claude Code instances working simultaneously on different parts of the same project via tmux.

## When to Use

| Scenario | Agents | Example |
|----------|--------|---------|
| New domain agents (N modules) | 2-4 | Add sales, inventory, manufacturing agents simultaneously |
| New feature (DB + Tool + Service) | 3 | db/handler + agents/tools + aiemployee/service in parallel |
| Batch content creation | 2-5 | Write 5 procedure docs or test suites at once |
| Full-stack feature | 3-5 | Backend API + frontend components + tests |

**Don't use when**: single-file fix, tightly coupled refactoring, sequential pipeline (ML training).

---

## 3 Iron Rules

### Rule 1: File Boundary Isolation

Each agent modifies ONLY its assigned files. No overlap allowed.

```
Bad:  Agent A edits utils.ts, Agent B also edits utils.ts
Good: Agent A edits db/handler.go, Agent B edits agents/tools.go
```

### Rule 2: Shared Interfaces First

Define shared types/interfaces BEFORE (or in a dedicated agent that launches first) so other agents can import them.

```
Agent 1 (data): defines types in models.go     ← launches first
Agent 2 (tools): imports from models.go         ← launches after delay
Agent 3 (service): imports from models.go       ← launches after delay
```

### Rule 3: Unidirectional Dependencies Only

A depends on B is fine. A and B depend on each other is forbidden.

```
Good: tools.go → db/handler.go → models.go  (one direction)
Bad:  tools.go ↔ db/handler.go              (circular)
```

---

## Prompt File Structure

Each agent gets a `.md` file with clear scope:

```markdown
# Agent Role: [name]

## Your Files (create/modify ONLY these)
- path/to/file1.go
- path/to/file2.go

## Context
- Tech stack, architecture, existing patterns to follow

## Tasks
1. Specific task with acceptance criteria
2. Another task

## Rules
- Do NOT modify files outside your scope
- Follow existing code patterns (reference specific files)
- Import shared types from [path]
```

**Naming convention**: `01-data.md`, `02-tools.md`, `03-service.md` — numeric prefix controls launch order.

---

## Decomposition Strategies

### Strategy A: Layer Split (Feature Development)

Split by architectural layer. Best for adding a complete feature.

```
01-db.md        → db/{feature}_handler.go, sql/migration.sql
02-tools.md     → agents/{feature}_tools.go
03-service.md   → aiemployee/{feature}.go
```

Dependency: service → tools → db (unidirectional)

### Strategy B: Module Split (Multiple Independent Units)

Split by independent modules. Best for batch additions.

```
01-agent-sales.md       → agents/agent_sales/
02-agent-inventory.md   → agents/agent_inventory/
03-agent-finance.md     → agents/agent_finance/
```

Dependency: none (fully parallel)

### Strategy C: Content Split (Documentation / Procedures)

Split by content area. Best for batch content generation.

```
01-sales-procs.md       → agents/procedures/sales/*.md
02-support-procs.md     → agents/procedures/support/*.md
03-ops-procs.md         → agents/procedures/operations/*.md
```

Dependency: none (fully parallel)

---

## Running

```bash
# Preview layout (no launch)
bash run-agent-team.sh ./prompts/my-feature --dry

# Launch 3 agents with sonnet
bash run-agent-team.sh ./prompts/my-feature

# Launch with opus, 3s delay
bash run-agent-team.sh ./prompts/my-feature --model opus --delay 3

# Specify working directory
bash run-agent-team.sh ./prompts/my-feature --work-dir /path/to/project
```

## Monitoring

```
tmux attach -t agent-team      # attach
Ctrl+B → arrow keys            # switch panes
Ctrl+B → z                     # zoom pane (full screen)
Ctrl+B → d                     # detach (agents keep running)
```

**Intervene when**:
- Agent asks for permission (approve or deny)
- Agent is stuck in error loop (kill and reassign)
- Agent writes outside its file scope (stop immediately)

---

## Practical Tips

1. **Start small**: 2 agents first, then scale to 3-5
2. **Stagger launches**: 5-10s delay between agents avoids API rate limits
3. **Data agent first**: if shared types exist, give the data agent a head start
4. **Review after merge**: agents don't know about each other — verify integration after all finish
5. **Git commit per agent**: each agent should commit its own work for easy rollback
6. **Sonnet for parallel**: use sonnet (faster, cheaper) for parallel work; reserve opus for complex decisions
