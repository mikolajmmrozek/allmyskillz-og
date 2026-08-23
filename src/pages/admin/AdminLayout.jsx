import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/i18n';
import { collections, collectionGroups, getCollection } from '@/lib/entityRegistry';
import { LayoutDashboard, Image, Settings, Mail, Menu, LogOut, Globe, ExternalLink, ChevronRight, X } from 'lucide-react';
import { SiteLogo } from '@/components/site/SiteLogo';
import { ARTIST_NAME } from '@/lib/brand';

const ICON_MAP = { LayoutDashboard, Image, Settings, Mail, Menu };

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0C0C0C] border-b border-neutral-800">
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300"><Menu className="w-5 h-5" /></button>
        <span className="font-semibold text-white text-sm tracking-tight">{ARTIST_NAME}</span>
        <button onClick={() => setLang(lang === 'en' ? 'pl' : 'en')} className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300"><Globe className="w-4 h-4" /></button>
      </div>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />}
      {/* Sidebar */}
      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'lg:w-16' : 'lg:w-64'} w-64 shrink-0 border-r border-neutral-800/80 flex flex-col transition-all duration-300 bg-[#0C0C0C] fixed lg:sticky top-0 h-screen z-50 lg:z-auto`}>
        <div className="p-4 flex items-center gap-2 border-b border-neutral-800/80">
          <SiteLogo size={32} tone="light" className="shrink-0" />
          {!collapsed && <span className="font-semibold text-white tracking-tight">{ARTIST_NAME}</span>}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1 rounded hover:bg-neutral-800 text-neutral-500"><X className="w-4 h-4" /></button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block ml-auto p-1 rounded hover:bg-neutral-800 text-neutral-500">
            <ChevronRight className={`w-4 h-4 transition ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3" onClick={() => setMobileOpen(false)}>
          <SidebarLink to="/admin" icon={LayoutDashboard} label={t('nav.dashboard')} collapsed={collapsed} end />
          <SidebarLink to="/admin/media" icon={Image} label={t('nav.media')} collapsed={collapsed} />
          <SidebarLink to="/admin/messages" icon={Mail} label={t('nav.messages')} collapsed={collapsed} />
          <SidebarLink to="/admin/navigation" icon={Menu} label={t('nav.navigation')} collapsed={collapsed} />

          {collectionGroups.map((group) => {
            // Collections with dedicated pages are linked above/in singletons — skip them here
            const dedicated = ['MediaItem', 'ContactMessage', 'NavigationItem'];
            const cols = collections.filter((c) => c.group === group.id && !dedicated.includes(c.key));
            if (cols.length === 0) return null;
            return (
              <div key={group.id} className="mt-4">
                {!collapsed && <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">{group[`label_${lang}`] || group.label_en}</p>}
                {cols.map((c) => {
                  const Icon = c.icon;
                  return (
                    <NavLink
                      key={c.key}
                      to={c.singleton ? `/admin/${c.key === 'SiteSetting' ? 'settings' : c.key === 'HomepageConfig' ? 'homepage' : c.key.toLowerCase()}` : `/admin/collection/${c.key}`}
                      className={({ isActive }) => `flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm transition ${isActive ? 'bg-[#CBFF00] text-black font-medium' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="truncate">{lang === 'pl' ? (c.label_pl || c.key) : c.key}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-800/80 space-y-2">
          <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
            <button onClick={() => setLang(lang === 'en' ? 'pl' : 'en')} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300">
              <Globe className="w-3.5 h-3.5" />
              {!collapsed && <span className="uppercase">{lang}</span>}
            </button>
            <Link to="/" target="_blank" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300">
              <ExternalLink className="w-3.5 h-3.5" />
              {!collapsed && <span>{t('admin.view_site')}</span>}
            </Link>
          </div>
          <div className={`flex items-center gap-2 pt-1 ${collapsed ? 'flex-col' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium text-white shrink-0">
              {(user?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-300 truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-neutral-600 truncate">{user?.email}</p>
              </div>
            )}
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500" title={t('admin.logout')}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 bg-[#FDFDFD] text-neutral-900 overflow-x-hidden pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, collapsed, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm transition ${isActive ? 'bg-[#CBFF00] text-black font-medium' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}