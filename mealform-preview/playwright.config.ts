import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/ui', testIgnore:'production-ui.spec.ts', fullyParallel: true, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5174', channel: 'chrome', headless: true },
  webServer: [
    { command: 'npm run dev', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI },
    { command: 'npm run storybook', url: 'http://127.0.0.1:6006', reuseExistingServer: !process.env.CI }
  ],
  reporter: 'list'
});
