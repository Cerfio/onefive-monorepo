import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3002';
const STATE_DIR = path.join(__dirname, 'tests/e2e/.auth');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  // Bumped: Next.js dev server slows down significantly during long test runs
  // (HMR + on-demand compilation). Production build is much faster but we run
  // against dev for now. If you switch to `pnpm build && pnpm start`, you can
  // reduce these back to 60s/10s.
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 120_000,
    actionTimeout: 20_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'fresh',
      dependencies: ['setup'],
      testMatch: /(auth|forms)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'team',
      dependencies: ['setup'],
      testIgnore: /(auth|forms|interactions)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: path.join(STATE_DIR, 'team.json'),
      },
    },
    {
      name: 'interactions',
      dependencies: ['setup'],
      testMatch: /interactions\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
