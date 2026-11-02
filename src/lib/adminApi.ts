// Back-office data access: every write the admin does goes through here.
// Without a database connection (no VITE_SUPABASE_* env) the screens open empty and writes are refused.
import { supabase, IS_MOCK } from '@/integrations/supabase/client';
import { sanitizeFileName } from './uploadFile';
import { checkFile, contentTypeOf, type UploadKind } from './uploadRules';

export type Table =
  | 'i365_island_templates' | 'i365_islands' | 'i365_sections' | 'i365_item_types' | 'i365_items'
  | 'i365_categories' | 'i365_tag_groups' | 'i365_tags' | 'i365_item_tags'
  | 'i365_routes' | 'i365_route_variants' | 'i365_route_items' | 'i365_inquiries' | 'i365_site_settings' | 'i365_media';

export const MOCK_WRITE_MSG = 'โหมดจำลอง: ยังไม่ได้เชื่อมฐานข้อมูล จึงบันทึกไม่ได้';

type Filter = [column: string, value: string | number | boolean | null];

export async function list<T>(table: Table, filters: Filter[] = [], order: string | null = 'sort_order'): Promise<T[]> {
  if (IS_MOCK) return [];
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
 * Upload one file to the i365-media bucket and record it in the media library (i365_media).
 * The file must pass the upload rule of the box it came from (type + size, src/lib/uploadRules.ts).
 * Thai/space file names become a safe key (original name kept in i365_media.file_name).
 * Every upload is "pending" until the form it came from is saved or closed — see settleUploads().
 */
export async function uploadMedia(file: File, folder = 'uploads', kind: UploadKind = 'document'): Promise<string> {
  if (IS_MOCK) throw new Error(MOCK_WRITE_MSG);
  const bad = checkFile(file, kind);
  if (bad) throw new Error(bad);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${sanitizeFileName(file.name)}`;
  const contentType = contentTypeOf(file);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  pending.add(path);
  await supabase.from('i365_media').insert({ path, public_url: data.publicUrl, file_name: file.name, mime_type: contentType, size_bytes: file.size } as never);
  return data.publicUrl;
}

// ── keeping storage in step with the data ─────────────────────────────────
// A file in i365-media is kept while any i365 row still points at it (checked in the database by
// i365_media_in_use, which looks through items, articles, sections, islands, settings, routes …).
// When nothing points at it any more — the item was deleted, the file was replaced, or the form was
// closed without saving — the file and its i365_media row are removed. Links to other sites
// (ImageKit, YouTube …) are never touched.
const BUCKET = 'i365-media';
const pending = new Set<string>();

/** Paths of i365-media files referenced anywhere inside `value` (a row, a form state, …). */
export function mediaPathsIn(value: unknown): string[] {
  const base = supabase.storage.from(BUCKET).getPublicUrl('').data.publicUrl.replace(/\/$/, '') + '/';
  const text = JSON.stringify(value ?? null);
  const out = new Set<string>();
  let i = text.indexOf(base);
  while (i !== -1) {
    const rest = text.slice(i + base.length);
    const path = rest.match(/^[^"\s?#\\]+/)?.[0];
    if (path) out.add(decodeURIComponent(path));
    i = text.indexOf(base, i + base.length);
  }
  return [...out];
}

/** Remove the given files from storage + i365_media when no i365 row refers to them any more. */
export async function releaseMedia(paths: Iterable<string>): Promise<string[]> {
  if (IS_MOCK) return [];
  const removed: string[] = [];
  for (const path of new Set(paths)) {
    const { data: inUse, error } = await supabase.rpc('i365_media_in_use' as never, { _path: path } as never);
    if (error || inUse !== false) continue;            // unsure or still used → keep it
    const { error: e2 } = await supabase.storage.from(BUCKET).remove([path]);
    if (e2) continue;
    await supabase.from('i365_media').delete().eq('path', path);
    removed.push(path);
  }
  return removed;
}

/**
 * Call after a form is saved, deleted or closed: files uploaded in it that were not saved, plus the
 * given files that the save/delete stopped using, are removed. Never throws (cleanup must not block work).
 */
export async function settleUploads(alsoCheck: string[] = []): Promise<void> {
  const all = [...pending, ...alsoCheck];
  pending.clear();
  try { await releaseMedia(all); } catch { /* the next settle retries nothing; orphan stays, data is safe */ }
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
