# Agent Role: gRPC Service Layer

## Your Files (create/modify ONLY these)
- aiemployee/bookmarks.go

## Context
- Go microservice with gRPC service definitions in `aiemployee/`
- Service methods handle gRPC requests, extract context, call DB handlers, return proto responses
- Reference `aiemployee/notes.go` for the exact pattern
- Proto definitions are in `protobuf/src/aiagent.proto` (read-only reference)
- DB types are defined in `db/bookmark_handler.go` (created by Agent 1)

## Tasks

### 1. Create `aiemployee/bookmarks.go`
Implement gRPC service methods:

**CreateBookmark(ctx, req) (*resp, error)**
- Extract tenant/company/user from gRPC metadata
- Validate required fields (title, url)
- Call `db.CreateBookmark()`
- Return proto response

**ListBookmarks(ctx, req) (*resp, error)**
- Extract context, apply pagination defaults
- Call `db.ListBookmarks()`
- Return proto response with items + total count

**UpdateBookmark(ctx, req) (*resp, error)**
- Extract context, validate bookmark ID
- Call `db.UpdateBookmark()`
- Return updated bookmark

**DeleteBookmark(ctx, req) (*resp, error)**
- Extract context, validate bookmark ID
- Call `db.DeleteBookmark()`
- Return success/error

### 2. Helper functions
- `bookmarkToProto(b db.Bookmark) *pb.Bookmark` — DB struct to proto conversion
- `protoToBookmark(p *pb.Bookmark) db.Bookmark` — proto to DB struct conversion

## Rules
- Do NOT modify files outside `aiemployee/bookmarks.go`
- Do NOT modify DB handler or tools (other agents' scope)
- Do NOT modify the proto file (requires separate regeneration step)
- Import DB types from `db` package
- Follow `aiemployee/notes.go` patterns exactly
- Extract context via `GetTenantIDFromContext(ctx)` etc.
