# GPT Codex-5.4 + Playwright 자동화 테스트 완벽 가이드

사용자님께서 겪고 계신 **"HTML 요소를 모두 모킹하여 검증하려는 시도"**는 현대의 SPA(React, Vue 등) 생태계에서 매우 취약한 방식입니다. 
단순 클로닝된 HTML 위에서 컴포넌트를 모킹하면, **비동기 렌더링(Hydration), 세션 쿠키, 서버와의 실제 실시간 데이터 통신**이 작동하지 않기 때문에 (1)세션 유지, (2)로그인 인증, (3)렌더링 시간 이슈가 자연스럽게 발생합니다.

본 가이드는 클로닝 방식의 한계를 벗어나, **"GPT Codex-5.4(또는 유사 상위 LLM)를 실제 브라우저(Staging/Local)와 다이렉트로 결합"**하여 Playwright 테스트 파이프라인의 핵심 제약 사항들을 해결하는 모범 사례(Best Practices)를 다룹니다.

---

## 1. 로그인 인증 및 세션 유지 문제: `StorageState` 활용

매번 테스트마다 브라우저를 새로 열어 ID/PW를 치고 UI 렌더링을 기다린다면 시간 낭비와 세션 튕김 현상(Flakiness)이 급증합니다. Playwright는 인증 상태를 단 1번만 추출해 재사용하는 강력한 기능을 제공합니다.

### 1-1. 전역 셋업(`global-setup.ts`)을 통한 상태 저장
사전에 로그인만 수행하는 셋업 파일을 작성하여 쿠키와 로컬스토리지 토큰을 JSON으로 캡처합니다.

```typescript
// playwright/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('https://your-target-site.com/login');
  
  // 로그인 과정 수행
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // 로그인이 성공적으로 완료되었음을 검증 (핵심)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // 모든 세션(쿠키, 스토리지)을 저장
  await page.context().storageState({ path: authFile });
});
```

### 1-2. 테스트 코드에 저장된 세션 복원하기
Codex-5.4 가 짜는 코드 혹은 `playwright.config.ts`에 이 경로를 주입하면, **로그인 단계를 영구히 건너뛸 수 있습니다.**

```typescript
// playwright.config.ts 설정 부분
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 저장된 로그인 상태를 주입하여 인증 세션이 유지된 상태로 테스트 시작
        storageState: 'playwright/.auth/user.json', 
      },
      dependencies: ['setup'], // 항상 setup을 먼저 실행
    },
  ],
});
```

> ⚠️ **주의:** 절대로 `.auth/user.json` 파일이 Git(버전관리) 등에 커밋되지 않도록 `.gitignore`에 반드시 추가하세요!

---

## 2. 렌더링 시간 지연 (Hydration/API 통신) 문제 해결

클로닝된 HTML은 1밀리초만에 나타나지만 상용 앱은 아닙니다. 테스트가 자주 실패한다면 십중팔구 **하드코딩된 대기시간** 때문입니다.

### 2-1. 절대 금지 항목 (Codex-5.4 시스템 프롬프트에 명시할 것)
* `await page.waitForTimeout(3000)`: 고정된 스레드 락다운은 네트워크 상황에 따라 필연적으로 취약해집니다.

### 2-2. 권장 접근 방식: Auto-waiting 및 Network Event
Playwright는 기본적으로 DOM이 보이거나 클릭 가능해질 때까지 기다립니다(`Auto-wait`). SPA 렌더링 지연이 생길 때는 **"API 호출이 완료되는 시점"**을 타겟팅해야 합니다.

```typescript
// 1. 상태 대기 (Auto-waiting 기반 Locator 사용)
// 요소가 렌더링될 때까지 Playwright가 자동으로 대기 및 재시도합니다.
const submitBtn = page.getByRole('button', { name: 'Submit' });
await expect(submitBtn).toBeVisible({ timeout: 10000 }); // 최대 10초까지 유연하게 대기

// 2. 중요 컴포넌트 등장 대기
await page.waitForSelector('.table-data-row', { state: 'attached' });

// 3. API 통신(렌더링의 원인) 응답 완료 대기 (가장 안정적)
// 어떤 상호작용 후, 특정 API 데이터 패치가 끝날 때까지 기다립니다.
await Promise.all([
  page.waitForResponse(response => response.url().includes('/api/v1/users') && response.status() === 200),
  page.getByRole('button', { name: 'Refresh Data' }).click() // 렌더링을 유발하는 액션
]);
```

---

## 3. GPT Codex-5.4 자동 검증 파이프라인 (2가지 방식)

### 접근법 A. 사전 코드 제너레이터로서의 역할 (Pre-generation)
HTML 전체를 주지 않고, **실제 사이트의 Accessibility Tree(접근성 트리)** 만 렌더링해서 프롬프트에 던집니다.
* **이유:** LLM(Codex-5.4)은 난잡한 `<div>` 덩어리보다 의미론적인 마크업("버튼-Submit", "링크-Dashboard")을 볼 때 완벽한 Playwright Action/Expect 코드를 짜냅니다.
* **프로세스:**
  1. 사전 스크립트롤 통해 `page.accessibility.snapshot()` 구조를 텍스트화합니다.
  2. Codex-5.4에 "A에서 B버튼을 누르고 C를 확인하는 위 내용 기반의 Typescript 테스트 코드를 작성해 줘"라고 전달.
  3. 로컬에 `.spec.ts`를 저장하고 CI 환경에서 실행합니다.

### 접근법 B. 런타임 Agentic Testing (권장)
ZeroStep(또는 커스텀 스크립트)과 같이 테스트 런타임에서 LLM에 직접 명령을 내리는 구조입니다. Playwright MCP(Model Context Protocol)를 활용해 Codex-5.4가 브라우저 DOM을 실시간으로 분석하고 조작합니다.

```typescript
import { test } from '@playwright/test';
import { ai } from '@zerostep/playwright'; // LLM 임베딩 예시

test('GPT Codex-5.4 자동 검증 라우팅 테스트', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Codex-5.4가 HTML 구조 변화에 구애받지 않고 시멘틱하게 요소를 찾아 동작합니다.
  // 렌더링 문제와 복잡한 라우팅 연결점을 알아서 판단합니다.
  await ai('사이드바에서 사용자 설정 메뉴로 이동해', { page, test });
  await ai('새로운 유저 초대 버튼을 누르고 임의의 이메일을 입력한 뒤 저장해', { page, test });
  
  const successMessage = await ai('성공적으로 저장되었다는 알림 메시지가 화면에 나타났는지 확인해줘', { page, test });
  expect(successMessage).toBe(true);
});
```

이 접근 방식들은 모킹(Mocking)으로 인한 헛수고를 줄이고, 오직 실제 비즈니스 로직에만 AI 인텔리전스와 검증 리소스를 쏟을 수 있게 해줍니다.
