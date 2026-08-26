import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Lock } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function Navigation() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLang();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.NavigationItem.list('sort_order', 200);
      setItems(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const created = await base44.entities.NavigationItem.create({ label_en: 'New link', label_pl: 'Nowy link', href: '/', sort_order: items.length, status: 'published' });
    setItems((prev) => [...prev, created]);
  };

  const update = async (id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await base44.entities.NavigationItem.update(id, patch);
  };

  const remove = async (id) => {
    await base44.entities.NavigationItem.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Start ('/') is pinned first, Kontakt ('/contact') pinned last. They can't
  // be hidden, deleted, or reordered out of position.
  const isStart = (it) => it.href === '/';
  const isContact = (it) => it.href === '/contact';
  const isPinned = (it) => isStart(it) || isContact(it);

  const ordered = [
    ...items.filter(isStart),
    ...items.filter((it) => !isPinned(it)).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    ...items.filter(isContact),
  ];

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= ordered.length) return;
    const it = ordered[idx];
    if (isPinned(it) || isPinned(ordered[target])) return;
    const next = [...ordered];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((nIt, i) => { nIt.sort_order = i; });
    setItems(next);
    await Promise.all(next.map((nIt) => base44.entities.NavigationItem.update(nIt.id, { sort_order: nIt.sort_order })));
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('admin.navigation_title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('admin.navigation_desc')}</p>
        </div>
        <Button onClick={add} className="bg-[var(--accent,#CBFF00)] text-[var(--accent-ink,#000)] hover:bg-[var(--accent,#CBFF00)]/90 w-full sm:w-auto"><Plus className="w-4 h-4 mr-1" /> {t('admin.add_link')}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
      ) : (
        <div className="space-y-2">
          {ordered.map((it, idx) => {
            const pinned = isPinned(it);
            const isFirst = idx === 0;
            const isLast = idx === ordered.length - 1;
            return (
              <div key={it.id} className={`flex flex-col sm:flex-row sm:items-center gap-2 border rounded-xl p-2 ${pinned ? 'bg-neutral-50 border-neutral-300' : 'bg-white border-neutral-200'} ${!pinned && it.hidden ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button onClick={() => move(idx, -1)} disabled={pinned || isFirst} className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => move(idx, 1)} disabled={pinned || isLast} className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                  {pinned ? (
                    <span className="inline-flex items-center justify-center w-9 h-9 text-neutral-400" title={lang === 'pl' ? 'Zawsze widoczne' : 'Always visible'}>
                      <Lock className="w-4 h-4" />
                    </span>
                  ) : (
                    <button
                      onClick={() => update(it.id, { hidden: !it.hidden })}
                      title={it.hidden ? (lang === 'pl' ? 'Pokaż na stronie' : 'Show on site') : (lang === 'pl' ? 'Ukryj na stronie' : 'Hide on site')}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${it.hidden ? 'text-neutral-300' : 'text-neutral-500 hover:text-black'}`}
                    >
                      {it.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <Input className="flex-1 min-w-0" placeholder={t('admin.label_en_ph')} value={it.label_en || ''} onChange={(e) => update(it.id, { label_en: e.target.value })} />
                <Input className="flex-1 min-w-0" placeholder={t('admin.label_pl_ph')} value={it.label_pl || ''} onChange={(e) => update(it.id, { label_pl: e.target.value })} />
                <Input className="flex-1 min-w-0" placeholder={t('admin.path_ph')} value={it.href || ''} onChange={(e) => update(it.id, { href: e.target.value })} />
                {!pinned && (
                  <button onClick={() => remove(it.id)} className="p-2 text-red-400 hover:text-red-600 sm:hidden"><Trash2 className="w-4 h-4" /></button>
                )}
                {!pinned && (
                  <button onClick={() => remove(it.id)} className="hidden sm:block p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            );
          })}
          {ordered.length === 0 && <p className="text-sm text-neutral-400 text-center py-12">{t('admin.no_nav_items')}</p>}
        </div>
      )}
    </div>
  );
}