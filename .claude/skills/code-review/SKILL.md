---
name: code-review
description: Git diff 기반 코드 리뷰. 변경된 파일의 보안, 품질, 패턴, side effect를 검토하고 APPROVE/WARNING/BLOCK 판정. TRIGGER when user says "/review", "리뷰해줘", "검토해줘", "코드 리뷰", "review this", "check my changes".
---

# Code Reviewer

변경된 코드의 품질, 보안, 정확성을 검증하는 사후 검토 프로세스.

## 프로세스

### Step 1: 변경 범위 파악
```bash
git diff HEAD --stat
```

### Step 2: 프로젝트 컨텍스트 로딩
변경된 파일 위치의 CLAUDE.md와 rules를 참조. 서브에이전트 사용 시 해당 프로젝트 CLAUDE.md 경로만 전달.

### Step 3: 변경 코드 분석
각 변경 파일에 대해:
1. 변경 전후 diff 분석
2. 호출하는 함수/모듈 추적
3. 이 파일을 import하는 곳 추적
4. 체크리스트 적용

### Step 4: 체크리스트

**CRITICAL**
- 하드코딩된 자격증명 (API 키, 비밀번호, 토큰)
- SQL/명령어 인젝션 가능성
- .env, 시크릿 파일이 git에 포함되는지

**HIGH**
- 기존 API 응답 구조 변경 (하위 호환성)
- 기존 함수 시그니처 변경 (호출자 영향)
- 에러 핸들링 누락 (외부 API, DB 호출)
- 새 의존성이 배포 환경에서 사용 가능한지

**MEDIUM**
- 불필요한 코드 추가 (over-engineering)
- 하드코딩된 매직 넘버
- 기존 유틸리티가 있는데 새로 구현

**LOW**
- 스타일 불일치
- 미사용 import/변수

### Step 5: 리포트

```
## Code Review Report

### 변경 요약
- 파일 N개 변경, +X / -Y lines

### 이슈
[SEVERITY] 제목
  파일: path:line
  문제: 설명
  수정: 제안

### 판정
| 심각도 | 개수 |
|--------|------|
| CRITICAL | X |
| HIGH | X |

**결과: APPROVE / WARNING / BLOCK**
```

## 기준
- 80% 이상 확신하는 이슈만 보고
- 변경되지 않은 코드의 이슈는 CRITICAL 보안만
- 유사 이슈 통합
- 프로젝트 CLAUDE.md/rules 컨벤션 우선
