import { test, expect } from './fixtures';

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDigits = (length: number) =>
  Array.from({ length }, () => String(randomInt(0, 9))).join('');

test('新建仓库后在该仓库下新建库区', async ({ page }) => {
  await page.goto('https://demo.gwms.jmalltech.com/admin/index');

  const suffix = `${Date.now().toString().slice(-6)}${randomDigits(3)}`;
  const warehouseCode = `WH${suffix}`;
  const warehouseName = `Warehouse-${suffix}`;

  await page.locator('div').filter({ hasText: /^仓库管理$/ }).click();
  await page.getByRole('link', { name: '仓库', exact: true }).click();
  await page.getByRole('button', { name: '新增' }).click();
  const warehouseDialog = page.getByRole('dialog', { name: '添加仓库' });
  await expect(warehouseDialog).toBeVisible();

  await warehouseDialog.getByRole('textbox', { name: '* 编码' }).fill(warehouseCode);
  await warehouseDialog.getByRole('textbox', { name: '* 名称' }).fill(warehouseName);
  await warehouseDialog.getByRole('textbox', { name: '公司' }).fill(`Company-${suffix}`);
  await warehouseDialog.getByRole('textbox', { name: '* 联系人' }).fill(`Contact-${suffix.slice(-4)}`);
  await warehouseDialog.getByRole('textbox', { name: '* 电话' }).fill(`1${randomDigits(10)}`);
  await warehouseDialog.getByRole('textbox', { name: '* 收件人' }).fill(`Recipient-${suffix.slice(-4)}`);

  await warehouseDialog.getByRole('combobox', { name: '* 货币' }).click({ force: true });
  await page.getByRole('option', { name: 'USD' }).click();
  await warehouseDialog.getByRole('combobox', { name: '* 国家' }).click({ force: true });
  await page.getByRole('option', { name: 'US' }).click();

  await warehouseDialog.getByRole('textbox', { name: '* 省/州' }).fill('CA');
  await warehouseDialog.getByRole('textbox', { name: '* 城市' }).fill('LosAngeles');
  await warehouseDialog.getByRole('textbox', { name: '* 邮编' }).fill(randomDigits(5));
  await warehouseDialog.getByRole('textbox', { name: /地址行1/ }).fill(`${randomInt(1, 999)} Main St`);
  await warehouseDialog.getByRole('button', { name: '确 定' }).click();
  await expect(warehouseDialog).toBeHidden({ timeout: 10000 });

  const zoneCode = `${randomInt(10, 99)}-${randomInt(10, 99)}-${randomInt(10, 99)}`;
  const zoneName = `库区-${zoneCode}`;

  await page.goto('https://demo.gwms.jmalltech.com/admin/warehouse/wmsZone');
  await expect(page).toHaveURL(/\/warehouse\/wmsZone/);
  await page.getByRole('button', { name: '新增' }).click();
  const zoneDialog = page.getByRole('dialog', { name: '添加库区' });
  await expect(zoneDialog).toBeVisible();

  await zoneDialog.getByRole('combobox', { name: '* 仓库' }).click({ force: true });
  const targetWarehouseOption = page.getByRole('option', { name: warehouseName, exact: true });
  await expect(targetWarehouseOption).toBeVisible({ timeout: 10000 });
  await targetWarehouseOption.click();

  await zoneDialog.getByRole('textbox', { name: '* 库区编码' }).fill(zoneCode);
  await zoneDialog.getByRole('textbox', { name: '* 库区名称' }).fill(zoneName);

  await page.getByLabel('添加库区').getByText('请选择库区类型').click();
  await page.getByRole('option', { name: '存储区' }).click();

  await zoneDialog.getByRole('spinbutton', { name: '优先级' }).fill(String(randomInt(1, 6)));
  await zoneDialog.getByRole('button', { name: '确 定' }).click();
  await expect(zoneDialog).toBeHidden({ timeout: 10000 });
});
