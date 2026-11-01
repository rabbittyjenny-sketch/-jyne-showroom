// Back-office data access: every write the admin does goes through here.
// Reads fall back to mock data when no database is connected, so the screens can
// be previewed; writes in mock mode are refused with a clear message.
import { supabase, IS_MOCK } from '@/integrations/supabase/client';
import { mock } from './mock';
import { sanitizeFileName, resolveContentType } from './uploadFile';

export type Table =
  | 'i365_island_templates' | 'i365_islands' | 'i365_sections' | 'i365_item_types' | 'i365_items'
  | 'i365_categories' | 'i365_tag_groups' | 'i365_tags' | 'i365_item_tags'
  | 'i365_routes' | 'i365_route_variants' | 'i365_route_items' | 'i365_inquiries' | 'i365_site_settings' | 'i365_media';

const MOCK_TABLES: Partial<Record<Table, unknown[]>> = {
  i365_island_templates: mock.templates, i365_islands: mock.islands, i365_sections: mock.sections,
  i365_item_types: mock.itemTypes, i365_items: mock.items, i365_categories: mock.categories,
  i365_tag_groups: mock.tagGroups, i365_tags: mock.tags, i365_item_tags: mock.itemTags,
  i365_routes: mock.routes, i365_route_variants: mock.routeVariants, i365_route_items: mock.routeItems,
  i365_inquiries: [], i365_site_settings: Object.entries(mock.settings).map(([key, value]) => ({ key, value })), i365_media: [],
};

export const MOCK_WRITE_MSG = 'โหมดจำลอง: ยังไม่ได้เชื่อมฐานข้อมูล จึงบันทึกไม่ได้';

type Filter = [column: string, value: string | number | boolean | null];

export async function list<T>(table: Table, filters: Filter[] = [], order: string | null = 'sort_order'): Promise<T[]> {
  if (IS_MOCK) {
    let rows = [...((MOCK_TABLES[table] ?? []) as Record<string, unknown>[])];
    for (const [c, v] of filters) rows = rows.filter((r) => r[c] === v);
    if (order) rows.sort((a, b) => Number(a[order] ?? 0) - Number(b[order] ?? 0));
    return rows as T[];
  }
  let q = supabase.from(table).select('*');
  for (const [c, v] of filters) q = v === null ? q.is(c, null) : q.eq(c, v);
  if (order) q = q.order(order);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function insert<T>(table: Table, row: Record<string, unknown> | Record<string, unknown>[]): Promise<T[]> {
  if (IS_MOCK) throw new Error(MOCK_WRITE_MSG);
  const { data, error } = await supabase.from(table).insert(row as never).select('*');
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function update(table: Table, match: Record<string, unknown>, patch: Record<string, unknown>): Promise<void> {
  if (IS_MOCK) throw new Error(MOCK_WRITE_MSG);
  let q = supabase.from(table).update(patch as never);
  for (const [c, v] of Object.entries(match)) q = q.eq(c, v as string);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

export async function remove(table: Table, match: Record<string, unknown>): Promise<void> {
  if (IS_MOCK) throw new Error(MOCK_WRITE_MSG);
  let q = supabase.from(table).delete();
  for (const [c, v] of Object.entries(match)) q = q.eq(c, v as string);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

export async function upsertSetting(key: string, value: unknown): Promise<void> {
  if (IS_MOCK) throw new Error(MOCK_WRITE_MSG);
  const { error } = await supabase.from('i365_site_settings').upsert({ key, value } as never);
  if (error) throw new Error(error.message);
}

/**
 * Upload one file to the i365-media bucket and record it in the media library.
 * Uses Creatr365's uploadFile helpers: Thai/space file names become a safe key
 * (original name kept), and the real MIME type is sent instead of text/plain.
 */
export async function uploadMedia(file: File, folder = 'uploads'): Promise<string> {
  if (IS_MOCK) throw new Error(MOCK_WRITE_MSG);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from('i365-media').upload(path, file, { contentType: resolveContentType(file), upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('i365-media').getPublicUrl(path);
  await supabase.from('i365_media').insert({ path, public_url: data.publicUrl, file_name: file.name, mime_type: resolveContentType(file), size_bytes: file.size } as never);
  return data.publicUrl;
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
