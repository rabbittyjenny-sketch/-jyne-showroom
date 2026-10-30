import { getIslands, getSettings } from '@/lib/data';
import { useLoad } from '@/lib/useLoad';
import { MapStage } from '@/components/site/MapStage';
import { Loading, PageShell, SiteHeader } from '@/components/site/SiteChrome';

export default function MapPage() {
  const { data, loading, error } = useLoad(() => Promise.all([getSettings(), getIslands()]), []);
  if (loading) return <PageShell><Loading /></PageShell>;
  if (error || !data) return <PageShell><p className="i365-error">โหลดไม่สำเร็จ: {error}</p></PageShell>;
  const [settings, islands] = data;
  return (
    <PageShell>
      <SiteHeader settings={settings} />
      <h1 className="i365-sr">iDEAS365 · แผนที่หมู่เกาะ</h1>
      <MapStage
        background={settings.main_map_image ?? null}
        aspect={settings.main_map_aspect ?? '16/9'}
        buttons={islands.map((i) => ({
          key: i.id, to: `/i/${i.slug}`, label: i.name_th, tooltip: i.tooltip_th, image: i.button_image,
          left: i.pos_left, top: i.pos_top, width: i.pos_width,
        }))}
      />
    </PageShell>
  );
}
