import { qs, qsa } from './util';
import { storageKeys } from '../config/site';

type State = { v: 1; ts: number; necessary: true; stats: boolean; social: boolean };
const KEY = storageKeys.consent;

function read(): State | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as State;
    return s && s.v === 1 ? s : null;
  } catch { return null; }
}
function write(s: State) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* opslag geblokkeerd, keuze geldt dan alleen nu */ }
}

const banner = qs('[data-consent]');
const rows = banner ? qsa<HTMLInputElement>('input[type=checkbox]:not([disabled])', banner) : [];
const stats = qs<HTMLInputElement>('[data-consent-stats]');
const social = qs<HTMLInputElement>('[data-consent-social]');
let memory: State | null = read();

function emit() {
  window.dispatchEvent(new CustomEvent('mando:consent', { detail: memory }));
}
function set(c: { stats: boolean; social: boolean }) {
  memory = { v: 1, ts: Date.now(), necessary: true, stats: c.stats, social: c.social };
  write(memory);
  banner?.classList.remove('is-open', 'is-detail');
  emit();
}
function open() {
  if (!banner) return;
  if (stats) stats.checked = !!memory?.stats;
  if (social) social.checked = !!memory?.social;
  banner.classList.add('is-open');
  qs<HTMLElement>('[data-consent-accept]', banner)?.focus();
}

window.mandoConsent = { get: () => (memory ? { necessary: true, stats: memory.stats, social: memory.social } : null), set, open };

qs('[data-consent-accept]', banner ?? document)?.addEventListener('click', () => set({ stats: true, social: true }));
qs('[data-consent-reject]', banner ?? document)?.addEventListener('click', () => set({ stats: false, social: false }));
const detailBtn = qs<HTMLButtonElement>('[data-consent-detail]', banner ?? document);
const saveBtn = qs<HTMLButtonElement>('[data-consent-save]', banner ?? document);
detailBtn?.addEventListener('click', () => {
  const on = !banner?.classList.contains('is-detail');
  banner?.classList.toggle('is-detail', on);
  detailBtn.setAttribute('aria-expanded', String(on));
  if (saveBtn) saveBtn.hidden = !on;
});
saveBtn?.addEventListener('click', () => set({ stats: !!stats?.checked, social: !!social?.checked }));
qsa('[data-consent-open]').forEach((b) => b.addEventListener('click', open));
void rows;

if (!memory) banner?.classList.add('is-open');
