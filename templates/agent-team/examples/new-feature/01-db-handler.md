# Agent Role: Database Layer

## Your Files (create/modify ONLY these)
- db/bookmark_handler.go
- sql/029_bookmarks.sql

## Context
- Go microservice with PostgreSQL (KB database for agent data)
- DB handlers follow the pattern in `db/note_handler.go` and `db/calendar_event_handler.go`
- Two-database setup: KB DB (`KBReadConn`/`KBWriteConn`) for agent data
- Context extraction: `GetTenantIDFromContext(ctx)`, `GetCompanyIDFromContext(ctx)`

## Tasks

### 1. Create SQL migration (`sql/029_bookmarks.sql`)
```sql
CREATE TABLE IF NOT EXISTS ai_employee_bookmark (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    company_id UUID NOT NULL,
    ai_employee_id UUID NOT NULL,
    user_id UUID,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookmark_aie ON ai_employee_bookmark(ai_employee_id);
```

### 2. Create DB handler (`db/bookmark_handler.go`)
Implement CRUD operations:
- `CreateBookmark(ctx, bookmark) (Bookmark, error)`
- `ListBookmarks(ctx, aiEmployeeID, limit, offset) ([]Bookmark, error)`
- `GetBookmark(ctx, id) (Bookmark, error)`
- `UpdateBookmark(ctx, id, updates) (Bookmark, error)`
- `DeleteBookmark(ctx, id) error`
- `SearchBookmarks(ctx, aiEmployeeID, query) ([]Bookmark, error)` — search title/description

Follow `db/note_handler.go` patterns:
- Use `db.KBWriteConn` for writes, `db.KBReadConn` for reads
- Add tenant_id/company_id filtering on all queries
- Return structured errors

## Rules
- Do NOT modify any files outside `db/` and `sql/`
- Do NOT create tools or gRPC service (other agents handle those)
- Export the Bookmark struct so other packages can import it
- Follow existing handler naming conventions
