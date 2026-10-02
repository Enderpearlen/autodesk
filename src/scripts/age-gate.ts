import { qs, trapFocus } from './util';
import { storageKeys } from '../config/site';

const root = document.documentElement;
const gate = qs('[data-age-gate]');
const site = qs('#site-root');
const yes = qs<HTMLButtonElement>('[data-age-yes]', gate ?? document);

function lock(on: boolean) {
  if (!site) return;
  if (on) site.setAttribute('inert', ''); else site.removeAttribute('inert');
}

function close() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${storageKeys.age}=1; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax${secure}`;
  root.classList.remove('age-pending');
  lock(false);
  window.dispatchEvent(new CustomEvent('mando:age'));
  qs<HTMLElement>('#main')?.focus({ preventScroll: true });
}

if (gate && root.classList.contains('age-pending')) {
  lock(true);
  yes?.focus();
  gate.addEventListener('keydown', (e) => trapFocus(gate, e as KeyboardEvent));
}
yes?.addEventListener('click', close);
