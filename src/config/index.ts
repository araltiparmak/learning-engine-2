import langConfig from './site'
import { fromLang } from '../i18n/lang'

// Configuration for the active target. Which content pack arrives is decided AT BUILD
// TIME: vite.config.ts binds the '#content' alias to content/<target>/ based on VITE_LANG
// (./site.ts assembles it). Picking at runtime with a ternary would pull every target's
// lessons into the bundle (the German build used to ship the English lessons as well).
//
// Within it, the copy for the learner's explanation language is picked at startup
// (see src/i18n/lang.ts) — a site without that language falls back to Turkish.
export type {
  Level,
  NavItem,
  Cta,
  Lesson,
  LessonSection,
  SiteCopy,
  FromLang,
  LangConfig,
} from './types'

export default langConfig[fromLang] ?? langConfig.tr
