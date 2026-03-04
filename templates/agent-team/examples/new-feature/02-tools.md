# Agent Role: Genkit Tools Layer

## Your Files (create/modify ONLY these)
- agents/bookmark_tools.go

## Context
- Go microservice using Firebase Genkit for LLM tool orchestration
- Always-on tools are registered via `registry.RegisterAlwaysOn()`
- Tool definition pattern: `genkit.DefineTool(g, "toolName", "description", handler)`
- Reference `agents/note_tools.go` for the exact pattern
- DB types are defined in `db/bookmark_handler.go` (created by Agent 1)

## Tasks

### 1. Create `agents/bookmark_tools.go`
Define 4-5 always-on tools:

**createBookmark**
- Input: title, url, description (optional), tags (optional)
- Calls `db.CreateBookmark()`, returns confirmation

**listBookmarks**
- Input: limit (default 20), offset, tag filter (optional)
- Calls `db.ListBookmarks()`, returns formatted list

**searchBookmarks**
- Input: query string
- Calls `db.SearchBookmarks()`, returns matching results

**deleteBookmark**
- Input: bookmark ID
- Calls `db.DeleteBookmark()`, returns confirmation

### 2. Tool guidance
Each tool description should clearly state:
- What it does (one line)
- When to use it (context hint for the LLM)
- Required vs optional parameters

## Rules
- Do NOT modify files outside `agents/bookmark_tools.go`
- Do NOT register tools in `manager.go` (will be done separately after merge)
- Do NOT modify DB handler (Agent 1's scope)
- Import DB types from `db` package, do NOT redefine them
- Follow `agents/note_tools.go` patterns exactly
