import { qs, qsa } from './util';

const root = qs('[data-stores]');
if (root) {
  const items = qsa('.store', root);
  const chips = qsa<HTMLButtonElement>('[data-filter]', root);
  const input = qs<HTMLInputElement>('[data-store-search]', root);
  const count = qs('[data-store-count]', root);
  const empty = qs('[data-store-empty]', root);
  let type = 'all';

  const apply = () => {
    const q = (input?.value ?? '').trim().toLowerCase();
    let n = 0;
    items.forEach((li) => {
      const ok = (type === 'all' || li.dataset.type === type) && (!q || (li.dataset.text ?? '').includes(q));
      li.hidden = !ok;
      if (ok) n++;
    });
    if (count) count.textContent = n === 1 ? '1 verkooppunt' : `${n} verkooppunten`;
    if (empty) empty.hidden = n > 0;
  };
  chips.forEach((c) => c.addEventListener('click', () => {
    type = c.dataset.filter ?? 'all';
    chips.forEach((o) => o.setAttribute('aria-pressed', String(o === c)));
    apply();
  }));
  input?.addEventListener('input', apply);
}
