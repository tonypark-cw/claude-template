---
name: evaluate
description: 루브릭 기반 코드 평가. evaluator 에이전트를 호출하여 채점 리포트 생성. TRIGGER when user says "/evaluate", "평가해줘", "evaluate this", "rubric check".
model: sonnet
effort: high
---

# Evaluate — 루브릭 기반 평가 오케스트레이터

루브릭과 PRD를 기준으로 evaluator 에이전트를 실행하고 결과를 라우팅.

## 프로세스

### Step 1: Pre-flight

1. 루브릭 경로 확인:
   - `docs/rubric.md` 존재 시 사용
   - 없으면 `templates/rubric-template.md` fallback (사용자에게 알림)
2. PRD 경로 확인:
   - `docs/prd.md` 존재 시 evaluator에 전달
   - 없으면 경고: "docs/prd.md not found — P0 acceptance check will be skipped"
3. 변경 범위 표시:
```bash
git diff --stat HEAD
```

### Step 2: evaluator 에이전트 실행

```
Agent "evaluator":
  prompt: "rubric_path={rubric_path}, prd_path={prd_path}
           루브릭을 로드하고 현재 변경사항을 채점하라.
           독립적으로 결론을 도출할 것."
```

### Step 3: 리포트 제시

- evaluator 결과를 그대로(verbatim) 출력
- 마지막에 한 줄 요약 추가: `Overall: [PASS/CONDITIONAL/FAIL] — [score]/[max] ([%]%)`

### Step 4: 판정 라우팅

| 판정 | 다음 액션 |
|------|-----------|
| **PASS** | `/handoff` 또는 커밋 제안 |
| **CONDITIONAL** | 개선 필요 항목 목록 출력 → 수정 후 `/evaluate` 재실행 제안 |
| **FAIL** | "이슈를 먼저 해결하세요" + 이슈 목록 출력. 커밋/배포 제안 금지 |

## 컨텍스트 규칙
- 오케스트레이터는 코드를 직접 읽지 않는다 — pre-flight + 라우팅만
- evaluator 에이전트 결과를 수정하거나 완화하지 않는다
