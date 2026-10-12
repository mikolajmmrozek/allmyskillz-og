import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isRtl, langName } from '@/lib/languages';

const LanguageContext = createContext();

const STORAGE_KEY = 'portfolio_lang';

const dictionaries = {
  en: {
    'site.home': 'Home',
    'site.about': 'Experience',
    'site.projects': 'Projects',
    'site.offers': 'Offers',
    'site.news': 'Journal',
    'site.shop': 'Shop',
    'site.contact': 'Contact',
    'site.explore': 'Explore',
    'site.rights': 'All rights reserved.',
    'site.viewAll': 'View all',
    'site.readMore': 'Read more',
    'site.getInTouch': 'Contact',
    'site.sendMessage': 'Send message',
    'site.name': 'Name',
    'site.email': 'Email',
    'site.phone': 'Phone',
    'site.subject': 'Subject',
    'site.message': 'Message',
    'site.sent': 'Thank you — your message has been sent.',
    'site.backToAll': 'Back to all',
    'site.relatedProjects': 'Related projects',
    'site.relatedNews': 'Related news',
    'site.partners': 'Partners',
    'site.latestNews': 'Latest from the journal',
    'site.featuredWork': 'Selected projects',
    'site.allProjects': 'All projects',
    'site.allOffers': 'All offers',
    'site.allProducts': 'All products',
    'site.faq': 'FAQ',
    'site.enroll': 'Enroll',
    'site.buyNow': 'Buy',
    'site.outOfStock': 'Out of stock',
    'site.from': 'from',
    'about.journey': 'Journey',
    'about.experience': 'Experience',
    'about.foundation': 'Foundation',
    'about.education': 'Education',
    'about.currently': 'Currently',
    'about.skills': 'Skills',
    'about.languages': 'Languages',
    'about.achievements': 'Achievements',
    'about.milestones': 'Milestones',
    'about.awards': 'Awards',
    'about.certificates': 'Certificates',
    'about.attachment': 'Attachment',
    'about.projects': 'Projects',
    'about.news': 'News',
    'about.exploreAll': 'Explore all my work',
    'about.viewAll': 'View all',
    'nav.dashboard': 'Dashboard',
    'nav.biography': 'Biography',
    'nav.work': 'Creative Work',
    'nav.content': 'Content',
    'nav.commerce': 'Commerce',
    'nav.media': 'Media Library',
    'nav.system': 'System',
    'nav.messages': 'Messages',
    'nav.navigation': 'Navigation',
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
    'admin.studio_title': 'Dashboard',
    'admin.studio_subtitle': 'Your personal brand operating system.',
    'admin.recent_messages': 'Recent messages',
    'admin.view_all': 'View all',
    'admin.no_messages': 'No messages yet.',
    'admin.quick_start': 'Quick start',
    'admin.quick_start_desc': 'Manage every piece of content from here. No code required.',
    'admin.pinned': 'Pinned',
    'admin.edit': 'Edit',
    'admin.no_pinned': 'No pinned collections — click to choose.',
    'admin.edit_dashboard': 'Edit dashboard',
    'admin.edit_dashboard_desc': 'Choose collections to pin at the top of the dashboard.',
    'admin.add_project': '+ Add a project',
    'admin.add_post': '+ Write a news post',
    'admin.edit_homepage': '+ Edit homepage',
    'admin.site_settings_link': 'Site settings',
    'admin.media_library': 'Media Library',
    'admin.media_count_suffix': 'files · reusable across the site',
    'admin.generate': 'Generate',
    'admin.upload': 'Upload',
    'admin.ai_media_gen': 'AI Media Generation',
    'admin.search_media': 'Search media…',
    'admin.no_media': 'No media yet.',
    'admin.confirm_remove_media': 'Remove this media item?',
    'admin.messages_title': 'Messages',
    'admin.messages_count_suffix': 'active · forwarded to your email',
    'admin.email_label': 'Email',
    'admin.phone_label': 'Phone',
    'admin.subject_label': 'Subject',
    'admin.mark_unread': 'Mark unread',
    'admin.mark_read': 'Mark read',
    'admin.archive_btn': 'Archive',
    'admin.delete_btn': 'Delete',
    'admin.confirm_delete_message': 'Delete this message?',
    'admin.homepage_title': 'Homepage',
    'admin.homepage_desc': 'Hero, intro, featured projects & workshop announcements.',
    'admin.navigation_title': 'Navigation',
    'admin.navigation_desc': 'Drag-free reorder with up/down controls.',
    'admin.add_link': 'Add link',
    'admin.label_en_ph': 'Label (EN)',
    'admin.label_pl_ph': 'Label (PL)',
    'admin.path_ph': '/path',
    'admin.no_nav_items': 'No navigation items yet.',
    'admin.settings_title': 'Site Settings',
    'admin.settings_desc': 'Global configuration, SEO defaults & social links.',
    'admin.languages_title': 'Languages',
    'admin.languages_desc': 'The admin panel and content are in two languages: the primary language and auto-translated English. The enabled languages below are only for visitor display.',
    'admin.primary_language': 'Primary Language',
    'admin.language_changed': 'Interface language changed',
    'admin.translating_ui': 'Translating interface…',
    'admin.primary_language_hint': 'Content is authored in this language. English is auto-translated on save.',
    'admin.enabled_languages': 'Visitor Languages',
    'admin.enabled_languages_hint': 'Languages available in the public language switcher. Primary and English are always included. Other languages fall back to the primary language content.',
    'admin.search_languages': 'Search languages…',
    'admin.no_results': 'No results',
    'admin.seo_settings': 'SEO settings',
    'admin.seo_settings_desc': 'These fields control how the page appears in search engines and social media. They are not shown on the site itself.',
    'admin.new_entity': 'New',
    'admin.edit_entity': 'Edit',
    'admin.select_placeholder': 'Select…',
    'admin.no_records_entity': 'No records yet.',
    'admin.choose': 'Choose',
    'admin.clear': 'Clear',
    'admin.add': 'Add',
    'admin.add_item': 'Add item',
    'admin.save_failed': 'Save failed',
    'admin.reorder_failed': 'Reorder save failed',
    'admin.library_tab': 'Library',
    'admin.paste_url': 'Paste external URL…',
    'admin.no_media_upload': 'No media yet. Upload your first file.',
    'admin.selected': 'selected',
    'admin.insert': 'Insert',
    'admin.image_mode': 'Image',
    'admin.video_mode': 'Video',
    'admin.describe_image': 'Describe the image to generate…',
    'admin.describe_video': 'Describe the video to generate…',
    'admin.generating': 'Generating…',
    'admin.generating_video': 'Generating video…',
    'admin.video_gen_time': 'Video generation takes about 30–60 seconds…',
    'admin.saved': 'Saved',
    'admin.save_to_library': 'Save to library',
    'admin.generated_image': 'Generated image',
    'admin.generated_video': 'Generated video',
    'admin.generation_failed': 'Generation failed',
    'admin.confirm_delete_record': 'Delete this record permanently?',
    'admin.actions': 'Actions',
    'field.title_en': 'Title',
    'field.school_en': 'School',
    'field.degree_en': 'Degree',
    'field.company_en': 'Company',
    'field.position_en': 'Position',
    'field.name_en': 'Name',
    'field.category_en': 'Category',
    'field.level': 'Level',
    'field.level_en': 'Level',
    'field.proficiency': 'Proficiency',
    'field.issuer': 'Issuer',
    'field.date': 'Date',
    'field.start_year': 'Start',
    'field.end_year': 'End',
    'field.featured': 'Featured',
    'field.status': 'Status',
    'field.slug': 'Slug',
    'field.price': 'Price',
    'field.stock': 'Stock',
    'field.is_digital': 'Digital',
    'field.metric': 'Metric',
    'field.website': 'Website',
    'field.sort_order': 'Order',
    'field.published_date': 'Publish date',
    'field.href': 'Link',
    'field.label_en': 'Label',
    'field.site_name_en': 'Site name',
    'field.headline_en': 'Headline',
    'field.email': 'Email',
    'field.type': 'Type',
    'field.cover_image': 'Cover',
    'field.image': 'Image',
    'field.logo_url': 'Logo',
    'filter.all': 'All',
    'filter.draft': 'Drafts',
    'filter.published': 'Published',
    'filter.archived': 'Archived',
    'records.one': 'record',
    'records.many': 'records',
    'admin.upload_failed': 'Failed',
    'admin.upload_retry': 'Retry',
    'admin.uploading_progress': 'Uploading',
    'admin.upload_done_label': 'done',
    'admin.upload_phase_sending': 'sending…',
    'admin.upload_phase_saving': 'saving to library…',
    'admin.upload_phase_done': 'in library',
    'admin.heic_not_supported': 'HEIC/HEIF images are not supported. Please convert them to JPG or PNG before uploading.',
    'admin.format_not_supported': 'Only JPG, PNG, PDF and MP4 files are allowed.',
    'admin.file_too_large': 'File exceeds the 100 MB limit.',
    'admin.upload_cancelled': 'Cancelled',
    'admin.cancel_upload': 'Cancel',
    'admin.appearance_title': 'Appearance',
    'admin.appearance_desc': 'Accent color, site theme and fonts.',
    'admin.accent_color': 'Accent color',
    'admin.theme': 'Site theme',
    'admin.theme_light': 'Light',
    'admin.theme_dark': 'Dark',
    'admin.font_package': 'Font package',
    'admin.save_appearance': 'Save appearance',
    'admin.danger_zone': 'Danger zone',
    'admin.danger_desc': 'Permanently delete ALL content (projects, posts, media, navigation, offers…) but keeps site settings. This cannot be undone.',
    'admin.reset_btn': 'Delete all content',
    'admin.reset_done': 'All content deleted.',
    'group.biography': 'Biography',
    'group.work': 'Creative Work',
    'group.content': 'Content',
    'group.commerce': 'Commerce',
    'group.communication': 'Communication',
    'group.system': 'System',
    'collection.Education': 'Education',
    'collection.Experience': 'Experience',
    'collection.Skill': 'Skills',
    'collection.Certificate': 'Certificates',
    'collection.Language': 'Languages',
    'collection.Project': 'Projects',
    'collection.Achievement': 'Achievements',
    'collection.Award': 'Awards',
    'collection.Partner': 'Partners',
    'collection.Offer': 'Offers',
    'collection.Post': 'News',
    'collection.Category': 'Categories',
    'collection.Tag': 'Tags',
    'collection.Product': 'Products',
    'collection.ContactMessage': 'Messages',
    'collection.MediaItem': 'Media Library',
    'collection.SiteSetting': 'Site Settings',
    'collection.HomepageConfig': 'Homepage',
    'collection.NavigationItem': 'Navigation',
  },
  pl: {
    'site.home': 'Start',
    'site.about': 'Doświadczenie',
    'site.projects': 'Projekty',
    'site.offers': 'Oferty',
    'site.news': 'Dziennik',
    'site.shop': 'Sklep',
    'site.contact': 'Kontakt',
    'site.explore': 'Odkryj',
    'site.rights': 'Wszelkie prawa zastrzeżone.',
    'site.viewAll': 'Zobacz wszystkie',
    'site.readMore': 'Czytaj dalej',
    'site.getInTouch': 'Kontakt',
    'site.sendMessage': 'Wyślij wiadomość',
    'site.name': 'Imię',
    'site.email': 'E-mail',
    'site.phone': 'Telefon',
    'site.subject': 'Temat',
    'site.message': 'Wiadomość',
    'site.sent': 'Dziękuję — wiadomość została wysłana.',
    'site.backToAll': 'Wszystkie',
    'site.relatedProjects': 'Powiązane projekty',
    'site.relatedNews': 'Powiązane aktualności',
    'site.partners': 'Partnerzy',
    'site.latestNews': 'Najnowsze wpisy',
    'site.featuredWork': 'Wybrane projekty',
    'site.allProjects': 'Wszystkie projekty',
    'site.allOffers': 'Wszystkie oferty',
    'site.allProducts': 'Wszystkie produkty',
    'site.faq': 'FAQ',
    'site.enroll': 'Zapisz się',
    'site.buyNow': 'Kup',
    'site.outOfStock': 'Brak w magazynie',
    'site.from': 'od',
    'about.journey': 'Droga',
    'about.experience': 'Doświadczenie',
    'about.foundation': 'Kształcenie',
    'about.education': 'Edukacja',
    'about.currently': 'Obecnie',
    'about.skills': 'Umiejętności',
    'about.languages': 'Języki',
    'about.achievements': 'Osiągnięcia',
    'about.milestones': 'Wyróżnienia',
    'about.awards': 'Nagrody',
    'about.certificates': 'Certyfikaty',
    'about.attachment': 'Załącznik',
    'about.projects': 'Projekty',
    'about.news': 'Aktualności',
    'about.exploreAll': 'Zobacz wszystkie moje prace',
    'about.viewAll': 'Zobacz wszystkie',
    'nav.dashboard': 'Pulpit',
    'nav.biography': 'Biografia',
    'nav.work': 'Praca twórcza',
    'nav.content': 'Treść',
    'nav.commerce': 'Sklep',
    'nav.media': 'Biblioteka mediów',
    'nav.system': 'System',
    'nav.messages': 'Wiadomości',
    'nav.navigation': 'Nawigacja',
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
    'status.draft': 'draft',
    'status.published': 'opublikowany',
    'status.archived': 'Zarchiwizowane',
    'status.scheduled': 'Zaplanowane',
    'status.new': 'Nowa',
    'status.read': 'Przeczytana',
    'empty.title': 'Brak elementów',
    'empty.subtitle': 'Utwórz pierwszy wpis, aby zacząć.',
    'admin.title': 'Studio',
    'admin.view_site': 'Zobacz stronę',
    'admin.logout': 'Wyloguj',
    'admin.studio_title': 'Pulpit',
    'admin.studio_subtitle': 'Twój system zarządzania osobistą marką.',
    'admin.recent_messages': 'Ostatnie wiadomości',
    'admin.view_all': 'Zobacz wszystkie',
    'admin.no_messages': 'Brak wiadomości.',
    'admin.quick_start': 'Szybki start',
    'admin.quick_start_desc': 'Zarządzaj całą treścią stąd. Bez kodu.',
    'admin.pinned': 'Przypięte',
    'admin.edit': 'Edytuj',
    'admin.no_pinned': 'Brak przypiętych kolekcji — kliknij, aby wybrać.',
    'admin.edit_dashboard': 'Edytuj pulpit',
    'admin.edit_dashboard_desc': 'Wybierz kolekcje do przypięcia na górze pulpitu.',
    'admin.add_project': '+ Dodaj projekt',
    'admin.add_post': '+ Napisz wpis',
    'admin.edit_homepage': '+ Edytuj stronę główną',
    'admin.site_settings_link': 'Ustawienia strony',
    'admin.media_library': 'Biblioteka mediów',
    'admin.media_count_suffix': 'plików · wielokrotnego użytku',
    'admin.generate': 'Generuj',
    'admin.upload': 'Prześlij',
    'admin.ai_media_gen': 'Generowanie mediów AI',
    'admin.search_media': 'Szukaj mediów…',
    'admin.no_media': 'Brak mediów.',
    'admin.confirm_remove_media': 'Usunąć ten plik multimedialny?',
    'admin.messages_title': 'Wiadomości',
    'admin.messages_count_suffix': 'aktywnych · przekazywane na e-mail',
    'admin.email_label': 'E-mail',
    'admin.phone_label': 'Telefon',
    'admin.subject_label': 'Temat',
    'admin.mark_unread': 'Oznacz jako nieprzeczytane',
    'admin.mark_read': 'Oznacz jako przeczytane',
    'admin.archive_btn': 'Archiwizuj',
    'admin.delete_btn': 'Usuń',
    'admin.confirm_delete_message': 'Usunąć tę wiadomość?',
    'admin.homepage_title': 'Strona główna',
    'admin.homepage_desc': 'Hero, intro, wyróżnione projekty i ogłoszenia warsztatów.',
    'admin.navigation_title': 'Nawigacja',
    'admin.navigation_desc': 'Zmiana kolejności przyciskami góra/dół.',
    'admin.add_link': 'Dodaj link',
    'admin.label_en_ph': 'Etykieta (EN)',
    'admin.label_pl_ph': 'Etykieta (PL)',
    'admin.path_ph': '/ścieżka',
    'admin.no_nav_items': 'Brak elementów nawigacji.',
    'admin.settings_title': 'Ustawienia strony',
    'admin.settings_desc': 'Globalna konfiguracja, SEO i linki społecznościowe.',
    'admin.languages_title': 'Języki',
    'admin.languages_desc': 'Panel admina i treści są w dwóch językach: głównym i auto-tłumaczonym na angielski. Aktywne języki poniżej służą tylko do wyświetlania dla odwiedzających.',
    'admin.primary_language': 'Język główny',
    'admin.language_changed': 'Język interfejsu został zmieniony',
    'admin.translating_ui': 'Tłumaczenie interfejsu…',
    'admin.primary_language_hint': 'Treść jest tworzona w tym języku. Angielski jest tłumaczony automatycznie przy zapisie.',
    'admin.enabled_languages': 'Języki dla odwiedzających',
    'admin.enabled_languages_hint': 'Języki dostępne w publicznym przełączniku. Główny język i angielski są zawsze włączone. Pozostałe języki korzystają z treści w języku głównym.',
    'admin.search_languages': 'Szukaj języków…',
    'admin.no_results': 'Brak wyników',
    'admin.seo_settings': 'Ustawienia SEO',
    'admin.seo_settings_desc': 'Te pola sterują tym, jak strona pojawia się w wyszukiwarkach i mediach społecznościowych. Nie są widoczne na samej stronie.',
    'admin.new_entity': 'Nowy',
    'admin.edit_entity': 'Edytuj',
    'admin.select_placeholder': 'Wybierz…',
    'admin.no_records_entity': 'Brak rekordów.',
    'admin.choose': 'Wybierz',
    'admin.clear': 'Wyczyść',
    'admin.add': 'Dodaj',
    'admin.add_item': 'Dodaj element',
    'admin.save_failed': 'Zapis nie powiódł się',
    'admin.reorder_failed': 'Zapis kolejności nie powiódł się',
    'admin.library_tab': 'Biblioteka',
    'admin.paste_url': 'Wklej zewnętrzny URL…',
    'admin.no_media_upload': 'Brak mediów. Prześlij pierwszy plik.',
    'admin.selected': 'wybranych',
    'admin.insert': 'Wstaw',
    'admin.image_mode': 'Obraz',
    'admin.video_mode': 'Wideo',
    'admin.describe_image': 'Opisz obraz do wygenerowania…',
    'admin.describe_video': 'Opisz wideo do wygenerowania…',
    'admin.generating': 'Generowanie…',
    'admin.generating_video': 'Generowanie wideo…',
    'admin.video_gen_time': 'Generowanie wideo trwa około 30–60 sekund…',
    'admin.saved': 'Zapisano',
    'admin.save_to_library': 'Zapisz w bibliotece',
    'admin.generated_image': 'Wygenerowany obraz',
    'admin.generated_video': 'Wygenerowane wideo',
    'admin.generation_failed': 'Generowanie nie powiodło się',
    'admin.confirm_delete_record': 'Trwale usunąć ten rekord?',
    'admin.actions': 'Akcje',
    'field.title_en': 'Tytuł',
    'field.school_en': 'Szkoła',
    'field.degree_en': 'Stopień',
    'field.company_en': 'Firma',
    'field.position_en': 'Stanowisko',
    'field.name_en': 'Nazwa',
    'field.category_en': 'Kategoria',
    'field.level': 'Poziom',
    'field.level_en': 'Poziom',
    'field.proficiency': 'Biegłość',
    'field.issuer': 'Wydawca',
    'field.date': 'Data',
    'field.start_year': 'Od',
    'field.end_year': 'Do',
    'field.featured': 'Wyróżnione',
    'field.status': 'Status',
    'field.slug': 'Slug',
    'field.price': 'Cena',
    'field.stock': 'Stan',
    'field.is_digital': 'Cyfrowy',
    'field.metric': 'Metryka',
    'field.website': 'Strona',
    'field.sort_order': 'Kolejność',
    'field.published_date': 'Data publikacji',
    'field.href': 'Link',
    'field.label_en': 'Etykieta',
    'field.site_name_en': 'Nazwa strony',
    'field.headline_en': 'Nagłówek',
    'field.email': 'E-mail',
    'field.type': 'Typ',
    'field.cover_image': 'Okładka',
    'field.image': 'Obraz',
    'field.logo_url': 'Logo',
    'filter.all': 'Wszystkie',
    'filter.draft': 'Szkice',
    'filter.published': 'Opublikowane',
    'filter.archived': 'Zarchiwizowane',
    'records.one': 'rekord',
    'records.many': 'rekordów',
    'admin.upload_failed': 'Błąd',
    'admin.upload_retry': 'Spróbuj ponownie',
    'admin.uploading_progress': 'Wgrywanie',
    'admin.upload_done_label': 'gotowe',
    'admin.upload_phase_sending': 'wysyłanie…',
    'admin.upload_phase_saving': 'zapis do biblioteki…',
    'admin.upload_phase_done': 'w bibliotece',
    'admin.heic_not_supported': 'Obrazy HEIC/HEIF nie są obsługiwane. Przekonwertuj je na JPG lub PNG przed przesłaniem.',
    'admin.format_not_supported': 'Dozwolone tylko pliki JPG, PNG, PDF i MP4.',
    'admin.file_too_large': 'Plik przekracza limit 100 MB.',
    'admin.upload_cancelled': 'Anulowano',
    'admin.cancel_upload': 'Anuluj',
    'admin.appearance_title': 'Wygląd',
    'admin.appearance_desc': 'Kolor wiodący, motyw strony i czcionki.',
    'admin.accent_color': 'Kolor wiodący',
    'admin.theme': 'Motyw strony',
    'admin.theme_light': 'Jasny',
    'admin.theme_dark': 'Ciemny',
    'admin.font_package': 'Pakiet czcionek',
    'admin.save_appearance': 'Zapisz wygląd',
    'admin.danger_zone': 'Strefa zagrożenia',
    'admin.danger_desc': 'Trwale usuwa WSZYSTKIE treści (projekty, posty, media, nawigacja, oferty…), ale zachowuje ustawienia strony. Tej operacji nie można cofnąć.',
    'admin.reset_btn': 'Usuń wszystkie treści',
    'admin.reset_done': 'Wszystkie treści zostały usunięte.',
    'group.biography': 'Biografia',
    'group.work': 'Praca twórcza',
    'group.content': 'Treść',
    'group.commerce': 'Sklep',
    'group.communication': 'Komunikacja',
    'group.system': 'System',
    'collection.Education': 'Edukacja',
    'collection.Experience': 'Doświadczenie',
    'collection.Skill': 'Umiejętności',
    'collection.Certificate': 'Certyfikaty',
    'collection.Language': 'Języki',
    'collection.Project': 'Projekty',
    'collection.Achievement': 'Osiągnięcia',
    'collection.Award': 'Nagrody',
    'collection.Partner': 'Partnerzy',
    'collection.Offer': 'Oferty',
    'collection.Post': 'Aktualności',
    'collection.Category': 'Kategorie',
    'collection.Tag': 'Tagi',
    'collection.Product': 'Produkty',
    'collection.ContactMessage': 'Wiadomości',
    'collection.MediaItem': 'Biblioteka mediów',
    'collection.SiteSetting': 'Ustawienia strony',
    'collection.HomepageConfig': 'Strona główna',
    'collection.NavigationItem': 'Nawigacja',
  }
};

const DICT_CACHE_PREFIX = 'i18n_dict_v3_';
const CHUNK_SIZE = 90;
const inflight = {};

// sessionStorage flag: set before the post-language-change reload so the admin
// can show a "language changed" notice (in the new language) after it.
export const LANG_NOTICE_KEY = 'admin_lang_changed_notice';

const readCachedDict = (code) => {
  try {
    const raw = localStorage.getItem(DICT_CACHE_PREFIX + code);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const parseJsonObject = (res) => {
  if (res && typeof res === 'object') return res;
  if (typeof res !== 'string') return null;
  const match = res.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
};

const translateChunk = async (code, chunk) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          `You are a professional UI translator. Translate the following JSON object of user-interface strings from English to ${langName(code)}. ` +
          `Return ONLY a valid JSON object with the exact same keys and translated string values. ` +
          `Do not add any explanation, markdown, or code fences — just the raw JSON.\n\n` +
          JSON.stringify(chunk),
      });
      const parsed = parseJsonObject(res);
      if (parsed) return parsed;
    } catch {}
  }
  return null;
};

// Translates the English UI dictionary into `code` in parallel chunks (much
// faster than one huge request) and caches it. Resolves instantly for built-in
// or already-cached languages.
export const loadDictionary = (code) => {
  if (dictionaries[code]) return Promise.resolve(dictionaries[code]);
  const cached = readCachedDict(code);
  if (cached) return Promise.resolve(cached);
  if (!inflight[code]) {
    const entries = Object.entries(dictionaries.en);
    const chunks = [];
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      chunks.push(Object.fromEntries(entries.slice(i, i + CHUNK_SIZE)));
    }
    inflight[code] = Promise.all(chunks.map((c) => translateChunk(code, c)))
      .then((parts) => {
        const merged = Object.assign({}, ...parts.filter(Boolean));
        if (parts.every(Boolean)) {
          try { localStorage.setItem(DICT_CACHE_PREFIX + code, JSON.stringify(merged)); } catch {}
        }
        return merged;
      })
      .finally(() => { delete inflight[code]; });
  }
  return inflight[code];
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'pl');
  const [primaryLang, setPrimaryLang] = useState('pl');
  // Dictionary for languages without a hardcoded one (not en/pl). Tagged with
  // its language so a stale dictionary is never used after switching language.
  const [extra, setExtra] = useState(() => ({ lang, dict: dictionaries[lang] ? null : readCachedDict(lang) }));
  const [dictLoading, setDictLoading] = useState(() => !dictionaries[lang] && !readCachedDict(lang));

  useEffect(() => {
    if (dictionaries[lang]) { setDictLoading(false); return; }
    const cached = readCachedDict(lang);
    if (cached) { setExtra({ lang, dict: cached }); setDictLoading(false); return; }
    let cancelled = false;
    setDictLoading(true);
    loadDictionary(lang).then((dict) => {
      if (cancelled) return;
      setExtra({ lang, dict });
      setDictLoading(false);
    });
    return () => { cancelled = true; };
  }, [lang]);

  const setLang = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const t = useCallback((key) => {
    const dict = extra.lang === lang ? extra.dict : null;
    if (dict && dict[key]) return dict[key];
    return (dictionaries[lang] && dictionaries[lang][key]) || dictionaries.en[key] || key;
  }, [lang, extra]);

  // Translate a record field. The _pl slot holds the primary-language content,
  // _en holds the English auto-translation. Other languages live in a
  // `translations` JSON object keyed by language code. Fallback chain:
  //   current lang is primary → _pl slot
  //   English → _en slot, then _pl
  //   other lang → translations[lang][field], then _pl (primary)
  const tr = useCallback((record, baseField) => {
    if (!record) return '';
    const primaryContent = record[`${baseField}_pl`];
    const enContent = record[`${baseField}_en`];
    if (lang === primaryLang) return primaryContent ?? record[baseField] ?? '';
    if (lang === 'en') return enContent ?? primaryContent ?? record[baseField] ?? '';
    const translated = record.translations?.[lang]?.[baseField];
    if (translated) return translated;
    return primaryContent ?? record[baseField] ?? '';
  }, [lang, primaryLang]);

  const dir = isRtl(lang) ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tr, primaryLang, setPrimaryLang, dir, dictLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};