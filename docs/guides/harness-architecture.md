# Harness Architecture — 기획/생성/평가 3분리 구조

기획자, 생성자, 평가자를 독립 주체로 분리해 AI 자가 평가 편향을 제거하는 아키텍처.

## 1. 이 아키텍처가 해결하는 문제

AI에게 한 줄 지시("이 기능 만들어줘")로 코딩을 시키면, AI는 지시 의도가 아닌 **측정 가능한 지표**를 향해 최적화한다. 테스트를 통과하도록 코드를 짜는 것이 아니라, 테스트 자체를 통과하는 코드를 짠다.

**자가 평가의 함정**: 자기가 짠 코드를 자기가 평가하면 편향이 생긴다. "내가 이렇게 구현했으니 이게 맞다"는 사후 합리화가 평가를 오염시킨다. 코드 리뷰에서 작성자가 리뷰어를 겸하면 안 되는 것과 같은 이유다.

**해결**: 기획 / 생성 / 평가를 3개 독립 주체로 분리한다.

- **Planner**: 요구사항을 PRD로 문서화. 코드는 건드리지 않는다.
- **Generator**: PRD를 읽고 구현. 평가는 하지 않는다.
- **Evaluator**: Rubric + PRD 기준으로 결과물 평가. 코드를 수정하지 않는다.

---

## 2. 아키텍처 다이어그램

```
[User] ──► /plan ──► docs/prd.md (SSOT)
                         │
                         ▼
              [Generator] ──► code changes
                                  │
                docs/rubric.md ──►▼
                             [Evaluator]
                                  │
                       PASS / CONDITIONAL / FAIL
```

세 주체의 권한은 엄격히 분리된다.

- **Planner**는 `docs/prd.md`를 작성한다. 소스 코드를 작성하지 않는다.
- **Generator**는 소스 코드를 작성한다. 자기 결과물을 평가하지 않는다.
- **Evaluator**는 판정을 내린다. 아무 파일도 수정하지 않는다.

---

## 3. 3개 에이전트

| Agent | Trigger | Writes | Reads | Independence |
|-------|---------|--------|-------|--------------|
| Planner | `/plan` 스킬 | `docs/prd.md` | 사용자 지시, 기존 코드 구조 | 최상 — 구현 완료 전 실행 |
| Generator | Claude Code 기본 (구현 지시) | 소스 코드 | `docs/prd.md` | 중간 — PRD에 의존 |
| Evaluator | `/evaluate` 스킬 | 아무것도 쓰지 않음 | `docs/rubric.md`, `docs/prd.md`, git diff | 최상 — 구현과 완전 분리 |

**핵심**: Evaluator는 Generator가 누구인지, 어떤 맥락에서 코드를 짰는지 알지 못한다. Rubric과 PRD, diff만 보고 판정한다.

---

## 4. SSOT 흐름 — PRD가 계약서

PRD는 사후 문서가 아니라 **코딩 전 명세서**다. "구현하고 나서 문서 작성"이 아니라 "문서를 먼저 쓰고, 문서대로 구현하고, 문서 기준으로 평가"한다.

### Lifecycle

1. `/plan` → `docs/prd.md` 생성 (P0/P1 요구사항, 완료 기준 포함)
2. **사용자 PRD 승인** (human in the loop — 이 단계 없이 구현으로 넘어가지 않는다)
3. Generator에게 지시: "Read `docs/prd.md` and implement"
4. 구현 완료
5. `/evaluate` → `docs/rubric.md` + PRD P0 기준으로 채점
6. CONDITIONAL / FAIL → 수정 후 재평가 (Step 4로 돌아감)
7. PASS → `/handoff` 또는 commit

### 왜 사용자 승인이 필수인가

PRD를 AI가 자동 승인하고 바로 구현으로 넘어가면, "잘못된 문서를 기준으로 완벽하게 구현"하는 상황이 된다. 평가도 그 잘못된 문서 기준으로 PASS가 나온다. 사용자가 PRD를 한 번 읽고 승인해야 전체 루프가 올바른 방향을 유지한다.

---

## 5. Rubric 시스템

채점 기준을 **구현 전에** 미리 정한다. 구현 완료 후 기준을 정하면 결과에 맞게 기준이 조정되는 사후 합리화가 일어난다.

### 동작 방식

- `templates/rubric-template.md`를 복사해 `docs/rubric.md`로 커스터마이징
- 각 항목은 0–3 점수 척도로 정의
- **Score ≤ 2 → 자동 FAIL** (변명 불가. Evaluator는 점수만 본다)

### 판정 기준

| 판정 | 조건 | 다음 단계 |
|------|------|-----------|
| PASS | 모든 P0 기준 충족, 전체 평균 ≥ 2.5 | 커밋 또는 `/handoff` |
| CONDITIONAL | P0 일부 미충족 또는 평균 2.0–2.4 | 지적 항목 수정 후 재평가 |
| FAIL | P0 항목 Score ≤ 2 또는 평균 < 2.0 | 처음부터 재구현 또는 PRD 재검토 |

### Rubric vs PRD 역할 구분

- **PRD**: 무엇을 만들어야 하는가 (기능 명세)
- **Rubric**: 얼마나 잘 만들었는가 (품질 기준)

두 문서가 일치하지 않으면 PRD를 우선한다. PRD에 없는 기준을 Rubric에 추가하지 않는다.

---

## 6. 기존 도구와의 관계

이 아키텍처는 기존 리뷰 도구를 **대체하지 않는다**. 각 도구의 역할이 다르다.

| 도구 | 실행 시점 | 평가 기준 | 평가 주체 |
|------|-----------|-----------|-----------|
| `/evaluate` | 구현 직후 | `docs/rubric.md` + PRD P0 기준 | evaluator 에이전트 |
| `/review` | 코드 품질 심층 검토 시 | 보안, 성능, 가독성, 테스트 커버리지 | code-review 스킬 |
| `/review-team` | 머지 직전 전체 검토 시 | 리뷰 + QA 병렬 수행 | orchestrator |

### 추천 순서

```
/plan → 구현 → /evaluate → /review-team → commit
```

- `/evaluate`가 FAIL이면 `/review-team`으로 가지 않는다. 기능 요구사항을 먼저 충족해야 코드 품질 리뷰가 의미 있다.
- `/evaluate` PASS 이후 `/review-team`에서 BLOCK이 나오면, 코드 품질 문제이므로 PRD나 Rubric이 아니라 구현을 수정한다.

---

## 7. 빠른 참조

| 상황 | 커맨드 | 출력물 |
|------|--------|--------|
| 새 기능 시작 | `/plan` | `docs/prd.md` |
| 요구사항 충족 여부 확인 | `/evaluate` | Scored report (PASS / CONDITIONAL / FAIL) |
| 코드 품질 심층 리뷰 | `/review` | APPROVE / WARNING / BLOCK |
| 머지 전 전체 검토 | `/review-team` | Aggregated verdict |
| 세션 종료 | `/handoff` | `handoff.md` |
