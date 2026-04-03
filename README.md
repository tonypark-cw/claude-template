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

### 컨텍스트 파일

| 파일 | 역할 |
|------|------|
| `AGENTS.md` | 모든 AI 도구 공용 규칙 (SSOT) |
| `CLAUDE.md` | Claude Code 전용 — @AGENTS.md import + 7 Core Principles |
| `.claude/rules/*.md` | 분산 규칙 (workflow, team_protocol, thinking-model 등) |

### 에이전트 (`.claude/agents/`)

| 에이전트 | 모델 | 역할 |
|----------|------|------|
| `architect` | Opus | 설계, 영향 범위 분석 |
| `deep-coder` | Opus | 구현 (worktree 격리) |
| `researcher` | Sonnet | 외부 조사 |
| `validator` | Sonnet | 검증 (코드 수정 불가) |
| `evaluator` | Sonnet | Rubric 기반 독립 평가 |

### 훅 (`.claude/hooks/`)

| 훅 | 이벤트 | 기능 |
|---|--------|------|
| `guard.js` | PreToolUse (Bash) | 3-tier: WHITELIST→BLOCK→ASK |
| `stop-gate.js` | Stop | 품질 검증 (JSON/JS/Python syntax) + 동기화 리마인드 |
| `stop-gate (prompt)` | Stop | 의미론적 검증 — 요구사항 충족 여부 LLM 평가 |
| `check-line-limit.js` | PostToolUse | 80줄 초과 파일 감지 |
| `check-file-header.js` | PostToolUse | 파일 헤더 주석 누락 감지 |
| `pre-compact.js` | PreCompact | 컨텍스트 압축 전 상태 스냅샷 |
| `session-start.js` | SessionStart | handoff + TODO + git 상태 → additionalContext 주입 |

### 스킬 (`.claude/skills/`)

| 스킬 | 트리거 | 기능 |
|------|--------|------|
| `/plan` | 기획 시작 | 6개 문답 → PRD 자동 생성 |
| `/debate` | 토론 시작 | Claude↔Codex 크로스 토론 |
| `/evaluate` | 평가 | Rubric 기반 독립 평가 |
| `/review` | 코드 리뷰 | Git diff 분석, APPROVE/WARNING/BLOCK |
| `/review-team` | 전체 검토 | 리뷰어+QA 병렬 오케스트레이터 |
| `/handoff` | 세션 종료 | 컨텍스트 전달 문서 생성 |
| `/qa` | 테스트 | 프로젝트별 테스트/검증 실행 |

### 규칙 (`.claude/rules/`)

| 파일 | 범위 |
|------|------|
| `workflow.md` | TODO, progress, mistakes, session resume |
| `team_protocol.md` | 에이전트 팀 조직도, Heartbeat, 에스컬레이션 |
| `thinking-model.md` | GROUND→APPLY→VERIFY→ADAPT 행동 모델 |
| `permission-layers.md` | 3층 권한 구조 (Hooks > Prompts > Permissions) |
| `subagent-guide.md` | 서브에이전트 사용 가이드 (컨텍스트 방화벽) |
| `mcp-boundaries.md` | MCP 도구 경계 + 선택 체크리스트 |

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
cp AGENTS.md CLAUDE.md /path/to/project/
cp -r .claude/ /path/to/project/
cp -r docs/ templates/ /path/to/project/
```

## 설치 후 커스터마이징

1. `AGENTS.md`의 Build & Test 섹션에 프로젝트 명령어 기입
2. `CLAUDE.md`의 Project Context 섹션 편집
3. `docs/todo.md`에 첫 작업 목록 작성
4. 불필요한 `rules/example-*.md` 제거, 프로젝트 맞춤 규칙 추가

## 원칙 요약 (CLAUDE.md 7 Principles)

| # | 원칙 | 핵심 |
|---|------|------|
| 1 | Verify Before Acting | 읽지 않고 가정하지 않는다 |
| 2 | Simplicity First | 요청된 것만 만든다 |
| 3 | Surgical Changes | 필요한 것만 수정한다 |
| 4 | Read Then Act | GROUND→APPLY→VERIFY→ADAPT |
| 5 | Goal-Driven | 성공 기준 먼저 정의 |
| 6 | Safety First | 파괴적 행동 전 확인 |
| 7 | Efficient Execution | 병렬 실행, 불필요한 요약 생략 |
