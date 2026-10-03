import { qs, reducedMotion } from './util';

/**
 * Klok op de homepage. Zodra de sectie in beeld komt, draaien de wijzers snel (de klok "kijkt"),
 * en na ongeveer 1,8 seconde staan ze op 17:00 en verschijnt "Tijd voor Mando!".
 * Zonder JavaScript of bij verminderde beweging staat de eindstand er meteen.
 */
const root = qs<HTMLElement>('[data-clock]');
if (root) {
  const hour = qs<SVGGElement>('[data-hand="h"]', root)!;
  const minute = qs<SVGGElement>('[data-hand="m"]', root)!;
  const replay = qs<HTMLButtonElement>('[data-clock-replay]', root);
  const SPIN_MS = 1800;
  const END_H = 150; // 17:00: de uurwijzer staat op 5/12 van de wijzerplaat
  const turns = { m: 4, h: 1 }; // hele rondes extra, de wijzers eindigen exact op 17:00
  let timer = 0;
  let raf = 0;

  const set = (h: number, m: number) => {
    hour.style.transform = `rotate(${h}deg)`;
    minute.style.transform = `rotate(${m}deg)`;
  };
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const finish = () => { cancelAnimationFrame(raf); set(END_H, 0); root.dataset.state = 'done'; };

  const play = () => {
    window.clearTimeout(timer);
    cancelAnimationFrame(raf);
    if (reducedMotion()) { finish(); return; }
    root.dataset.state = 'watching';
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / SPIN_MS);
      const e = ease(t);
      set(e * (END_H + 360 * turns.h), e * 360 * turns.m);
      if (t < 1) raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);
  };

  if (reducedMotion() || !('IntersectionObserver' in window)) {
    finish();
  } else {
    root.dataset.state = 'idle';
    set(0, 0);
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
    }, { threshold: 0.55 });
    io.observe(root);
  }
  replay?.addEventListener('click', play);
}
