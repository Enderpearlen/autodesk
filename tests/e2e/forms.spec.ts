import { test, expect } from '@playwright/test';
import { skipOverlays } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

test('nieuwsbrief: validatie, foutmeldingen en demo-melding', async ({ page }) => {
  await page.goto('/#nieuwsbrief');
  const form = page.locator('form[data-form=newsletter]');
  await form.scrollIntoViewIfNeeded();
  await form.getByRole('button', { name: 'Aanmelden' }).click();
  await expect(form.locator('#nl-email-err')).toBeVisible();
  await expect(form.locator('#nl-email')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('[data-status]')).toContainText('Controleer');
  await expect(form.locator('#nl-email')).toBeFocused();

  await form.locator('#nl-email').fill('geen-mail');
  await form.getByRole('button', { name: 'Aanmelden' }).click();
  await expect(form.locator('#nl-email-err')).toContainText('geldig');

  await form.locator('#nl-email').fill('test@example.nl');
  await form.getByRole('button', { name: 'Aanmelden' }).click();
  await expect(form.locator('#nl-consent-err')).toBeVisible();
  await form.locator('#nl-age').check();
  await form.locator('#nl-consent').check();
  await form.getByRole('button', { name: 'Aanmelden' }).click();
  await expect(form.locator('[data-status]')).toContainText('Demo');
  await expect(form.locator('#nl-email-err')).toBeHidden();
});

test('contactformulier: alle verplichte velden en verzending naar endpoint', async ({ page }) => {
  let body: any = null;
  await page.route('https://forms.example.test/**', async (route) => {
    body = JSON.parse(route.request().postData() ?? '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/contact');
  // zet een endpoint, zoals PUBLIC_FORM_ENDPOINT dat bij het bouwen doet
  await page.evaluate(() => document.querySelector('form[data-form=contact]')!.setAttribute('data-endpoint', 'https://forms.example.test/mando'));
  const form = page.locator('form[data-form=contact]');
  await form.getByRole('button', { name: 'Versturen' }).click();
  for (const id of ['c-name', 'c-email', 'c-message', 'c-consent']) await expect(form.locator(`#${id}-err`)).toBeVisible();
  await form.locator('#c-name').fill('Test Persoon');
  await form.locator('#c-email').fill('test@example.nl');
  await form.locator('#c-subject').selectOption({ index: 1 });
  await form.locator('#c-message').fill('Hallo Mando');
  await form.locator('#c-consent').check();
  await form.getByRole('button', { name: 'Versturen' }).click();
  await expect(form.locator('[data-status]')).toContainText('Bedankt');
  expect(body).toMatchObject({ form: 'contact', name: 'Test Persoon', email: 'test@example.nl', message: 'Hallo Mando' });
  expect(body.website).toBeUndefined;
});

test('contactformulier: honeypot wordt stil genegeerd', async ({ page }) => {
  let called = false;
  await page.route('https://forms.example.test/**', (r) => { called = true; return r.fulfill({ status: 200, body: '{}' }); });
  await page.goto('/contact');
  await page.evaluate(() => document.querySelector('form[data-form=contact]')!.setAttribute('data-endpoint', 'https://forms.example.test/mando'));
  const form = page.locator('form[data-form=contact]');
  await form.locator('#c-name').fill('Bot');
  await form.locator('#c-email').fill('bot@example.nl');
  await form.locator('#c-message').fill('spam');
  await form.locator('#c-consent').check();
  await form.locator('input[name=website]').evaluate((el: HTMLInputElement) => { el.value = 'http://spam.example'; });
  await form.getByRole('button', { name: 'Versturen' }).click();
  await page.waitForTimeout(300);
  expect(called).toBe(false);
});

test('formulier toont een foutmelding als de server niet antwoordt', async ({ page }) => {
  await page.route('https://forms.example.test/**', (r) => r.fulfill({ status: 500, body: 'fout' }));
  await page.goto('/#nieuwsbrief');
  await page.evaluate(() => document.querySelector('form[data-form=newsletter]')!.setAttribute('data-endpoint', 'https://forms.example.test/x'));
  const form = page.locator('form[data-form=newsletter]');
  await form.locator('#nl-email').fill('test@example.nl');
  await form.locator('#nl-age').check();
  await form.locator('#nl-consent').check();
  await form.getByRole('button', { name: 'Aanmelden' }).click();
  await expect(form.locator('[data-status]')).toContainText('Er ging iets mis');
});
