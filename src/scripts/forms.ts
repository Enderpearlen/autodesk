import { qsa, qs } from './util';

type Messages = { required: string; email: string; consent: string; generic: string; summary: string };
const M: Messages = {
  required: 'Vul dit veld in.',
  email: 'Vul een geldig e-mailadres in.',
  consent: 'Je moet hiermee akkoord gaan om verder te gaan.',
  generic: 'Er ging iets mis. Probeer het later opnieuw.',
  summary: 'Controleer de gemarkeerde velden.',
};
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function check(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  const v = field.value.trim();
  if (field instanceof HTMLInputElement && field.type === 'checkbox') return field.required && !field.checked ? M.consent : '';
  if (field.required && !v) return M.required;
  if (field instanceof HTMLInputElement && field.type === 'email' && v && !emailRe.test(v)) return M.email;
  return '';
}

function show(field: HTMLElement, msg: string) {
  const err = field.getAttribute('aria-describedby') ? document.getElementById(field.getAttribute('aria-describedby')!) : null;
  if (msg) { field.setAttribute('aria-invalid', 'true'); if (err) { err.textContent = msg; err.hidden = false; } }
  else { field.removeAttribute('aria-invalid'); if (err) { err.textContent = ''; err.hidden = true; } }
}

qsa<HTMLFormElement>('form[data-form]').forEach((form) => {
  const status = qs('[data-status]', form);
  const fields = qsa<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:not([name=website]), select, textarea', form);
  fields.forEach((f) => f.addEventListener('blur', () => { if (f.getAttribute('aria-invalid') || (f as HTMLInputElement).value) show(f, check(f)); }));
  fields.forEach((f) => f.addEventListener('input', () => { if (f.getAttribute('aria-invalid')) show(f, check(f)); }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let first: HTMLElement | null = null;
    fields.forEach((f) => {
      const msg = check(f);
      show(f, msg);
      if (msg && !first) first = f;
    });
    if (status) { status.textContent = ''; status.removeAttribute('data-kind'); }
    if (first) { if (status) status.textContent = M.summary; (first as HTMLElement).focus(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) { if (status) status.textContent = form.dataset.ok ?? ''; form.reset(); return; } // honeypot
    const endpoint = form.dataset.endpoint;
    const submit = qs<HTMLButtonElement>('button[type=submit]', form);
    if (!endpoint) { if (status) status.textContent = form.dataset.demo ?? ''; return; }
    try {
      if (submit) submit.disabled = true;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ form: form.dataset.form, ...data, page: location.href, ts: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      if (status) status.textContent = form.dataset.ok ?? '';
      form.reset();
    } catch {
      if (status) status.textContent = M.generic;
    } finally {
      if (submit) submit.disabled = false;
    }
  });
});
