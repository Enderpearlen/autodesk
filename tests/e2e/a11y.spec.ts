import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { skipOverlays, settle } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

const pages = ['/', '/het-blik', '/verhaal', '/waar-te-koop', '/community', '/faq', '/contact', '/18-plus', '/juridisch/privacy', '/juridisch/cookies'];

for (const theme of ['mosterd', 'nacht']) {
  for (const route of pages) {
    test(`axe: ${route} (${theme}) heeft geen ernstige problemen`, async ({ page }) => {
      await page.goto(`${route}?theme=${theme}`, { waitUntil: 'networkidle' });
      await settle(page);
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
}

test('leeftijdscontrole en cookiebanner zijn bruikbaar met toetsenbord en axe', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  let res = await new AxeBuilder({ page }).include('[data-age-gate]').analyze();
  expect(res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-age-gate]')).toBeHidden();
  await expect(page.locator('[data-consent]')).toBeVisible();
  res = await new AxeBuilder({ page }).include('[data-consent]').analyze();
  expect(res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  await ctx.close();
});
