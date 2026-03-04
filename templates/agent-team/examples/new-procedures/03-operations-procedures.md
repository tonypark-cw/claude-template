# Agent Role: Operations Procedures Writer

## Your Files (create/modify ONLY these)
- agents/procedures/operations/inventory-reorder.md
- agents/procedures/operations/vendor-evaluation.md
- agents/procedures/operations/shipment-tracking.md

## Context
- Procedures are step-by-step instructions injected into the LLM system prompt
- They guide the AI agent through complex multi-step business tasks
- Reference existing procedures in `agents/procedures/` for format and tone
- Follow the same markdown format as Agent 1 (sales) and Agent 2 (support)

## Tasks
1. **inventory-reorder.md**: Guide for managing inventory reorder points
   - Steps: check current stock → identify low items → review reorder history → calculate order quantity → create PO
   - Tools: getStockLevels, listInventoryItems, listPurchaseOrders, createPurchaseOrder

2. **vendor-evaluation.md**: Guide for evaluating vendor performance
   - Steps: pull PO history → calculate on-time rate → check quality issues → compare pricing → generate report
   - Tools: listPurchaseOrders, getVendorInfo, listNotes, createNote

3. **shipment-tracking.md**: Guide for tracking and managing shipments
   - Steps: identify pending shipments → check carrier status → update customer → handle delays → confirm delivery
   - Tools: listSalesOrders, getSalesOrder, getContactDossier, createNote, createCalendarEvent

## Rules
- Do NOT modify files outside `agents/procedures/operations/`
- Do NOT modify `agents/procedures/init.go` (registration done separately)
- Write in the same language and tone as existing procedures
- Include tool names at each step
- Keep each procedure under 100 lines
