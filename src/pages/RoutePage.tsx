import { Link, useParams } from 'react-router-dom';
import { getRouteBundle, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { BackFloat, Loading, NotFoundBlock, PageShell, PageTitle, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
import { ItemsDisplay } from '@/components/site/ItemViews';
import { ContactForm } from '@/components/site/ContactForm';
import type { DisplayStyle } from '@/lib/types';

/** The link you attach to a job application: only the work that matters for that job. */
export default function RoutePage() {
  const { route: slug = '' } = useParams();
  const { data, loading, error } = useLoad(() => Promise.all([getSettings(), getRouteBundle(slug)]), [slug]);
  if (loading) return <PageShell tone="paper"><Loading /></PageShell>;
  if (error) return <PageShell tone="paper"><p className="i365-error">โหลดไม่สำเร็จ: {error}</p></PageShell>;
  const [settings, bundle] = data!;
  if (!bundle) return <PageShell tone="paper"><SiteHeader settings={settings} /><NotFoundBlock /></PageShell>;
  const { route, variant, items, itemTypes } = bundle;
  const title = variant?.title_th ?? route.title_th;
  const headline = variant?.headline_th ?? route.headline_th;

  // group the picked work by the island it lives on, in the order you set
  const groups: { key: string; label: string; style: DisplayStyle; list: typeof items }[] = [];
  for (const it of items) {
    const key = it.section?.id ?? 'other';
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label: [it.island?.name_th, it.section?.name_th].filter(Boolean).join(' · '), style: it.section?.display_style ?? 'cards', list: [] };
      groups.push(g);
    }
    g.list.push(it);
  }

  return (
    <PageShell theme={{ preset: 'blog' }}>
      <SiteHeader settings={settings} />
      <PageTitle title={title} subtitle="โปรไฟล์สำหรับตำแหน่งนี้" />
      <main className="i365-content i365-route">
        <div className="i365-content-card i365-reveal">
          {headline && <p className="i365-lead">{headline}</p>}
          {route.summary_th && <p>{route.summary_th}</p>}
          <div className="i365-route-actions">
            {route.resume_url && <a className="i365-big-btn" href={route.resume_url} target="_blank" rel="noreferrer">ดาวน์โหลดเรซูเม่ ↓</a>}
            <Link className="i365-big-btn is-ghost" to="/i/profile">ดูโปรไฟล์เต็ม</Link>
          </div>
        </div>
        {groups.length === 0 && <div className="i365-content-card"><p>ยังไม่ได้เลือกผลงานให้เส้นทางนี้</p></div>}
        {groups.map((g) => (
          <section key={g.key} className={`i365-content-card i365-display-${g.style} i365-reveal`}>
            <h2 className="i365-col-title"><span className="i365-sweep-title">{g.label}</span></h2>
            <ItemsDisplay
              style={g.style}
              items={g.list}
              type={itemTypes.find((t) => t.id === g.list[0].item_type_id) ?? null}
              tagsFor={() => []}
              showTags={false}
            />
          </section>
        ))}
        <section className="i365-content-card i365-reveal">
          <h2 className="i365-col-title"><span className="i365-sweep-title">ติดต่อ</span></h2>
          <ContactForm settings={settings} sourceRoute={slug} />
        </section>
      </main>
      <SiteFooter settings={settings} />
      <BackFloat settings={settings} to="/" label="แผนที่หลัก" />
    </PageShell>
  );
}
