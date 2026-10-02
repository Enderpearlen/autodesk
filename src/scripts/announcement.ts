import { qs } from './util';

/** Sluit de actiebar en onthoudt dat per actie (id), zodat een nieuwe actie weer verschijnt. */
const cfg = (window as unknown as { __MANDO_CFG?: { bar?: { id: string }; keys?: { bar?: string } } }).__MANDO_CFG;
const btn = qs<HTMLButtonElement>('[data-announcement-close]');

btn?.addEventListener('click', () => {
  document.documentElement.setAttribute('data-bar', 'off');
  try {
    if (cfg?.bar?.id && cfg.keys?.bar) window.localStorage.setItem(cfg.keys.bar, cfg.bar.id);
  } catch {
    /* opslag geblokkeerd: de balk blijft dan alleen tijdens dit bezoek dicht */
  }
});
