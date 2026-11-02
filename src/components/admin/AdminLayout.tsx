// Admin console layout copied from the Creatr365 repo (src/components/admin/AdminLayout.tsx):
// collapsible icon sidebar, sticky top bar with eyebrow + title + actions, dark console, square corners.
// Nav items are iDEAS365's own back-office pages.
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, Newspaper, Shapes, LayoutTemplate, Tags, Route as RouteIcon, Inbox, Settings, LogOut, ExternalLink } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';
import { supabase, IS_MOCK } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const starts = (p: string) => (path: string) => path.startsWith(p);
/** Single source of truth for the back-office nav. */
const NAV_ITEMS = [
  { to: '/backoffice/islands', label: 'เกาะ · เนื้อหาในหน้า', icon: Map, match: (p: string) => p.startsWith('/backoffice/islands') || p.startsWith('/backoffice/sections') },
  { to: '/backoffice/articles', label: 'COMMUNITY · บทความ', icon: Newspaper, match: starts('/backoffice/articles') },
  { to: '/backoffice/item-types', label: 'ประเภทผลงาน', icon: Shapes, match: starts('/backoffice/item-types') },
  { to: '/backoffice/templates', label: 'แม่แบบเกาะ', icon: LayoutTemplate, match: starts('/backoffice/templates') },
];
/** Parts made for the earlier island pages; the live pages do not read them yet. */
const NAV_UNUSED = [
  { to: '/backoffice/tags', label: 'แท็ก', icon: Tags, match: starts('/backoffice/tags') },
  { to: '/backoffice/routes', label: 'เส้นทางสมัครงาน', icon: RouteIcon, match: starts('/backoffice/routes') },
  { to: '/backoffice/inquiries', label: 'ข้อความติดต่อ', icon: Inbox, match: starts('/backoffice/inquiries') },
  { to: '/backoffice/settings', label: 'ตั้งค่าเว็บ', icon: Settings, match: starts('/backoffice/settings') },
];

export function AdminLayout({ title, eyebrow = 'iDEAS365 · หลังบ้าน', actions, children }: {
  title: string; eyebrow?: string; actions?: ReactNode; children: ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signOut = async () => { await supabase.auth.signOut(); navigate('/backoffice/login'); };
  const group = (label: string, items: typeof NAV_ITEMS, dim = false) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white/30">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild isActive={item.match(pathname)} tooltip={item.label} className={cn(dim && 'text-white/45')}>
                <Link to={item.to}><item.icon /><span>{item.label}</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <SidebarProvider>
      <div className="admin-console-surface min-h-screen flex w-full bg-[#080808] text-white">
        <Sidebar collapsible="icon" className="border-white/8">
          <SidebarHeader className="px-3 py-4">
            <a href="/index.html" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-1">
              <span className="w-8 h-8 rounded-sm bg-[#D4A843] text-black font-bold text-sm flex items-center justify-center shrink-0">i</span>
              <span className="flex flex-col leading-tight overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-bold tracking-wide whitespace-nowrap">iDEAS365</span>
                <span className="text-[10px] text-white/35 uppercase tracking-[0.2em] whitespace-nowrap">Back Office</span>
              </span>
            </a>
          </SidebarHeader>
          <SidebarContent>
            {group('จัดการเนื้อหา', NAV_ITEMS)}
            {group('ยังไม่ได้ใช้กับหน้าเว็บตอนนี้', NAV_UNUSED, true)}
          </SidebarContent>
          <SidebarFooter className="px-2 pb-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ดูหน้าเว็บไซต์">
                  <a href="/index.html" target="_blank" rel="noopener noreferrer"><ExternalLink /><span>ดูหน้าเว็บไซต์</span></a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!IS_MOCK && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={signOut} tooltip="ออกจากระบบ"><LogOut /><span>ออกจากระบบ</span></SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-[#080808]">
          <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/8 bg-[#080808]/95 backdrop-blur px-4 sm:px-6 h-16 shrink-0">
            <SidebarTrigger className="text-white/50 hover:text-white hover:bg-white/8" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#D4A843] uppercase leading-none mb-1">{eyebrow}</p>
              <h1 className="text-lg font-bold truncate leading-tight">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </header>
          <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
            {IS_MOCK && (
              <div className="mb-4 border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-2 text-sm text-[#D4A843]">โหมดจำลอง: ยังไม่ได้เชื่อมฐานข้อมูล ดูหน้าตาได้ แต่บันทึกไม่ได้</div>
            )}
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/** Small inline message area used by every admin form (Creatr365 admin message style). */
export function Notice({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null;
  return (
    <div role="status" className={cn('mb-4 p-3 border text-sm', msg.ok
      ? 'bg-[#34A853]/15 border-[#34A853]/25 text-[#34A853]'
      : 'bg-[#CC0033]/15 border-[#CC0033]/30 text-[#FF6B7F]')}>{msg.text}</div>
  );
}
