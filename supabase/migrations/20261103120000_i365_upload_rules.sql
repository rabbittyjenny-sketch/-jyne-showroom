-- iDEAS365 · file rules and keeping storage in step with the data. i365_ objects + the i365-media bucket only.
-- Safe to run more than once.

-- ── 1. which files each file field accepts (read by src/lib/uploadRules.ts) ─────────────
-- resume: the page shows the résumé as a picture, so it must be an image
-- certificate PDF: PDF · design work attachment: PDF or picture (video = link) · document: PDF / Office / ZIP
create or replace function pg_temp.i365_set_field(_type text, _key text, _patch jsonb)
returns void language sql as $$
  update public.i365_item_types t
     set fields = (select jsonb_agg(case when f->>'key' = _key then f || _patch else f end order by ord)
                   from jsonb_array_elements(t.fields) with ordinality as x(f, ord)),
         updated_at = now()
   where t.slug = _type and exists (select 1 from jsonb_array_elements(t.fields) f where f->>'key' = _key);
$$;
select pg_temp.i365_set_field('resume',      'file_url', '{"upload":"image","label_th":"รูปเรซูเม่ (หน้าเว็บแสดงเป็นรูป)"}');
select pg_temp.i365_set_field('certificate', 'file_url', '{"upload":"pdf"}');
select pg_temp.i365_set_field('design_work', 'file_url', '{"upload":"design"}');
select pg_temp.i365_set_field('design_work', 'url',      '{"label_th":"ลิงก์ผลงาน (วิดีโอ: ใส่ลิงก์ YouTube / TikTok ที่นี่)"}');
select pg_temp.i365_set_field('document',    'file_url', '{"upload":"document"}');

-- ── 2. the bucket enforces the same limits on the server ──────────────────────────────
-- 50MB ceiling (the largest rule: podcast audio); each box in the back office has its own smaller limit.
-- No video types: video is always a link.
update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array[
         'image/jpeg', 'image/png', 'image/webp',
         'application/pdf',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
         'application/zip', 'application/x-zip-compressed',
         'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/wave']
 where id = 'i365-media';

-- ── 3. is an uploaded file still used anywhere? ───────────────────────────────────────
-- The back office removes a file from i365-media only when this says false (no i365 row mentions it).
-- It looks through every public.i365_* table (new tables are covered automatically), except the
-- media list itself and tables that never hold file links. Admins only; anyone else gets null (= keep).
create or replace function public.i365_media_in_use(_path text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare tbl text; hit boolean;
begin
  if not public.i365_is_admin() then return null; end if;
  if coalesce(_path, '') = '' then return true; end if;
  for tbl in
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'i365\_%'
      and c.relname not in ('i365_media', 'i365_podcast_plays', 'i365_admins', 'i365_downloads')
  loop
    execute format('select exists (select 1 from public.%I t where position($1 in t::text) > 0)', tbl) into hit using _path;
    if hit then return true; end if;
  end loop;
  return false;
end $$;
revoke all on function public.i365_media_in_use(text) from public, anon;
grant execute on function public.i365_media_in_use(text) to authenticated;
