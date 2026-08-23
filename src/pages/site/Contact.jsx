import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useSite } from '@/components/site/SiteProvider';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';
import TikTokIcon from '@/components/site/TikTokIcon';

export default function Contact() {
  const { lang, tr, t } = useLang();
  const { settings } = useSite();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const socials = [
    { url: settings?.instagram, icon: Instagram },
    { url: settings?.linkedin, icon: Linkedin },
    { url: settings?.youtube, icon: Youtube },
    { url: settings?.facebook, icon: Facebook },
    { url: settings?.tiktok, icon: TikTokIcon },
  ].filter((s) => s.url);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await base44.entities.ContactMessage.create(form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-5 md:px-10 pt-16 md:pt-24 pb-20 grid md:grid-cols-2 gap-12">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">{t('site.contact')}</p>
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[12vw] md:text-[7vw] lg:text-[6.5rem]">
          {t('site.getInTouch')}
        </h1>
        <div className="mt-10 rounded-2xl bg-[#CBFF00] p-6 md:p-8 text-black">
          <div className="space-y-3 text-sm">
            {settings?.email && <p><a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a></p>}
            {settings?.phone && <p><a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a></p>}
            {tr(settings, 'address') && <p className="text-black/70">{tr(settings, 'address')}</p>}
          </div>
          {socials.length > 0 && (
            <div className="flex gap-3 mt-5">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#CBFF00] hover:bg-black/80 transition">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        {sent ? (
          <div className="rounded-2xl bg-[var(--accent,#CBFF00)] p-8">
            <p className="font-display text-2xl tracking-tight">{t('site.sent')}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('site.name')} required>
                <Input value={form.name} onChange={set('name')} required />
              </Field>
              <Field label={t('site.email')} required>
                <Input type="email" value={form.email} onChange={set('email')} required />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('site.phone')}>
                <Input value={form.phone} onChange={set('phone')} />
              </Field>
              <Field label={t('site.subject')}>
                <Input value={form.subject} onChange={set('subject')} />
              </Field>
            </div>
            <Field label={t('site.message')} required>
              <Textarea value={form.message} onChange={set('message')} rows={6} required />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={sending} className="rounded-full px-6">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t('site.sendMessage')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-2 block">
      {label}{required && ' *'}
    </span>
    {children}
  </label>
);