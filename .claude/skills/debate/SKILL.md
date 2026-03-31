---
name: debate
description: >
  Cross-AI 토론. Claude(구현)와 Gemini(설계)가 핑퐁 검토로 품질 향상.
  Playwright MCP로 Gemini 웹 자동 조작. 최대 3회 루프.
  TRIGGER when user says "/debate", "토론 시작", "Gemini랑 토론", "cross debate".
model: opus
effort: max
---

# Debate — Cross-AI 토론 오케스트레이터

Claude(구현)와 Gemini(설계)가 핑퐁 방식으로 설계·구현 품질을 상호 검토. Playwright MCP로 Gemini 웹을 자동 조작하며 API 비용 없이 운영.

## 핵심 규칙

- **역할 고정**: Gemini=설계, Claude=구현, 검토=양방향
- **최대 3회 루프**: 양쪽 PASS 또는 MAX_ROUNDS 도달 시 종료
- **긴 코드 전송 금지**: 웹 입력 길이 제한 — 요약본만 전송
- **Playwright MCP 없으면 즉시 중단**: 설정 안내 후 종료

## 프로세스

### Pre-flight

1. 사용자 입력에서 토론 주제(topic) 파싱
2. 상수 설정:
   - `MAX_ROUNDS=3`
   - `TIMESTAMP=YYYY-MM-DD`
   - `LOG_PATH=docs/debates/{TIMESTAMP}-{topic}.md` (한국어 주제 그대로 사용, 공백만 `-`로 치환)
3. Playwright MCP 사용 가능 여부 확인:
   - 사용 불가 → 중단: "Playwright MCP가 설정되지 않았습니다. `.claude/rules/gemini-selectors.md`와 MCP 설정을 확인하세요."
4. 메모리 내 토론 로그 초기화 (라운드 번호, 역할, 내용)

---

### Phase 1: Gemini 세션 확인

1. `browser_navigate` → `https://gemini.google.com/app`
2. `browser_snapshot`으로 현재 상태 확인:
   - 로그인 페이지 감지 → **즉시 중단**: "Gemini에 로그인 필요. 전용 프로필 브라우저에서 수동 로그인 후 재시도."
   - 채팅 인터페이스 확인 → 진행
3. 새 채팅 시작 (기존 컨텍스트 오염 방지)

---

### Phase 2: 설계 요청 (Gemini → 설계안)

1. 설계 프롬프트 구성:
   ```
   당신은 시니어 소프트웨어 아키텍트입니다.
   다음 주제에 대해 설계안을 작성해주세요: {topic}

   아래 항목을 포함해주세요:
   - 전체 아키텍처 및 컴포넌트 구성
   - 데이터 흐름 (입력→처리→출력)
   - 주요 인터페이스 및 API 계약
   - 설계 근거 (왜 이 방식을 선택했는지)
   - 예상 리스크 및 트레이드오프
   ```
2. Playwright로 전송:
   - `.claude/rules/gemini-selectors.md`의 셀렉터 참조
   - 입력창에 타이핑 → 전송 버튼 클릭 → 응답 완료 대기
   - 응답 완료 감지: `browser_snapshot` 2회 (2초 간격), 텍스트 동일하면 완료
3. 응답 텍스트 추출 + 로그 기록: `Turn 1 (Gemini - Design)`

---

### Phase 3: 설계 검토 (Claude → 설계안 리뷰)

1. Claude가 Gemini 설계안 분석:
   - **강점**: 잘 된 부분
   - **빈틈**: 누락되거나 불명확한 부분
   - **개선점**: 구체적인 수정 제안
2. 판정:
   - **PASS** → Phase 4로 진행
   - **NEEDS_REVISION** + `round < MAX_ROUNDS` → 피드백을 Gemini에 전송 → Phase 2 루프
   - **NEEDS_REVISION** + `round == MAX_ROUNDS` → 현재 설계안으로 Phase 4 진행 (루프 한도 초과)
3. 로그 기록: `Turn N (Claude - Design Review)`

---

### Phase 4: 구현 (Claude → 구현)

1. 합의된 설계안 기반으로 Claude가 직접 구현
2. 구현 요약 수집:
   - 변경/생성된 파일 목록
   - 핵심 설계 결정사항
   - 미구현 항목 (있는 경우)
3. 로그 기록: `Turn N (Claude - Implementation)`

---

### Phase 5: 구현 검토 (Gemini → 코드 리뷰)

1. 코드 리뷰 프롬프트 구성:
   ```
   당신은 시니어 코드 리뷰어입니다.
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
2. Playwright로 전송 (긴 코드는 요약만 전송)
3. 응답 완료 감지 후 텍스트 추출
4. 판정 추출: `PASS` 또는 `NEEDS_FIX`
5. 로그 기록: `Turn N (Gemini - Code Review)`

---

### Phase 6: 수정 (Claude → 수정 반영)

1. Gemini 판정 확인:
   - **PASS** → Phase 7로 진행
   - **NEEDS_FIX** + `round < MAX_ROUNDS` → Claude가 지적 사항 수정 → Phase 5 루프
   - **NEEDS_FIX** + `round == MAX_ROUNDS` → 수정 목록만 기록 후 Phase 7 진행 (루프 한도 초과)
2. 수정 내용 로그 기록

---

### Phase 7: 마무리

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
...

주요 개선 사항:
- {improvement_1}
- {improvement_2}
...
```

3. 다음 단계 제안:
   ```
   다음 단계:
   - 품질 평가: /evaluate
   - 코드 리뷰: /review
   - 변경사항 커밋: git commit
   ```

---

## Gemini 상호작용 규칙

- **셀렉터**: `.claude/rules/gemini-selectors.md` 참조 (파일 없으면 `browser_snapshot`으로 현재 DOM 탐색)
- **응답 완료 감지**: `browser_snapshot` 2회 (2초 간격), 텍스트 동일하면 완료. 최대 30초(15회) 후 타임아웃
- **입력 길이 제한**: 긴 코드는 요약본만 전송 (파일 경로 + 핵심 로직 발췌)
- **세션 만료 감지**: 로그인 페이지 재출현 시 → 부분 로그 저장 후 사용자에게 재로그인 안내

## 에러 처리

| 상황 | 대응 |
|------|------|
| Playwright MCP 없음 | 즉시 중단 + 설정 안내 |
| Gemini 미로그인 | 즉시 중단 + 로그인 안내 |
| Gemini 세션 만료 | 동일 LOG_PATH에 부분 로그 저장 (status: INTERRUPTED) + 재로그인 안내 |
| MAX_ROUNDS 초과 | 현재 상태로 Phase 7 진행 |
| 응답 추출 실패 | `browser_snapshot` 재시도 1회, 실패 시 사용자에게 수동 확인 요청 |
