import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4201',
    trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'off',
    launchOptions: { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Levanta el código actual en un puerto libre; la API corre en localhost:8080.
  webServer: { command: 'npm start -- --port 4201', url: 'http://localhost:4201', reuseExistingServer: true, timeout: 120_000 },
});
