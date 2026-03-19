import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.MOBILE_BASE_URL || 'http://localhost:5173';
const outputDir = path.resolve('.playwright-cli/screenshots');

const pages = [
  { name: 'home', path: '/', selectors: ['.hero', '.products-grid'] },
  { name: 'shop', path: '/shop', selectors: ['.shop-layout', '.products-grid'] },
  { name: 'product', path: '/product/1', selectors: ['.product-details-card'] },
  { name: 'cart', path: '/cart', selectors: ['.cart-container', '.empty-state'] },
  { name: 'offers', path: '/offers', selectors: ['.offers-container', '.coupons-list'] },
  { name: 'profile', path: '/profile', selectors: ['.profile-container', '.profile-card'] },
  { name: 'settings', path: '/settings', selectors: ['.settings-page', '.settings-card'] },
  { name: 'login', path: '/login', selectors: ['.auth-container'] },
  { name: 'signup', path: '/signup', selectors: ['.auth-container'] },
  { name: 'about', path: '/about', selectors: ['.about-section'] },
  { name: 'categories', path: '/categories', selectors: ['.categories-page-grid', '.categories-grid'] },
  { name: 'wishlist', path: '/wishlist', selectors: ['.wishlist-grid', '.empty-state'] },
  { name: 'orders', path: '/orders', selectors: ['.orders-grid', '.empty-state'] },
  { name: 'reviews', path: '/my-reviews', selectors: ['.my-reviews-list', '.reviews-empty-state'] },
  { name: 'checkout', path: '/checkout', selectors: ['.checkout-form', '.order-summary'] },
  { name: 'not-found', path: '/this-page-does-not-exist', selectors: ['.not-found-page'] },
];

const waitForStable = async (page, selectors) => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(400);

  if (await page.$('.connectivity-error-page')) {
    const retry = await page.$('.connectivity-error-actions .btn-retry');
    if (retry) {
      await retry.click();
      await page.waitForTimeout(2000);
    }
  }

  if (selectors?.length) {
    try {
      await Promise.race(
        selectors.map((selector) => page.waitForSelector(selector, { timeout: 30000 }))
      );
    } catch {
      // If the selector doesn't show up, still capture the state
    }
  }

  if (await page.$('.page-loader')) {
    try {
      await page.waitForSelector('.page-loader', { state: 'hidden', timeout: 30000 });
    } catch {
      // ignore if loader persists; we still capture for debugging
    }
  }

  await page.waitForTimeout(800);
};

const run = async () => {
  await fs.mkdir(outputDir, { recursive: true });
  const device = devices['iPhone 12'];

  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...device,
    baseURL: baseUrl,
  });

  const page = await context.newPage();

  for (const entry of pages) {
    const url = new URL(entry.path, baseUrl).toString();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await waitForStable(page, entry.selectors);
    await page.screenshot({
      path: path.join(outputDir, `${entry.name}.png`),
      fullPage: false,
    });
  }

  await browser.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
