# MCP Tool Boundaries

## Principles

1. **Start with 2-3 MCP servers.** Add more only when you hit a real limitation.
2. **CLI over MCP.** Git, Docker, npm, pip — these are already in the model's training data. A CLI command is faster and more reliable than an MCP wrapper.
3. **Tool descriptions cost tokens.** Every MCP tool's description is injected into the system prompt. More tools = less room for actual work.
4. **Verify sources.** Malicious MCP servers have been published to registries. Only use servers from trusted sources.

## Before Adding a New MCP Server

Run through this checklist:

- [ ] **Can CLI solve this?** If `gh`, `docker`, `curl`, or another CLI tool does the job, prefer it.
- [ ] **Is it a duplicate?** Check if an existing MCP server already covers this capability.
- [ ] **Is the selection criteria clear?** If the agent can't tell when to use this tool vs. another, it will thrash between them.
- [ ] **Is the source trusted?** Check the publisher, stars, recent commits, and whether the code is auditable.
- [ ] **Does the team actually need it?** Don't add "just in case" — add when the absence causes a real failure.

## Tool Thrash Prevention

"Tool thrash" happens when too many similar tools confuse the agent about which to use. Signs:
- Agent tries 2-3 tools before finding the right one
- Agent picks the wrong tool and gets an error
- Agent explains why it's switching tools mid-task

**Fix**: Remove the confusing tool, or make tool descriptions more distinct.

## Recommended MCP Configuration Pattern

```jsonc
// .mcp.json — keep it minimal
{
  "mcpServers": {
    "essential-server": {
      "command": "...",
      "args": ["..."]
    }
    // Add more only after hitting a real limitation
  }
}
```
