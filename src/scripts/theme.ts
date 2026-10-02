import { qs, qsa, reducedMotion } from './util';

type Mode = 'auto' | 'dag' | 'nacht';
const order: Mode[] = ['auto', 'dag', 'nacht'];
const names: Record<string, string> = { creme: 'ochtend', mosterd: 'dag', terra: 'avond', nacht: 'nacht' };
const modeNames: Record<Mode, string> = { auto: 'Auto', dag: 'Dag', nacht: 'Nacht' };

const root = document.documentElement;
const api = window.__mando;
const btn = qs<HTMLButtonElement>('[data-theme-toggle]');
const label = qs('[data-theme-label]');

function updateButton() {
  const mode = (api?.getMode() ?? 'auto') as Mode;
  const theme = root.dataset.theme ?? 'mosterd';
  if (label) label.textContent = modeNames[mode];
  const text = `Kleurthema: ${modeNames[mode]}${mode === 'auto' ? `, nu ${names[theme]}` : ''}. Klik om te wisselen.`;
  btn?.setAttribute('aria-label', text);
  btn?.setAttribute('title', text);
}

/** Laad het beeld van het doelthema eerst, zodat de wissel niet leeg flitst. */
async function preload(theme: string) {
  const imgs = qsa<HTMLImageElement>(`.themed[data-for~="${theme}"] img, img.themed[data-for~="${theme}"]`);
  const jobs = imgs.map((img) => {
    img.loading = 'eager';
    return img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
  });
  await Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, 1500))]);
}

async function change(run: () => void, target: string) {
  const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition?.bind(document);
  if (vt && !reducedMotion() && target !== root.dataset.theme) {
    await preload(target);
    vt(run);
  } else {
    run();
  }
}

function setMode(mode: Mode) {
  if (!api) return;
  const target = api.resolveTheme(mode);
  void change(() => api.setMode(mode), target);
}

btn?.addEventListener('click', () => {
  const cur = (api?.getMode() ?? 'auto') as Mode;
  setMode(order[(order.indexOf(cur) + 1) % order.length]);
});

function tick() {
  if (!api || api.getMode() !== 'auto') return;
  const target = api.resolveTheme('auto');
  if (target !== root.dataset.theme) void change(() => api.applyTheme(target, 'auto'), target);
}
setInterval(tick, 5 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
window.addEventListener('mando:theme', updateButton);
updateButton();
