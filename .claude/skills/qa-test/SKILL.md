---
name: qa-test
description: 변경된 코드의 테스트/검증 실행. 프로젝트별 테스트 전략 자동 적용, API 엔드포인트 검증, 회귀 테스트. TRIGGER when user says "/qa", "테스트해봐", "검증해봐", "QA", "test this", "verify changes".
---

# QA Tester

변경된 코드가 실제로 동작하는지 검증.

## 프로세스

### Step 1: 변경 파일을 프로젝트별 분류
```bash
git diff HEAD --name-only
```

### Step 2: 프로젝트별 서브에이전트 실행
변경된 프로젝트마다 독립 서브에이전트 실행. 각 에이전트는 해당 프로젝트 CLAUDE.md만 참조.

### Step 3: 테스트 유형

**로컬 테스트**
- 기존 테스트 실행 (pytest, jest, go test 등)
- import/빌드 체크

**API 검증** (서버가 있는 프로젝트)
- health check
- 핵심 엔드포인트 1-2건 호출
- 응답 구조 확인

**회귀 체크**
- 변경하지 않은 기존 엔드포인트 깨지지 않는지
- 기존 테스트 통과 여부

### Step 4: 리포트

```
## QA Test Report

### 테스트 환경
- 로컬 / 원격 서버

### 결과
| 테스트 | 결과 | 상세 |
|--------|------|------|
| import 체크 | PASS/FAIL | ... |
| health check | PASS/FAIL | ... |
| 기능 검증 | PASS/FAIL | ... |
| 회귀 테스트 | PASS/FAIL | ... |

### 판정: PASS / FAIL
```

## 주의사항
- 서버 재시작/배포는 사용자 확인 후만
- DB DDL 실행 금지
- 테스트만, 프로덕션 데이터 변경 금지
