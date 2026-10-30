-- ════════════════════════════════════════════════════════════════════
-- iDEAS365 island site — schema
--
-- Lives in the Creatr365 Supabase project as a separate set of tables.
-- Every object is prefixed i365_ (tables, functions, policies, bucket)
-- so it never collides with, reads from, or changes any Creatr365 table.
-- The only Creatr365 objects it touches are READ-ONLY selects on
-- public.articles and public.toolbox_assets from the website (through
-- their existing public RLS), never from this file.
--
-- Structure (EMS "event type → event → ticket type" pattern):
--   i365_island_templates  → i365_islands → i365_sections → i365_items
--   i365_item_types define which fields an item has (stored as data,
--   not in code, so a new type needs no code change).
--   Grouping: i365_categories (one per item, scoped to a section)
--             i365_tag_groups / i365_tags / i365_item_tags (many)
--             i365_routes / i365_route_variants / i365_route_items
--   Access:   i365_admins + i365_is_admin() (Creatr365 has_role pattern,
--             separate list so Creatr365 admins are not iDEAS365 admins)
-- ════════════════════════════════════════════════════════════════════

-- ── shared helpers ───────────────────────────────────────────────────
create or replace function public.i365_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ── admins (separate from Creatr365 user_roles) ──────────────────────
create table if not exists public.i365_admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner', 'editor', 'viewer')),
  island_id   uuid,              -- reserved: limit an editor to one island (EMS event_id pattern). null = all
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Can this user edit? (owner/editor, active). security definer so RLS on
-- i365_admins itself does not block the check — same shape as Creatr365 has_role().
create or replace function public.i365_is_admin(_uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.i365_admins
    where user_id = _uid and is_active and role in ('owner', 'editor')
  );
$$;

create or replace function public.i365_is_owner(_uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.i365_admins
    where user_id = _uid and is_active and role = 'owner'
  );
$$;

-- ── site settings (key → json) ───────────────────────────────────────
create table if not exists public.i365_site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ── island templates (EMS event_types) ───────────────────────────────
create table if not exists public.i365_island_templates (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th           text not null,
  name_en           text,
  icon              text,
  description_th    text,
  default_features  jsonb not null default '{}'::jsonb,
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── islands (EMS events) ─────────────────────────────────────────────
create table if not exists public.i365_islands (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9-]+$'),
  template_id       uuid references public.i365_island_templates(id) on delete set null,
  name_th           text not null,
  name_en           text,
  tooltip_th        text,
  intro_th          text,
  intro_en          text,
  features          jsonb not null default '{}'::jsonb,   -- copied from template, then switched per island
  button_image      text,                                  -- island picture on the main map (the button)
  land_image        text,                                  -- island background inside (image or .mp4)
  land_aspect       text not null default '1344/768',      -- reference frame for % positions (Explore pattern)
  mobile_focus_x    numeric not null default 50 check (mobile_focus_x between 0 and 100),
  pos_left          numeric check (pos_left between 0 and 100),
  pos_top           numeric check (pos_top between 0 and 100),
  pos_width         numeric check (pos_width > 0 and pos_width <= 100),
  redirect_url      text,
  redirect_delay_ms integer not null default 2500 check (redirect_delay_ms between 0 and 15000),
  is_published      boolean not null default false,
  sort_order        integer not null default 0,
  deleted_at        timestamptz,                           -- soft delete: hide first, purge later
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.i365_admins
  drop constraint if exists i365_admins_island_fk;
alter table public.i365_admins
  add constraint i365_admins_island_fk foreign key (island_id) references public.i365_islands(id) on delete set null;

-- ── item types: the fields of each kind of work, stored as data ──────
-- fields: [{ key, label_th, label_en, type, required, options:[{value,label}] }]
--   type ∈ text | textarea | url | video | image | file | month | number | select | boolean
-- features: { has_cover, bulk_field }  bulk_field = the field filled by multi-upload
create table if not exists public.i365_item_types (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9_]+$'),
  name_th          text not null,
  name_en          text,
  icon             text,
  fields           jsonb not null default '[]'::jsonb check (jsonb_typeof(fields) = 'array'),
  features         jsonb not null default '{}'::jsonb,
  default_display  text not null default 'cards',
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── sections = buttons inside an island (Explore hotspots) ───────────
create table if not exists public.i365_sections (
  id              uuid primary key default gen_random_uuid(),
  island_id       uuid not null references public.i365_islands(id) on delete restrict,
  slug            text not null check (slug ~ '^[a-z0-9-]+$'),
  name_th         text not null,
  name_en         text,
  description_th  text,
  item_type_id    uuid references public.i365_item_types(id) on delete restrict,
  source_type     text not null default 'items'
                  check (source_type in ('items', 'c365_articles', 'c365_toolbox', 'external_link', 'contact_form')),
  source_config   jsonb not null default '{}'::jsonb,
  external_url    text,
  display_style   text not null default 'cards'
                  check (display_style in ('cards', 'video_grid', 'gallery', 'timeline', 'list', 'text', 'feed')),
  filter_mode     text not null default 'categories' check (filter_mode in ('categories', 'tags', 'none')),
  button_image    text,
  cover_image     text,
  pos_left        numeric check (pos_left between 0 and 100),
  pos_top         numeric check (pos_top between 0 and 100),
  pos_width       numeric check (pos_width > 0 and pos_width <= 100),
  is_published    boolean not null default false,
  sort_order      integer not null default 0,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (island_id, slug),
  -- a section that holds items must say which type; feeds/forms/links must not
  constraint i365_sections_type_matches_source check (
    (source_type = 'items' and item_type_id is not null)
    or (source_type <> 'items')
  )
);

-- ── categories: one per item, scoped to the section (max 2 levels) ───
create table if not exists public.i365_categories (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.i365_sections(id) on delete cascade,
  parent_id   uuid references public.i365_categories(id) on delete restrict,
  slug        text not null check (slug ~ '^[a-z0-9-]+$'),
  name_th     text not null,
  name_en     text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (section_id, slug)
);

create or replace function public.i365_check_category()
returns trigger language plpgsql as $$
declare p record;
begin
  if new.parent_id is not null then
    select section_id, parent_id into p from public.i365_categories where id = new.parent_id;
    if p.parent_id is not null then
      raise exception 'หมวดซ้อนได้ไม่เกิน 2 ชั้น (category depth max 2)';
    end if;
    if p.section_id <> new.section_id then
      raise exception 'หมวดแม่ต้องอยู่ในเมนูย่อยเดียวกัน (parent must be in the same section)';
    end if;
    if new.parent_id = new.id then
      raise exception 'หมวดเป็นแม่ของตัวเองไม่ได้';
    end if;
  end if;
  return new;
end $$;

-- ── tags (controlled vocabulary in groups) ───────────────────────────
create table if not exists public.i365_tag_groups (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th         text not null,
  name_en         text,
  allow_multiple  boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.i365_tags (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.i365_tag_groups(id) on delete restrict,
  slug        text not null check (slug ~ '^[a-z0-9-]+$'),
  name_th     text not null,
  name_en     text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (group_id, slug)
);

-- ── items ────────────────────────────────────────────────────────────
create table if not exists public.i365_items (
  id            uuid primary key default gen_random_uuid(),
  section_id    uuid not null references public.i365_sections(id) on delete restrict,
  item_type_id  uuid not null references public.i365_item_types(id) on delete restrict,
  category_id   uuid references public.i365_categories(id) on delete restrict,
  title_th      text not null,
  title_en      text,
  summary_th    text,
  summary_en    text,
  cover_image   text,
  data          jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  is_featured   boolean not null default false,
  is_published  boolean not null default true,
  sort_order    integer not null default 0,
  batch_id      uuid,          -- set when created by a multi-upload; one batch = one category
  created_by    uuid default auth.uid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Integrity the admin UI also enforces, repeated here so no client can break it:
--   item type = its section's type; category belongs to the same section.
create or replace function public.i365_check_item()
returns trigger language plpgsql as $$
declare s record; c record;
begin
  select item_type_id, source_type into s from public.i365_sections where id = new.section_id;
  if s.source_type <> 'items' then
    raise exception 'เมนูย่อยนี้ไม่ได้เก็บผลงาน (section does not hold items)';
  end if;
  if s.item_type_id <> new.item_type_id then
    raise exception 'ประเภทผลงานไม่ตรงกับเมนูย่อย (item type must match its section)';
  end if;
  if new.category_id is not null then
    select section_id into c from public.i365_categories where id = new.category_id;
    if c.section_id <> new.section_id then
      raise exception 'หมวดต้องอยู่ในเมนูย่อยเดียวกับผลงาน (category must belong to the same section)';
    end if;
  end if;
  return new;
end $$;

-- One multi-upload batch = one category. Reject a batch whose items disagree.
create or replace function public.i365_check_batch()
returns trigger language plpgsql as $$
begin
  if new.batch_id is not null and exists (
    select 1 from public.i365_items
    where batch_id = new.batch_id and id <> new.id
      and (section_id <> new.section_id or category_id is distinct from new.category_id)
  ) then
    raise exception 'อัปโหลดหลายชิ้นในครั้งเดียวต้องเป็นหมวดเดียวกัน (one upload batch = one category)';
  end if;
  return new;
end $$;

create table if not exists public.i365_item_tags (
  item_id  uuid not null references public.i365_items(id) on delete cascade,
  tag_id   uuid not null references public.i365_tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

-- ── job-application routes ───────────────────────────────────────────
create table if not exists public.i365_routes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title_th      text not null,
  title_en      text,
  headline_th   text,
  headline_en   text,
  summary_th    text,
  summary_en    text,
  resume_url    text,
  cover_image   text,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Same route, different heading per link (e.g. /r/assistant vs /r/restaurant)
create table if not exists public.i365_route_variants (
  id           uuid primary key default gen_random_uuid(),
  route_id     uuid not null references public.i365_routes(id) on delete cascade,
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title_th     text not null,
  title_en     text,
  headline_th  text,
  created_at   timestamptz not null default now()
);

create table if not exists public.i365_route_items (
  route_id    uuid not null references public.i365_routes(id) on delete cascade,
  item_id     uuid not null references public.i365_items(id) on delete cascade,
  sort_order  integer not null default 0,
  note_th     text,
  primary key (route_id, item_id)
);

-- ── media library (files uploaded once, reused anywhere) ─────────────
create table if not exists public.i365_media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'i365-media',
  path        text,
  public_url  text not null,
  file_name   text,
  mime_type   text,
  size_bytes  bigint,
  alt_th      text,
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now()
);

-- ── visitors: contact messages and email-for-download ────────────────
create table if not exists public.i365_inquiries (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 1 and 200),
  email          text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320),
  phone          text check (char_length(phone) <= 50),
  company        text check (char_length(company) <= 200),
  interest       text check (char_length(interest) <= 100),
  source_island  text check (char_length(source_island) <= 100),
  source_route   text check (char_length(source_route) <= 100),
  message        text check (char_length(message) <= 5000),
  consent        boolean not null default false,
  status         text not null default 'new' check (status in ('new', 'replied', 'closed')),
  created_at     timestamptz not null default now()
);

create table if not exists public.i365_downloads (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.i365_items(id) on delete cascade,
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320),
  name        text check (char_length(name) <= 200),
  consent     boolean not null check (consent),
  created_at  timestamptz not null default now()
);

-- ── indexes ──────────────────────────────────────────────────────────
create index if not exists i365_sections_island_idx  on public.i365_sections (island_id, sort_order);
create index if not exists i365_items_section_idx    on public.i365_items (section_id, sort_order);
create index if not exists i365_items_category_idx   on public.i365_items (category_id);
create index if not exists i365_items_batch_idx      on public.i365_items (batch_id) where batch_id is not null;
create index if not exists i365_item_tags_tag_idx    on public.i365_item_tags (tag_id);
create index if not exists i365_route_items_item_idx on public.i365_route_items (item_id);
create index if not exists i365_categories_section_idx on public.i365_categories (section_id, sort_order);

-- ── triggers ─────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['i365_island_templates','i365_islands','i365_item_types','i365_sections',
                           'i365_categories','i365_tag_groups','i365_tags','i365_items','i365_routes']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.i365_touch_updated_at()', t, t);
  end loop;
end $$;

drop trigger if exists i365_categories_check on public.i365_categories;
create trigger i365_categories_check before insert or update on public.i365_categories
  for each row execute function public.i365_check_category();

drop trigger if exists i365_items_check on public.i365_items;
create trigger i365_items_check before insert or update on public.i365_items
  for each row execute function public.i365_check_item();

drop trigger if exists i365_items_batch_check on public.i365_items;
create trigger i365_items_batch_check before insert or update on public.i365_items
  for each row execute function public.i365_check_batch();

-- ── public views: what the website may show ──────────────────────────
-- A section is visible only if it and its island are published and not deleted;
-- an item only if it and its section are visible. One place decides "visible".
create or replace function public.i365_island_visible(_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.i365_islands
                 where id = _id and is_published and deleted_at is null);
$$;

create or replace function public.i365_section_visible(_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.i365_sections s
                 where s.id = _id and s.is_published and s.deleted_at is null
                   and public.i365_island_visible(s.island_id));
$$;

create or replace function public.i365_item_visible(_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.i365_items i
                 where i.id = _id and i.is_published
                   and public.i365_section_visible(i.section_id));
$$;

-- ── row level security ───────────────────────────────────────────────
alter table public.i365_admins            enable row level security;
alter table public.i365_site_settings     enable row level security;
alter table public.i365_island_templates  enable row level security;
alter table public.i365_islands           enable row level security;
alter table public.i365_item_types        enable row level security;
alter table public.i365_sections          enable row level security;
alter table public.i365_categories        enable row level security;
alter table public.i365_tag_groups        enable row level security;
alter table public.i365_tags              enable row level security;
alter table public.i365_items             enable row level security;
alter table public.i365_item_tags         enable row level security;
alter table public.i365_routes            enable row level security;
alter table public.i365_route_variants    enable row level security;
alter table public.i365_route_items       enable row level security;
alter table public.i365_media             enable row level security;
alter table public.i365_inquiries         enable row level security;
alter table public.i365_downloads         enable row level security;

-- admins: you can see your own row; only an owner manages the list
drop policy if exists "i365 admins read own" on public.i365_admins;
create policy "i365 admins read own" on public.i365_admins
  for select to authenticated using (user_id = auth.uid() or public.i365_is_owner());
drop policy if exists "i365 owner manages admins" on public.i365_admins;
create policy "i365 owner manages admins" on public.i365_admins
  for all to authenticated using (public.i365_is_owner()) with check (public.i365_is_owner());

-- configuration tables: everyone reads (needed to draw filters), admins write
do $$
declare t text;
begin
  foreach t in array array['i365_site_settings','i365_island_templates','i365_item_types',
                           'i365_categories','i365_tag_groups','i365_tags']
  loop
    execute format('drop policy if exists "i365 public read" on public.%I', t);
    execute format('create policy "i365 public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "i365 admin write" on public.%I', t);
    execute format('create policy "i365 admin write" on public.%I for all to authenticated using (public.i365_is_admin()) with check (public.i365_is_admin())', t);
  end loop;
end $$;

-- content tables: the public sees only what is visible; admins see and write everything
drop policy if exists "i365 public read" on public.i365_islands;
create policy "i365 public read" on public.i365_islands for select to anon, authenticated
  using ((is_published and deleted_at is null) or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_islands;
create policy "i365 admin write" on public.i365_islands for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 public read" on public.i365_sections;
create policy "i365 public read" on public.i365_sections for select to anon, authenticated
  using (public.i365_section_visible(id) or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_sections;
create policy "i365 admin write" on public.i365_sections for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 public read" on public.i365_items;
create policy "i365 public read" on public.i365_items for select to anon, authenticated
  using (public.i365_item_visible(id) or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_items;
create policy "i365 admin write" on public.i365_items for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 public read" on public.i365_item_tags;
create policy "i365 public read" on public.i365_item_tags for select to anon, authenticated
  using (public.i365_item_visible(item_id) or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_item_tags;
create policy "i365 admin write" on public.i365_item_tags for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 public read" on public.i365_routes;
create policy "i365 public read" on public.i365_routes for select to anon, authenticated
  using (is_published or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_routes;
create policy "i365 admin write" on public.i365_routes for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 public read" on public.i365_route_variants;
create policy "i365 public read" on public.i365_route_variants for select to anon, authenticated
  using (exists (select 1 from public.i365_routes r where r.id = route_id and r.is_published) or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_route_variants;
create policy "i365 admin write" on public.i365_route_variants for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 public read" on public.i365_route_items;
create policy "i365 public read" on public.i365_route_items for select to anon, authenticated
  using ((exists (select 1 from public.i365_routes r where r.id = route_id and r.is_published)
          and public.i365_item_visible(item_id)) or public.i365_is_admin());
drop policy if exists "i365 admin write" on public.i365_route_items;
create policy "i365 admin write" on public.i365_route_items for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 public read" on public.i365_media;
create policy "i365 public read" on public.i365_media for select to anon, authenticated using (true);
drop policy if exists "i365 admin write" on public.i365_media;
create policy "i365 admin write" on public.i365_media for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

-- visitors may only add a new message / download record; only admins read them
drop policy if exists "i365 visitors send" on public.i365_inquiries;
create policy "i365 visitors send" on public.i365_inquiries for insert to anon, authenticated
  with check (status = 'new');
drop policy if exists "i365 admin manage" on public.i365_inquiries;
create policy "i365 admin manage" on public.i365_inquiries for all to authenticated
  using (public.i365_is_admin()) with check (public.i365_is_admin());

drop policy if exists "i365 visitors record" on public.i365_downloads;
create policy "i365 visitors record" on public.i365_downloads for insert to anon, authenticated
  with check (public.i365_item_visible(item_id));
drop policy if exists "i365 admin read" on public.i365_downloads;
create policy "i365 admin read" on public.i365_downloads for select to authenticated
  using (public.i365_is_admin());

-- ── grants (Supabase roles) ──────────────────────────────────────────
-- Only i365_ tables are named here; no grant touches any Creatr365 table.
grant select on public.i365_site_settings, public.i365_island_templates, public.i365_islands,
               public.i365_item_types, public.i365_sections, public.i365_categories,
               public.i365_tag_groups, public.i365_tags, public.i365_items, public.i365_item_tags,
               public.i365_routes, public.i365_route_variants, public.i365_route_items,
               public.i365_media to anon, authenticated;
grant insert on public.i365_inquiries, public.i365_downloads to anon, authenticated;
grant select, insert, update, delete on
               public.i365_admins, public.i365_site_settings, public.i365_island_templates,
               public.i365_islands, public.i365_item_types, public.i365_sections,
               public.i365_categories, public.i365_tag_groups, public.i365_tags, public.i365_items,
               public.i365_item_tags, public.i365_routes, public.i365_route_variants,
               public.i365_route_items, public.i365_media, public.i365_inquiries,
               public.i365_downloads to authenticated;
grant execute on function public.i365_is_admin(uuid), public.i365_is_owner(uuid),
                          public.i365_island_visible(uuid), public.i365_section_visible(uuid),
                          public.i365_item_visible(uuid) to anon, authenticated;

-- ── storage bucket for uploads (public read, admin write) ────────────
insert into storage.buckets (id, name, public)
values ('i365-media', 'i365-media', true)
on conflict (id) do nothing;

drop policy if exists "i365 media public read" on storage.objects;
create policy "i365 media public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'i365-media');
drop policy if exists "i365 media admin insert" on storage.objects;
create policy "i365 media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'i365-media' and public.i365_is_admin());
drop policy if exists "i365 media admin update" on storage.objects;
create policy "i365 media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'i365-media' and public.i365_is_admin());
drop policy if exists "i365 media admin delete" on storage.objects;
create policy "i365 media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'i365-media' and public.i365_is_admin());
