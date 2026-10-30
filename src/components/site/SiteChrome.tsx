import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { SiteSettings } from '@/lib/types';
import { SafeImg } from './SafeImg';

export function SiteHeader({ settings, back }: { settings: SiteSettings | null; back?: { to: string; label: string } }) {
  return (
    <header className="i365-header">
      <Link to="/" className="i365-logo" aria-label="iDEAS365 หน้าแรก">
        <SafeImg src={settings?.logo} alt="iDEAS365" fallback={<span>iDEAS365</span>} />
      </Link>
      {back && (
        <Link to={back.to} className="i365-back">
          <span aria-hidden="true">←</span> {back.label}
        </Link>
      )}
    </header>
  );
}

export function PageShell({ children, tone = 'sea' }: { children: ReactNode; tone?: 'sea' | 'paper' }) {
  return <div className={`i365-page i365-page-${tone}`}>{children}</div>;
}

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  return (
    <footer className="i365-footer">
      <span>© {new Date().getFullYear()} iDEAS365 · Jenjira Jaisin</span>
      {settings?.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}
    </footer>
  );
}

export function Loading() {
  return <div className="i365-loading" role="status"><span className="i365-spinner" />กำลังโหลด…</div>;
}

export function NotFoundBlock({ message = 'ไม่พบหน้านี้' }: { message?: string }) {
  return (
    <div className="i365-empty">
      <p>{message}</p>
      <Link to="/" className="i365-pill">กลับแผนที่หลัก</Link>
    </div>
  );
}
