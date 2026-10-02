/** Maakt van tekst veilige HTML en markeert placeholders [X: ...] zodat ze opvallen. */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function fmt(text: string): string {
  return esc(text).replace(/\[X(?::[^\]]*)?\]/g, (m) => `<mark class="ph">${m}</mark>`);
}

export const stripPlaceholders = (text: string) => text.replace(/\[X(?::[^\]]*)?\]/g, '').replace(/\s{2,}/g, ' ').trim();

/** Lijst van placeholders in een tekst. */
export const findPlaceholders = (text: string) => text.match(/\[X(?::[^\]]*)?\]/g) ?? [];

export const isPlaceholder = (text: string) => /\[X(?::[^\]]*)?\]/.test(text);
