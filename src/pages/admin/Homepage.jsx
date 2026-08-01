import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import CollectionEditor from '@/components/admin/CollectionEditor';
import { Loader2 } from 'lucide-react';

// Singleton wrapper: finds the single HomepageConfig record (or lets the editor create it)
export default function Homepage() {
  const [recordId, setRecordId] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const items = await base44.entities.HomepageConfig.list('-created_date', 1);
        if (items.length > 0) setRecordId(items[0].id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight mb-1">Homepage</h1>
      <p className="text-sm text-neutral-500 mb-8">Hero, intro, featured projects & workshop announcements.</p>
      <CollectionEditor entityName="HomepageConfig" recordId={recordId} onSaved={(rec) => setRecordId(rec.id)} />
    </div>
  );
}