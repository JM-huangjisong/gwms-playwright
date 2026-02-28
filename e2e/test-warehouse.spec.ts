import { test, expect } from './fixtures';

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomString = (length: number, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') =>
  Array.from({ length }, () => chars[randomInt(0, chars.length - 1)]).join('');

const randomDigits = (length: number) =>
  Array.from({ length }, () => String(randomInt(0, 9))).join('');

const randomChoice = <T,>(items: T[]) => items[randomInt(0, items.length - 1)];

test('新建仓库', async ({ page }) => {
  const mock = {
    code: `WH${randomDigits(4)}`,
    name: `Warehouse-${randomDigits(3)}`,
    company: `Company-${randomString(5)}`,
    contact: `Contact-${randomString(4)}`,
    phone: `1${randomDigits(10)}`,
    recipient: `Recipient-${randomString(4)}`,
    state: randomChoice(['CA', 'NY', 'TX', 'FL', 'WA']),
    city: randomChoice(['LosAngeles', 'NewYork', 'Austin', 'Miami', 'Seattle']),
    zip: randomDigits(5),
    address: `${randomInt(1, 999)} ${randomChoice(['Main', 'Market', 'Pine', 'Oak', 'Maple'])} St`,
  };

  await page.locator('div').filter({ hasText: /^仓库管理$/ }).click();
  await page.getByRole('link', { name: '仓库', exact: true }).click();
  await page.getByRole('button', { name: '新增' }).click();
  await page.getByRole('textbox', { name: '* 编码' }).click();
  await page.getByRole('textbox', { name: '* 编码' }).fill(mock.code);
  await page.getByRole('textbox', { name: '* 名称' }).click();
  await page.getByRole('textbox', { name: '* 名称' }).fill(mock.name);
  await page.getByRole('textbox', { name: '公司' }).click();
  await page.getByRole('textbox', { name: '公司' }).fill(mock.company);
  await page.getByRole('textbox', { name: '* 联系人' }).click();
  await page.getByRole('textbox', { name: '* 联系人' }).fill(mock.contact);
  await page.getByRole('textbox', { name: '* 电话' }).click();
  await page.getByRole('textbox', { name: '* 电话' }).fill(mock.phone);
  await page.getByRole('textbox', { name: '* 收件人' }).click();
  await page.getByRole('textbox', { name: '* 收件人' }).fill(mock.recipient);
  await page.locator('div').filter({ hasText: /^请选择货币$/ }).nth(2).click();
  await page.getByRole('option', { name: 'USD' }).click();
  await page.getByText('请选择国家').click();
  await page.getByRole('option', { name: 'US' }).click();
  await page.getByRole('textbox', { name: '* 省/州' }).click();
  await page.getByRole('textbox', { name: '* 省/州' }).click();
  await page.getByRole('textbox', { name: '* 省/州' }).fill(mock.state);
  await page.getByRole('textbox', { name: '* 城市' }).click();
  await page.getByRole('textbox', { name: '* 城市' }).fill(mock.city);
  await page.getByRole('textbox', { name: '* 邮编' }).click();
  await page.getByRole('textbox', { name: '* 邮编' }).fill(mock.zip);
  await page.getByRole('textbox', { name: '* 地址行' }).click();
  await page.getByRole('textbox', { name: '* 地址行' }).fill(mock.address);
  await page.getByRole('button', { name: '确 定' }).click();
  await page.getByRole('button', { name: '搜索' }).click();
});
