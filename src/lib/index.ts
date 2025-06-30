// Export the main component
export { default as DaisyPlayer } from './components/DaisyPlayer/DaisyPlayer';
export { default as DaisyPlayerWithRouter } from './components/DaisyPlayerWithRouter/DaisyPlayerWithRouter';

// Export types
export type { Section, FlatSection, SectionsHolder } from './utils/sections';
export type { ComponentProps as DaisyPlayerProps, DaisyPlayerRef } from './components/DaisyPlayer/DaisyPlayer';
export type { ComponentProps as DaisyPlayerWithRouterProps } from './components/DaisyPlayerWithRouter/DaisyPlayerWithRouter';
export type { SupportedLanguage, TranslationKey, Translations } from './utils/i18n';

// Export utility functions
export {
  flatten,
  getFirst,
  getFirstSmil,
  treeFindBySmil,
  flatGetNext,
  flatGetPrev,
  flatFindBySmil
} from './utils/sections';

export {
  getTranslations,
  createTranslator
} from './utils/i18n';

// Import all component styles
import './components/DaisyPlayer/index.scss';
import './components/ShareLinkButton/index.scss';
import './components/SectionList/index.scss';
import './components/AccessibleAudioPlayer/index.scss';
