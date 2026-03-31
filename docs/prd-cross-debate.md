# PRD: Cross-AI Debate System (Claude ↔ Gemini)
Version: 0.1 | Status: DRAFT | Date: 2026-03-31

## 1. Project Overview

Claude Code(CLI)와 Gemini Pro(웹)가 토론을 통해 설계·구현 품질을 높이는 시스템. Claude가 구현을, Gemini가 설계를 담당하고, 검토는 양방향으로 수행한다. Playwright MCP로 Gemini 웹을 자동 조작하여 API 비용 없이 기존 구독(Claude Max + Gemini Pro)만으로 운영한다. 향후 다른 AI 에이전트로 확장 가능한 구조로 설계한다.

## 2. Target User & Problem

**Primary User**: Claude Code를 메인으로 사용하는 1인 개발자 (본인)

**Current Situation**: Claude Code 단독 사용. 설계·구현·검토를 모두 같은 모델이 수행하여 "자가 평가의 함정" 발생.

**Pain Point**: 같은 모델끼리는 서로의 결함을 관대하게 넘기는 편향이 존재. 이종 모델의 독립적 시각이 필요하지만, API 추가 비용은 원치 않음.

**Desired Outcome**: Claude와 Gemini가 자동으로 토론하여 설계는 더 견고하게, 구현은 더 정확하게. 토론 과정과 개선 결과가 기록되어 재활용 가능.

## 3. MVP Features (Prioritized)

| Priority | Feature | Description | Acceptance Criteria |
|----------|---------|-------------|---------------------|
| P0 | Gemini 웹 자동화 | Playwright로 gemini.google.com 채팅 입력/응답 추출 | 전용 프로필로 로그인 유지, 텍스트 전송+응답 추출 성공 |
| P0 | 토론 루프 | Claude→Gemini→Claude 핑퐁 (설계→검토→구현→검토) | 최대 3회 루프, 양쪽 PASS 시 종료 |
| P0 | `/debate` 스킬 | 토론 트리거 + 전체 플로우 오케스트레이션 | `/debate "주제"` 한 번으로 전체 진행 |
| P1 | 토론 로그 기록 | 과정 + 개선 결과 요약을 파일로 저장 | `docs/debates/YYYY-MM-DD-주제.md`에 자동 기록 |
| P1 | 역할 분리 | Gemini=설계, Claude=구현, 검토=공통 | 프롬프트로 역할 강제 |
| P2 | 에이전트 확장 구조 | 향후 GPT 등 다른 모델 추가 가능한 인터페이스 | backend 추가 시 기존 코드 최소 변경 |

## 4. User Flow

Step 1: 사용자가 `/debate "결제 모듈 설계해줘"` 실행
Step 2: Claude가 Playwright로 Gemini 웹에 설계 요청 전송
Step 3: Gemini 응답(설계안) 추출
Step 4: Claude가 설계안 검토 + 피드백 작성
Step 5: 피드백을 Gemini에 전송 → Gemini 수정안 추출
Step 6: 설계 확정 → Claude가 구현
Step 7: 구현 코드를 Gemini에 검토 요청 전송
Step 8: Gemini 검토 결과 추출 → Claude가 반영
Step 9: 최대 3회 루프 후 완료, 토론 로그 저장
Step 10: 사용자에게 최종 결과 + 토론 요약 보고

## 5. Success Criteria

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| 토론 완료율 | 90%+ | 10회 테스트 중 에러 없이 완료되는 비율 |
| 턴당 응답 시간 | 30초 이내 | Gemini 웹 응답 추출까지 걸리는 시간 |
| 로그인 세션 유지 | 24시간+ | 전용 프로필 재로그인 없이 유지되는 시간 |
| 추가 API 비용 | $0 | 웹 브라우저만 사용, API 호출 없음 |
| 토론 로그 완전성 | 100% | 모든 턴의 요청/응답 + 개선 요약이 기록됨 |

## 6. Out of Scope (v1)

- GPT 등 다른 AI 연동 (향후 확장)
- API 방식 fallback
- 다중 Gemini 세션 병렬 처리
- 자동 git 커밋 (토론 후 사용자가 판단)
- Claude 웹 자동화 (Claude는 현재 CLI 세션에서 직접 처리)

## 7. Technical Constraints

- **Playwright MCP**: `@playwright/mcp` — Gemini 웹 자동 조작
- **브라우저 프로필**: 전용 Chromium 프로필 생성, 로그인 세션 영속
- **Python 3.10+**: claude-template 기존 스택
- **제약**: Gemini 웹 UI 변경 시 셀렉터 업데이트 필요 (취약점)
- **확장 고려**: backend 인터페이스를 추상화해서 향후 다른 모델 추가 가능하게 설계
