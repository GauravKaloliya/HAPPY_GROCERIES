import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.MOBILE_BASE_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve('playwright-screenshots');

const categories = [
  { id: 1, name: 'Fruits' },
  { id: 2, name: 'Vegetables' },
  { id: 3, name: 'Dairy' },
];

const products = [
  {
    id: 101,
    name: 'Fresh Apples',
    price: 99,
    stock: 24,
    discount_percent: 5,
    description: 'Sweet and crisp apples packed for everyday grocery orders.',
    tags: ['fresh', 'fruit'],
    is_featured: true,
    is_new_arrival: false,
    is_active: true,
    is_deleted: false,
    image_url: '',
    category: { id: 1, name: 'Fruits' },
  },
  {
    id: 102,
    name: 'Organic Bananas',
    price: 56,
    stock: 18,
    discount_percent: 0,
    description: 'Soft ripe bananas sourced from trusted local farms.',
    tags: ['organic', 'banana'],
    is_featured: false,
    is_new_arrival: true,
    is_active: true,
    is_deleted: false,
    image_url: '',
    category: { id: 1, name: 'Fruits' },
  },
];

const waitForStable = async (page, selector) => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector(selector, { timeout: 15000 });
  if (await page.locator('.admin-loading-panel').isVisible().catch(() => false)) {
    await page.waitForSelector('.admin-loading-panel', { state: 'hidden', timeout: 15000 }).catch(() => {});
  }
  await page.waitForTimeout(900);

  const toastClose = page.getByRole('button', { name: 'Close toast' });
  if (await toastClose.isVisible().catch(() => false)) {
    await toastClose.click().catch(() => {});
    await page.waitForTimeout(250);
  }
};

const fulfillApi = async (route) => {
  const url = new URL(route.request().url());

  if (url.pathname.endsWith('/auth/admin/session/')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ username: 'admin' }),
    });
    return;
  }

  if (url.pathname.endsWith('/products/categories/')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(categories),
    });
    return;
  }

  if (url.pathname.endsWith('/products/101/')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products[0]),
    });
    return;
  }

  if (url.pathname.endsWith('/products/')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products),
    });
    return;
  }

  await route.continue();
};

const run = async () => {
  await fs.mkdir(outputDir, { recursive: true });
  const device = devices['iPhone 12'];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...device,
    baseURL: baseUrl,
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('adminToken', 'playwright-admin-token');
    window.localStorage.setItem('adminUsername', 'admin');
  });

  await context.route('**/api/**', fulfillApi);

  const page = await context.newPage();

  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, '.admin-page');
  await page.screenshot({
    path: path.join(outputDir, 'admin-dashboard-mobile.png'),
    fullPage: true,
  });

  await page.goto('/admin/products/new', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, '.admin-form-page');
  await page.screenshot({
    path: path.join(outputDir, 'admin-add-product-mobile.png'),
    fullPage: true,
  });

  await browser.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
