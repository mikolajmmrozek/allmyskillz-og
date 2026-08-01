import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function Navigation() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((it, i) => { it.sort_order = i; });
    setItems(next);
    await Promise.all(next.map((it) => base44.entities.NavigationItem.update(it.id, { sort_order: it.sort_order })));
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Navigation</h1>
          <p className="text-sm text-neutral-500 mt-1">Drag-free reorder with up/down controls.</p>
        </div>
        <Button onClick={add} className="bg-[#CBFF00] text-black hover:bg-[#CBFF00]/90"><Plus className="w-4 h-4 mr-1" /> Add link</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
      ) : (
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={it.id} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl p-2">
              <div className="flex flex-col">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
              </div>
              <Input className="flex-1" placeholder="Label (EN)" value={it.label_en || ''} onChange={(e) => update(it.id, { label_en: e.target.value })} />
              <Input className="flex-1" placeholder="Label (PL)" value={it.label_pl || ''} onChange={(e) => update(it.id, { label_pl: e.target.value })} />
              <Input className="flex-1" placeholder="/path" value={it.href || ''} onChange={(e) => update(it.id, { href: e.target.value })} />
              <button onClick={() => remove(it.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-neutral-400 text-center py-12">No navigation items yet.</p>}
        </div>
      )}
    </div>
  );
}