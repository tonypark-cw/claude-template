---
name: debate
description: >
  Cross-AI 토론. Claude(구현)와 Gemini(설계)가 핑퐁 검토로 품질 향상.
  cross-evaluator MCP의 debate_send 도구로 Gemini API 호출. 최대 3회 루프.
  TRIGGER when user says "/debate", "토론 시작", "Gemini랑 토론", "cross debate".
model: opus
effort: max
---

# Debate — Cross-AI 토론 오케스트레이터

Claude(구현)와 Gemini(설계)가 핑퐁 방식으로 설계·구현 품질을 상호 검토.
cross-evaluator MCP 서버의 `debate_send` 도구를 통해 Gemini API 호출.

## 핵심 규칙

- **역할 고정**: Gemini=설계, Claude=구현, 검토=양방향
- **최대 3회 루프**: 양쪽 PASS 또는 MAX_ROUNDS 도달 시 종료
- **MCP 도구**: `debate_send(message, role, model)` — Gemini에 메시지 전송 + 응답 반환
- **cross-evaluator MCP 없으면 즉시 중단**: 설정 안내 후 종료

## 프로세스

### Pre-flight

1. 사용자 입력에서 토론 주제(topic) 파싱
2. 상수 설정:
   - `MAX_ROUNDS=3`
   - `TIMESTAMP=YYYY-MM-DD`
   - `LOG_PATH=docs/debates/{TIMESTAMP}-{topic}.md` (한국어 주제 그대로, 공백만 `-`로 치환)
3. cross-evaluator MCP 사용 가능 여부 확인:
   - `list_available_models` 호출 → gemini.available=true 확인
   - 사용 불가 → 중단: "Gemini API 키가 설정되지 않았습니다. GOOGLE_GEMINI_API_KEY 환경변수를 확인하세요."
4. 메모리 내 토론 로그 초기화

---

### Phase 1: 설계 요청 (Gemini → 설계안)

1. `debate_send` MCP 도구 호출:
   - role: "architect"
   - message:
   ```
   다음 주제에 대해 설계안을 작성해주세요: {topic}

   아래 항목을 포함해주세요:
   - 전체 아키텍처 및 컴포넌트 구성
   - 데이터 흐름 (입력→처리→출력)
   - 주요 인터페이스 및 API 계약
   - 설계 근거 (왜 이 방식을 선택했는지)
   - 예상 리스크 및 트레이드오프
   ```
2. 응답 수신 + 로그 기록: `Turn 1 (Gemini - Design)`

---

### Phase 2: 설계 검토 (Claude → 설계안 리뷰)

1. Claude가 Gemini 설계안 분석:
   - **강점**: 잘 된 부분
   - **빈틈**: 누락되거나 불명확한 부분
   - **개선점**: 구체적인 수정 제안
2. 판정:
   - **PASS** → Phase 3로 진행
   - **NEEDS_REVISION** + `round < MAX_ROUNDS` → 피드백을 `debate_send`로 Gemini에 전송 → Phase 1 루프
   - **NEEDS_REVISION** + `round == MAX_ROUNDS` → 현재 설계안으로 Phase 3 진행
3. 로그 기록: `Turn N (Claude - Design Review)`

---

### Phase 3: 구현 (Claude → 구현)

1. 합의된 설계안 기반으로 Claude가 직접 구현
2. 구현 요약 수집:
   - 변경/생성된 파일 목록
   - 핵심 설계 결정사항
   - 미구현 항목 (있는 경우)
3. 로그 기록: `Turn N (Claude - Implementation)`

---

### Phase 4: 구현 검토 (Gemini → 코드 리뷰)

1. `debate_send` MCP 도구 호출:
   - role: "reviewer"
   - message:
   ```
   이전에 논의한 설계안을 기반으로 구현된 결과를 검토해주세요.

   구현 요약:
   {implementation_summary}

   아래 관점에서 검토해주세요:
   - 설계안 준수 여부
   - 코드 품질 (가독성, 단일 책임, DRY)
   - 엣지케이스 및 에러 처리
   - 잠재적 버그
   - 개선 제안

   최종 판정: PASS 또는 NEEDS_FIX (각각에 근거 포함)
   ```
2. 응답에서 판정 추출: `PASS` 또는 `NEEDS_FIX`
3. 로그 기록: `Turn N (Gemini - Code Review)`

---

### Phase 5: 수정 (Claude → 수정 반영)

1. Gemini 판정 확인:
   - **PASS** → Phase 6로 진행
   - **NEEDS_FIX** + `round < MAX_ROUNDS` → Claude가 지적 사항 수정 → Phase 4 루프
   - **NEEDS_FIX** + `round == MAX_ROUNDS` → 수정 목록만 기록 후 Phase 6 진행
2. 수정 내용 로그 기록

---

### Phase 6: 마무리

1. 토론 로그를 `LOG_PATH`에 저장:
   - `templates/debate-log-template.md` 형식 사용
   - 모든 턴의 요청/응답 + 개선 요약 포함
2. 사용자에게 최종 요약 출력:

```
토론 완료

주제: {topic}
진행 라운드: {rounds}회
최종 판정: {PASS | NEEDS_FIX | MAX_ROUNDS_REACHED}
로그 저장: {LOG_PATH}

핵심 설계 결정:
- {decision_1}
- {decision_2}

주요 개선 사항:
- {improvement_1}
- {improvement_2}
```

3. 다음 단계 제안:
   ```
   다음 단계:
   - 품질 평가: /evaluate
   - 코드 리뷰: /review
   - 변경사항 커밋: git commit
   ```

## 에러 처리

| 상황 | 대응 |
|------|------|
| cross-evaluator MCP 없음 | 즉시 중단 + MCP 설정 안내 |
| Gemini API 키 없음 | 즉시 중단 + 환경변수 안내 |
| Gemini API 오류 | 1회 재시도, 실패 시 동일 LOG_PATH에 부분 로그 저장 (status: INTERRUPTED) |
| MAX_ROUNDS 초과 | 현재 상태로 Phase 6 진행 |
| debate_send 응답 비어있음 | 재시도 1회, 실패 시 사용자에게 수동 확인 요청 |
