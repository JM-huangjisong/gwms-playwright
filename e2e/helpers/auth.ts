import type { Page } from '@playwright/test';

export const login = async (page: Page) => {
  await page.goto('https://demo.gwms.jmalltech.com/admin/login?redirect=/index');
  await page.getByRole('button', { name: '管理员' }).click();
  await page.getByRole('button', { name: '登 录' }).click();
};
