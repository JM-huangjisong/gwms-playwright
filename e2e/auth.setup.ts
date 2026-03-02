import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect, type Browser } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
const appUrl = 'https://demo.gwms.jmalltech.com/admin/index';
const loginUrl = 'https://demo.gwms.jmalltech.com/admin/login?redirect=/index';

const hasValidSession = async (browser: Browser) => {
  if (!fs.existsSync(authFile)) return false;

  const context = await browser.newContext({ storageState: authFile });
  const page = await context.newPage();

  try {
    await page.goto(appUrl);
    await expect.poll(() => page.url(), { timeout: 10000 }).not.toContain('/admin/login');
    await expect(page.locator('div').filter({ hasText: /^仓库管理$/ })).toBeVisible({ timeout: 10000 });
    return true;
  } catch {
    return false;
  } finally {
    await context.close();
  }
};

setup('authenticate', async ({ page, browser }) => {
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  if (await hasValidSession(browser)) {
    return;
  }

  await page.goto(loginUrl);
  await page.getByRole('button', { name: '管理员' }).click();
  await page.getByRole('textbox', { name: '账号' }).fill('demo_admin');
  await page.getByRole('textbox', { name: '密码' }).fill('demo123');
  await page.getByRole('button', { name: '登 录' }).click();

  await expect.poll(() => page.url(), { timeout: 30000 }).not.toContain('/admin/login');
  await expect(page.locator('div').filter({ hasText: /^仓库管理$/ })).toBeVisible({ timeout: 20000 });
  await page.context().storageState({ path: authFile });
});
