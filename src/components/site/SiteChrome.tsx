import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { SiteSettings } from '@/lib/types';
import { resolveTheme, themeVars, type IslandTheme } from '@/lib/themes';
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

/**
 * Page wrapper. With a theme the page takes the island's colours (old island pages:
 * solid colour page, white/black cards, Anton titles); without one it keeps the sea/paper look.
 */
export function PageShell({ children, tone = 'sea', theme }: { children: ReactNode; tone?: 'sea' | 'paper'; theme?: IslandTheme | null }) {
  if (theme !== undefined) {
    const preset = resolveTheme(theme).preset;
    return <div className={`i365-page i365-themed i365-theme-${preset}`} style={themeVars(theme)}>{children}</div>;
  }
  return <div className={`i365-page i365-page-${tone}`}>{children}</div>;
}

/** Big Anton title like ABOUT / ISLAND on the old pages; hover sweeps the colour across. */
export function PageTitle({ title, subtitle }: { title: string; subtitle?: string | null }) {
  const words = title.trim().split(/\s+/);
  return (
    <div className="i365-hero">
      <h1 className="i365-page-title">
        {words.map((w, i) => <span key={i} className="i365-sweep-page">{w}</span>)}
      </h1>
      {subtitle && <p className="i365-page-subtitle">{subtitle}</p>}
    </div>
  );
}

/** Footer from the old pages: J Y N E in the four brand colours, "Smart Lazy Style". */
export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  return (
    <footer className="i365-site-footer">
      <p className="i365-footer-brand">
        <span className="dot-r">J</span><span className="dot-g">Y</span><span className="dot-b">N</span><span className="dot-y">E</span>
        &nbsp;:&nbsp;iDEAS365
      </p>
      <p className="i365-footer-tagline">Smart Lazy Style</p>
      {settings?.contact_email && <p className="i365-footer-mail"><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></p>}
      <p className="i365-footer-copy">© {new Date().getFullYear()} All right reserved &nbsp;|&nbsp; Created by iDEAS365 x Generative AI</p>
    </footer>
  );
}

/** Fixed back button at the bottom right, using the BACK picture from the old site when set. */
export function BackFloat({ settings, to, label }: { settings: SiteSettings | null; to: string; label: string }) {
  return (
    <Link to={to} className="i365-back-float" aria-label={`กลับ: ${label}`}>
      <SafeImg src={settings?.back_button} alt="" fallback={<span className="i365-back-float-text">← {label}</span>} />
    </Link>
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
