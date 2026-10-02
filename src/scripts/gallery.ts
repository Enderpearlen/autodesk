import { qs, qsa } from './util';

qsa('[data-gallery]').forEach((g) => {
  const main = qs<HTMLImageElement>('[data-gallery-main]', g);
  const thumbs = qsa<HTMLButtonElement>('.thumb', g);
  thumbs.forEach((t) => t.addEventListener('click', () => {
    if (!main) return;
    main.src = t.dataset.src ?? main.src;
    main.alt = t.dataset.alt ?? '';
    thumbs.forEach((o) => o.setAttribute('aria-pressed', String(o === t)));
  }));
});
