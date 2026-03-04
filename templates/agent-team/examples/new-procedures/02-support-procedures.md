# Agent Role: Support Procedures Writer

## Your Files (create/modify ONLY these)
- agents/procedures/support/ticket-triage.md
- agents/procedures/support/escalation-handling.md
- agents/procedures/support/customer-feedback.md

## Context
- Procedures are step-by-step instructions injected into the LLM system prompt
- They guide the AI agent through complex multi-step business tasks
- Reference existing procedures in `agents/procedures/` for format and tone
- Follow the same markdown format as Agent 1 (sales procedures)

## Tasks
1. **ticket-triage.md**: Guide for categorizing and routing support tickets
   - Steps: understand issue → check customer history → categorize severity → assign priority → route or resolve
   - Tools: getContactDossier, searchFiles, createNote, handoffToColleague

2. **escalation-handling.md**: Guide for handling escalated issues
   - Steps: review ticket history → gather technical details → notify relevant team → track resolution → follow up
   - Tools: getContactDossier, listNotes, handoffToColleague, createCalendarEvent

3. **customer-feedback.md**: Guide for collecting and processing feedback
   - Steps: acknowledge feedback → categorize (bug/feature/praise) → log in system → notify team → respond to customer
   - Tools: createNote, updateContactDossier, handoffToColleague

## Rules
- Do NOT modify files outside `agents/procedures/support/`
- Do NOT modify `agents/procedures/init.go` (registration done separately)
- Write in the same language and tone as existing procedures
- Include tool names at each step
- Keep each procedure under 100 lines
