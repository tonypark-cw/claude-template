# Agent Team Templates

tmux 기반 병렬 Claude Code 에이전트 오케스트레이션.

## 구조

```
agent-team/
├── run-agent-team.sh          # 오케스트레이션 스크립트
├── README.md                  # 이 파일
└── examples/
    ├── new-domain-agents/     # 시나리오 A: 도메인 에이전트 N개 동시 추가
    │   ├── 01-agent-sales.md
    │   ├── 02-agent-inventory.md
    │   └── 03-agent-finance.md
    ├── new-feature/           # 시나리오 B: Feature 레이어별 분업
    │   ├── 01-db-handler.md
    │   ├── 02-tools.md
    │   └── 03-grpc-service.md
    └── new-procedures/        # 시나리오 C: 프로시저 일괄 작성
        ├── 01-sales-procedures.md
        ├── 02-support-procedures.md
        └── 03-operations-procedures.md
```

## 빠른 시작

```bash
# 1. 프롬프트 디렉토리 준비 (예시 복사 후 커스터마이징)
cp -r examples/new-feature ./prompts/my-feature
# 각 .md 파일을 프로젝트에 맞게 수정

# 2. 레이아웃 미리보기
bash run-agent-team.sh ./prompts/my-feature --dry

# 3. 실행
bash run-agent-team.sh ./prompts/my-feature --work-dir /path/to/project
```

## 시나리오별 가이드

### A. 도메인 에이전트 N개 (`new-domain-agents/`)

각 에이전트가 독립된 `agents/agent_{domain}/` 디렉토리를 담당. 의존성 없이 완전 병렬.

### B. Feature 레이어 분업 (`new-feature/`)

하나의 기능을 DB → Tools → Service 레이어로 분리. 단방향 의존: Service → Tools → DB.

### C. 프로시저 일괄 작성 (`new-procedures/`)

카테고리별 프로시저를 병렬 작성. 독립 `.md` 파일이라 충돌 없음.

## 커스터마이징

예시를 프로젝트에 맞게 수정할 때:

1. **파일 경로**: `Your Files` 섹션의 경로를 실제 프로젝트에 맞게 변경
2. **참조 파일**: `Reference` 섹션에 팀의 기존 패턴 파일 지정
3. **규칙**: `Rules` 섹션에 프로젝트 고유 제약 추가
4. **에이전트 수**: .md 파일 추가/삭제로 에이전트 수 조절 (최대 9개)

자세한 내용: `docs/guides/agent-team.md`
