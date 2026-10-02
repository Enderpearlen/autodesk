import { qsa, qs } from './util';

/**
 * Instagram en TikTok worden pas na toestemming voor "social" geladen, als officiële embed-iframe.
 * Zonder toestemming (of zonder URL) blijft de themakaart met een gewone link staan.
 */
const embeds = qsa('[data-embed]');

const parseInstagram = (url: string) => {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/captioned/` : null;
};
const parseTikTok = (url: string) => {
  const m = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
};

function mount(el: HTMLElement) {
  const url = el.dataset.url ?? '';
  const platform = el.dataset.platform;
  const mountEl = qs<HTMLElement>('[data-embed-mount]', el);
  if (!url || !mountEl || el.dataset.state === 'loaded') return;
  const src = platform === 'instagram' ? parseInstagram(url) : platform === 'tiktok' ? parseTikTok(url) : null;
  const msg = qs('[data-embed-msg]', el);
  if (!src) { if (msg) msg.textContent = 'Deze link is geen geldige post of video. Controleer de URL in de configuratie.'; return; }
  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = platform === 'instagram' ? 'Instagram post van Mando' : 'TikTok video van Mando';
  frame.loading = 'lazy';
  frame.allow = 'encrypted-media; clipboard-write';
  frame.setAttribute('allowfullscreen', '');
  frame.style.cssText = `width:100%;border:0;min-height:${platform === 'tiktok' ? 740 : 640}px;background:#fff`;
  mountEl.hidden = false;
  mountEl.appendChild(frame);
  Array.from(el.children).forEach((c) => { if (c !== mountEl) (c as HTMLElement).hidden = true; });
  el.dataset.state = 'loaded';
}

function update() {
  const ok = !!window.mandoConsent?.get()?.social;
  embeds.forEach((el) => { if (ok) mount(el); });
}

// Delegatie, zodat ook knoppen die later worden toegevoegd werken.
document.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('[data-embed-show]')) return;
  const cur = window.mandoConsent?.get();
  window.mandoConsent?.set({ stats: !!cur?.stats, social: true });
});
window.addEventListener('mando:consent', update);
update();
