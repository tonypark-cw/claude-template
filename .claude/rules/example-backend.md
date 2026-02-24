# Backend — API + DB Patterns

## API Convention
- RESTful endpoints: `GET /api/v1/{resource}`, `POST /api/v1/{resource}`
- Error response: `{"error": "message", "code": "ERROR_CODE"}`

## DB Rules
- Migrations: `sql/0XX_{feature}.sql`
- Read replica for SELECT, write primary for mutations
