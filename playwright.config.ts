import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

// Use process.env.PORT by default and fallback to 3000 if not set.
const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`; // Use localhost for consistency

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Timeout for each test
  timeout: 30 * 1000, // 30 seconds per test
  // Timeout for each assertion (e.g., expect(locator).toBeVisible())
  expect: {
    timeout: 10 * 1000, // 10 seconds for expect()
  },
  testDir: path.join(__dirname, 'playwright-tests'), // Changed to playwright-tests to avoid conflict with Jest's default 'tests'
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    trace: 'on-first-retry', // Record trace only when retrying a test

    // Default timeout for actions like page.click(), page.fill(), etc.
    actionTimeout: 15 * 1000, // 15 seconds for actions

    // Default timeout for navigations like page.goto(), page.waitForNavigation(), page.waitForURL()
    navigationTimeout: 30 * 1000, // 30 seconds for navigations
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev', // Command to start your dev server
    url: baseURL, // URL Playwright will wait for
    timeout: 120 * 1000, // Timeout for server to start (e.g., 120 seconds)
    reuseExistingServer: !process.env.CI, // Reuse if already running (except on CI)
    stdout: 'pipe', // Pipe the standard output of the server process
    stderr: 'pipe', // Pipe the standard error of the server process
    // cwd: 'c:\\path\\to\\your\\project', // Optional: if playwright.config.ts is not in project root
  },
});
