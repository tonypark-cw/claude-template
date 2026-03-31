# Claude Starter Template

Claude Code 프로젝트에 즉시 적용할 수 있는 하네스 엔지니어링 스타터 킷.
기획→설계→구현→평가 파이프라인과 Cross-AI 토론 시스템 포함.

## 핵심 아키텍처

```
[User] → /plan → docs/prd.md (SSOT)
                     │
                     ▼
          [Generator] → code changes
                            │
              /debate ──►  [Gemini] ←→ [Claude] (설계↔검토 토론)
                            │
              /evaluate ►  [Evaluator] → PASS/CONDITIONAL/FAIL
                            ↑
                   docs/rubric.md (평가 기준표)
```

## 포함 항목

### 에이전트 (`.claude/agents/`)

| 에이전트 | 모델 | 역할 |
|----------|------|------|
| `architect` | Opus | 설계, 영향 범위 분석 (`memory: project`) |
| `deep-coder` | Opus | 구현 (`memory: project`, `isolation: worktree`) |
| `researcher` | Sonnet | 외부 조사 (`memory: project`) |
| `validator` | Sonnet | 검증 (코드 수정 불가) |
| `evaluator` | Sonnet | Rubric 기반 독립 평가 (Write/Edit 차단) |

### 스킬 (`.claude/skills/`)

| 스킬 | 트리거 | 기능 |
|------|--------|------|
| `/plan` | 기획 시작 | 6개 문답 → PRD 자동 생성 → `docs/prd.md` SSOT |
| `/debate` | 토론 시작 | Claude↔Gemini 토론 (설계→검토→구현→검토, 최대 3회) |
| `/evaluate` | 평가 | Rubric 기반 1-5점 독립 평가, PASS/CONDITIONAL/FAIL |
| `/review` | 코드 리뷰 | Git diff 분석, APPROVE/WARNING/BLOCK |
| `/review-team` | 전체 검토 | 리뷰어+QA 병렬 오케스트레이터 |
| `/handoff` | 세션 종료 | 20줄 컨텍스트 전달 문서 생성 |
| `/session-resume` | 세션 시작 | 이전 상태 자동 복원 |
| `/qa` | 테스트 | 프로젝트별 테스트/검증 실행 |
| `prompt-review` | 프롬프트 검토 | 7축 체크리스트 리뷰 |
| `quiz` | 퀴즈 | 코드베이스 이해도 테스트 |

### 훅 (`.claude/hooks/`)

| 훅 | 이벤트 | 기능 |
|---|--------|------|
| `destructive-guard.js` | PreToolUse | rm -rf, force push 등 차단 |
| `check-line-limit.js` | PostToolUse | 80줄 초과 파일 감지 |
| `check-file-header.js` | PostToolUse | 파일 헤더 주석 누락 감지 |
| `session-start.js` | SessionStart | handoff + TODO + git 상태 자동 로드 |
| `stop-sync-reminder.js` | Stop | 핸드오프/진행상황 업데이트 알림 |

### MCP 서버 (`mcp-servers/`)

| 서버 | 기능 |
|------|------|
| `cross-evaluator` | Gemini/OpenAI API로 독립 평가 + `debate_send` 토론 도구 |
| `playwright` | 브라우저 자동화, E2E 테스트 |

### 문서 & 가이드

| 파일 | 내용 |
|------|------|
| `docs/guides/harness-architecture.md` | Planner→Generator→Evaluator 파이프라인 |
| `docs/guides/mcp-integration.md` | Playwright, Figma, shadcn, Magic MCP 등 연동 |
| `docs/guides/context-splitting.md` | 봉건제 패턴 — Layer 0~3 컨텍스트 분산 |
| `docs/guides/context-engineering.md` | 4전략: 저장/골라주기/정리/나눠주기 |
| `docs/guides/model-strategy.md` | Opus vs Sonnet 사용 전략 |
| `docs/guides/agent-team.md` | 병렬 멀티 에이전트 개발 |
| `docs/ai_harness_engineering_guide.md` | 하네스 엔지니어링 전체 가이드 |
| `docs/8_videos_summary.md` | 8개 영상 요약 + 구현 매핑 |

### 템플릿

| 파일 | 용도 |
|------|------|
| `templates/prd-template.md` | PRD 7섹션 템플릿 |
| `templates/rubric-template.md` | 평가 기준표 6항목 (ML 확장 시 9항목) |
| `templates/debate-log-template.md` | 토론 로그 형식 |
| `templates/agent-team/` | tmux 기반 에이전트 팀 + 3개 시나리오 |

## 설치

### 자동 (권장)

```bash
git clone https://github.com/tonypark-cw/claude-template.git /tmp/claude-template
cd /tmp/claude-template && bash install.sh /path/to/your/project
```

### 수동

```bash
git clone https://github.com/tonypark-cw/claude-template.git
cd claude-template

# 대상 프로젝트에 복사
cp CLAUDE.md /path/to/project/
cp -r .claude/ /path/to/project/
cp -r docs/ /path/to/project/
cp -r templates/ /path/to/project/
cp -r mcp-servers/ /path/to/project/
cp .mcp.json /path/to/project/
```

### MCP 서버 설정

```bash
# 1. Gemini API 키 설정 (aistudio.google.com에서 무료 발급)
export GOOGLE_GEMINI_API_KEY=your-key

# 2. MCP 서버 의존성 설치
cd mcp-servers/cross-evaluator && uv sync

# 3. Playwright MCP 설치
npm install -g @playwright/mcp
```

## 설치 후 커스터마이징

1. `CLAUDE.md`의 `## Project Context` 섹션 편집
2. `docs/todo.md`에 첫 작업 목록 작성
3. `docs/rubric.md`로 평가 기준 커스터마이징 (선택)
4. `.mcp.json`에 프로젝트별 MCP 서버 추가 (선택)

## 추천 워크플로우

```
/plan "새 기능 기획"          → docs/prd.md 생성
/debate "기능 설계"           → Gemini와 설계 토론
구현                          → Claude가 코드 작성
/evaluate                     → Rubric 기반 평가
/review-team                  → 코드 리뷰 + QA 병렬
/handoff                      → 세션 종료 시 컨텍스트 저장
```

## 원칙 요약

| # | 원칙 | 핵심 |
|---|------|------|
| 1 | Ask Before Acting | 애매하면 물어봐 |
| 2 | Think Before Coding | 코딩 전에 계획 |
| 3 | Simplicity First | 80줄 제한, 최소 코드 |
| 4 | Surgical Changes | 필요한 것만 수정 |
| 5 | Goal-Driven | 성공 기준 먼저 정의 |
| 6 | Codebase Awareness | 불일치 시 즉시 중단 |
| 7 | Plan-Review Loop | 계획→리뷰→수정→리뷰 |
| 8 | No Guessing | 안 읽은 코드 추측 금지 |
| 9 | State Management | 진행 상황 파일 저장 |
| 10 | Efficient Execution | 병렬 실행 |
| 11 | Safety First | 파괴적 행동 전 확인 |
| 12 | Auto Agent Team | 비단순 작업 시 자동 팀 |
| 13 | Distributed Context | 포인터 + handoff |
