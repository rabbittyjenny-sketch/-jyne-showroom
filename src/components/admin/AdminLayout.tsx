import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase, IS_MOCK } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/backoffice/islands', label: 'จัดการเกาะ' },
  { to: '/backoffice/item-types', label: 'ประเภทผลงาน' },
  { to: '/backoffice/tags', label: 'แท็ก' },
  { to: '/backoffice/routes', label: 'เส้นทางสมัครงาน' },
  { to: '/backoffice/inquiries', label: 'ข้อความติดต่อ' },
  { to: '/backoffice/templates', label: 'แม่แบบเกาะ' },
  { to: '/backoffice/settings', label: 'ตั้งค่าเว็บ' },
];

export function AdminLayout({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-muted/30 text-foreground i365-admin">
      <aside className="w-56 shrink-0 border-r bg-background p-4 flex flex-col gap-1">
        <div className="font-semibold mb-4">iDEAS365 · หลังบ้าน</div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => cn('rounded-md px-3 py-2 text-sm hover:bg-muted', isActive && 'bg-muted font-medium')}>
            {n.label}
          </NavLink>
        ))}
        <div className="mt-auto pt-4 flex flex-col gap-2 text-sm">
          <a href="/" target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md hover:bg-muted">ดูหน้าเว็บ ↗</a>
          {!IS_MOCK && (
            <button className="px-3 py-2 rounded-md hover:bg-muted text-left" onClick={async () => { await supabase.auth.signOut(); navigate('/backoffice/login'); }}>
              ออกจากระบบ
            </button>
          )}
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6">
        {IS_MOCK && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            โหมดจำลอง: ยังไม่ได้เชื่อมฐานข้อมูล ดูหน้าตาได้ แต่บันทึกไม่ได้
          </div>
        )}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex gap-2">{actions}</div>
        </div>
        {children}
      </main>
    </div>
  );
}

/** Small inline message area used by every admin form. */
export function Notice({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null;
  return <p className={cn('text-sm rounded-md px-3 py-2', msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>{msg.text}</p>;
}
