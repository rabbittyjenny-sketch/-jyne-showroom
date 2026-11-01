import { useParams } from 'react-router-dom';
import { getRouteBundle, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { CONTACT_PAGE, LegacyCard, LegacyItems, LegacyShell, PROFILE_PAGE } from '@/legacy/Legacy';
import type { DisplayStyle, Item, Section } from '@/lib/types';

function Plain({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans Thai', sans-serif" }}>{children}</div>;
}

/** The link attached to a job application: only the work that matters for that job, in the About Island look. */
export default function RoutePage() {
  const { route: slug = '' } = useParams();
  const { data, loading, error } = useLoad(() => Promise.all([getSettings(), getRouteBundle(slug)]), [slug]);
  if (loading) return <Plain>กำลังโหลด…</Plain>;
  if (error) return <Plain>โหลดไม่สำเร็จ: {error}</Plain>;
  const [settings, bundle] = data!;
  if (!bundle) return <Plain><a href="/">ไม่พบหน้านี้ · กลับแผนที่</a></Plain>;
  const { route, variant, items, itemTypes } = bundle;
  const titleEn = variant?.title_en ?? route.title_en ?? route.title_th;
  const headline = variant?.headline_th ?? route.headline_th;

  const groups: { key: string; section: Pick<Section, 'name_en' | 'name_th'>; label: string; style: DisplayStyle; list: Item[] }[] = [];
  for (const it of items) {
    const key = it.section?.id ?? 'other';
    let g = groups.find((x) => x.key === key);
    if (!g) {
      const sec = { name_en: it.section?.name_en ?? null, name_th: it.section?.name_th ?? '' };
      g = { key, section: sec, label: [it.island?.name_th, it.section?.name_th].filter(Boolean).join(' · '), style: it.section?.display_style ?? 'cards', list: [] };
      groups.push(g);
    }
    g.list.push(it);
  }

  return (
    <LegacyShell theme={{ preset: 'about' }} settings={settings} title={titleEn.replace(/·/g, ' ')} subtitle={variant?.title_th ?? route.title_th} back="/">
      <LegacyCard family="card" title="PROFILE · โปรไฟล์" desc={headline}>
        {route.summary_th && <p className="col-desc">{route.summary_th}</p>}
        <div className="big-btn-row">
          {route.resume_url && <a className="big-btn" href={route.resume_url} target="_blank" rel="noreferrer">RESUME ↓</a>}
          <a className="big-btn" href={PROFILE_PAGE}>ABOUT JYNE</a>
        </div>
      </LegacyCard>
      {groups.map((g) => (
        <LegacyCard key={g.key} family="card" title={g.label}>
          <LegacyItems style={g.style} items={g.list} type={itemTypes.find((t) => t.id === g.list[0].item_type_id) ?? null} family="card" section={g.section} />
        </LegacyCard>
      ))}
      <div className="content-card single">
        <div style={{ textAlign: 'center' }}>
          <a className="big-btn" style={{ display: 'inline-block', padding: '14px 40px' }} href={CONTACT_PAGE}>ติดต่อ →</a>
        </div>
      </div>
    </LegacyShell>
  );
}
