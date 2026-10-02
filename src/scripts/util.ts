export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Houdt Tab binnen een element (bijvoorbeeld de leeftijdscontrole). */
export function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  if (e.key !== 'Tab') return;
  const items = qsa<HTMLElement>(FOCUSABLE, container).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
