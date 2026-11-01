// Public-site data access. One place for every read the website does,
// so pages never talk to the database directly and mock mode is a single switch.
import { supabase, IS_MOCK, C365_URL } from '@/integrations/supabase/client';
import { mock } from './mock';
import type { Category, FeedEntry, Island, Item, ItemType, Route, RouteVariant, Section, SiteSettings, Tag, TagGroup } from './types';

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

async function rows<T>(p: PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSettings(): Promise<SiteSettings> {
  if (IS_MOCK) return mock.settings;
  const list = await rows<{ key: string; value: unknown }>(supabase.from('i365_site_settings').select('key,value'));
  return Object.fromEntries(list.map((r) => [r.key, r.value])) as SiteSettings;
}

export async function getIslands(): Promise<Island[]> {
  if (IS_MOCK) return [...mock.islands].sort(bySort);
  return rows<Island>(supabase.from('i365_islands').select('*').eq('is_published', true).is('deleted_at', null).order('sort_order'));
}

export async function getIslandWithSections(slug: string): Promise<{ island: Island; sections: Section[] } | null> {
  if (IS_MOCK) {
    const island = mock.islands.find((i) => i.slug === slug);
    if (!island) return null;
    return { island, sections: mock.sections.filter((s) => s.island_id === island.id).sort(bySort) };
  }
  const { data: island, error } = await supabase.from('i365_islands').select('*')
    .eq('slug', slug).eq('is_published', true).is('deleted_at', null).maybeSingle();
  if (error) throw new Error(error.message);
  if (!island) return null;
  const sections = await rows<Section>(supabase.from('i365_sections').select('*')
    .eq('island_id', island.id).eq('is_published', true).is('deleted_at', null).order('sort_order'));
  return { island: island as Island, sections };
}

export interface SectionBundle {
  island: Island; section: Section; siblings: Section[]; itemType: ItemType | null;
  items: Item[]; categories: Category[]; tags: Tag[]; tagGroups: TagGroup[]; itemTags: { item_id: string; tag_id: string }[];
}

export async function getSectionBundle(islandSlug: string, sectionSlug: string): Promise<SectionBundle | null> {
  const found = await getIslandWithSections(islandSlug);
  if (!found) return null;
  const section = found.sections.find((s) => s.slug === sectionSlug);
  if (!section) return null;

  if (IS_MOCK) {
    const items = mock.items.filter((i) => i.section_id === section.id && i.is_published).sort(bySort);
    return {
      island: found.island, section, siblings: found.sections,
      itemType: mock.itemTypes.find((t) => t.id === section.item_type_id) ?? null,
      items, categories: mock.categories.filter((c) => c.section_id === section.id),
      tags: mock.tags, tagGroups: mock.tagGroups, itemTags: mock.itemTags.filter((t) => items.some((i) => i.id === t.item_id)),
    };
  }

  const [itemType, items, categories, tagGroups, tags] = await Promise.all([
    section.item_type_id
      ? supabase.from('i365_item_types').select('*').eq('id', section.item_type_id).maybeSingle().then((r) => (r.data as ItemType) ?? null)
      : Promise.resolve(null),
    rows<Item>(supabase.from('i365_items').select('*').eq('section_id', section.id).eq('is_published', true).order('sort_order').order('created_at', { ascending: false })),
    rows<Category>(supabase.from('i365_categories').select('*').eq('section_id', section.id).eq('is_active', true).order('sort_order')),
    rows<TagGroup>(supabase.from('i365_tag_groups').select('*').order('sort_order')),
    rows<Tag>(supabase.from('i365_tags').select('*').order('sort_order')),
  ]);
  const itemTags = items.length
    ? await rows<{ item_id: string; tag_id: string }>(supabase.from('i365_item_tags').select('item_id,tag_id').in('item_id', items.map((i) => i.id)))
    : [];
  return { island: found.island, section, siblings: found.sections, itemType, items, categories, tags, tagGroups, itemTags };
}

/** Creatr365 content, read through Creatr365's own public policies (read only). */
export async function getFeed(source: Section['source_type']): Promise<FeedEntry[]> {
  if (IS_MOCK) {
    return [1, 2, 3].map((n) => ({
      id: `${source}-${n}`, title: source === 'c365_articles' ? `บทความตัวอย่าง ${n}` : `เทมเพลตตัวอย่าง ${n}`,
      summary: 'ข้อมูลจำลอง — ของจริงดึงจาก Creatr365', image: null, href: C365_URL,
    }));
  }
  if (source === 'c365_articles') {
    const list = await rows<{ id: string; slug: string; title: string; summary: string | null; cover_image_url: string | null }>(
      supabase.from('articles').select('id,slug,title,summary,cover_image_url').eq('is_active', true).eq('kind', 'blog').order('sort_order'),
    );
    return list.map((a) => ({ id: a.id, title: a.title, summary: a.summary, image: a.cover_image_url, href: `${C365_URL}/articles/${a.slug}` }));
  }
  if (source === 'c365_toolbox') {
    const list = await rows<{ id: string; title: string; description: string | null; cover_image_url: string | null }>(
      supabase.from('toolbox_assets').select('id,title,description,cover_image_url').eq('is_active', true).order('sort_order'),
    );
    return list.map((a) => ({ id: a.id, title: a.title, summary: a.description, image: a.cover_image_url, href: `${C365_URL}/toolbox` }));
  }
  return [];
}

export interface RouteBundle { route: Route; variant: RouteVariant | null; items: (Item & { note_th: string | null; section: Section | null; island: Island | null })[]; itemTypes: ItemType[] }

/** A route link can be the route's own slug or one of its variants (different heading, same content). */
export async function getRouteBundle(slug: string): Promise<RouteBundle | null> {
  if (IS_MOCK) {
    const variant = mock.routeVariants.find((v) => v.slug === slug) ?? null;
    const route = mock.routes.find((r) => r.slug === slug || r.id === variant?.route_id);
    if (!route) return null;
    const items = mock.routeItems.filter((ri) => ri.route_id === route.id).sort(bySort).map((ri) => {
      const item = mock.items.find((i) => i.id === ri.item_id)!;
      const section = mock.sections.find((s) => s.id === item.section_id) ?? null;
      return { ...item, note_th: ri.note_th, section, island: mock.islands.find((i) => i.id === section?.island_id) ?? null };
    });
    return { route, variant, items, itemTypes: mock.itemTypes };
  }
  let variant: RouteVariant | null = null;
  let { data: route } = await supabase.from('i365_routes').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!route) {
    const { data: v } = await supabase.from('i365_route_variants').select('*').eq('slug', slug).maybeSingle();
    if (!v) return null;
    variant = v as RouteVariant;
    ({ data: route } = await supabase.from('i365_routes').select('*').eq('id', variant.route_id).eq('is_published', true).maybeSingle());
    if (!route) return null;
  }
  const links = await rows<{ item_id: string; sort_order: number; note_th: string | null }>(
    supabase.from('i365_route_items').select('item_id,sort_order,note_th').eq('route_id', route.id).order('sort_order'),
  );
  const ids = links.map((l) => l.item_id);
  const [items, itemTypes] = await Promise.all([
    ids.length ? rows<Item>(supabase.from('i365_items').select('*').in('id', ids)) : Promise.resolve([] as Item[]),
    rows<ItemType>(supabase.from('i365_item_types').select('*')),
  ]);
  const sectionIds = [...new Set(items.map((i) => i.section_id))];
  const sections = sectionIds.length ? await rows<Section>(supabase.from('i365_sections').select('*').in('id', sectionIds)) : [];
  const islandIds = [...new Set(sections.map((s) => s.island_id))];
  const islands = islandIds.length ? await rows<Island>(supabase.from('i365_islands').select('*').in('id', islandIds)) : [];
  const ordered = links.flatMap((l) => {
    const item = items.find((i) => i.id === l.item_id);
    if (!item) return [];
    const section = sections.find((s) => s.id === item.section_id) ?? null;
    return [{ ...item, note_th: l.note_th, section, island: islands.find((i) => i.id === section?.island_id) ?? null }];
  });
  return { route: route as Route, variant, items: ordered, itemTypes };
}

export async function getRoutes(): Promise<Route[]> {
  if (IS_MOCK) return mock.routes;
  return rows<Route>(supabase.from('i365_routes').select('*').eq('is_published', true).order('sort_order'));
}

export interface InquiryInput { name: string; email: string; phone?: string; company?: string; interest?: string; message?: string; source_island?: string; source_route?: string; consent: boolean }

export async function sendInquiry(input: InquiryInput): Promise<void> {
  if (IS_MOCK) return;
  // insert only — visitors are not allowed to read inquiries back, so no .select()
  const { error } = await supabase.from('i365_inquiries').insert({ ...input, status: 'new' });
  if (error) throw new Error(error.message);
}

export async function recordDownload(itemId: string, email: string, name: string): Promise<void> {
  if (IS_MOCK) return;
  const { error } = await supabase.from('i365_downloads').insert({ item_id: itemId, email, name, consent: true });
  if (error) throw new Error(error.message);
}
