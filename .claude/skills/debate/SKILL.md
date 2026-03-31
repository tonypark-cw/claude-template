---
name: debate
description: >
  Cross-AI 토론. Claude가 직접 반론하고, Gemini가 독립 리뷰. 진짜 이종 모델 대립.
  Claude=분석/반론(직접), Gemini=리뷰/대안(API). 논점 추적으로 모든 항목 완결.
  TRIGGER when user says "/debate", "토론 시작", "Gemini랑 토론", "cross debate".
model: opus
effort: max
---

# Debate — Cross-AI 토론 오케스트레이터

**핵심**: Claude(나)가 직접 분석·반론하고, Gemini는 `debate_send` MCP로 독립 리뷰.
Gemini에게 Claude 역할을 시키지 않는다 — 그러면 같은 모델끼리 합의해서 대립이 안 됨.

## 핵심 규칙

- **역할 분리**: Claude=분석+반론(직접 수행), Gemini=리뷰+대안(API 호출)
- **Gemini에 Claude 역할 위임 절대 금지**: Claude의 반론은 Claude 자신이 작성
- **의도적 반론(Devil's Advocate)**: Gemini가 동의하더라도, Claude는 의도적으로 반론을 제기한다. 반론에 대해 더 나은 대안이 없거나 현재가 최선임이 확인되면 그때 AGREED로 전환. 쉬운 합의를 방지하여 토론의 깊이를 보장.
- **논점 추적 필수**: 모든 논점이 AGREED/DISAGREED/DEFERRED로 해결될 때까지 계속
- **최대 3회 루프**: 미해결 논점은 DEFERRED로 기록
- **MCP 도구**: `debate_send(message, role, model)` — Gemini에만 사용

## 프로세스

### Pre-flight

1. 사용자 입력에서 토론 주제(topic) 파싱
2. 상수 설정:
   - `MAX_ROUNDS=3`
   - `TIMESTAMP=YYYY-MM-DD`
   - `LOG_PATH=docs/debates/{TIMESTAMP}-{topic}.md` (공백→`-` 치환)
3. cross-evaluator MCP 확인 (`list_available_models` 호출)
4. **논점 목록(AGENDA) 생성**:
   - Claude가 주제를 분석하여 검토해야 할 논점 목록 작성
   - 각 논점 상태: OPEN → AGREED / DISAGREED / DEFERRED
   - 모든 논점이 OPEN이 아닐 때까지 루프 (최대 MAX_ROUNDS)

---

### Phase 1: Claude 초기 분석

1. Claude가 직접 주제를 분석:
   - 현재 상태 파악 (관련 코드/문서 읽기)
   - 논점별 Claude 입장 수립 (구체적 수치 포함)
   - 논점 목록(AGENDA) 확정
2. 로그 기록: `Turn 1 (Claude - Initial Analysis)`

---

### Phase 2: Gemini 독립 리뷰

1. `debate_send` MCP 호출:
   - role: "reviewer"
   - message에 포함:
     - 주제 컨텍스트
     - Claude의 분석 결과
     - **논점 목록 전체** (Gemini가 모든 논점에 대해 답하도록 강제)
     - "각 논점에 대해 동의/반대/대안을 구체적 수치와 함께 제시하세요"
2. 응답에서 논점별 Gemini 입장 추출
3. 로그 기록: `Turn 2 (Gemini - Independent Review)`

---

### Phase 3: Claude 반론 (Claude 자신이 직접 작성)

1. **Claude가 직접** Gemini 리뷰를 분석:
   - 논점별로 Gemini 의견 검토
   - 동의하면: 해당 논점 → AGREED (합의 내용 기록)
   - 반대하면: 구체적 근거 + 대안 제시, 해당 논점 유지 OPEN
   - 새 논점 발견 시: AGENDA에 추가
2. **절대 Gemini에게 Claude 역할을 위임하지 않는다**
3. 로그 기록: `Turn 3 (Claude - Rebuttal)`

---

### Phase 4: Gemini 재반론 (OPEN 논점만)

1. OPEN 상태인 논점만 Gemini에 전송:
   - Claude의 반론 내용
   - 해당 논점의 양측 입장 요약
   - "동의하거나, 수정된 대안을 제시하세요"
2. 응답에서 논점별 상태 업데이트
3. 로그 기록: `Turn 4 (Gemini - Counter-rebuttal)`

---

### Phase 5: 루프 판정

1. 모든 논점 상태 확인:
   - 모든 OPEN → AGREED/DISAGREED/DEFERRED면 → Phase 6
   - OPEN 남아있고 round < MAX_ROUNDS → Phase 3으로 루프
   - round == MAX_ROUNDS → 남은 OPEN → DEFERRED로 강제 전환 → Phase 6

---

### Phase 6: 마무리

1. 토론 로그를 `LOG_PATH`에 저장:
   - `templates/debate-log-template.md` 형식
   - **논점 추적 테이블** 포함:

   ```
   ## 논점 추적

   | # | 논점 | Claude 입장 | Gemini 입장 | 최종 상태 | 합의 내용 |
   |---|------|------------|------------|----------|----------|
   | 1 | ... | ... | ... | AGREED | ... |
   | 2 | ... | ... | ... | DISAGREED | Claude: ..., Gemini: ... |
   | 3 | ... | ... | ... | DEFERRED | 추가 검증 필요 |
   ```

2. 사용자에게 최종 요약:

```
토론 완료

주제: {topic}
라운드: {rounds}/{MAX_ROUNDS}
논점: {total}개 (합의 {agreed}개, 불합의 {disagreed}개, 보류 {deferred}개)

합의된 변경사항:
- {change_1}
- {change_2}

불합의 항목 (사용자 판단 필요):
- {item}: Claude={position}, Gemini={position}

로그: {LOG_PATH}
```

3. 다음 단계 제안

## 에러 처리

| 상황 | 대응 |
|------|------|
| cross-evaluator MCP 없음 | 즉시 중단 + 설정 안내 |
| Gemini API 오류 | 1회 재시도, 실패 시 부분 로그 저장 (status: INTERRUPTED) |
| MAX_ROUNDS 도달 | OPEN → DEFERRED 강제 전환, Phase 6 |
| Gemini 응답에 논점 누락 | 누락 논점 재전송 (1회) |
| debate_send 응답 비어있음 | 재시도 1회 |

## 금지 사항

- **Gemini에 "Claude 역할로 답변해줘" 프롬프트 절대 금지**
- **Claude 반론을 debate_send로 생성 금지** — Claude 자신이 직접 작성
- **논점 추적 없이 자유 토론 금지** — 모든 논점이 추적되어야 함
