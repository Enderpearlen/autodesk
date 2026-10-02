/** Phosphor (bold) iconen, als ruwe SVG. Eén iconenset voor de hele site. */
import instagram from '@phosphor-icons/core/assets/bold/instagram-logo-bold.svg?raw';
import tiktok from '@phosphor-icons/core/assets/bold/tiktok-logo-bold.svg?raw';
import sun from '@phosphor-icons/core/assets/bold/sun-bold.svg?raw';
import moon from '@phosphor-icons/core/assets/bold/moon-bold.svg?raw';
import auto from '@phosphor-icons/core/assets/bold/circle-half-bold.svg?raw';
import list from '@phosphor-icons/core/assets/bold/list-bold.svg?raw';
import x from '@phosphor-icons/core/assets/bold/x-bold.svg?raw';
import arrowRight from '@phosphor-icons/core/assets/bold/arrow-right-bold.svg?raw';
import arrowUpRight from '@phosphor-icons/core/assets/bold/arrow-up-right-bold.svg?raw';
import mapPin from '@phosphor-icons/core/assets/bold/map-pin-bold.svg?raw';
import check from '@phosphor-icons/core/assets/bold/check-bold.svg?raw';
import storefront from '@phosphor-icons/core/assets/bold/storefront-bold.svg?raw';
import star from '@phosphor-icons/core/assets/fill/star-fill.svg?raw';
import quotes from '@phosphor-icons/core/assets/fill/quotes-fill.svg?raw';

export const icons = { instagram, tiktok, sun, moon, auto, list, x, arrowRight, arrowUpRight, mapPin, check, storefront, star, quotes } as const;
export type IconName = keyof typeof icons;
