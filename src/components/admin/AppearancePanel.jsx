import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, Trash2, AlertTriangle } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { ACCENT_PRESETS, FONT_PACKAGES } from '@/lib/siteTheme';

// Appearance controls for the single SiteSetting record: accent color
// (12 presets + custom hex), site theme (light/dark), font package (4), and a
// danger zone that factory-resets all content via the factoryReset function.
export default function AppearancePanel() {
  const { t, lang } = useLang();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetErr, setResetErr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const items = await base44.entities.SiteSetting.list('-created_date', 1);
        setRec(items[0] || null);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const patch = (p) => setRec((r) => (r ? { ...r, ...p } : r));

  const save = async () => {
    if (!rec) return;
    setSaving(true); setSaved(false);
    try {
      const updated = await base44.entities.SiteSetting.update(rec.id, {
        accent_color: rec.accent_color,
        theme: rec.theme,
        font_package: rec.font_package,
      });
      setRec(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const doReset = async () => {
    if (confirmText !== 'USUŃ') return;
    setResetting(true); setResetMsg(''); setResetErr(false);
    try {
      await base44.functions.invoke('factoryReset', { confirm: 'USUŃ' });
      setResetMsg(t('admin.reset_done'));
      setConfirmText('');
    } catch (e) {
      setResetErr(true);
      setResetMsg(e?.response?.data?.error || e?.message || 'Error');
    } finally { setResetting(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>;
  }

  const accent = rec?.accent_color || '#CBFF00';
  const theme = rec?.theme || 'light';
  const fontPkg = rec?.font_package || 'editorial';

  return (
    <div className="mt-10 border-t border-neutral-200 pt-8">
      <h2 className="text-xl font-semibold tracking-tight">{t('admin.appearance_title')}</h2>
      <p className="text-sm text-neutral-500 mb-6">{t('admin.appearance_desc')}</p>

      {!rec ? (
        <p className="text-sm text-neutral-500">{lang === 'pl' ? 'Najpierw utwórz ustawienia strony powyżej.' : 'Create site settings above first.'}</p>
      ) : (
        <div className="space-y-8">
          {/* Accent color */}
          <div>
            <p className="text-sm font-medium mb-3">{t('admin.accent_color')}</p>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => patch({ accent_color: c })}
                  className={`w-9 h-9 rounded-lg border-2 transition ${accent.toLowerCase() === c.toLowerCase() ? 'border-black scale-110' : 'border-neutral-200 hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
              <div className="flex items-center gap-2 ml-2">
                <span className="w-9 h-9 rounded-lg border-2 border-neutral-200" style={{ backgroundColor: accent }} />
                <Input value={accent} onChange={(e) => patch({ accent_color: e.target.value })} className="w-32 font-mono text-sm uppercase" placeholder="#CBFF00" />
              </div>
            </div>
          </div>

          {/* Site theme */}
          <div>
            <p className="text-sm font-medium mb-3">{t('admin.theme')}</p>
            <div className="flex gap-2">
              {['light', 'dark'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => patch({ theme: m })}
                  className={`px-4 py-2 rounded-lg border text-sm transition ${theme === m ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-neutral-400'}`}
                >
                  {m === 'light' ? t('admin.theme_light') : t('admin.theme_dark')}
                </button>
              ))}
            </div>
          </div>

          {/* Font package */}
          <div>
            <p className="text-sm font-medium mb-3">{t('admin.font_package')}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(FONT_PACKAGES).map(([key, pkg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => patch({ font_package: key })}
                  className={`text-left p-3 rounded-lg border transition ${fontPkg === key ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}
                >
                  <span className="block text-sm font-medium" style={{ fontFamily: pkg.display }}>{pkg.label}</span>
                  <span className="block text-xs text-neutral-500" style={{ fontFamily: pkg.body }}>{pkg.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving} className="bg-[#CBFF00] text-black hover:bg-[#CBFF00]/90">
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              {t('admin.save_appearance')}
            </Button>
            {saved && <span className="text-sm text-green-600 inline-flex items-center gap-1"><Check className="w-4 h-4" /> {t('admin.saved')}</span>}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="mt-10 border-2 border-red-200 rounded-xl p-5 bg-red-50/40">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-red-700">{t('admin.danger_zone')}</h3>
        </div>
        <p className="text-sm text-red-600/80 mb-4 max-w-xl">{t('admin.danger_desc')}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="USUŃ" className="sm:w-40 uppercase font-mono" />
          <Button onClick={doReset} disabled={resetting || confirmText !== 'USUŃ'} className="bg-red-600 text-white hover:bg-red-700">
            {resetting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
            {t('admin.reset_btn')}
          </Button>
        </div>
        {resetMsg && <p className={`text-sm mt-3 ${resetErr ? 'text-red-700' : 'text-green-700'}`}>{resetMsg}</p>}
      </div>
    </div>
  );
}