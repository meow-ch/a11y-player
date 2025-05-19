// Define the structure for translations
export type TranslationKey = 
  | 'audioPlayer'
  | 'previousSection'
  | 'nextSection'
  | 'play'
  | 'pause'
  | 'backward30Seconds'
  | 'forward30Seconds'
  | 'speed'
  | 'decreasePlaybackRate'
  | 'increasePlaybackRate'
  | 'toggleSectionsView'
  | 'shareLink'
  | 'linkCopied'
  | 'failedToCopy'
  | 'tableOfContents'
  | 'noTitle'
  | 'unknownAuthor'
  | 'defaultBookTitle';

export type Translations = {
  [key in TranslationKey]: string;
};

// Define supported languages
export type SupportedLanguage = 'en' | 'fr' | 'de' | 'it' | 'es';

// English translations (default)
const en: Translations = {
  audioPlayer: 'Audio Player',
  previousSection: 'Previous Section',
  nextSection: 'Next Section',
  play: 'Play',
  pause: 'Pause',
  backward30Seconds: 'Backward 30 Seconds',
  forward30Seconds: 'Forward 30 Seconds',
  speed: 'Speed',
  decreasePlaybackRate: 'Decrease playback rate',
  increasePlaybackRate: 'Increase playback rate',
  toggleSectionsView: 'Toggle sections view',
  shareLink: 'Share link to current position',
  linkCopied: 'Link copied!',
  failedToCopy: 'Failed to copy',
  tableOfContents: 'Table of Contents',
  noTitle: 'No title',
  unknownAuthor: 'Unknown author',
  defaultBookTitle: 'Daisy player'
};

// French translations
const fr: Translations = {
  audioPlayer: 'Lecteur Audio',
  previousSection: 'Section Précédente',
  nextSection: 'Section Suivante',
  play: 'Lecture',
  pause: 'Pause',
  backward30Seconds: 'Reculer de 30 Secondes',
  forward30Seconds: 'Avancer de 30 Secondes',
  speed: 'Vitesse',
  decreasePlaybackRate: 'Diminuer la vitesse de lecture',
  increasePlaybackRate: 'Augmenter la vitesse de lecture',
  toggleSectionsView: 'Afficher/Masquer les sections',
  shareLink: 'Partager un lien vers la position actuelle',
  linkCopied: 'Lien copié !',
  failedToCopy: 'Échec de la copie',
  tableOfContents: 'Table des matières',
  noTitle: 'Sans titre',
  unknownAuthor: 'Auteur inconnu',
  defaultBookTitle: 'Lecteur Daisy'
};

// German translations
const de: Translations = {
  audioPlayer: 'Audio-Player',
  previousSection: 'Vorheriger Abschnitt',
  nextSection: 'Nächster Abschnitt',
  play: 'Abspielen',
  pause: 'Pause',
  backward30Seconds: '30 Sekunden zurück',
  forward30Seconds: '30 Sekunden vorwärts',
  speed: 'Geschwindigkeit',
  decreasePlaybackRate: 'Wiedergabegeschwindigkeit verringern',
  increasePlaybackRate: 'Wiedergabegeschwindigkeit erhöhen',
  toggleSectionsView: 'Abschnittsansicht umschalten',
  shareLink: 'Link zur aktuellen Position teilen',
  linkCopied: 'Link kopiert!',
  failedToCopy: 'Kopieren fehlgeschlagen',
  tableOfContents: 'Inhaltsverzeichnis',
  noTitle: 'Kein Titel',
  unknownAuthor: 'Unbekannter Autor',
  defaultBookTitle: 'Daisy-Player'
};

// Italian translations
const it: Translations = {
  audioPlayer: 'Lettore Audio',
  previousSection: 'Sezione Precedente',
  nextSection: 'Sezione Successiva',
  play: 'Riproduci',
  pause: 'Pausa',
  backward30Seconds: 'Indietro di 30 Secondi',
  forward30Seconds: 'Avanti di 30 Secondi',
  speed: 'Velocità',
  decreasePlaybackRate: 'Diminuisci velocità di riproduzione',
  increasePlaybackRate: 'Aumenta velocità di riproduzione',
  toggleSectionsView: 'Attiva/disattiva vista sezioni',
  shareLink: 'Condividi link alla posizione attuale',
  linkCopied: 'Link copiato!',
  failedToCopy: 'Copia fallita',
  tableOfContents: 'Indice',
  noTitle: 'Nessun titolo',
  unknownAuthor: 'Autore sconosciuto',
  defaultBookTitle: 'Lettore Daisy'
};

// Spanish translations
const es: Translations = {
  audioPlayer: 'Reproductor de Audio',
  previousSection: 'Sección Anterior',
  nextSection: 'Sección Siguiente',
  play: 'Reproducir',
  pause: 'Pausar',
  backward30Seconds: 'Retroceder 30 Segundos',
  forward30Seconds: 'Avanzar 30 Segundos',
  speed: 'Velocidad',
  decreasePlaybackRate: 'Disminuir velocidad de reproducción',
  increasePlaybackRate: 'Aumentar velocidad de reproducción',
  toggleSectionsView: 'Alternar vista de secciones',
  shareLink: 'Compartir enlace a la posición actual',
  linkCopied: '¡Enlace copiado!',
  failedToCopy: 'Error al copiar',
  tableOfContents: 'Tabla de contenidos',
  noTitle: 'Sin título',
  unknownAuthor: 'Autor desconocido',
  defaultBookTitle: 'Reproductor Daisy'
};

// Map of all translations
const translations: Record<SupportedLanguage, Translations> = {
  en,
  fr,
  de,
  it,
  es
};

/**
 * Get translations for a specific language, falling back to English if not supported
 * @param lang Language code (2 letters)
 * @returns Translation object
 */
export const getTranslations = (lang: string): Translations => {
  const normalizedLang = lang.toLowerCase().substring(0, 2) as SupportedLanguage;
  
  if (!translations[normalizedLang]) {
    console.log(`Language '${lang}' is not supported. Using English as fallback.`);
    return translations.en;
  }
  
  return translations[normalizedLang];
};

/**
 * Create a translation function for a specific language
 * @param lang Language code
 * @returns Function to get translated strings
 */
export const createTranslator = (lang: string) => {
  const translationObj = getTranslations(lang);
  
  return (key: TranslationKey): string => {
    return translationObj[key] || translations.en[key];
  };
};
