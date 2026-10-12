// 44 supported languages: 24 EU official + 20 widely-spoken world languages.
// Used by the language switcher, admin settings, i18n fallback, and RTL support.

export const LANGUAGES = [
  // EU official languages (24)
  { code: 'pl', name: 'Polish', native: 'Polski', rtl: false },
  { code: 'en', name: 'English', native: 'English', rtl: false },
  { code: 'bg', name: 'Bulgarian', native: 'Български', rtl: false },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski', rtl: false },
  { code: 'cs', name: 'Czech', native: 'Čeština', rtl: false },
  { code: 'da', name: 'Danish', native: 'Dansk', rtl: false },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', rtl: false },
  { code: 'et', name: 'Estonian', native: 'Eesti', rtl: false },
  { code: 'fi', name: 'Finnish', native: 'Suomi', rtl: false },
  { code: 'fr', name: 'French', native: 'Français', rtl: false },
  { code: 'de', name: 'German', native: 'Deutsch', rtl: false },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', rtl: false },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', rtl: false },
  { code: 'ga', name: 'Irish', native: 'Gaeilge', rtl: false },
  { code: 'it', name: 'Italian', native: 'Italiano', rtl: false },
  { code: 'lv', name: 'Latvian', native: 'Latviešu', rtl: false },
  { code: 'lt', name: 'Lithuanian', native: 'Lietuvių', rtl: false },
  { code: 'mt', name: 'Maltese', native: 'Malti', rtl: false },
  { code: 'pt', name: 'Portuguese', native: 'Português', rtl: false },
  { code: 'ro', name: 'Romanian', native: 'Română', rtl: false },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina', rtl: false },
  { code: 'sl', name: 'Slovenian', native: 'Slovenščina', rtl: false },
  { code: 'es', name: 'Spanish', native: 'Español', rtl: false },
  { code: 'sv', name: 'Swedish', native: 'Svenska', rtl: false },
  // World languages (20)
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', rtl: false },
  { code: 'zh', name: 'Chinese', native: '中文', rtl: false },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', rtl: false },
  { code: 'id', name: 'Indonesian', native: 'Indonesia', rtl: false },
  { code: 'ja', name: 'Japanese', native: '日本語', rtl: false },
  { code: 'ko', name: 'Korean', native: '한국어', rtl: false },
  { code: 'ms', name: 'Malay', native: 'Melayu', rtl: false },
  { code: 'fa', name: 'Persian', native: 'فارسی', rtl: true },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', rtl: false },
  { code: 'ru', name: 'Russian', native: 'Русский', rtl: false },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', rtl: false },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', rtl: false },
  { code: 'th', name: 'Thai', native: 'ไทย', rtl: false },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', rtl: false },
  { code: 'ur', name: 'Urdu', native: 'اردو', rtl: true },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', rtl: false },
  { code: 'ha', name: 'Hausa', native: 'Hausa', rtl: false },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', rtl: false },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', rtl: false },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);
export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));
export const RTL_LANGUAGES = LANGUAGES.filter((l) => l.rtl).map((l) => l.code);

export function isRtl(code) {
  return LANGUAGE_MAP[code]?.rtl || false;
}

export function langNative(code) {
  return LANGUAGE_MAP[code]?.native || code;
}

export function langName(code) {
  return LANGUAGE_MAP[code]?.name || code;
}