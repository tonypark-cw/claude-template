---
paths:
  - ".claude/skills/debate/**"
---
# Gemini Web UI Selectors

Last verified: 2026-03-31

NOTE: Playwright MCP는 접근성 트리(Accessibility Tree) 기반으로 동작.
CSS 셀렉터가 아닌 접근성 속성으로 요소를 찾는다.

## 채팅 입력
- 접근성 트리에서 role="textbox" 또는 contenteditable="true" 요소
- aria-label에 "Message", "Enter a prompt", "메시지 입력" 포함
- Fallback: browser_snapshot에서 입력 영역 식별

## 전송 버튼
- aria-label "Send message" 또는 "보내기"
- Fallback: 입력 후 Enter 키 전송 (browser_type에 submit=true)

## 응답 완료 감지
- 방법: browser_snapshot 2회 (2초 간격) → 텍스트 동일하면 완료
- 보조: 복사/공유 버튼 출현 감지 (스트리밍 완료 후에만 나타남)

## 응답 텍스트 추출
- browser_snapshot 후 마지막 메시지 버블에서 assistant 응답 추출
- 접근성 트리의 대화 영역에서 마지막 항목

## 새 대화 버튼
- "New chat" 또는 "새 채팅" 텍스트 포함 버튼
- 사이드바의 "+" 아이콘 버튼

## 로그인 감지
- browser_snapshot에 "Sign in", "로그인" 텍스트 포함 시 → 세션 만료
