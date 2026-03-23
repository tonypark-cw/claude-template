---
name: review-team
description: 코드 리뷰어 + QA 테스터를 병렬 서브에이전트로 실행하여 종합 검토. TRIGGER when user says "/review-team", "전체 검토", "리뷰+테스트", "review and test", "full review".
model: sonnet
effort: medium
---

# Review Team — 에이전트 팀 오케스트레이터

코드 리뷰어 + QA 테스터를 병렬 서브에이전트로 실행, 결과 종합 판정.

## 핵심: 컨텍스트 분산

각 서브에이전트는 해당 프로젝트의 CLAUDE.md만 참조. 메인은 오케스트레이션만.

## 프로세스

### Step 1: git diff → 프로젝트별 분류

### Step 2: 프로젝트별 서브에이전트 병렬 실행

```
Agent "review-{project}":
  prompt: "{project}/CLAUDE.md를 읽고, 아래 diff를 리뷰해줘.
           체크리스트: [code-review 스킬 Step 4]
           변경 파일: {files}
           출력: APPROVE/WARNING/BLOCK"

Agent "qa-{project}":
  prompt: "{project}/CLAUDE.md를 읽고, 변경을 검증해줘.
           테스트: health check + 기능 1건 + 회귀
           출력: PASS/FAIL"
```

### Step 3: 종합 판정

| 리뷰어 | QA | 최종 |
|--------|-----|------|
| APPROVE | PASS | **SHIP IT** |
| APPROVE | FAIL | **HOLD** |
| WARNING | PASS | **CAUTION** |
| BLOCK | * | **BLOCK** |

### Step 4: 최종 리포트

```
## Review Team Report

### 프로젝트별 결과
| 프로젝트 | Code Review | QA Test |
|----------|-------------|---------|
| {name} | APPROVE | PASS |

### 종합 판정: SHIP IT / CAUTION / HOLD / BLOCK
```

## 컨텍스트 분산 규칙
1. 서브에이전트는 자기 프로젝트의 CLAUDE.md만 읽는다
2. 메인 에이전트는 코드를 읽지 않는다 — 분류 + 오케스트레이션만
3. 프로젝트 간 의존성은 메인이 종합 시 판단
