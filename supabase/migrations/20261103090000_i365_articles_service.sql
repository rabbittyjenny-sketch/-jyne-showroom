-- iDEAS365: its own articles (COMMUNITY HARBOR), podcast play stats, and the A SERVICE MANIA page topics.
-- Copied from the structure of Creatr365's articles / podcast_plays / log_podcast_play — as NEW i365_ objects.
-- Nothing of Creatr365 is read, changed or referenced. Safe to run more than once.

-- ── 1. articles ─────────────────────────────────────────────────────────────
create table if not exists public.i365_articles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  kind               text not null default 'blog'
                     check (kind in ('blog', 'video', 'news', 'update', 'community', 'tool')),
  title              text not null,
  summary            text not null default '',
  body               text,                    -- HTML, a whole HTML file, or structured JSON { meta, blocks }
  target_url         text not null default '',
  cover_image_url    text,
  author             text default 'iDEAS365',
  tags               text[] default '{}',
  meta_description   text,
  video_url          text,                    -- YouTube link (kind = 'video')
  audio_url          text,                    -- podcast
  audio_title        text,
  audio_image_url    text,
  audio_duration_sec integer,
  is_active          boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table public.i365_articles is 'iDEAS365 COMMUNITY HARBOR content (articles, clips, news). Managed in /backoffice/articles.';

drop trigger if exists i365_articles_touch on public.i365_articles;
create trigger i365_articles_touch before update on public.i365_articles
  for each row execute function public.i365_touch_updated_at();

alter table public.i365_articles enable row level security;
drop policy if exists "i365 public read" on public.i365_articles;
create policy "i365 public read" on public.i365_articles for select to anon, authenticated
  using (is_active or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_articles;
create policy "i365 admin write" on public.i365_articles for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());
grant select on public.i365_articles to anon, authenticated;
grant insert, update, delete on public.i365_articles to authenticated;

-- ── 2. podcast plays (who listened, how far) ───────────────────────────────
create table if not exists public.i365_podcast_plays (
  id               uuid primary key default gen_random_uuid(),
  article_id       uuid not null references public.i365_articles(id) on delete cascade,
  play_session     uuid not null unique,
  user_id          uuid,
  max_progress_pct smallint not null default 0,
  listened_seconds integer not null default 0,
  completed        boolean not null default false,
  started_at       timestamptz not null default now(),
  last_seen_at     timestamptz not null default now()
);
alter table public.i365_podcast_plays enable row level security;
drop policy if exists "i365 admin read" on public.i365_podcast_plays;
create policy "i365 admin read" on public.i365_podcast_plays for select to authenticated using (public.i365_is_admin());
grant select on public.i365_podcast_plays to authenticated;

-- visitors write only through this function (no direct insert/update policy)
create or replace function public.i365_log_podcast_play(
  _article_id uuid, _play_session uuid, _progress_pct integer default 0, _listened_seconds integer default 0)
returns void language plpgsql security definer set search_path = public as $$
declare
  _uid  uuid := auth.uid();
  _pct  smallint := least(100, greatest(0, coalesce(_progress_pct, 0)));
  _secs integer  := least(86400, greatest(0, coalesce(_listened_seconds, 0)));
begin
  if not exists (select 1 from public.i365_articles where id = _article_id and is_active and audio_url is not null) then
    raise exception 'PODCAST_NOT_FOUND';
  end if;
  insert into public.i365_podcast_plays as pp
    (article_id, play_session, user_id, max_progress_pct, listened_seconds, completed)
  values (_article_id, _play_session, _uid, _pct, _secs, _pct >= 90)
  on conflict (play_session) do update
    set max_progress_pct = greatest(pp.max_progress_pct, excluded.max_progress_pct),
        listened_seconds = greatest(pp.listened_seconds, excluded.listened_seconds),
        completed        = pp.completed or excluded.completed,
        last_seen_at     = now()
    where pp.article_id = _article_id and pp.user_id is not distinct from _uid;
end $$;
revoke all on function public.i365_log_podcast_play(uuid, uuid, integer, integer) from public;
grant execute on function public.i365_log_podcast_play(uuid, uuid, integer, integer) to anon, authenticated;

-- ── 3. COMMUNITY HARBOR opens the in-site community page ──────────────────
update public.i365_islands set page_slug = 'community', updated_at = now() where slug = 'community';

-- ── 4. A SERVICE MANIA: item types + topics (content from iDEAS365-web /work, /approach, /services) ─────
insert into public.i365_item_types (slug, name_th, name_en, icon, fields, features, default_display, sort_order)
values
  ('point', 'หัวข้อสั้น (EN / ไทย)', 'Point', '•', '[
     {"key":"text_en","type":"textarea","label_th":"คำอธิบาย (อังกฤษ)","label_en":"Text (EN)","required":false},
     {"key":"text_th","type":"textarea","label_th":"คำอธิบาย (ไทย)","label_en":"Text (TH)","required":false}
   ]'::jsonb, '{"has_cover":false,"bulk_field":null}'::jsonb, 'list', 20),
  ('service', 'บริการ', 'Service', '◆', '[
     {"key":"label","type":"text","label_th":"ป้ายเล็กเหนือชื่อ (เช่น Strategy Consulting)","label_en":"Label","required":false},
     {"key":"points","type":"textarea","label_th":"สิ่งที่ทำให้ (บรรทัดละข้อ: English | ไทย)","label_en":"Points","required":false},
     {"key":"detail_title","type":"text","label_th":"หัวข้อรายละเอียด (English | ไทย)","label_en":"Detail title","required":false},
     {"key":"detail_body","type":"textarea","label_th":"ย่อหน้ารายละเอียด (บรรทัดละย่อหน้า: English | ไทย)","label_en":"Detail paragraphs","required":false},
     {"key":"framework_title","type":"text","label_th":"หัวข้อกรอบการทำงาน (English | ไทย)","label_en":"Framework title","required":false},
     {"key":"framework_points","type":"textarea","label_th":"กรอบการทำงาน (บรรทัดละข้อ: หัวข้อ | English | ไทย)","label_en":"Framework points","required":false},
     {"key":"cta_label","type":"text","label_th":"ข้อความปุ่ม","label_en":"Button label","required":false},
     {"key":"cta_url","type":"url","label_th":"ปุ่มพาไปที่ (ว่าง = หน้าติดต่อ)","label_en":"Button link","required":false}
   ]'::jsonb, '{"has_cover":false,"bulk_field":null}'::jsonb, 'detail', 21)
on conflict (slug) do nothing;

insert into public.i365_sections (island_id, slug, name_th, description_th, item_type_id, source_type, display_style, filter_mode, page_slug, is_published, sort_order)
select i.id, v.slug, v.name, v.descr, t.id, 'items', v.disp, 'none', 'service', true, v.ord
from (values
  ('how-i-work',     'HOW I WORK · การทำงานของ iDEAS365', 'My Approach & Methodology', 'point',   'timeline', 1),
  ('what-to-expect', 'WHAT TO EXPECT',   null,                         'point',   'cards',    2),
  ('work-with',      'I WORK WITH',                         null,                         'point',   'list',     3),
  ('dont-work-with', 'I DON''T WORK WITH',                  null,                         'point',   'list',     4),
  ('services',       'SERVICES',                   'Three clear paths to work together · 3 แนวทางชัดเจนในการทำงานร่วมกัน', 'service', 'detail', 5)
) as v(slug, name, descr, typ, disp, ord)
join public.i365_islands i on i.slug = 'service'
join public.i365_item_types t on t.slug = v.typ
where not exists (select 1 from public.i365_sections s where s.island_id = i.id and s.slug = v.slug);

create index if not exists i365_articles_active_idx on public.i365_articles (is_active, sort_order);
