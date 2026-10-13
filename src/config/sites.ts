// The sites of the family — one per build target (see the TARGETS table in
// vite.config.ts), so a changed domain is fixed here once instead of in every config
// file. A target links to whichever of the others it wants under `about.siblings` —
// the German site currently links to none, so SITES.en / SITES['en-business'] stay
// here as the domain registry without being rendered anywhere.
export const SITES = {
  de: { label: 'Deutsch Lernen', url: 'https://mein-deutsch-lernen.vercel.app' },
  en: { label: 'İngilizce Öğren', url: 'https://ingilizce-ogren-one.vercel.app' },
  'en-business': { label: 'İş İngilizcesi', url: 'https://is-ingilizcesi.vercel.app' },
} as const
