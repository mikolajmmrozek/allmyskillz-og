import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { LANGUAGES } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Check, ChevronDown, Search } from 'lucide-react';
import { useLang, loadDictionary } from '@/lib/i18n';
import { invalidateBrandingCache } from '@/components/site/SiteLogo';

// Dedicated UI for choosing the site's primary language and which languages
// visitors can switch between. Renders above the CollectionEditor in Settings.
export default function LanguageSettingsPanel({ recordId, onSaved }) {
  const { t, setPrimaryLang, setLang } = useLang();
  const [settings, setSettings] = useState(null);
  const [primary, setPrimary] = useState('pl');
  const [enabled, setEnabled] = useState(['pl', 'en']);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (!recordId) return;
      try {
        const rec = await base44.entities.SiteSetting.get(recordId);
        setSettings(rec);
        setPrimary(rec.primary_language || 'pl');
        setEnabled(rec.enabled_languages || ['pl', 'en']);
      } catch (e) { console.error(e); }
    })();
  }, [recordId]);

  const toggle = (code) => {
    if (code === primary || code === 'en') return;
    setEnabled((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const onPrimaryChange = (code) => {
    setPrimary(code);
    // English is always enabled; primary is always enabled
    setEnabled((prev) => Array.from(new Set([...prev, code, 'en'])));
  };

  const filteredLanguages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((l) =>
      l.code.includes(q) || l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q)
    );
  }, [search]);

  const enabledLabel = useMemo(() => {
    const count = enabled.length;
    const names = enabled
      .slice(0, 3)
      .map((c) => LANGUAGES.find((l) => l.code === c)?.native || c)
      .join(', ');
    return count <= 3 ? names : `${names} +${count - 3}`;
  }, [enabled]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    let reloading = false;
    try {
      const primaryChanged = primary !== (settings?.primary_language || 'pl');
      const payload = { ...(settings || {}), primary_language: primary, enabled_languages: enabled };
      let result;
      if (settings?.id) {
        result = await base44.entities.SiteSetting.update(settings.id, payload);
      } else {
        result = await base44.entities.SiteSetting.create(payload);
      }
      setSettings(result);
      // Immediately sync the i18n primary language + invalidate the branding
      // cache so AdminLayout (and CollectionEditor labels) reflect the new
      // primary language without a full page reload.
      setPrimaryLang(primary);
      invalidateBrandingCache();
      if (primaryChanged) {
        // Reload the admin panel so every label, editor column and cache
        // starts fresh in the new primary language.
        reloading = true;
        // Prepare the new interface language BEFORE reloading, so the panel
        // comes back instantly in that language, then flag the notice.
        setTranslating(true);
        await loadDictionary(primary);
        setLang(primary);
        window.location.reload();
        return;
      }
      if (onSaved) onSaved(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Save failed');
    } finally {
      if (!reloading) setSaving(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200">
      <h2 className="text-lg font-semibold mb-1">{t('admin.languages_title')}</h2>
      <p className="text-sm text-neutral-500 mb-6">{t('admin.languages_desc')}</p>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">{t('admin.primary_language')}</label>
          <Select value={primary} onValueChange={onPrimaryChange}>
            <SelectTrigger className="w-full max-w-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.native} ({l.name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-400 mt-1.5">{t('admin.primary_language_hint')}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">{t('admin.enabled_languages')}</label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="flex items-center justify-between w-full max-w-sm px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-left hover:border-neutral-300 transition">
                <span className="truncate text-neutral-700">{enabledLabel}</span>
                <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-2" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('admin.search_languages')}
                    className="pl-8 h-8 text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredLanguages.map((l) => {
                  const isOn = enabled.includes(l.code);
                  const locked = l.code === primary || l.code === 'en';
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => toggle(l.code)}
                      disabled={locked}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition text-left ${isOn ? 'bg-neutral-50' : 'hover:bg-neutral-50'} ${locked ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isOn ? 'bg-[var(--accent,#CBFF00)] border-transparent' : 'border-neutral-300 bg-white'}`}>
                        {isOn && <Check className="w-3 h-3 text-[var(--accent-ink,#000)]" />}
                      </span>
                      <span className="flex-1 truncate text-neutral-700">{l.native}</span>
                      <span className="text-xs text-neutral-400 shrink-0">{l.code.toUpperCase()}</span>
                    </button>
                  );
                })}
                {filteredLanguages.length === 0 && (
                  <p className="text-sm text-neutral-400 text-center py-4">{t('admin.no_results')}</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-neutral-400 mt-2">{t('admin.enabled_languages_hint')}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="bg-[var(--accent,#CBFF00)] text-[var(--accent-ink,#000)] hover:bg-[var(--accent,#CBFF00)]/90">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} {translating ? t('admin.translating_ui') : t('action.save')}
          </Button>
          {saved && <span className="text-sm text-green-600">{t('admin.saved')}</span>}
        </div>
      </div>
    </div>
  );
}