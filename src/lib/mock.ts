// Mock data built from seed/seed.json — used when no Supabase keys are set (VITE_MOCK=1),
// so the site can be previewed and tested before the database is connected.
import seed from '../../seed/seed.json';
import type { Category, Island, IslandTemplate, Item, ItemType, Route, RouteVariant, Section, SiteSettings, Tag, TagGroup } from './types';

type SeedSection = { slug: string; name_th: string; name_en: string; item_type: string | null; display: string; pos?: number[]; source_type?: string };
type SeedIsland = {
  slug: string; template: string; name_th: string; name_en: string; tooltip_th: string; intro_th?: string;
  button_image: string | null; land_image: string | null; pos: number[]; sort_order: number; redirect_url?: string; sections: SeedSection[];
};

const templates: IslandTemplate[] = seed.island_templates.map((t, i) => ({
  id: `tpl-${t.slug}`, slug: t.slug, name_th: t.name_th, name_en: t.name_en, icon: t.icon,
  description_th: null, default_features: t.default_features, is_active: true, sort_order: i + 1,
}));

const itemTypes: ItemType[] = seed.item_types.map((t, i) => ({
  id: `type-${t.slug}`, slug: t.slug, name_th: t.name_th, name_en: t.name_en, icon: null,
  fields: t.fields as ItemType['fields'], features: t.features, default_display: t.default_display as ItemType['default_display'],
  is_active: true, sort_order: i + 1,
}));

const islands: Island[] = [];
const sections: Section[] = [];
(seed.islands as SeedIsland[]).forEach((s) => {
  const tpl = templates.find((t) => t.slug === s.template)!;
  islands.push({
    id: `isl-${s.slug}`, slug: s.slug, template_id: tpl.id, name_th: s.name_th, name_en: s.name_en,
    tooltip_th: s.tooltip_th, intro_th: s.intro_th ?? null, intro_en: null, features: { ...tpl.default_features },
    button_image: s.button_image, land_image: s.land_image, land_aspect: '1344/768', mobile_focus_x: 50,
    pos_left: s.pos[0], pos_top: s.pos[1], pos_width: s.pos[2], redirect_url: s.redirect_url ?? null,
    redirect_delay_ms: 2500, is_published: true, sort_order: s.sort_order, deleted_at: null,
  });
  s.sections.forEach((sec, i) => {
    sections.push({
      id: `sec-${s.slug}-${sec.slug}`, island_id: `isl-${s.slug}`, slug: sec.slug, name_th: sec.name_th, name_en: sec.name_en,
      description_th: null, item_type_id: sec.item_type ? `type-${sec.item_type}` : null,
      source_type: (sec.source_type ?? 'items') as Section['source_type'], source_config: {}, external_url: null,
      display_style: sec.display as Section['display_style'], filter_mode: 'categories',
      button_image: `/islands/${s.slug}/btn-${sec.slug}.png`, cover_image: null,
      pos_left: sec.pos?.[0] ?? null, pos_top: sec.pos?.[1] ?? null, pos_width: sec.pos?.[2] ?? null,
      is_published: true, sort_order: i + 1, deleted_at: null,
    });
  });
});

const items: Item[] = (seed.items ?? []).map((it, i) => ({
  id: `item-${i + 1}`, section_id: `sec-${it.island}-${it.section}`, item_type_id: 'type-clip', category_id: null,
  title_th: it.title_th, title_en: null, summary_th: null, summary_en: null, cover_image: null,
  data: it.data, is_featured: false, is_published: true, sort_order: i + 1, batch_id: null,
}));

const tagGroups: TagGroup[] = seed.tag_groups.map((g, i) => ({
  id: `tg-${g.slug}`, slug: g.slug, name_th: g.name_th, name_en: g.name_en, allow_multiple: g.allow_multiple, sort_order: i + 1,
}));
const tags: Tag[] = seed.tag_groups.flatMap((g) =>
  g.tags.map(([slug, th, en], k) => ({ id: `tag-${g.slug}-${slug}`, group_id: `tg-${g.slug}`, slug, name_th: th, name_en: en, sort_order: k + 1 })),
);

const routes: Route[] = seed.routes.map((r, i) => ({
  id: `route-${r.slug}`, slug: r.slug, title_th: r.title_th, title_en: r.title_en, headline_th: r.headline_th,
  headline_en: null, summary_th: null, summary_en: null, resume_url: null, cover_image: null, is_published: true, sort_order: i + 1,
}));
const routeVariants: RouteVariant[] = seed.routes.flatMap((r) =>
  r.variants.map(([slug, th, en]) => ({ id: `rv-${slug}`, route_id: `route-${r.slug}`, slug, title_th: th, title_en: en, headline_th: null })),
);

export const mock = {
  settings: seed.site_settings as SiteSettings,
  templates, itemTypes, islands, sections, items, tagGroups, tags, routes, routeVariants,
  categories: [] as Category[],
  itemTags: [] as { item_id: string; tag_id: string }[],
  routeItems: items.slice(0, 4).map((it, i) => ({ route_id: 'route-live-streamer', item_id: it.id, sort_order: i + 1, note_th: null })),
};
