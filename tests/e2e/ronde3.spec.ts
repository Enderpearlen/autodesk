import { test, expect } from '@playwright/test';
import { skipOverlays } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

test.describe('klok', () => {
  test('klok kijkt eerst en toont binnen drie seconden "Tijd voor Mando!" met de wijzers op 17:00', async ({ page }) => {
    await page.goto('/');
    const clock = page.locator('[data-clock]');
    await clock.scrollIntoViewIfNeeded();
    await expect(clock).toHaveAttribute('data-state', 'watching', { timeout: 2000 });
    await expect(page.locator('.clock-t--wait')).toHaveText('Klok aan het bekijken…');
    await expect(clock).toHaveAttribute('data-state', 'done', { timeout: 4000 });
    await expect(page.locator('.clock-t--done')).toHaveText('Tijd voor Mando!');
    await expect(page.locator('.clock-t--done')).toBeVisible();
    expect(await page.locator('[data-hand=m]').evaluate((e) => (e as SVGGElement).style.transform)).toBe('rotate(0deg)');
    expect(await page.locator('[data-hand=h]').evaluate((e) => (e as SVGGElement).style.transform)).toBe('rotate(150deg)');
  });

  test('klok is groot, de sectie zelf laag en de klok valt over de secties eromheen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const section = (await page.locator('.clock').boundingBox())!;
    const face = (await page.locator('.clock-face').boundingBox())!;
    expect(face.width).toBeGreaterThanOrEqual(380);
    expect(section.height).toBeLessThanOrEqual(face.height * 0.55);
    const claims = (await page.locator('.claims').boundingBox())!;
    expect(face.y).toBeLessThan(claims.y + claims.height); // valt over de lopende balk
    const next = (await page.locator('#smaken').boundingBox())!;
    expect(face.y + face.height).toBeGreaterThan(next.y); // en over de smakensectie
    const h2 = await page.locator('.clock-t--done').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(h2).toBeGreaterThanOrEqual(64);
  });

  test('met verminderde beweging staat de eindstand er meteen', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    await skipOverlays(ctx);
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('[data-clock]')).toHaveAttribute('data-state', 'done');
    await expect(page.locator('.clock-t--done')).toBeVisible();
    await expect(page.locator('.clock-t--wait')).toHaveCSS('opacity', '0');
    await ctx.close();
  });

  test('klik op de klok speelt de animatie opnieuw af', async ({ page }) => {
    await page.goto('/');
    const clock = page.locator('[data-clock]');
    await clock.scrollIntoViewIfNeeded();
    await expect(clock).toHaveAttribute('data-state', 'done', { timeout: 5000 });
    await page.locator('[data-clock-replay]').click();
    await expect(clock).toHaveAttribute('data-state', 'watching');
    await expect(clock).toHaveAttribute('data-state', 'done', { timeout: 4000 });
  });
});

test.describe('verkooppunten en B2B', () => {
  test('menu en knop: geen Het blik, Waar te koop blijft en de knop heet Contact', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    expect(await page.locator('.nav a').allTextContents()).toEqual(['Verhaal', 'Waar te koop', 'Community', 'FAQ']);
    await expect(page.locator('.header-cta')).toHaveText('Contact');
    await expect(page.locator('.header-cta')).toHaveAttribute('href', '/contact');
  });

  test('homepage-band: Binnenkort verkrijgbaar met knop naar het B2B-blok', async ({ page }) => {
    await page.goto('/');
    const band = page.locator('#waar-te-koop-kort');
    await expect(band.getByRole('heading', { name: 'Binnenkort verkrijgbaar' })).toBeVisible();
    await expect(band.getByRole('link', { name: 'Word B2B-klant' })).toHaveAttribute('href', '/contact#b2b');
  });

  test('de tekst in de band ligt boven de afbeelding, niet erover', async ({ page }) => {
    for (const w of [390, 1100, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/');
      await page.addStyleTag({ content: '*{transition:none!important}' });
      await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
      const copy = (await page.locator('.where-copy .inner').boundingBox())!;
      const img = (await page.locator('.where > .where-img').boundingBox())!;
      expect(copy.y + copy.height, `breedte ${w}`).toBeLessThanOrEqual(img.y + 1);
    }
  });

  test('contactpagina: apart B2B-blok met eigen formulier dat zakelijke velden controleert en onderwerp B2B meestuurt', async ({ page }) => {
    let body: any = null;
    await page.route('https://forms.example.test/**', async (route) => {
      body = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/contact#b2b');
    const section = page.locator('#b2b');
    await expect(section.getByRole('heading', { name: 'B2B-klant worden' })).toBeVisible();
    await page.evaluate(() => document.querySelector('form[data-form=b2b]')!.setAttribute('data-endpoint', 'https://forms.example.test/b2b'));
    const form = page.locator('form[data-form=b2b]');
    await form.getByRole('button', { name: 'Verstuur aanvraag' }).click();
    await expect(form.locator('#b-company-err')).toBeVisible();
    await expect(form.locator('#b-company')).toBeFocused();
    await form.locator('#b-company').fill('Bar Rosso');
    await form.locator('#b-name').fill('Test Persoon');
    await form.locator('#b-email').fill('test@example.nl');
    await form.locator('#b-type').selectOption('Horeca');
    await form.locator('#b-message').fill('We willen Mando op de kaart.');
    await form.locator('#b-consent').check();
    await form.getByRole('button', { name: 'Verstuur aanvraag' }).click();
    await expect(form.locator('[data-status]')).toContainText('Bedankt voor je aanvraag');
    expect(body).toMatchObject({ form: 'b2b', company: 'Bar Rosso', subject: 'Zakelijk (B2B)', type: 'Horeca' });
    // het gewone formulier heeft een eigen B2B-optie en geen id-botsing met het zakelijke formulier
    await expect(page.locator('#c-subject option', { hasText: 'Zakelijk (B2B)' })).toHaveCount(1);
    expect(await page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); return ids.length - new Set(ids).size; })).toBe(0);
  });
});
