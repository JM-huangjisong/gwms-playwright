import { test } from './fixtures';

test('新增库区', async ({ page }) => {
  await page.goto('https://demo.gwms.jmalltech.com/admin/index');

  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const randomCode = () =>
    `${rand(10, 99)}-${rand(10, 99)}-${rand(10, 99)}`;

  const code = randomCode();
  const name = `库区-${code}`;
  const priority = String(rand(1, 6));

  await page.locator('div').filter({ hasText: /^仓库管理$/ }).click();
  await page.getByRole('link', { name: '库区' }).click();
  await page.getByRole('button', { name: '新增' }).click();
  await page.locator('div').filter({ hasText: /^请选择仓库$/ }).nth(4).click();
  for (let i = 0; i < rand(1, 5); i += 1) {
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('Enter');
  const zoneDialog = page.getByRole('dialog', { name: '添加库区' });
  await zoneDialog.getByRole('textbox', { name: '* 库区编码' }).fill(code);
  await zoneDialog.getByRole('textbox', { name: '* 库区名称' }).fill(name);
  await page.getByLabel('添加库区').getByText('请选择库区类型').click();
  for (let i = 0; i < rand(1, 3); i += 1) {
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('Enter');
  await zoneDialog.getByRole('spinbutton', { name: '优先级' }).fill(priority);
  await zoneDialog.getByRole('button', { name: '确 定' }).click();
});
