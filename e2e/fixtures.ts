import { test as base, expect } from '@playwright/test';
import { login } from './helpers/auth';

type TestOptions = {
  skipLogin?: boolean;
};

export const test = base.extend<TestOptions>({
  skipLogin: [false, { option: true }],
});

test.beforeEach(async ({ page, skipLogin }) => {
  if (skipLogin) return;
  await login(page);
});

export { expect };
