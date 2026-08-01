import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext();

const STORAGE_KEY = 'portfolio_lang';

const dictionaries = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.biography': 'Biography',
    'nav.work': 'Creative Work',
    'nav.content': 'Content',
    'nav.commerce': 'Commerce',
    'nav.media': 'Media Library',
    'nav.system': 'System',
    'nav.messages': 'Messages',
    'action.new': 'New',
    'action.create': 'Create',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.duplicate': 'Duplicate',
    'action.archive': 'Archive',
    'action.publish': 'Publish',
    'action.unpublish': 'Unpublish',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.back': 'Back',
    'action.search': 'Search…',
    'status.draft': 'Draft',
    'status.published': 'Published',
    'status.archived': 'Archived',
    'status.scheduled': 'Scheduled',
    'status.new': 'New',
    'status.read': 'Read',
    'empty.title': 'Nothing here yet',
    'empty.subtitle': 'Create your first entry to get started.',
    'admin.title': 'Studio',
    'admin.view_site': 'View site',
    'admin.logout': 'Sign out',
  },
  pl: {
    'nav.dashboard': 'Pulpit',
    'nav.biography': 'Biografia',
    'nav.work': 'Praca twórcza',
    'nav.content': 'Treść',
    'nav.commerce': 'Sklep',
    'nav.media': 'Biblioteka mediów',
    'nav.system': 'System',
    'nav.messages': 'Wiadomości',
    'action.new': 'Nowy',
    'action.create': 'Utwórz',
    'action.edit': 'Edytuj',
    'action.delete': 'Usuń',
    'action.duplicate': 'Duplikuj',
    'action.archive': 'Archiwizuj',
    'action.publish': 'Opublikuj',
    'action.unpublish': 'Cofnij publikację',
    'action.save': 'Zapisz',
    'action.cancel': 'Anuluj',
    'action.back': 'Wstecz',
    'action.search': 'Szukaj…',
    'status.draft': 'Wersja robocza',
    'status.published': 'Opublikowane',
    'status.archived': 'Zarchiwizowane',
    'status.scheduled': 'Zaplanowane',
    'status.new': 'Nowa',
    'status.read': 'Przeczytana',
    'empty.title': 'Brak elementów',
    'empty.subtitle': 'Utwórz pierwszy wpis, aby zacząć.',
    'admin.title': 'Studio',
    'admin.view_site': 'Zobacz stronę',
    'admin.logout': 'Wyloguj',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');

  const setLang = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const t = useCallback((key) => (dictionaries[lang] && dictionaries[lang][key]) || dictionaries.en[key] || key, [lang]);

  // Translate a record field: tries field_<lang>, falls back to _en, then field itself
  const tr = useCallback((record, baseField) => {
    if (!record) return '';
    return record[`${baseField}_${lang}`] ?? record[`${baseField}_en`] ?? record[baseField] ?? '';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};