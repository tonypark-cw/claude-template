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

## 분산 컨텍스트 — Lazy Loading + Handoff

규칙 파일 분리만으로는 부족하다. 서브에이전트와 세션 간 전달까지 고려해야 한다.

### 문제: 파편화 vs 집약

```
문서 1개에 집약    →  컨텍스트 낭비 (안 쓰는 부분도 로딩)
문서 10개로 분산   →  파편화 (뭐가 어디 있는지 모름)
```

### 해결: 포인터 + Handoff 2단계 구조

```
Layer 0: CLAUDE.md (30줄 이하)
  → "프로젝트 A 상세는 projectA/CLAUDE.md 참조" (포인터만)

Layer 1: rules/*.md (각 5-10줄, globs 기반)
  → 해당 파일 건드릴 때만 자동 로딩
  → "상세는 {project}/CLAUDE.md 참조" (포인터만)

Layer 2: {project}/CLAUDE.md (상세, 필요할 때만 Read)
  → 서브에이전트가 자기 프로젝트 것만 읽음

Layer 3: .claude/context/handoff.md (세션/에이전트 간 전달)
  → 다음 세션: "handoff.md 읽고 이어서"
  → 서브에이전트: handoff + 해당 CLAUDE.md만
```

### 서브에이전트에 컨텍스트 전달

```
# BAD: 전체 컨텍스트 프롬프트에 주입
Agent(prompt="전체 프로젝트 규칙: [500줄]... 이걸 기반으로 작업해줘")

# GOOD: 파일 경로만 전달, 에이전트가 직접 읽음
Agent(prompt="projectA/CLAUDE.md를 읽고, 아래 파일을 수정해줘. 변경: {files}")
```

### Handoff 패턴

세션이 끝나거나 에이전트 간 인계 시 `.claude/context/handoff.md`에 20줄 이하로 기록:

```markdown
# Handoff — 2026-03-23

## 무엇을 했는가
- API 전처리 로직 추가

## 현재 상태
- 브랜치: main, 커밋 안 된 변경 3개

## 다음에 할 것
- [ ] 테스트 실행
- [ ] EC2 배포

## 관련 파일
- projectA/CLAUDE.md
- src/server.py (변경됨)
```

다음 세션이나 서브에이전트는 이 파일 하나만 읽으면 즉시 작업 시작 가능.

### 효과

```
BEFORE: 매 대화 시작 → 558줄 컨텍스트 로딩
AFTER:  CLAUDE.md 30줄 + handoff 20줄 = 50줄로 시작
        필요한 프로젝트 CLAUDE.md만 lazy load
```

### 서브에이전트 크리티컬 인라인 패턴

서브에이전트가 CLAUDE.md를 안 읽고 작업하는 경우가 자주 발생한다.
**절대 위반하면 안 되는 규칙은 프롬프트에 직접 넣고**, 상세만 파일로 위임:

```
Agent(prompt="""
[필수 규칙]
- REST API 한국어: curl 금지, requests.post(json=...) 사용
- DB DDL 금지, SELECT만
- 모델 파일 git 커밋 금지
[상세 컨텍스트]
{project}/CLAUDE.md 읽을 것
[작업]
...
""")
```

---

## 저장소 분리 기준

어떤 정보를 어디에 넣을지 판단 기준:

| 저장소 | 담는 것 | 안 담는 것 | 비유 |
|--------|---------|-----------|------|
| **스킬** | **어떻게** 할지 (프로세스, 체크리스트, 단계) | 뭘 했는지, 현재 상태 | 매뉴얼 |
| **메모리** | **무엇을/언제** 했는지 (결정, 결과, 날짜) | 프로세스, 절차 | 일지 |
| **rules** | **하면 안 되는 것** (금지사항, 제약, 각 5-10줄) | 상세 설명, 이력 | 법률 |
| **CLAUDE.md** | **어디에 뭐가 있는지** (포인터, 구조) | 상세 내용 | 지도 |
| **handoff** | **지금 상태 + 다음 할 것** (20줄 이하) | 과거 이력, 프로세스 | 인수인계서 |

### 판단 테스트

정보를 어디에 넣을지 모르겠으면 이 질문을 던져라:

- "이건 **절차**인가 **사실**인가?" → 절차=스킬, 사실=메모리
- "이건 **금지사항**인가?" → rules
- "이건 **포인터**인가 **내용**인가?" → 포인터=CLAUDE.md, 내용=해당 파일
- "이건 **지금만** 필요한가 **나중에도** 필요한가?" → 지금=handoff, 나중=메모리

### 파편화 수준 가이드

rules를 얼마나 쪼갤지:

```
너무 집약 (1파일에 200줄)     → 안 쓰는 규칙도 로딩 → 컨텍스트 낭비
적정 (파일당 5-10줄, globs)   → 해당 파일 작업 시만 로딩 → 균형 ✓
너무 파편화 (globs 제거)      → 규칙 자체를 안 읽을 위험 → 위반 사고

권장: rules 파일당 5-10줄, globs로 조건 로딩 유지.
     크리티컬 규칙은 서브에이전트 프롬프트에 인라인.
```
