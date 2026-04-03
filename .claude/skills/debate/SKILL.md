---
name: debate
description: >
  Cross-AI 토론. Claude가 직접 반론하고, Codex(GPT-5.4)가 독립 리뷰. 진짜 이종 모델 대립.
  Claude=분석/반론(직접), Codex=리뷰/대안(/codex:rescue). 논점 추적으로 모든 항목 완결.
  TRIGGER when user says "/debate", "토론 시작", "토론해줘", "cross debate".
model: opus
effort: max
---

# Debate — Cross-AI 토론 오케스트레이터

**핵심**: Claude(나)가 직접 분석·반론하고, Codex(GPT-5.4)는 `/codex:rescue` 스킬로 독립 리뷰.
Codex에게 Claude 역할을 시키지 않는다 — 그러면 같은 모델끼리 합의해서 대립이 안 됨.

## 핵심 규칙

- **역할 분리**: Claude=분석+반론(직접 수행), Codex=리뷰+대안(`/codex:rescue` 호출)
- **Codex에 Claude 역할 위임 절대 금지**: Claude의 반론은 Claude 자신이 작성
- **의도적 반론(Devil's Advocate)**: Codex가 동의하더라도, Claude는 의도적으로 반론을 제기한다. 반론에 대해 더 나은 대안이 없거나 현재가 최선임이 확인되면 그때 AGREED로 전환. 쉬운 합의를 방지하여 토론의 깊이를 보장.
- **논점 추적 필수**: 모든 논점이 AGREED/DISAGREED/DEFERRED로 해결될 때까지 계속
- **최대 3회 루프**: 미해결 논점은 DEFERRED로 기록
- **Codex 호출 방법**: `codex:codex-rescue` 서브에이전트 (Agent 도구 사용)

## Codex 호출 패턴

Codex 독립 리뷰를 요청할 때는 `codex:codex-rescue` 서브에이전트를 사용:

```
Agent(
  subagent_type="codex:codex-rescue",
  description="Codex debate review round N",
  prompt="""Use one Bash call to invoke the Codex companion and return its stdout verbatim.
Do not inspect files, poll status, or do any follow-up work.

Command:
node "C:/Users/qkrck/.claude/plugins/marketplaces/openai-codex/plugins/codex/scripts/codex-companion.mjs" task --fresh "{review_prompt}"
"""
)
```

**첫 호출은 `--fresh`**, 이후 라운드는 `--resume`으로 컨텍스트 유지.

### Codex 프롬프트 구성 규칙

Codex에 보내는 프롬프트에 반드시 포함:
1. 토론 주제와 관련 파일 경로 (Codex가 직접 읽을 수 있도록)
2. Claude의 분석/반론 전문
3. **논점 목록 전체** + 각 논점의 현재 상태
4. "각 논점에 대해 AGREE/DISAGREE/PARTIAL 판정 + 구체적 근거 + 대안 제시" 지시
5. "서브에이전트를 생성해서 깊이 조사하라" 권장 (Codex도 하위 에이전트 사용 가능)

## 프로세스

### Pre-flight

1. 사용자 입력에서 토론 주제(topic) 파싱
2. 상수 설정:
   - `MAX_ROUNDS=3`
   - `TIMESTAMP=YYYY-MM-DD`
   - `LOG_PATH=work-reports/debates/{TIMESTAMP}-{topic}.md` (공백→`-` 치환)
3. Codex 사용 가능 여부 확인: `codex:codex-rescue` 서브에이전트 존재 확인
   - 없으면: `/codex:setup` 실행 안내 후 중단
4. **논점 목록(AGENDA) 생성**:
   - Claude가 주제를 분석하여 검토해야 할 논점 목록 작성
   - 각 논점 상태: OPEN → AGREED / DISAGREED / DEFERRED
   - 모든 논점이 OPEN이 아닐 때까지 루프 (최대 MAX_ROUNDS)

---

### Phase 1: Claude 초기 분석

1. Claude가 직접 주제를 분석:
   - 현재 상태 파악 (관련 코드/문서 읽기)
   - 논점별 Claude 입장 수립 (구체적 수치/근거 포함)
   - 각 주장의 근거와, 예상되는 반박 근거도 함께 제시
   - 논점 목록(AGENDA) 확정
2. 로그 기록: `Turn 1 (Claude - Initial Analysis)`

---

### Phase 2: Codex 독립 리뷰

1. `codex:codex-rescue` 서브에이전트로 Codex 호출 (`--fresh`):
   - 주제 컨텍스트 + 관련 파일 경로
   - Claude의 분석 결과 전문
   - **논점 목록 전체** (Codex가 모든 논점에 대해 답하도록 강제)
   - "각 논점에 대해 AGREE/DISAGREE/PARTIAL + 구체적 수치/근거 + 대안 제시"
   - "필요하면 서브에이전트를 생성해서 깊이 조사하라"
2. 응답에서 논점별 Codex 입장 추출
3. 로그 기록: `Turn 2 (Codex - Independent Review)`

---

### Phase 3: Claude 반론 (Claude 자신이 직접 작성)

1. **Claude가 직접** Codex 리뷰를 분석:
   - 논점별로 Codex 의견 검토
   - 동의하면: 해당 논점 → AGREED (합의 내용 기록)
   - 반대하면: 구체적 근거 + 반박 근거 + 대안 제시, 해당 논점 유지 OPEN
   - 새 논점 발견 시: AGENDA에 추가
2. **절대 Codex에게 Claude 역할을 위임하지 않는다**
3. 로그 기록: `Turn 3 (Claude - Rebuttal)`

---

### Phase 4: Codex 재반론 (OPEN 논점만)

1. OPEN 상태인 논점만 Codex에 전송 (`--resume`):
   - Claude의 반론 내용
   - 해당 논점의 양측 입장 요약
   - "동의하거나, 수정된 대안을 구체적 근거와 함께 제시하세요"
2. 응답에서 논점별 상태 업데이트
3. 로그 기록: `Turn 4 (Codex - Counter-rebuttal)`

---

### Phase 5: 루프 판정

1. 모든 논점 상태 확인:
   - 모든 OPEN → AGREED/DISAGREED/DEFERRED면 → Phase 6
   - OPEN 남아있고 round < MAX_ROUNDS → Phase 3으로 루프
   - round == MAX_ROUNDS → 남은 OPEN → DEFERRED로 강제 전환 → Phase 6

---

### Phase 6: 마무리

1. 토론 로그를 `LOG_PATH`에 저장:
   - **논점 추적 테이블** 포함:

   ```
   ## 논점 추적

   | # | 논점 | Claude 입장 | Codex 입장 | 최종 상태 | 합의 내용 |
   |---|------|------------|------------|----------|----------|
   | 1 | ... | ... | ... | AGREED | ... |
   | 2 | ... | ... | ... | DISAGREED | Claude: ..., Codex: ... |
   | 3 | ... | ... | ... | DEFERRED | 추가 검증 필요 |
   ```

   - **핵심 근거 테이블** 포함:

   ```
   ## 핵심 근거

   | 근거 | 주장 | 반박 |
   |------|------|------|
   | [출처] | 이 근거로 주장한 내용 | 이 근거에 대한 반박 |
   ```

2. 사용자에게 최종 요약:

```
토론 완료

주제: {topic}
참여: Claude vs Codex(GPT-5.4)
라운드: {rounds}/{MAX_ROUNDS}
논점: {total}개 (합의 {agreed}개, 불합의 {disagreed}개, 보류 {deferred}개)

합의된 변경사항:
- {change_1}
- {change_2}

불합의 항목 (사용자 판단 필요):
- {item}: Claude={position}, Codex={position}

로그: {LOG_PATH}
```

3. 다음 단계 제안

## 에러 처리

| 상황 | 대응 |
|------|------|
| Codex CLI 미설치/미인증 | `/codex:setup` 실행 안내 후 중단 |
| Codex 응답 타임아웃 | 1회 재시도 (timeout: 600000), 실패 시 부분 로그 저장 (status: INTERRUPTED) |
| MAX_ROUNDS 도달 | OPEN → DEFERRED 강제 전환, Phase 6 |
| Codex 응답에 논점 누락 | 누락 논점만 재전송 (1회, `--resume`) |
| Codex 응답 비어있음 | `--fresh`로 재시도 1회 |

## 금지 사항

- **Codex에 "Claude 역할로 답변해줘" 프롬프트 절대 금지**
- **Claude 반론을 Codex로 생성 금지** — Claude 자신이 직접 작성
- **논점 추적 없이 자유 토론 금지** — 모든 논점이 추적되어야 함
- **LOG_PATH를 docs/에 저장 금지** — `work-reports/debates/`에 저장 (디렉토리 구조 규칙)
