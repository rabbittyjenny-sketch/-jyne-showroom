import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIslandWithSections, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { MapStage } from '@/components/site/MapStage';
import { Loading, NotFoundBlock, PageShell, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
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
    <div className="i365-redirect">
      <h1>{island.name_th}</h1>
      {island.intro_th && <p>{island.intro_th}</p>}
      <div className="i365-loadbar" style={{ animationDuration: `${island.redirect_delay_ms}ms` }} />
      {island.redirect_url ? (
        <>
          <p className="i365-muted">กำลังพาไปใน {left} วินาที…</p>
          <a className="i365-pill i365-pill-solid" href={island.redirect_url}>ไปเลย →</a>
        </>
      ) : <p className="i365-muted">ยังไม่ได้ตั้งลิงก์ปลายทางในหลังบ้าน</p>}
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

  if (f.is_redirect) {
    return <PageShell><SiteHeader settings={settings} back={{ to: '/', label: 'แผนที่หลัก' }} /><RedirectIsland island={island} /></PageShell>;
  }

  return (
    <PageShell tone={island.land_image ? 'sea' : 'paper'}>
      <SiteHeader settings={settings} back={{ to: '/', label: 'แผนที่หลัก' }} />
      <h1 className="i365-island-title">{island.name_th}</h1>
      {island.intro_th && <p className="i365-island-intro">{island.intro_th}</p>}
      {sections.length > 0 && (
        <MapStage
          background={island.land_image}
          aspect={island.land_aspect}
          mobileFocusX={island.mobile_focus_x}
          floating={false}
          buttons={sections.map((s) => ({
            key: s.id,
            to: s.source_type === 'external_link' && s.external_url ? s.external_url : `/i/${island.slug}/${s.slug}`,
            external: s.source_type === 'external_link' && !!s.external_url,
            label: s.name_th, tooltip: s.description_th, image: s.button_image,
            left: s.pos_left, top: s.pos_top, width: s.pos_width,
          }))}
        />
      )}
      {f.has_contact_form && <section className="i365-panel"><ContactForm settings={settings} sourceIsland={island.slug} /></section>}
      <SiteFooter settings={settings} />
    </PageShell>
  );
}
