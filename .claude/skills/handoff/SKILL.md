---
name: handoff
description: 세션/에이전트 간 컨텍스트 전달용 핸드오프 문서 생성. 현재 작업 상태를 최소한의 문서로 압축하여 다음 세션이나 서브에이전트가 바로 이어서 작업 가능. TRIGGER when user says "/handoff", "핸드오프", "인수인계", "세션 정리", "hand off", "session summary".
model: sonnet
effort: low
---

# Handoff — 세션/에이전트 컨텍스트 전달

현재 작업 상태를 `.claude/context/handoff.md`에 기록.
다음 세션/서브에이전트는 이 파일 하나만 읽으면 컨텍스트 복원.

## 문서 형식 (20줄 이하)

```markdown
# Handoff — {날짜}

## 무엇을 했는가
- {완료 작업 1줄 요약}

## 현재 상태
- 브랜치: {branch}
- 커밋 안 된 변경: {N}개 파일
- 배포: {됨/안됨}

## 다음에 할 것
- [ ] {다음 작업}

## 관련 파일 (이것만 읽으면 됨)
- {CLAUDE.md 경로}
- {핵심 변경 파일 경로}

## 주의사항
- {알아야 할 것}
```

## 사용 패턴

### 패턴 1: 세션 전환
```
세션 A 종료: /handoff → handoff.md 생성
세션 B 시작: "handoff.md 읽고 이어서 해줘"
```

### 패턴 2: 서브에이전트 위임
```
메인: handoff-{project}.md 생성
Agent(prompt="Read .claude/context/handoff-{project}.md and do X")
```

### 패턴 3: 팀 에이전트 간 전달
```
리뷰어 완료 → handoff-review.md
QA에게: "리뷰 결과 읽고 테스트해"
```

## 원칙
1. **20줄 이하** — 짧을수록 좋음
2. **self-contained** — 다른 문서 없이 작업 시작 가능
3. **action-oriented** — "다음에 뭘 할지"가 핵심
4. **파일 경로 필수** — 추상적 설명 대신 "이 파일을 읽어"
