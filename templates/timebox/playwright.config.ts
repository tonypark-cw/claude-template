// Playwright E2E test configuration for timebox app (headless chromium + serve)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3939',
  },
  webServer: {
    command: 'npx serve . -l 3939 --no-clipboard',
    port: 3939,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
