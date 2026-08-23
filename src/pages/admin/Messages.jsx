import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, MailOpen, Archive, Trash2 } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { t } = useLang();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ContactMessage.list('-created_date', 200);
      setMessages(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id, isRead) => {
    await base44.entities.ContactMessage.update(id, { is_read: !isRead, status: !isRead ? 'read' : 'new' });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: !isRead, status: !isRead ? 'read' : 'new' } : m)));
  };

  const archive = async (id) => {
    await base44.entities.ContactMessage.update(id, { status: 'archived' });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'archived' } : m)));
  };

  const remove = async (id) => {
    if (!confirm(t('admin.confirm_delete_message'))) return;
    await base44.entities.ContactMessage.delete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const visible = messages.filter((m) => m.status !== 'archived');

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">{t('admin.messages_title')}</h1>
      <p className="text-sm text-neutral-500 mb-8">{visible.length} {t('admin.messages_count_suffix')}</p>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 border border-dashed rounded-2xl">
          <Mail className="w-10 h-10 mb-3" />
          <p className="text-sm">{t('admin.no_messages')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((m) => (
            <div key={m.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <button onClick={() => { setExpanded(expanded === m.id ? null : m.id); if (!m.is_read) markRead(m.id, false); }} className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 transition">
                {m.is_read ? <MailOpen className="w-4 h-4 text-neutral-400 shrink-0" /> : <Mail className="w-4 h-4 text-black shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    {!m.is_read && <span className="w-2 h-2 rounded-full bg-[#CBFF00]" />}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{m.subject || m.message}</p>
                </div>
                <span className="text-xs text-neutral-400 shrink-0 hidden sm:block">{m.email}</span>
              </button>
              {expanded === m.id && (
                <div className="px-4 pb-4 pt-1 border-t border-neutral-100">
                  <div className="flex flex-wrap gap-4 text-xs text-neutral-500 mb-3">
                    <span><strong className="text-neutral-700">{t('admin.email_label')}:</strong> {m.email}</span>
                     {m.phone && <span><strong className="text-neutral-700">{t('admin.phone_label')}:</strong> {m.phone}</span>}
                     {m.subject && <span><strong className="text-neutral-700">{t('admin.subject_label')}:</strong> {m.subject}</span>}
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">{m.message}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => markRead(m.id, m.is_read)}>{m.is_read ? t('admin.mark_unread') : t('admin.mark_read')}</Button>
                     <Button variant="outline" size="sm" onClick={() => archive(m.id)}><Archive className="w-3.5 h-3.5 mr-1" /> {t('admin.archive_btn')}</Button>
                     <Button variant="ghost" size="sm" className="text-red-500" onClick={() => remove(m.id)}><Trash2 className="w-3.5 h-3.5 mr-1" /> {t('admin.delete_btn')}</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}