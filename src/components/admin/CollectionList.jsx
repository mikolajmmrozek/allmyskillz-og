import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { getCollection } from '@/lib/entityRegistry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Copy, Trash2, Archive, Send, EyeOff, Loader2 } from 'lucide-react';

const statusColors = {
  draft: 'bg-neutral-200 text-neutral-600',
  published: 'bg-[#CBFF00] text-black',
  archived: 'bg-neutral-300 text-neutral-500',
  scheduled: 'bg-amber-200 text-amber-700',
  new: 'bg-[#CBFF00] text-black',
  read: 'bg-neutral-200 text-neutral-600',
};

export default function CollectionList({ entityName }) {
  const navigate = useNavigate();
  const { t, tr } = useLang();
  const col = getCollection(entityName);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities[entityName].list('-created_date', 200);
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [entityName]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    const matchesSearch = !search || col.list.some((f) => String(r[f] ?? '').toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id, status) => {
    await base44.entities[entityName].update(id, { status });
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const duplicate = async (rec) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = rec;
    await base44.entities[entityName].create({ ...rest, status: 'draft', slug: rest.slug ? `${rest.slug}-copy` : undefined });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this record permanently?')) return;
    await base44.entities[entityName].delete(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{col.key}</h1>
          <p className="text-sm text-neutral-500 mt-1">{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</p>
        </div>
        <Button onClick={() => navigate(`/admin/collection/${entityName}/new`)} className="bg-[#CBFF00] text-black hover:bg-[#CBFF00]/90 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1" /> {t('action.new')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input className="pl-9" placeholder={t('action.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {['all', 'draft', 'published', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md capitalize transition whitespace-nowrap ${statusFilter === s ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 border border-dashed rounded-2xl">
          <p className="text-lg font-medium">{t('empty.title')}</p>
          <p className="text-sm mt-1">{t('empty.subtitle')}</p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-x-auto bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {col.list.map((f) => (
                  <th key={f} className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">{f.replace(/_en$/, '').replace(/_/g, ' ')}</th>
                ))}
                <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition">
                  {col.list.map((f) => (
                    <td key={f} className="px-4 py-3 text-sm">
                      {f === 'status' ? (
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ${statusColors[r[f]] || 'bg-neutral-200'}`}>{r[f]}</span>
                      ) : f === 'featured' || f === 'is_digital' ? (
                        r[f] ? <span className="text-[#CBFF00]">●</span> : <span className="text-neutral-300">○</span>
                      ) : f === 'price' ? (
                        r[f] != null ? `${r[f]} ${r.currency || ''}`.trim() : '—'
                      ) : f === 'cover_image' || f === 'image' || f === 'logo_url' ? (
                        r[f] ? <img src={r[f]} className="w-10 h-10 object-cover rounded" alt="" /> : <span className="text-neutral-300">—</span>
                      ) : (
                        <span className="text-neutral-700">{String(r[f] ?? '—').slice(0, 60)}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/admin/collection/${entityName}/${r.id}`)} className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500" title={t('action.edit')}><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => duplicate(r)} className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500" title={t('action.duplicate')}><Copy className="w-4 h-4" /></button>
                      {r.status === 'draft' && <button onClick={() => updateStatus(r.id, 'published')} className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500" title={t('action.publish')}><Send className="w-4 h-4" /></button>}
                      {r.status === 'published' && <button onClick={() => updateStatus(r.id, 'draft')} className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500" title={t('action.unpublish')}><EyeOff className="w-4 h-4" /></button>}
                      <button onClick={() => updateStatus(r.id, 'archived')} className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500" title={t('action.archive')}><Archive className="w-4 h-4" /></button>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title={t('action.delete')}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}