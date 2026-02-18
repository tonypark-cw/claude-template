# Claude Starter Template

Claude Code 프로젝트에 즉시 적용할 수 있는 컨텍스트 엔지니어링 스타터 킷.

## 포함 항목

| 카테고리 | 파일 | 역할 |
|----------|------|------|
| **규칙** | `CLAUDE.md` | 11개 행동 원칙 + 워크플로우 규칙 |
| **훅** | `.claude/hooks/destructive-guard.js` | 파괴적 명령(rm -rf, force push 등) 자동 차단 |
| **훅** | `.claude/hooks/check-line-limit.js` | 80줄 초과 파일 감지 → 분리 강제 |
| **훅** | `.claude/hooks/check-file-header.js` | 파일 헤더 주석 누락 감지 |
| **스킬** | `.claude/skills/session-resume/` | 세션 시작 시 자동 상태 복원 |
| **스킬** | `.claude/skills/prompt-review/` | 프롬프트 품질 7축 체크리스트 리뷰 |
| **설정** | `.claude/settings.local.json` | 훅 등록 + 권한 설정 |
| **문서** | `docs/todo.md` | 날짜+순서+완료기준 작업 추적 템플릿 |
| **문서** | `docs/mistakes.md` | 오답노트 템플릿 |
| **문서** | `docs/guides/context-engineering.md` | 4전략 가이드 (저장/골라주기/정리/나눠주기) |
| **문서** | `docs/guides/model-strategy.md` | Opus vs Sonnet 사용 전략 가이드 |
| **메모리** | `memory/MEMORY.md` | 세션 간 영속 메모리 템플릿 |

## 설치

### 자동 (권장)

```bash
# 프로젝트 루트에서 실행
git clone https://github.com/YOUR_USERNAME/claude-starter.git /tmp/claude-starter
cd /tmp/claude-starter && bash install.sh /path/to/your/project
```

### 수동

```bash
# 1. 이 레포를 클론
git clone https://github.com/YOUR_USERNAME/claude-starter.git

# 2. 대상 프로젝트에 복사
cp CLAUDE.md /path/to/project/
cp -r .claude/ /path/to/project/
cp -r docs/ /path/to/project/

# 3. CLAUDE.md의 Project Context 섹션 편집
# 4. memory/MEMORY.md → ~/.claude/projects/*/memory/ 에 복사 (선택)
```

## 설치 후 커스터마이징

1. `CLAUDE.md`의 `## Project Context` 섹션을 프로젝트에 맞게 편집
2. `docs/todo.md`에 첫 번째 작업 목록 작성
3. `.claude/settings.local.json`에 프로젝트별 권한 추가 (필요 시)

## 원칙 요약

| # | 원칙 | 핵심 |
|---|------|------|
| 1 | Ask Before Acting | 애매하면 물어봐 |
| 2 | Think Before Coding | 코딩 전에 계획 |
| 3 | Simplicity First | 80줄 제한, 최소 코드 |
| 4 | Surgical Changes | 필요한 것만 수정 |
| 5 | Goal-Driven | 성공 기준 먼저 정의 |
| 6 | Codebase Awareness | 불일치 발견 시 즉시 중단+설명 |
| 7 | Plan-Review Loop | 계획→리뷰→수정→리뷰 반복 |
| 8 | No Guessing | 안 읽은 코드 추측 금지 |
| 9 | State Management | 진행 상황 파일로 저장 |
| 10 | Efficient Execution | 병렬 실행, 불필요한 요약 생략 |
| 11 | Safety First | 파괴적 행동 전 확인 필수 |
