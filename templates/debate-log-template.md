# Cross-AI Debate Log

- **Topic**: {topic}
- **Date**: {date}
- **Participants**: Claude (구현) / Gemini (설계)
- **Rounds**: {total_rounds} / {max_rounds}
- **Final Verdict**: {PASS | NEEDS_FIX | MAX_ROUNDS_REACHED}

---

## 요약

{2-3문장: 무엇을 토론했고 결과가 어떠했는지}

### 토론으로 인한 핵심 개선사항
1. {improvement_1}
2. {improvement_2}
3. {improvement_3}

---

## Turn Log

### Turn 1 — Gemini (설계)
**역할**: 아키텍트
**전송한 프롬프트**:
> {prompt_text}

**응답**:
> {response_text}

---

### Turn 2 — Claude (설계 검토)
**역할**: 리뷰어
**판정**: {PASS | NEEDS_REVISION}

**분석**:
> {review_text}

---

### Turn 3 — Claude (구현)
**역할**: 구현자
**변경 파일**:
- {file_1}
- {file_2}

**요약**:
> {implementation_summary}

---

### Turn 4 — Gemini (코드 검토)
**역할**: 리뷰어
**판정**: {PASS | NEEDS_FIX}

**리뷰**:
> {review_text}

---

{... 추가 턴 ...}

## Metadata

- Gemini 상호작용 횟수: {count}
- 설계 라운드: {design_round_count}
- 구현 검토 라운드: {impl_review_round_count}
- 소요 시간: ~{minutes}분 (추정)
