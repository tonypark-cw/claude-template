# Context Splitting (봉건제 패턴)

CLAUDE.md에 모든 규칙을 넣으면 토큰 낭비가 심하다. `.claude/rules/` 디렉토리에 도메인별로 분리하면:

## 왜?

- **CLAUDE.md는 매 요청에 로딩된다** → 작을수록 좋다
- `.claude/rules/*.md`도 매번 로딩되지만, 토픽별로 분리하면 관리가 쉽다
- 프로젝트가 커지면 규칙도 늘어남 → 모놀리식 CLAUDE.md는 200줄 넘기면 관리 불가

## 구조

```
CLAUDE.md                         # 프로젝트 개요 + Quick Reference (50줄 이하)
.claude/rules/
  go_project.md                   # Go 패턴, 아키텍처
  graph_rag_api.md                # Graph RAG API
  graph_rag_phase1.md             # Phase 1 상세
  tool_selector_core.md           # Tool Selector 핵심
  slm_common.md                   # SLM 공통 규칙
```

## CLAUDE.md 작성법

CLAUDE.md는 **인덱스 역할**만 한다:

```markdown
# Project Name

## Quick Reference
| What | Where |
|------|-------|
| Entry point | `main.go` |
| API server | `api/server.go` |

## Core Rules
- 핵심 규칙 1줄 요약
- 핵심 규칙 1줄 요약

> 상세 패턴: `.claude/rules/` (auto-loads)
```

## .claude/rules/*.md 작성법

- 파일 하나 = 도메인 하나 (backend, frontend, testing, deployment 등)
- 각 파일 1KB 이하 권장 (간결하게)
- 운용 모델, 경로, 명령어, 핵심 규칙만 포함
- 튜토리얼이나 히스토리는 넣지 않음

## 실제 예시 (agent-ms 프로젝트)

11개 규칙 파일로 분할:
- `go_project.md` (3KB) — Go 아키텍처, 쿼리 플로우, dev tasks
- `slm_common.md` (0.8KB) — Python venv, GPU 설정, 데이터 규칙
- `graph_rag_api.md` (1KB) — FastAPI, 엔드포인트, 파이프라인 요약
- `graph_rag_phase1.md` (1KB) — Entity Resolution 모델, 모드
- `graph_rag_phase2.md` (1.4KB) — Schema Extraction 모델, 스키마
- `graph_rag_phase3.md` (1.1KB) — Query Execution, AGE 모드
- `tool_selector_core.md` (0.9KB) — 모델, tool_config, masking
- `tool_selector_serving.md` (0.7KB) — API, Go 연동
- `tool_selector_training.md` (1.2KB) — 훈련, 평가, 데이터

CLAUDE.md는 37줄 (Quick Reference 테이블 + 모델 전략 + SLM 포인터)
