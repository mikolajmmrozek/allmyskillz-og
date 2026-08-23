// Central registry of all CMS collections — drives the admin sidebar,
// list views, and the schema-driven editor. No code per collection needed.
import {
  GraduationCap, Briefcase, FolderKanban, Trophy, Award, Wrench,
  ScrollText, Languages, Package, Newspaper, Tags, Tag, Image,
  Handshake, Presentation, Mail, Settings, LayoutDashboard, Menu
} from 'lucide-react';

export const collectionGroups = [
  { id: 'biography', label_en: 'Biography', label_pl: 'Biografia' },
  { id: 'work', label_en: 'Creative Work', label_pl: 'Praca twórcza' },
  { id: 'content', label_en: 'Content', label_pl: 'Treść' },
  { id: 'commerce', label_en: 'Commerce', label_pl: 'Sklep' },
  { id: 'communication', label_en: 'Communication', label_pl: 'Komunikacja' },
  { id: 'system', label_en: 'System', label_pl: 'System' },
];

export const collections = [
  { key: 'Education', label_pl: 'Edukacja', group: 'biography', icon: GraduationCap, primary: 'school_en', list: ['school_en', 'degree_en', 'start_year', 'end_year', 'status'] },
  { key: 'Experience', label_pl: 'Doświadczenie', group: 'biography', icon: Briefcase, primary: 'company_en', list: ['company_en', 'position_en', 'start_year', 'end_year', 'status'] },
  { key: 'Skill', label_pl: 'Umiejętności', group: 'biography', icon: Wrench, primary: 'name_en', list: ['name_en', 'category_en', 'level', 'status'] },
  { key: 'Certificate', label_pl: 'Certyfikaty', group: 'biography', icon: ScrollText, primary: 'title_en', list: ['title_en', 'issuer', 'date', 'status'] },
  { key: 'Language', label_pl: 'Języki', group: 'biography', icon: Languages, primary: 'name_en', list: ['name_en', 'level_en', 'proficiency', 'status'] },

  { key: 'Project', label_pl: 'Projekty', group: 'work', icon: FolderKanban, primary: 'title_en', list: ['title_en', 'featured', 'status'] },
  { key: 'Achievement', label_pl: 'Osiągnięcia', group: 'work', icon: Trophy, primary: 'title_en', list: ['title_en', 'metric', 'date', 'status'] },
  { key: 'Award', label_pl: 'Nagrody', group: 'work', icon: Award, primary: 'title_en', list: ['title_en', 'issuer', 'date', 'status'] },
  { key: 'Partner', label_pl: 'Partnerzy', group: 'work', icon: Handshake, primary: 'name_en', list: ['name_en', 'website', 'status'] },
  { key: 'Offer', label_pl: 'Oferty', group: 'work', icon: Presentation, primary: 'title_en', list: ['title_en', 'slug', 'price', 'status'] },

  { key: 'Post', label_pl: 'Aktualności', group: 'content', icon: Newspaper, primary: 'title_en', list: ['title_en', 'slug', 'status', 'published_date'] },
  { key: 'Category', label_pl: 'Kategorie', group: 'content', icon: Tag, primary: 'name_en', list: ['name_en', 'slug', 'status'] },
  { key: 'Tag', label_pl: 'Tagi', group: 'content', icon: Tags, primary: 'name_en', list: ['name_en', 'slug', 'status'] },

  { key: 'Product', label_pl: 'Produkty', group: 'commerce', icon: Package, primary: 'title_en', list: ['title_en', 'price', 'stock', 'is_digital', 'status'] },

  { key: 'ContactMessage', label_pl: 'Wiadomości', group: 'communication', icon: Mail, primary: 'name', list: ['name', 'email', 'subject', 'status'] },

  { key: 'MediaItem', label_pl: 'Biblioteka mediów', group: 'system', icon: Image, primary: 'title', list: ['title', 'type', 'status'] },
  { key: 'SiteSetting', label_pl: 'Ustawienia strony', group: 'system', icon: Settings, primary: 'site_name_en', list: ['site_name_en', 'email'], singleton: true },
  { key: 'HomepageConfig', label_pl: 'Strona główna', group: 'system', icon: LayoutDashboard, primary: 'headline_en', list: ['headline_en'], singleton: true },
  { key: 'NavigationItem', label_pl: 'Nawigacja', group: 'system', icon: Menu, primary: 'label_en', list: ['label_en', 'href', 'sort_order', 'status'] },
];

export const getCollection = (key) => collections.find((c) => c.key === key);