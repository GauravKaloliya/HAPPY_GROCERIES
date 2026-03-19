import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.MOBILE_BASE_URL || 'http://localhost:5173';
const outputDir = path.resolve('.playwright-cli/screenshots');

const waitForStable = async (page, selectors = []) => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(400);

  if (await page.$('.connectivity-error-page')) {
    const retry = await page.$('.connectivity-error-actions .btn-retry');
    if (retry) {
      await retry.click();
      await page.waitForTimeout(2000);
    }
  }

  if (selectors.length) {
    try {
      await Promise.race(
        selectors.map((selector) => page.waitForSelector(selector, { timeout: 30000 }))
      );
    } catch {
      // ignore missing selectors
    }
  }

  if (await page.$('.page-loader')) {
    try {
      await page.waitForSelector('.page-loader', { state: 'hidden', timeout: 30000 });
    } catch {
      // ignore if loader persists
    }
  }

  await page.waitForTimeout(800);
};

const screenshot = async (page, name) => {
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: false,
  });
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
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(30000);

  const uniquePhone = String(Date.now()).slice(-10);
  const password = 'TestPass1';

  console.log('Step 1: Signup');
  await page.goto('/signup', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.auth-container']);
  await page.fill('#name', 'Test User');
  await page.fill('#phone', uniquePhone);
  await page.fill('#email', '');
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await screenshot(page, 'flow-01-signup');
  await page.getByRole('button', { name: /sign up/i }).first().click({ timeout: 15000 });
  await waitForStable(page, ['.home-mobile', '.hero', '.products-grid']);

  // 2) Logout then Login (explicit sign in)
  console.log('Step 2: Logout + Login');
  await page.waitForTimeout(500);
  const profileBtn = page.locator('.profile-btn');
  if (await profileBtn.count()) {
    await profileBtn.first().click({ timeout: 10000 });
    const logoutLink = page.getByRole('link', { name: /logout/i });
    if (await logoutLink.count()) {
      await logoutLink.first().click({ timeout: 10000 });
      await waitForStable(page, ['.auth-buttons', '.nav-actions']);
    }
  }

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.auth-container']);
  await page.fill('#phone', uniquePhone);
  await page.fill('#password', password);
  await screenshot(page, 'flow-02-login');
  await page.getByRole('button', { name: /sign in/i }).first().click({ timeout: 15000 });
  await waitForStable(page, ['.home-mobile', '.hero', '.products-grid']);

  // 3) Product page: add to cart + wishlist
  console.log('Step 3: Product + Cart + Wishlist');
  await page.goto('/product/1', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.product-details-card']);
  const addToCartBtn = page.locator('.product-details-card .btn-add-cart');
  if (await addToCartBtn.count()) {
    await addToCartBtn.first().click();
  }
  await page.waitForTimeout(800);
  await screenshot(page, 'flow-03-product-added');
  const wishlistBtn = page.locator('.product-details-wishlist');
  if (await wishlistBtn.count()) {
    await wishlistBtn.first().click();
  }

  // 4) Cart
  console.log('Step 4: Cart');
  await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.cart-container', '.empty-state']);
  await screenshot(page, 'flow-04-cart');

  // 5) Checkout + place order
  console.log('Step 5: Checkout + Place Order');
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.checkout-form', '.order-summary']);
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="phone"]', uniquePhone);
  await page.fill('textarea[name="address"]', '221B Test Street');
  await page.fill('input[name="city"]', 'Mumbai');
  await screenshot(page, 'flow-05-checkout');
  await page.getByRole('button', { name: /place order/i }).first().click({ timeout: 15000 });
  await page.waitForSelector('.modal.show', { timeout: 30000 });
  await screenshot(page, 'flow-06-order-success');
  await page.getByRole('button', { name: /view orders/i }).click();

  // 6) Orders
  console.log('Step 6: Orders');
  await waitForStable(page, ['.orders-container', '.empty-state']);
  const detailsBtn = page.getByRole('button', { name: /view details/i });
  if (await detailsBtn.count()) {
    await detailsBtn.first().click();
  }
  await screenshot(page, 'flow-07-orders');

  // 7) Wishlist
  console.log('Step 7: Wishlist');
  await page.goto('/wishlist', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.wishlist-grid', '.empty-state']);
  await screenshot(page, 'flow-08-wishlist');

  // 8) Review on product page
  console.log('Step 8: Review');
  await page.goto('/product/1', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.product-details-card']);
  await page.getByRole('button', { name: /reviews/i }).click();
  await page.waitForTimeout(800);
  const writeReviewBtn = page.getByRole('button', { name: /write a review/i });
  if (await writeReviewBtn.count()) {
    await writeReviewBtn.first().click();
    await page.getByRole('button', { name: /rate 5 stars/i }).click();
    await page.fill('input.review-input', 'Great quality');
    await page.fill('textarea.review-textarea', 'Fresh and tasty, delivered quickly.');
    await screenshot(page, 'flow-09-review-form');
    await page.getByRole('button', { name: /submit review/i }).click();
    await page.waitForTimeout(1200);
  }
  await screenshot(page, 'flow-10-review-posted');

  // 9) Profile
  console.log('Step 9: Profile');
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await waitForStable(page, ['.profile-container', '.profile-card']);
  await screenshot(page, 'flow-11-profile');

  await browser.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
