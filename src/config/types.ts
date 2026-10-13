/**
 * A CEFR level ('A1', 'A2', 'B1'…) or a range of them ('A1–A2'). A plain string on
 * purpose: a new level (B1, C1) arrives through JSON alone, and every page groups by the
 * levels its data carries instead of a hard-coded list.
 */
export type Level = string

// `also`: other paths (tabs of the same page) on which this item shows as active.
export type NavItem = { to: string; label: string; end?: boolean; also?: string[] }
export type Cta = { to: string; label: string; primary?: boolean }
/** A lesson card in list.json; the document itself is content/<target>/lessons/<slug>.json. */
export type Lesson = { slug: string; title: string; level: Level; description: string }
export type LessonSection = {
  title: string
  note?: string
  lessons: Lesson[]
  // Each section is a tab on the lessons page; the section carrying this flag is the tab
  // that opens when the page is visited without a ?bolum= parameter (first one otherwise).
  openByDefault?: boolean
}

/**
 * The language the learner reads the site in — UI text and explanations. `tr` is the
 * default and every site has it; the others are opt-in per site (see LangConfig).
 */
export type FromLang = 'tr' | 'en'

// Note: lesson DOCUMENTS are deliberately absent here. The app shell imports the
// config for navigation, so everything reachable from the config downloads on first
// paint. Documents load only through `src/data/lessons/index.ts`, from lazy pages.
export type SiteCopy = {
  nav: NavItem[]
  lessonsList: LessonSection[]
  home: { title: string; intro: string; ctas: Cta[] }
  // `siblings`: the OTHER sites in the family (each build target is its own domain),
  // rendered as links on the Hakkında page.
  about: { intro: string; siblings: { label: string; url: string }[] }
}

// One SiteCopy per explanation language the site offers. Its keys ARE the offer: a site
// with an `en` entry gets the language menu in its header, a site with `tr` alone does
// not. Each copy carries its own nav and lesson list, so the English nav lists only the
// pages that exist in English and the English list only the lessons translated so far.
export type LangConfig = { tr: SiteCopy } & { [L in Exclude<FromLang, 'tr'>]?: SiteCopy }
