# MCP 통합 가이드 — Claude Code에서 외부 서비스 연결하기

MCP(Model Context Protocol)로 Claude Code에 브라우저, DB, 결제, 디자인 도구를 연결하는 방법.

## 1. MCP란 무엇인가

MCP는 LLM이 외부 도구·서비스에 연결하는 **표준 프로토콜**이다. Claude Code는 MCP 서버를 통해 브라우저 제어, DB 쿼리, API 호출 등의 기능을 직접 수행할 수 있다.

**연결 구조**:

```
[Claude Code] ──► [MCP 클라이언트] ──► [MCP 서버] ──► [외부 서비스]
                  (Claude Code 내장)    (로컬/원격)     (DB, 브라우저, API 등)
```

MCP 서버는 로컬 프로세스(stdio)로 실행하거나, 원격 HTTP 서버에 연결할 수 있다.

---

## 2. 설정 방법

### 2-1. 스코프 — 어디에 저장할 것인가

| 스코프 | 저장 위치 | 용도 | 팀 공유 |
|--------|-----------|------|---------|
| `local` | `~/.claude.json` (프로젝트별) | 개인 전용 설정 | 불가 |
| `project` | `.mcp.json` (프로젝트 루트) | 팀 공유, git 커밋 | 가능 |
| `user` | `~/.claude.json` (전역) | 모든 프로젝트에 적용 | 불가 |

팀 프로젝트에서는 `project` 스코프를 기본으로 사용한다. `.mcp.json`을 git에 커밋하면 팀원 전체가 동일한 MCP 환경을 사용할 수 있다.

### 2-2. CLI 명령어

```bash
# 기본 등록 (로컬 스코프)
claude mcp add <이름> -- <실행 커맨드>

# 프로젝트 스코프로 등록 (팀 공유)
claude mcp add --scope project <이름> -- npx <패키지>

# HTTP 원격 서버 연결
claude mcp add --transport http <이름> <URL>

# 환경변수 주입
claude mcp add --env API_KEY=값 <이름> -- npx <패키지>

# 관리
claude mcp list            # 등록된 서버 목록
claude mcp get <이름>      # 특정 서버 설정 확인
claude mcp remove <이름>   # 서버 제거
```

### 2-3. `.mcp.json` 직접 작성

프로젝트 루트에 `.mcp.json`을 만들어 버전 관리할 수 있다.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

환경변수 참조 방식 (민감 정보는 반드시 이 방식 사용):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@github/mcp-server"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## 3. 권장 MCP 서버

### Playwright MCP (Microsoft 공식)

브라우저 자동화. E2E 테스트, 스크레이핑, UI 검증에 사용한다.

| 항목 | 내용 |
|------|------|
| 저장소 | github.com/microsoft/playwright-mcp |
| 패키지 | `@playwright/mcp` |
| 도구 수 | 34개 |
| 방식 | 접근성 트리 기반 (토큰 효율적) |

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest

# 스크린샷 모드 (비전 모드) 활성화
claude mcp add --scope project playwright -- npx @playwright/mcp@latest --caps vision
```

사용 예시:

```
"localhost:3000 열고 로그인 폼에 테스트 계정으로 로그인해봐"
"결제 플로우 전체를 클릭해서 오류 없는지 확인해줘"
```

접근성 트리 방식은 DOM 전체를 텍스트로 변환하므로 스크린샷 없이도 대부분의 조작이 가능하다. 시각적 판단이 필요한 경우에만 `--caps vision`을 사용한다.

---

### Figma MCP (Figma 공식)

Figma 프레임에서 디자인 토큰과 컴포넌트 코드를 직접 추출한다.

| 항목 | 내용 |
|------|------|
| 저장소 | github.com/figma/mcp-server-guide |
| 핵심 도구 | `get_variable_defs`, `get_design_context`, `create_design_system_rules` |
| 연결 방식 | HTTP (Figma 공식 엔드포인트) |
| 제한 | Starter 플랜 월 6회, Professional 이상 권장 |

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

워크플로우:

```
Figma 프레임 선택
    │
    ▼
get_variable_defs    ← 디자인 토큰 (색상, 폰트, 간격) 추출
    │
    ▼
get_design_context   ← React + Tailwind 컴포넌트 코드 생성
    │
    ▼
tokens.ts / Component.tsx 파일로 저장
```

사용 예시:

```
"이 Figma 프레임의 디자인 변수를 Tailwind tokens.ts로 만들어줘"
"Button 컴포넌트의 variants를 Figma 스펙 그대로 구현해줘"
```

---

### 21st.dev Magic MCP (UI 컴포넌트 생성)

자연어로 React 컴포넌트를 생성한다. "v0 in your IDE" 컨셉. 커뮤니티 컴포넌트 라이브러리에 즉시 접근 가능.

| 항목 | 내용 |
|------|------|
| 저장소 | github.com/21st-dev/magic-mcp |
| 기능 | 자연어 → React 컴포넌트 생성, 커뮤니티 라이브러리 즉시 활용 |
| 인증 | 21st.dev API 키 필요 (유료) |

```bash
npx @21st-dev/cli@latest install claude --api-key YOUR_API_KEY
```

사용 예시:

```
"히어로 섹션 컴포넌트 만들어줘, 그라데이션 배경에 CTA 버튼 포함"
"카드 그리드 레이아웃 컴포넌트 생성해줘, 반응형으로"
```

shadcn이 **기존 컴포넌트 설치**라면, Magic MCP는 **새 컴포넌트 생성**에 강하다. 둘을 함께 쓰면 설치+생성 모두 커버.

---

### shadcn/ui MCP (shadcn 공식)

shadcn 컴포넌트 레지스트리에 직접 접근해 검색·설치를 자동화한다.

| 항목 | 내용 |
|------|------|
| 문서 | ui.shadcn.com/docs/mcp |
| 기능 | 컴포넌트 검색, 설치 자동화, 의존성 처리 |
| 초기화 | `pnpm dlx shadcn@latest mcp init --client claude` |

```bash
# 프로젝트에서 초기화 (shadcn이 .mcp.json 자동 생성)
pnpm dlx shadcn@latest mcp init --client claude
```

사용 예시:

```
"DataTable 컴포넌트 찾아서 프로젝트에 추가해줘"
"Form 컴포넌트에 shadcn Combobox를 연결해줘"
```

---

### GitHub MCP (GitHub 공식)

이슈·PR 관리, 코드 검색, Actions 모니터링을 Claude Code에서 직접 수행한다.

| 항목 | 내용 |
|------|------|
| 저장소 | github.com/github/github-mcp-server |
| 기능 | 이슈/PR 생성·관리, 코드 검색, Actions 모니터링 |
| 인증 | Personal Access Token (PAT) |

```bash
# HTTP 방식 (PAT 사용)
claude mcp add --transport http \
  --header "Authorization: Bearer $GITHUB_PAT" \
  github https://api.githubcopilot.com/mcp
```

`.mcp.json`에서는 PAT를 환경변수로 참조:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PAT}"
      }
    }
  }
}
```

사용 예시:

```
"이 브랜치의 PR 만들어줘, 제목은 'feat: 결제 모듈 추가'"
"빌드 실패한 Actions 로그 확인해줘"
```

---

### Supabase MCP (Supabase 공식)

Supabase DB 쿼리, 테이블 구조 확인, TypeScript 타입 생성을 수행한다.

| 항목 | 내용 |
|------|------|
| 저장소 | github.com/supabase-community/supabase-mcp |
| 기능 | DB 쿼리, 테이블 관리, TypeScript 타입 생성 |
| 보안 필수 | `read_only=true` 파라미터 |

```bash
claude mcp add --transport http \
  --header "Authorization: Bearer $SUPABASE_TOKEN" \
  supabase "https://mcp.supabase.com/mcp?project_ref=YOUR_REF&read_only=true"
```

**`read_only=true`는 반드시 포함**한다. 없으면 Claude Code가 DB 데이터를 수정할 수 있다.

사용 예시:

```
"users 테이블 스키마 보여줘"
"최근 7일 신규 가입자 수 쿼리해줘"
"현재 DB 스키마로 TypeScript 타입 파일 생성해줘"
```

---

### Stripe MCP (Stripe 공식)

고객 조회·생성, 결제 링크, 구독 관리를 수행한다.

| 항목 | 내용 |
|------|------|
| 문서 | docs.stripe.com/mcp |
| 기능 | 고객 관리, 결제 링크 생성, 구독 관리 |
| 인증 | OAuth 권장 (Secret Key보다 권한 범위 제한 가능) |

```bash
claude mcp add --transport http stripe https://mcp.stripe.com/
```

사용 예시:

```
"customer@example.com 고객 정보 조회해줘"
"월 9900원 구독 플랜 결제 링크 만들어줘"
```

---

## 4. 프로젝트 타입별 추천 조합

| 프로젝트 타입 | 추천 MCP | 각 역할 |
|-------------|----------|---------|
| React 웹앱 | Magic + shadcn + Playwright + Figma | 생성 + 설치 + 테스트 + 디자인 |
| Full-stack (Supabase) | shadcn + Supabase + Playwright | UI + DB 쿼리 + 통합 테스트 |
| SaaS + 결제 | shadcn + Stripe + Supabase | UI + 결제 + DB |
| 오픈소스 프로젝트 | GitHub + Playwright | PR 관리 + E2E 테스트 |

**React 웹앱 `.mcp.json` 예시**:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## 5. 성능 — 토큰 소비 주의

MCP 서버를 많이 등록하면 도구 정의 자체가 컨텍스트 윈도우를 소비한다.

| 상태 | 토큰 소비 |
|------|-----------|
| 서버 다수 활성화 시 (최악) | 최대 98.7k 토큰 (200k 윈도우의 49%) |
| Tool Search 활성 시 (기본값) | 약 8.5k 토큰 (46.9% 절감) |

**Tool Search는 기본 활성화**되어 있으며, 현재 작업에 관련된 도구만 동적으로 로드한다. 별도 설정 없이도 토큰 절감 효과가 적용된다.

권장 운영 방식:

- 현재 작업에 필요한 MCP만 활성화한다
- `/context` 커맨드로 현재 토큰 소비량을 확인한다
- Playwright처럼 도구 수가 많은 서버는 작업이 끝나면 비활성화를 검토한다

---

## 6. 보안 규칙

| 규칙 | 이유 |
|------|------|
| API 키를 `.mcp.json`에 직접 쓰지 않는다 | `.mcp.json`은 git에 커밋됨 — 키가 공개 저장소에 노출됨 |
| 환경변수 참조 방식 사용: `${VAR}` | 실제 키는 `.env` 또는 시스템 환경변수에만 존재 |
| Supabase는 `read_only=true` 필수 | 없으면 Claude가 실수로 데이터를 수정할 수 있음 |
| 프로덕션 DB 직접 연결 금지 | 스테이징 환경 또는 읽기 전용 복제본 사용 |
| Stripe OAuth 방식 권장 | Secret Key보다 권한 범위를 좁게 제한할 수 있음 |

`.mcp.json`에 민감 정보가 포함된 것을 발견하면 즉시 키를 폐기하고 새 키를 발급한다. git 히스토리에 남은 키는 `git filter-repo`로 제거해야 한다.

---

## 7. 빠른 참조

| 작업 | 커맨드 |
|------|--------|
| 서버 목록 확인 | `claude mcp list` |
| 서버 설정 확인 | `claude mcp get <이름>` |
| 서버 제거 | `claude mcp remove <이름>` |
| 토큰 소비 확인 | `/context` |
| Playwright 설치 | `claude mcp add --scope project playwright -- npx @playwright/mcp@latest` |
| shadcn MCP 초기화 | `pnpm dlx shadcn@latest mcp init --client claude` |
