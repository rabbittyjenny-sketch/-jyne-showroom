import { useParams } from 'react-router-dom';
import { getFeed, getSectionBundle, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { CONTACT_PAGE, LegacyCard, LegacyFeed, LegacyItems, LegacyShell, cardTitle, familyOf } from '@/legacy/Legacy';

function Plain({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans Thai', sans-serif" }}>{children}</div>;
}

export default function SectionPage() {
  const { island: islandSlug = '', section: sectionSlug = '' } = useParams();
  const { data, loading, error } = useLoad(async () => {
    const [settings, bundle] = await Promise.all([getSettings(), getSectionBundle(islandSlug, sectionSlug)]);
    const feed = bundle && ['c365_articles', 'c365_toolbox'].includes(bundle.section.source_type) ? await getFeed(bundle.section.source_type) : [];
    return { settings, bundle, feed };
  }, [islandSlug, sectionSlug]);

  if (loading) return <Plain>กำลังโหลด…</Plain>;
  if (error) return <Plain>โหลดไม่สำเร็จ: {error}</Plain>;
  const bundle = data!.bundle;
  if (!bundle) return <Plain><a href={`/i/${islandSlug}`}>ไม่พบหน้านี้ · กลับเกาะ</a></Plain>;

  const { island, section, siblings, itemType, items } = bundle;
  const fam = familyOf(island.theme);
  const f = island.features ?? {};

  return (
    <LegacyShell theme={island.theme} settings={data!.settings}
      title={island.name_en || island.name_th} subtitle={island.name_en && island.name_en !== island.name_th ? island.name_th : null}
      back={`/i/${island.slug}`}>
      {siblings.length > 1 && (
        <nav className="lg-subnav" aria-label={`เมนูใน${island.name_th}`}>
          {siblings.map((s) => <a key={s.id} href={`/i/${island.slug}/${s.slug}`} className={s.id === section.id ? 'is-active' : ''}>{s.name_th}</a>)}
        </nav>
      )}
      <LegacyCard family={fam} title={cardTitle(section)} desc={section.description_th}>
        {section.source_type === 'items' && <LegacyItems style={section.display_style} items={items} type={itemType} family={fam} section={section} />}
        {(section.source_type === 'c365_articles' || section.source_type === 'c365_toolbox') && <LegacyFeed entries={data!.feed} family={fam} />}
        {section.source_type === 'external_link' && section.external_url && <a className="big-btn" style={{ display: 'inline-block', padding: '14px 40px' }} href={section.external_url}>ไปที่หน้านี้ →</a>}
      </LegacyCard>
      {f.has_contact_cta && (
        <div className="content-card single">
          <div style={{ textAlign: 'center' }}>
            <p className="col-desc">สนใจงานแบบนี้?</p>
            <a className="big-btn" style={{ display: 'inline-block', padding: '14px 40px' }} href={CONTACT_PAGE}>ติดต่อ →</a>
          </div>
        </div>
      )}
    </LegacyShell>
  );
}
