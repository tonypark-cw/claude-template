# Agent Role: Inventory Domain Agent

## Your Files (create/modify ONLY these)
- agents/agent_inventory/agent.go
- agents/agent_inventory/models.go

## Context
- Go microservice using Firebase Genkit for LLM tool orchestration
- Each domain agent defines tools via `genkit.DefineTool()` and registers them in the UnifiedToolRegistry
- Follow the existing agent pattern: extend `common.BaseAgent`, implement `Init()` and tool definitions

## Tasks
1. Create `models.go` with input/output structs for inventory domain tools
   - InventoryItemInput, StockLevelOutput, WarehouseInput, etc.
   - Use JSON tags matching the ERP API field names
2. Create `agent.go` implementing the inventory domain agent
   - Define 5-8 tools: listInventoryItems, getStockLevels, adjustStock, transferStock, getWarehouseInfo, etc.
   - Each tool calls the ERP REST API via `agents/api/client.go`
   - Register all tools under `agenttools.DomainInventory`
3. Add proper error handling and context extraction

## Rules
- Do NOT modify files outside `agents/agent_inventory/`
- Do NOT modify `agents/manager.go` (registration will be done separately)
- Follow the same patterns as Agent 1 (sales) for consistency
- Use `common.GetTenantIDFromContext(ctx)` for context extraction
