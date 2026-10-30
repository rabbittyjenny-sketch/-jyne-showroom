import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFeed, getSectionBundle, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { BackFloat, Loading, NotFoundBlock, PageShell, PageTitle, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
import { FeedDisplay, ItemsDisplay } from '@/components/site/ItemViews';
import { ContactForm } from '@/components/site/ContactForm';

export default function SectionPage() {
  const { island: islandSlug = '', section: sectionSlug = '' } = useParams();
  const { data, loading, error } = useLoad(async () => {
    const [settings, bundle] = await Promise.all([getSettings(), getSectionBundle(islandSlug, sectionSlug)]);
    const feed = bundle && ['c365_articles', 'c365_toolbox'].includes(bundle.section.source_type) ? await getFeed(bundle.section.source_type) : [];
    return { settings, bundle, feed };
  }, [islandSlug, sectionSlug]);
  const [cat, setCat] = useState<string | null>(null);

  const bundle = data?.bundle ?? null;
  const tagsFor = useMemo(() => {
    if (!bundle) return () => [];
    const byItem = new Map<string, string[]>();
    bundle.itemTags.forEach((t) => byItem.set(t.item_id, [...(byItem.get(t.item_id) ?? []), t.tag_id]));
    return (id: string) => (byItem.get(id) ?? []).map((tid) => bundle.tags.find((t) => t.id === tid)!).filter(Boolean);
  }, [bundle]);

  if (loading) return <PageShell tone="paper"><Loading /></PageShell>;
  if (error) return <PageShell tone="paper"><p className="i365-error">โหลดไม่สำเร็จ: {error}</p></PageShell>;
  if (!bundle) return <PageShell tone="paper"><SiteHeader settings={data!.settings} back={{ to: `/i/${islandSlug}`, label: 'กลับเกาะ' }} /><NotFoundBlock message="ไม่พบหน้านี้" /></PageShell>;

  const { island, section, siblings, itemType, items, categories } = bundle;
  const f = island.features ?? {};
  // category filter: choosing a top-level category also shows its sub-categories
  const childIds = (id: string) => [id, ...categories.filter((c) => c.parent_id === id).map((c) => c.id)];
  const shown = cat ? items.filter((i) => i.category_id && childIds(cat).includes(i.category_id)) : items;
  const topCats = categories.filter((c) => !c.parent_id);

  return (
    <PageShell theme={island.theme ?? {}}>
      <SiteHeader settings={data!.settings} />
      <PageTitle title={island.name_en || island.name_th} subtitle={island.name_en && island.name_en !== island.name_th ? island.name_th : null} />
      <nav className="i365-subnav" aria-label={`เมนูใน${island.name_th}`}>
        {siblings.map((s) => (
          <Link key={s.id} to={`/i/${island.slug}/${s.slug}`} className={s.id === section.id ? 'is-active' : ''}>{s.name_th}</Link>
        ))}
      </nav>
      <main className="i365-content">
        <div className={`i365-content-card i365-display-${section.display_style} i365-reveal`}>
          <h2 className="i365-col-title i365-section-title"><span className="i365-sweep-title">{section.name_th}</span></h2>
          {section.description_th && <p className="i365-card-muted">{section.description_th}</p>}

          {f.has_filters !== false && section.filter_mode === 'categories' && topCats.length > 0 && (
            <div className="i365-filters" role="group" aria-label="กรองตามหมวด">
              <button className={!cat ? 'is-active' : ''} onClick={() => setCat(null)}>ทั้งหมด</button>
              {topCats.map((c) => (
                <button key={c.id} className={cat === c.id ? 'is-active' : ''} onClick={() => setCat(c.id)}>{c.name_th}</button>
              ))}
            </div>
          )}

          {section.source_type === 'items' && (
            <ItemsDisplay style={section.display_style} items={shown} type={itemType} tagsFor={tagsFor} showTags={f.has_tags !== false} />
          )}
          {(section.source_type === 'c365_articles' || section.source_type === 'c365_toolbox') && <FeedDisplay entries={data!.feed} />}
          {section.source_type === 'contact_form' && <ContactForm settings={data!.settings} sourceIsland={island.slug} />}
          {section.source_type === 'external_link' && section.external_url && (
            <a className="i365-big-btn" href={section.external_url}>ไปที่หน้านี้ →</a>
          )}
        </div>

        {f.has_contact_cta && (
          <div className="i365-cta i365-reveal">
            <p>สนใจงานแบบนี้?</p>
            <Link to="/i/contact" className="i365-big-btn">ติดต่อ →</Link>
          </div>
        )}
      </main>
      <SiteFooter settings={data!.settings} />
      <BackFloat settings={data!.settings} to={`/i/${island.slug}`} label={island.name_th} />
    </PageShell>
  );
}
