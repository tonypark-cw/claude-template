# Agent Role: Sales Domain Agent

## Your Files (create/modify ONLY these)
- agents/agent_sales/agent.go
- agents/agent_sales/models.go

## Context
- Go microservice using Firebase Genkit for LLM tool orchestration
- Each domain agent defines tools via `genkit.DefineTool()` and registers them in the UnifiedToolRegistry
- Follow the existing agent pattern: extend `common.BaseAgent`, implement `Init()` and tool definitions
- Reference `agents/agent_inventory/agent.go` for structure

## Tasks
1. Create `models.go` with input/output structs for sales domain tools
   - SalesOrderInput, SalesOrderOutput, etc.
   - Use JSON tags matching the ERP API field names
2. Create `agent.go` implementing the sales domain agent
   - Define 5-8 tools: listSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrder, getSalesMetrics, etc.
   - Each tool calls the ERP REST API via `agents/api/client.go`
   - Register all tools under `agenttools.DomainSales`
3. Add proper error handling and context extraction (tenantID, companyID)

## Rules
- Do NOT modify files outside `agents/agent_sales/`
- Do NOT modify `agents/manager.go` (registration will be done separately)
- Follow existing patterns from `agents/agent_inventory/agent.go`
- Use `common.GetTenantIDFromContext(ctx)` for context extraction
