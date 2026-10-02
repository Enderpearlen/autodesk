import { test, expect } from '@playwright/test';

test('leeftijdscontrole: ja bewaart 30 dagen, nee gaat naar uitleg', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/age-pending/);
  await expect(page.locator('[data-age-gate]')).toBeVisible();
  await expect(page.locator('[data-age-yes]')).toBeFocused();
  // achtergrond is niet te bedienen
  expect(await page.locator('#site-root').getAttribute('inert')).not.toBeNull();
  // cookiebanner wacht op de leeftijdscontrole
  await expect(page.locator('[data-consent]')).toBeHidden();

  // toetsenbord blijft in het venster
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => !!document.activeElement?.closest('[data-age-gate]'));
  expect(inside).toBe(true);

  await page.locator('[data-age-yes]').click();
  await expect(page.locator('[data-age-gate]')).toBeHidden();
  await expect(page.locator('#site-root')).not.toHaveAttribute('inert', /.*/);
  const cookie = (await context.cookies()).find((c) => c.name === 'mando_age');
  expect(cookie?.value).toBe('1');
  const days = ((cookie?.expires ?? 0) - Date.now() / 1000) / 86400;
  expect(days).toBeGreaterThan(29);
  expect(days).toBeLessThan(31);
  await expect(page.locator('[data-consent]')).toBeVisible();

  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/age-pending/);
  await expect(page.locator('[data-age-gate]')).toBeHidden();
});

test('leeftijdscontrole: nee leidt naar de afwijzingspagina', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Nee' }).click();
  await expect(page).toHaveURL(/\/leeftijd-nee/);
  await expect(page.locator('main h1')).toContainText('nog even wachten');
});

for (const path of ['/18-plus', '/juridisch/privacy', '/juridisch/cookies', '/leeftijd-nee', '/stijlgids']) {
  test(`vrijgestelde pagina ${path} heeft geen leeftijdscontrole`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).not.toHaveClass(/age-pending/);
    await expect(page.locator('[data-age-gate]')).toBeHidden();
  });
}

test('zonder JavaScript blijft de inhoud bereikbaar', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('h1').first()).toContainText('Amandel');
  await expect(page.locator('[data-age-gate]')).toBeHidden();
  await ctx.close();
});
