// Public pages of the NEW islands, built with the exact markup and CSS of the original island
// pages (classes come from src/legacy/legacy.css, copied verbatim from about_island.html,
// work_marina.html, work_town.html, learning_bay.html, system_district.html, blog.html,
// contact_port.html). Nothing here restyles the originals; it reuses them.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { parseYouTubeId, youTubeThumb } from '@/lib/youtube';
import { recordDownload } from '@/lib/data';
import { resolveTheme, themeVars, type IslandTheme, type ThemePresetKey } from '@/lib/themes';
import type { DisplayStyle, FeedEntry, FieldDef, Item, ItemType, Section, SiteSettings } from '@/lib/types';

export const PAGE_LOGO = 'https://ik.imagekit.io/ideas365logo/ideas365-logo.png?updatedAt=1771192801056';
export const BACK_IMG = 'https://ik.imagekit.io/ideas365logo/BACK%20(1)%20(1).png?updatedAt=1773177420277';
export const CONTACT_PAGE = '/contact_port.html';
export const PROFILE_PAGE = '/about_island.html';

type Family = 'card' | 'works' | 'blog';
const FAMILY: Record<ThemePresetKey, Family> = {
  about: 'card', marina: 'card', learning: 'card', district: 'card', contact: 'card', works: 'works', blog: 'blog',
};
export const familyOf = (theme?: IslandTheme | null) => FAMILY[resolveTheme(theme).preset];

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const lines = (v: unknown) => str(v).split('\n').map((s) => s.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

/** Same reveal as the original pages: cards fade up when they scroll into view. */
function useReveal(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => { if (e.isIntersecting) window.setTimeout(() => e.target.classList.add('in-view'), i * 60); });
    }, { threshold: 0.08 });
    const watch = () => root.querySelectorAll('.content-card:not(.in-view)').forEach((c) => io.observe(c));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [ref]);
}

/** Header, big title, footer and BACK button exactly as on the original pages. */
export function LegacyShell({
  theme, settings, title, subtitle, back, children,
}: {
  theme?: IslandTheme | null; settings: SiteSettings | null; title: string; subtitle?: string | null;
  back: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const preset = resolveTheme(theme).preset;
  const fam = FAMILY[preset];
  const words = title.trim().toUpperCase().split(/\s+/);
  const heading = <>{words.map((w, i) => <span key={i}>{i > 0 && <br />}{w}</span>)}</>;

  useEffect(() => { document.title = `${title} - iDEAS365`; }, [title]);

  return (
    <div ref={ref} className={`lg lg-${preset}`} style={themeVars(theme)}>
      <header className="nav-header">
        <a href="/"><img src={PAGE_LOGO} alt="iDEAS365" className="logo-img" /></a>
      </header>
      {fam === 'works' ? (
        <>
          <div className="hero">
            <h1 className="page-title">{heading}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          <main className="main-content">{children}</main>
        </>
      ) : (
        <main className="main-content">
          {/* Blog Harbor's title is dark on white: no white sweep there (same as blog.html) */}
          <h1 className={fam === 'blog' ? 'page-title' : 'page-title hover-white'}>{heading}</h1>
          {subtitle && <p className={fam === 'blog' ? 'page-subtitle' : 'page-subtitle hover-white'}>{subtitle}</p>}
          {children}
        </main>
      )}
      <footer className="site-footer">
        <p className="footer-brand">
          <span className="dot-r">J</span><span className="dot-g">Y</span><span className="dot-b">N</span><span className="dot-y">E</span>
          &nbsp;:&nbsp;iDEAS365
        </p>
        <p className="footer-tagline">Smart Lazy Style</p>
        <p className="footer-copy">© 2026 All right reserved &nbsp;|&nbsp; Created by iDEAS365 x Generative AI</p>
      </footer>
      <a href={back} className="back-fixed">
        <img src={settings?.back_button || BACK_IMG} alt="Back" />
      </a>
    </div>
  );
}

/** One block of content: content-card (card pages), section-card (Works Town). */
export function LegacyCard({ family, title, desc, children, single = true }: {
  family: Family; title: string; desc?: string | null; children: ReactNode; single?: boolean;
}) {
  if (family === 'works') {
    return (
      <div className="section-card">
        <div className="section-head">
          <div className="section-title">{title}</div>
          {desc && <div className="section-sub">{desc}</div>}
        </div>
        {children}
      </div>
    );
  }
  return (
    <div className={`content-card${single ? ' single' : ''}`}>
      <div>
        <h2 className="col-title">{title}</h2>
        {desc && <p className="col-desc">{desc}</p>}
        {children}
      </div>
    </div>
  );
}

export const cardTitle = (s: { name_en?: string | null; name_th: string }) =>
  s.name_en && s.name_en !== s.name_th ? `${s.name_en} · ${s.name_th}` : s.name_th;

function YtPlay() {
  return (
    <div className="yt-play">
      <svg viewBox="0 0 68 48">
        <path d="M66.5 7.7c-.8-2.9-3-5.2-5.9-6C55.8 0 34 0 34 0S12.2 0 7.4 1.6c-2.9.8-5.1 3.1-5.9 6C0 12.5 0 24 0 24s0 11.5 1.5 16.3c.8 2.9 3 5.2 5.9 6C12.2 48 34 48 34 48s21.8 0 26.6-1.6c2.9-.8 5.1-3.1 5.9-6C68 35.5 68 24 68 24S68 12.5 66.5 7.7z" fill="#f00" />
        <path d="M45 24 27 14v20" fill="#fff" />
      </svg>
    </div>
  );
}

/** The picture of an item: cover, first image field, or video thumbnail. */
export function itemPicture(item: Item, type: ItemType | null): string | null {
  if (item.cover_image) return item.cover_image;
  for (const f of type?.fields ?? []) {
    const v = str(item.data[f.key]);
    if (!v) continue;
    if (f.type === 'image') return v;
    if (f.type === 'video') { const id = parseYouTubeId(v); if (id) return youTubeThumb(id); }
  }
  return null;
}

const linkOf = (item: Item, fields: FieldDef[]) => {
  for (const f of fields) if ((f.type === 'url' || f.type === 'file' || f.type === 'video') && str(item.data[f.key])) return str(item.data[f.key]);
  return null;
};

const BADGE: Record<string, { cls: string; label: string }> = {
  free: { cls: 'badge-ai', label: 'Free Tool' },
  pro: { cls: 'badge-sys', label: 'System Dev' },
  design_work: { cls: 'badge-creative', label: 'Creative' },
  default: { cls: 'badge-biz', label: 'Project' },
};
const BLOG_COLOURS = ['blue', 'yellow', 'green', 'red', 'dark'];

function DownloadBtn({ item, url, mode, className }: { item: Item; url: string; mode: string; className: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  if (mode !== 'email') return <a className={className} href={url} target="_blank" rel="noreferrer">Download <span>↓</span></a>;
  if (!open) return <button className={className} onClick={() => setOpen(true)}>Download <span>↓</span></button>;
  return (
    <form className="lg-dl" onSubmit={async (e) => {
      e.preventDefault();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr('กรอกอีเมลให้ถูกต้อง'); return; }
      try { await recordDownload(item.id, email, ''); window.open(url, '_blank', 'noopener'); setOpen(false); }
      catch (x) { setErr(x instanceof Error ? x.message : 'ส่งไม่สำเร็จ'); }
    }}>
      <input type="email" placeholder="อีเมล" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} />
      <button className={className}>รับไฟล์ ↓</button>
      {err && <span className="lg-err">{err}</span>}
    </form>
  );
}

/** Items of a section in the original pages' markup. */
export function LegacyItems({ style, items, type, family, section }: {
  style: DisplayStyle; items: Item[]; type: ItemType | null; family: Family; section: Pick<Section, 'name_en' | 'name_th'>;
}) {
  const fields = type?.fields ?? [];
  if (!items.length) return <p className="col-desc" style={{ color: '#888' }}>ยังไม่มีผลงานในส่วนนี้</p>;

  if (style === 'video_grid') {
    return (
      <div className="video-grid">
        {items.map((it) => {
          const url = linkOf(it, fields) ?? '';
          const id = parseYouTubeId(url);
          return (
            <a key={it.id} href={url} target="_blank" rel="noreferrer" className="video-wrap" title={it.title_th}>
              {id ? <img src={youTubeThumb(id)} loading="lazy" alt={it.title_th} /> : null}
              <YtPlay />
            </a>
          );
        })}
      </div>
    );
  }

  if (style === 'gallery') {
    return (
      <div className="proof-grid-work">
        {items.map((it) => {
          const pic = itemPicture(it, type);
          return pic ? <img key={it.id} src={pic} alt={it.title_th} loading="lazy" /> : null;
        })}
      </div>
    );
  }

  if (style === 'timeline') {
    return (
      <>
        {items.map((it) => (
          <div key={it.id} className="tl-item">
            {(str(it.data.period_th) || str(it.data.start)) && <div className="tl-year">{str(it.data.period_th) || `${str(it.data.start)} — ${str(it.data.end) || 'ปัจจุบัน'}`}</div>}
            <div className="tl-role">{str(it.data.role) || it.title_th}</div>
            {str(it.data.organization) && <div className="tl-place">{str(it.data.organization)}</div>}
            {lines(it.data.highlights_th).map((l, i) => <div key={i} className="tl-desc">- {l}</div>)}
          </div>
        ))}
      </>
    );
  }

  if (style === 'text') {
    return (
      <>
        {items.map((it) => (
          <div key={it.id}>
            <p className="col-desc"><strong style={{ fontSize: '1.05rem' }}>{it.title_th}</strong></p>
            {lines(it.data.body_th).map((p, i) => /^["“]/.test(p)
              ? <p key={i} className="col-desc" style={{ background: '#f9f0ec', borderLeft: '3px solid var(--accent)', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontStyle: 'italic' }}>{p}</p>
              : <p key={i} className="col-desc">{p}</p>)}
          </div>
        ))}
      </>
    );
  }

  if (style === 'detail') {
    return (
      <>
        {items.map((it) => (
          <div key={it.id} style={{ marginBottom: 24 }}>
            <p className="col-desc"><strong style={{ fontSize: '1.05rem' }}>{it.title_th}</strong></p>
            {it.summary_th && <p className="col-desc">{it.summary_th}</p>}
            {fields.map((f) => {
              const v = it.data[f.key];
              if (!str(v) || f.type === 'image') return null;
              if (f.type === 'textarea' && /result/i.test(f.key)) {
                return <div key={f.key} className="cs-pills">{lines(v).map((l, i) => <span key={i} className="cs-pill">✦ {l}</span>)}</div>;
              }
              if (f.type === 'textarea') return <ul key={f.key} className="hl" style={{ marginTop: 12 }}>{lines(v).map((l, i) => <li key={i}>{l}</li>)}</ul>;
              if (f.type === 'url' || f.type === 'file') return <p key={f.key} className="col-desc"><a href={str(v)} target="_blank" rel="noreferrer">{f.label_th} ↗</a></p>;
              return <p key={f.key} className="col-desc"><strong>{f.label_en || f.label_th}:</strong> {str(v)}</p>;
            })}
          </div>
        ))}
      </>
    );
  }

  if (style === 'list') {
    const fileKey = fields.find((f) => f.type === 'file')?.key ?? '';
    if (family === 'card') {
      return (
        <div className="res-grid ext-cards">
          {items.map((it) => (
            <div key={it.id} className="ext-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div className="ext-card-title">{it.title_th}</div>
              {it.summary_th && <div className="ext-card-sub">{it.summary_th}</div>}
              {str(it.data[fileKey]) && <DownloadBtn item={it} url={str(it.data[fileKey])} mode={str(it.data.download_mode)} className="big-btn" />}
            </div>
          ))}
        </div>
      );
    }
  }

  // cards (and list/feed on Works/Blog pages)
  if (family === 'works') {
    return (
      <div className="ai-grid">
        {items.map((it) => {
          const url = linkOf(it, fields);
          const badge = BADGE[str(it.data.tool_kind)] ?? (type?.slug ? BADGE[type.slug] : null) ?? BADGE.default;
          const pic = itemPicture(it, type);
          const inner = (
            <>
              {pic ? (
                <div className="ai-cover"><img src={pic} alt="" loading="lazy" /><div className="ai-badge-chip"><span className={`badge ${badge.cls}`}>{badge.label}</span></div></div>
              ) : (
                <div className="ai-cover-placeholder">◆<div className="ai-badge-chip" style={{ position: 'absolute', top: 10, right: 10 }}><span className={`badge ${badge.cls}`}>{badge.label}</span></div></div>
              )}
              <div className="ai-body">
                <div className="ai-title-en">{it.title_en || it.title_th}</div>
                {it.title_en && <div className="ai-title-th">{it.title_th}</div>}
                <div className="ai-desc">{it.summary_th ?? ''}</div>
              </div>
              {url && <div className="ai-footer"><span className="ai-cta">VIEW PROJECT →</span></div>}
            </>
          );
          return url
            ? <a key={it.id} className="ai-card" href={url} target="_blank" rel="noreferrer">{inner}</a>
            : <div key={it.id} className="ai-card">{inner}</div>;
        })}
      </div>
    );
  }

  if (family === 'blog') {
    return (
      <div className="blog-grid">
        {items.map((it, i) => {
          const url = linkOf(it, fields) ?? '#';
          const pic = itemPicture(it, type);
          const meta = [str(it.data.tools), str(it.data.platforms)].filter(Boolean).join(' · ');
          return (
            <a key={it.id} href={url} className="blog-card" data-color={BLOG_COLOURS[i % BLOG_COLOURS.length]} target={url === '#' ? undefined : '_blank'} rel="noopener">
              {pic && <div className="photo-slot photo-slot-wide" style={{ marginBottom: 16 }}><img src={pic} alt="" loading="lazy" /></div>}
              <div className="tag">{section.name_en || section.name_th}</div>
              <h2>{(it.title_en || it.title_th).toUpperCase()}</h2>
              {(it.summary_th || str(it.data.role_th)) && <p>{it.summary_th || str(it.data.role_th)}</p>}
              <div className="blog-meta">{meta} &nbsp;<strong>{url === '#' ? '' : 'View →'}</strong></div>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="ext-cards">
      {items.map((it) => {
        const url = linkOf(it, fields);
        return (
          <a key={it.id} className="ext-card" href={url ?? undefined} target="_blank" rel="noreferrer">
            <div>
              <div className="ext-card-title">{it.title_th}</div>
              {it.summary_th && <div className="ext-card-sub">{it.summary_th}</div>}
            </div>
            {url && <span>↗</span>}
          </a>
        );
      })}
    </div>
  );
}

/** Articles / templates pulled from Creatr365, in the Blog page's card. */
export function LegacyFeed({ entries, family }: { entries: FeedEntry[]; family: Family }) {
  if (!entries.length) return <p className="col-desc" style={{ color: '#888' }}>ยังไม่มีรายการ</p>;
  if (family === 'blog') {
    return (
      <div className="blog-grid">
        {entries.map((e, i) => (
          <a key={e.id} href={e.href} className="blog-card" data-color={BLOG_COLOURS[i % BLOG_COLOURS.length]} target="_blank" rel="noopener">
            <div className="tag">Creatr365</div>
            <h2>{e.title.toUpperCase()}</h2>
            {e.summary && <p>{e.summary}</p>}
            <div className="blog-meta">&nbsp;<strong>Read Article →</strong></div>
          </a>
        ))}
      </div>
    );
  }
  return (
    <div className="ext-cards">
      {entries.map((e) => (
        <a key={e.id} className="ext-card" href={e.href} target="_blank" rel="noreferrer">
          <div><div className="ext-card-title">{e.title}</div>{e.summary && <div className="ext-card-sub">{e.summary}</div>}</div>
          <span>↗</span>
        </a>
      ))}
    </div>
  );
}
