import { qs, qsa, FOCUSABLE } from './util';

const btn = qs<HTMLButtonElement>('[data-menu-toggle]');
const menu = qs('[data-menu]');
const inertTargets = () => ['main', '.site-footer'].map((s) => qs(s)).filter(Boolean) as HTMLElement[];

function setOpen(open: boolean) {
  if (!btn || !menu) return;
  menu.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Sluit menu' : 'Menu');
  document.body.classList.toggle('menu-open', open);
  inertTargets().forEach((el) => (open ? el.setAttribute('inert', '') : el.removeAttribute('inert')));
  if (open) qs<HTMLElement>('a', menu)?.focus();
}

btn?.addEventListener('click', () => setOpen(!menu?.classList.contains('is-open')));
document.addEventListener('keydown', (e) => {
  if (!menu?.classList.contains('is-open')) return;
  if (e.key === 'Escape') { setOpen(false); btn?.focus(); }
  if (e.key === 'Tab') {
    const items = [btn!, ...qsa<HTMLElement>(FOCUSABLE, menu)];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
menu?.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false); });
window.matchMedia('(min-width: 1100px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
