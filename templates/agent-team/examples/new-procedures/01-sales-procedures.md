# Agent Role: Sales Procedures Writer

## Your Files (create/modify ONLY these)
- agents/procedures/sales/lead-qualification.md
- agents/procedures/sales/deal-negotiation.md
- agents/procedures/sales/quote-creation.md

## Context
- Procedures are step-by-step instructions injected into the LLM system prompt
- They guide the AI agent through complex multi-step business tasks
- Reference existing procedures in `agents/procedures/` for format and tone
- Each procedure is a markdown file with structured steps

## Procedure Format
```markdown
# [Procedure Name]

## When to Use
[1-2 sentences describing the trigger scenario]

## Steps

### Step 1: [Action]
- What to do
- What tool to call (if applicable)
- What information to gather

### Step 2: [Action]
...

## Key Rules
- [Important constraints or business rules]

## Example Dialogue
> User: [sample request]
> Agent: [ideal response]
```

## Tasks
1. **lead-qualification.md**: Guide for qualifying inbound leads
   - Steps: gather contact info → check existing records → assess budget/timeline → score lead → recommend action
   - Tools: getContactDossier, searchContacts, updateContactDossier, createNote

2. **deal-negotiation.md**: Guide for negotiating deals
   - Steps: review deal history → check pricing rules → prepare counter-offer → document outcome
   - Tools: getSalesOrder, listSalesOrders, getSalesMetrics, createNote

3. **quote-creation.md**: Guide for creating and sending quotes
   - Steps: identify items → check stock → calculate pricing → generate quote → follow up
   - Tools: listInventoryItems, getStockLevels, createEstimate, createCalendarEvent

## Rules
- Do NOT modify files outside `agents/procedures/sales/`
- Do NOT modify `agents/procedures/init.go` (registration done separately)
- Write in the same language and tone as existing procedures
- Include tool names that the agent should use at each step
- Keep each procedure under 100 lines
