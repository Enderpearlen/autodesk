import { test, expect } from '@playwright/test';
import { skipOverlays } from './helpers';

test.describe('cookiebanner en embeds', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([{ name: 'mando_age', value: '1', url: 'http://127.0.0.1:4321' }]);
  });

  test('banner verschijnt, standaard alles uit, keuze blijft bewaard', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('[data-consent]');
    await expect(banner).toBeVisible();
    await page.getByRole('button', { name: 'Cookie-instellingen' }).first().click();
    await expect(page.locator('[data-consent-stats]')).not.toBeChecked();
    await expect(page.locator('[data-consent-social]')).not.toBeChecked();
    await page.locator('[data-consent-reject]').click();
    await expect(banner).toBeHidden();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mando-consent')!));
    expect(stored).toMatchObject({ necessary: true, stats: false, social: false });
    await page.reload();
    await expect(banner).toBeHidden();
    // opnieuw openen vanuit de footer
    await page.locator('footer [data-consent-open]').click();
    await expect(banner).toBeVisible();
  });

  test('embeds laden niet vóór toestemming en wel erna', async ({ page }) => {
    const hits: string[] = [];
    await page.route(/instagram\.com|tiktok\.com/, (route) => {
      hits.push(route.request().url());
      return route.fulfill({ contentType: 'text/html', body: '<html><body>nagebootste embed</body></html>' });
    });
    await page.goto('/community');
    // geef de eerste Instagram-tegel een URL (de configuratie bevat nu nog placeholders)
    await page.evaluate(() => {
      const ig = document.querySelector('[data-embed][data-platform=instagram]') as HTMLElement;
      ig.dataset.url = 'https://www.instagram.com/p/ABC123_x-y/';
      const tt = document.querySelector('[data-embed][data-platform=tiktok]') as HTMLElement;
      tt.dataset.url = 'https://www.tiktok.com/@mando/video/7300000000000000000';
    });
    await page.locator('[data-consent-reject]').click();
    await page.waitForTimeout(300);
    expect(await page.locator('[data-embed] iframe').count()).toBe(0);
    expect(hits.filter((u) => !u.includes('visuals'))).toEqual([]);

    // toestemming via de banner opnieuw openen
    await page.locator('footer [data-consent-open]').click();
    await page.locator('[data-consent-accept]').click();
    await expect(page.locator('[data-embed][data-platform=instagram] iframe')).toHaveAttribute('src', 'https://www.instagram.com/p/ABC123_x-y/embed/captioned/');
    await expect(page.locator('[data-embed][data-platform=tiktok] iframe')).toHaveAttribute('src', 'https://www.tiktok.com/embed/v2/7300000000000000000');
    expect(hits.length).toBeGreaterThanOrEqual(2);
  });

  test('knop Toon inhoud geeft alleen toestemming voor social en laadt die embed', async ({ page }) => {
    await page.route(/instagram\.com/, (route) => route.fulfill({ contentType: 'text/html', body: '<html><body>ok</body></html>' }));
    await page.goto('/community');
    await page.evaluate(() => {
      const ig = document.querySelector('[data-embed][data-platform=instagram]') as HTMLElement;
      ig.dataset.url = 'https://www.instagram.com/reel/XYZ987/';
      // de knop bestaat alleen als er bij het bouwen een URL was, dus maak hem na
      const b = document.createElement('button');
      b.dataset.embedShow = '';
      b.textContent = 'Toon inhoud';
      ig.appendChild(b);
    });
    await page.locator('[data-consent-reject]').click();
    await page.locator('[data-embed][data-platform=instagram] [data-embed-show]').click();
    await expect(page.locator('[data-embed][data-platform=instagram] iframe')).toHaveAttribute('src', /instagram\.com\/reel\/XYZ987\/embed/);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mando-consent')!));
    expect(stored.stats).toBe(false);
    expect(stored.social).toBe(true);
  });

  test('placeholder-tegels hebben een werkende link naar het profiel', async ({ page }) => {
    await skipOverlays(page.context(), { stats: false, social: true });
    await page.goto('/community');
    const link = page.locator('[data-embed] a').first();
    await expect(link).toHaveAttribute('href', /instagram\.com|tiktok\.com/);
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(page.locator('[data-embed]').first()).toContainText('[X:');
  });
});
