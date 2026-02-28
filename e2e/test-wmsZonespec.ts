import { test, expect } from './fixtures';

test('新增库区', async ({ page }) => {
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const randomCode = () =>
    `${rand(10, 99)}-${rand(10, 99)}-${rand(10, 99)}`;

  const pickRandomOption = async () => {
    const options = page.getByRole('option');
    const count = await options.count();
    if (count === 0) {
      throw new Error('下拉框无可选项');
    }
    await options.nth(rand(0, count - 1)).click();
  };

  const code = randomCode();
  const name = `库区-${code}`;
  const priority = String(rand(1, 6));

  await page.locator('div').filter({ hasText: /^仓库管理$/ }).click();
  await page.getByRole('link', { name: '库区' }).click();
  await page.getByRole('button', { name: '新增' }).click();
  await page.locator('div').filter({ hasText: /^请选择仓库$/ }).nth(4).click();
  await pickRandomOption();
  await page.getByRole('textbox', { name: '* 库区编码' }).fill(code);
  await page.getByRole('textbox', { name: '* 库区名称' }).fill(name);
  await page.getByLabel('添加库区').getByText('请选择库区类型').click();
  await pickRandomOption();
  await page.getByRole('spinbutton', { name: '优先级' }).fill(priority);
  await page.getByRole('button', { name: '确 定' }).click();
});
