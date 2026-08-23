import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { collections } from '@/lib/entityRegistry';
import { useLang } from '@/lib/i18n';
import { Loader2, ArrowUpRight, Mail } from 'lucide-react';

export default function Dashboard() {
  const { t, lang } = useLang();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    (async () => {
      const entries = collections.filter((c) => !c.singleton);
      const results = await Promise.allSettled(
        entries.map(async (c) => {
          const items = await base44.entities[c.key].list('-created_date', 1);
          return [c.key, items.length];
        })
      );
      const map = {};
      results.forEach((r) => { if (r.status === 'fulfilled') map[r.value[0]] = r.value[1]; });
      setStats(map);
      try {
        const msgs = await base44.entities.ContactMessage.list('-created_date', 5);
        setRecentMessages(msgs);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-1">{t('admin.studio_title')}</h1>
      <p className="text-neutral-500 mb-10">{t('admin.studio_subtitle')}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {collections.filter((c) => !c.singleton).map((c) => {
          const Icon = c.icon;
          const count = stats[c.key] ?? 0;
          return (
            <Link key={c.key} to={`/admin/collection/${c.key}`} className="group p-5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-900 transition">
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-neutral-400 group-hover:text-black transition" />
                <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-black transition" />
              </div>
              <p className="text-3xl font-semibold tracking-tight">{count}</p>
              <p className="text-xs text-neutral-500 mt-1">{lang === 'pl' ? (c.label_pl || c.key) : c.key}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{t('admin.recent_messages')}</h2>
            <Link to="/admin/messages" className="text-xs text-neutral-500 hover:text-black">{t('admin.view_all')}</Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">{t('admin.no_messages')}</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((m) => (
                <div key={m.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-neutral-400" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{m.subject || m.message}</p>
                  </div>
                  {!m.is_read && <span className="w-2 h-2 rounded-full bg-[#CBFF00] shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-neutral-900 text-white rounded-2xl">
          <h2 className="font-semibold mb-2">{t('admin.quick_start')}</h2>
          <p className="text-sm text-neutral-400 mb-4">{t('admin.quick_start_desc')}</p>
          <div className="space-y-2">
            <Link to="/admin/collection/Project/new" className="block px-4 py-3 bg-neutral-800 rounded-lg text-sm hover:bg-neutral-700 transition">{t('admin.add_project')}</Link>
            <Link to="/admin/collection/Post/new" className="block px-4 py-3 bg-neutral-800 rounded-lg text-sm hover:bg-neutral-700 transition">{t('admin.add_post')}</Link>
            <Link to="/admin/homepage" className="block px-4 py-3 bg-neutral-800 rounded-lg text-sm hover:bg-neutral-700 transition">{t('admin.edit_homepage')}</Link>
            <Link to="/admin/settings" className="block px-4 py-3 bg-[#CBFF00] text-black rounded-lg text-sm font-medium hover:opacity-90 transition">{t('admin.site_settings_link')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}