import { qs, reducedMotion } from './util';

/** Het blik in de hero volgt de muis een beetje. Alleen met een muis en zonder beperking van beweging. */
const hero = qs('[data-hero]');
const can = qs('[data-hero-can] .px');
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (hero && can && fine && !reducedMotion()) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    can.style.setProperty('--px', String(Math.round(x * -22)));
    can.style.setProperty('--py', String(Math.round(y * -14)));
  });
  hero.addEventListener('pointerleave', () => { can.style.setProperty('--px', '0'); can.style.setProperty('--py', '0'); });
}
