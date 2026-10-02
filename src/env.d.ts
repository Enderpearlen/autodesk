/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  __mando?: {
    resolveTheme: (mode?: string, date?: Date) => string;
    applyTheme: (theme: string, mode: string) => void;
    getMode: () => string;
    setMode: (mode: string) => void;
    ageOk: () => boolean;
  };
  mandoConsent?: {
    get: () => { necessary: true; stats: boolean; social: boolean } | null;
    set: (c: { stats: boolean; social: boolean }) => void;
    open: () => void;
  };
  instgrm?: { Embeds: { process: () => void } };
}
