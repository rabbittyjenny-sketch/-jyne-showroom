import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIslandWithSections, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { MapStage } from '@/components/site/MapStage';
import { Link } from 'react-router-dom';
import { BackFloat, Loading, NotFoundBlock, PageShell, PageTitle, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
import { ContactForm } from '@/components/site/ContactForm';
import type { Island } from '@/lib/types';

/** "Taking you to …" page for islands that point to another site (Academy, systems work). */
function RedirectIsland({ island }: { island: Island }) {
  const [left, setLeft] = useState(Math.ceil(island.redirect_delay_ms / 1000));
  useEffect(() => {
    if (!island.redirect_url) return;
    const go = window.setTimeout(() => window.location.assign(island.redirect_url!), island.redirect_delay_ms);
    const tick = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => { window.clearTimeout(go); window.clearInterval(tick); };
  }, [island.redirect_url, island.redirect_delay_ms]);
  return (
    <div className="i365-redirect i365-reveal">
      <h2 className="i365-col-title"><span className="i365-sweep-title">{island.name_th}</span></h2>
      {island.intro_th && <p>{island.intro_th}</p>}
      <div className="i365-loadbar" style={{ animationDuration: `${island.redirect_delay_ms}ms` }} />
      {island.redirect_url ? (
        <>
          <p className="i365-card-muted">กำลังพาไปใน {left} วินาที…</p>
          <a className="i365-big-btn" href={island.redirect_url}>ไปเลย →</a>
        </>
      ) : <p className="i365-card-muted">ยังไม่ได้ตั้งลิงก์ปลายทางในหลังบ้าน</p>}
    </div>
  );
}

export default function IslandPage() {
  const { island: slug = '' } = useParams();
  const { data, loading, error } = useLoad(() => Promise.all([getSettings(), getIslandWithSections(slug)]), [slug]);
  if (loading) return <PageShell><Loading /></PageShell>;
  if (error) return <PageShell><p className="i365-error">โหลดไม่สำเร็จ: {error}</p></PageShell>;
  const [settings, found] = data!;
  if (!found) return <PageShell><SiteHeader settings={settings} back={{ to: '/', label: 'แผนที่หลัก' }} /><NotFoundBlock message="ไม่พบเกาะนี้" /></PageShell>;
  const { island, sections } = found;
  const f = island.features ?? {};

  const title = island.name_en || island.name_th;
  const subtitle = island.name_en && island.name_en !== island.name_th ? island.name_th : null;

  if (f.is_redirect) {
    return (
      <PageShell theme={island.theme ?? {}}>
        <SiteHeader settings={settings} />
        <PageTitle title={title} subtitle={subtitle} />
        <RedirectIsland island={island} />
        <BackFloat settings={settings} to="/" label="แผนที่หลัก" />
      </PageShell>
    );
  }

  const buttons = sections.map((s) => ({
    key: s.id,
    to: s.source_type === 'external_link' && s.external_url ? s.external_url : `/i/${island.slug}/${s.slug}`,
    external: s.source_type === 'external_link' && !!s.external_url,
    label: s.name_th, tooltip: s.description_th, image: s.button_image,
    left: s.pos_left, top: s.pos_top, width: s.pos_width,
  }));

  return (
    <PageShell theme={island.theme ?? {}}>
      <SiteHeader settings={settings} />
      <PageTitle title={title} subtitle={subtitle} />
      {island.intro_th && <p className="i365-island-intro">{island.intro_th}</p>}
      {sections.length > 0 && (
        <MapStage
          background={island.land_image}
          aspect={island.land_aspect}
          mobileFocusX={island.mobile_focus_x}
          floating={false}
          buttons={buttons}
          fallback={
            // no island picture yet (or it can't load): the sub-menus as the old site's big buttons
            <nav className="i365-content i365-big-btn-grid" aria-label={`เมนูใน${island.name_th}`}>
              {buttons.map((b) => b.external
                ? <a key={b.key} className="i365-big-btn i365-reveal" href={b.to}>{b.label}</a>
                : <Link key={b.key} className="i365-big-btn i365-reveal" to={b.to}>{b.label}</Link>)}
            </nav>
          }
        />
      )}
      {f.has_contact_form && (
        <section className="i365-content">
          <div className="i365-content-card i365-reveal"><ContactForm settings={settings} sourceIsland={island.slug} /></div>
        </section>
      )}
      <SiteFooter settings={settings} />
      <BackFloat settings={settings} to="/" label="แผนที่หลัก" />
    </PageShell>
  );
}
