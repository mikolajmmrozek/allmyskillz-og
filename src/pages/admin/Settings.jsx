import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import CollectionEditor from '@/components/admin/CollectionEditor';
import { Loader2 } from 'lucide-react';
import { useLang } from '@/lib/i18n';

// Singleton wrapper: finds the single SiteSetting record (or lets the editor create it)
export default function Settings() {
  const [recordId, setRecordId] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    (async () => {
      try {
        const items = await base44.entities.SiteSetting.list('-created_date', 1);
        if (items.length > 0) setRecordId(items[0].id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight mb-1">{t('admin.settings_title')}</h1>
      <p className="text-sm text-neutral-500 mb-8">{t('admin.settings_desc')}</p>
      <CollectionEditor entityName="SiteSetting" recordId={recordId} onSaved={(rec) => setRecordId(rec.id)} />
    </div>
  );
}