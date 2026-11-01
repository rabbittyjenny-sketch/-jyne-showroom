import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIslandWithSections, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { MapStage } from '@/components/site/MapStage';
import { LegacyCard, LegacyShell, familyOf } from '@/legacy/Legacy';
import type { Island } from '@/lib/types';

/** Academy / systems work: short intro, a loading bar, then on to the other site. */
function Redirect({ island }: { island: Island }) {
  const [left, setLeft] = useState(Math.ceil(island.redirect_delay_ms / 1000));
  useEffect(() => {
    if (!island.redirect_url) return;
    const go = window.setTimeout(() => window.location.assign(island.redirect_url!), island.redirect_delay_ms);
    const tick = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => { window.clearTimeout(go); window.clearInterval(tick); };
  }, [island.redirect_url, island.redirect_delay_ms]);
  return (
    <LegacyCard family={familyOf(island.theme)} title={island.name_th} desc={island.intro_th}>
      <div className="lg-loadbar" style={{ animationDuration: `${island.redirect_delay_ms}ms` }} />
      {island.redirect_url ? (
        <>
          <p className="col-desc" style={{ color: '#888' }}>กำลังพาไปใน {left} วินาที…</p>
          <a className="big-btn" style={{ display: 'inline-block', padding: '14px 40px' }} href={island.redirect_url}>ไปเลย →</a>
        </>
      ) : <p className="col-desc" style={{ color: '#888' }}>ยังไม่ได้ตั้งลิงก์ปลายทางในหลังบ้าน</p>}
    </LegacyCard>
  );
}

function Plain({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans Thai', sans-serif" }}>{children}</div>;
}

export default function IslandPage() {
  const { island: slug = '' } = useParams();
  const { data, loading, error } = useLoad(() => Promise.all([getSettings(), getIslandWithSections(slug)]), [slug]);
  if (loading) return <Plain>กำลังโหลด…</Plain>;
  if (error) return <Plain>โหลดไม่สำเร็จ: {error}</Plain>;
  const [settings, found] = data!;
  if (!found) return <Plain><a href="/">ไม่พบเกาะนี้ · กลับแผนที่</a></Plain>;
  const { island, sections } = found;
  const title = island.name_en || island.name_th;
  const subtitle = island.name_en && island.name_en !== island.name_th ? island.name_th : null;

  if (island.features?.is_redirect) {
    return <LegacyShell theme={island.theme} settings={settings} title={title} subtitle={subtitle} back="/"><Redirect island={island} /></LegacyShell>;
  }

  const buttons = sections.map((s) => ({
    key: s.id,
    to: s.source_type === 'external_link' && s.external_url ? s.external_url : `/i/${island.slug}/${s.slug}`,
    external: s.source_type === 'external_link' && !!s.external_url,
    label: s.name_th, tooltip: s.description_th, image: s.button_image,
    left: s.pos_left, top: s.pos_top, width: s.pos_width,
  }));

  // sub-menus as big buttons — used until the island picture exists (or if it fails to load)
  const menu = (
    <LegacyCard family="card" title={island.name_th} desc={island.intro_th}>
      <div className="big-btn-row">
        {buttons.map((b) => <a key={b.key} className="big-btn" href={b.to}>{b.label}</a>)}
      </div>
    </LegacyCard>
  );

  return (
    <LegacyShell theme={island.theme} settings={settings} title={title} subtitle={subtitle} back="/">
      {sections.length > 0 && (
        <div className="lg-stage">
          <MapStage background={island.land_image} aspect={island.land_aspect} mobileFocusX={island.mobile_focus_x}
            floating={false} buttons={buttons} fallback={menu} />
        </div>
      )}
    </LegacyShell>
  );
}
