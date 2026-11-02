-- i365: make the back office follow the live site structure (2 Nov 2026)
--
-- The site keeps its original static pages. Each topic page (about_profile.html, works_clips.html, ...)
-- now asks Supabase for the published items of its sections (sections.page_slug = the page file name).
--   * a section with published items  -> the page shows the database items in the original card markup
--   * a section with no published items -> the page keeps its original content from the code / Google Sheet
--
-- Islands follow the main map (index.html):
--   ABOUT ISLAND · PIC&CLIP WAREHOUSE · ACADEMY BAY · AI&TECH CREATION BRIDGE · COMMUNITY HARBOR · CONTACT PIER · A SERVICE MANIA
-- Only i365_ tables are touched. Safe to run more than once.

-- ── 1. columns / allowed values ───────────────────────────────────────────
alter table public.i365_sections add column if not exists page_slug text;
alter table public.i365_islands  add column if not exists page_slug text;
comment on column public.i365_sections.page_slug is 'topic page file (without .html) that shows this section, e.g. works_clips';
comment on column public.i365_islands.page_slug  is 'page opened from the main map (without .html), e.g. island_about';

alter table public.i365_sections drop constraint if exists i365_sections_display_style_check;
alter table public.i365_sections add constraint i365_sections_display_style_check
  check (display_style in ('cards', 'video_grid', 'gallery', 'gallery_wide', 'timeline', 'list', 'text', 'feed', 'detail'));

-- ── 2. item type fields the pages need ────────────────────────────────────
-- tool  = the cards on learning_tools (same fields as the Google Sheet: category, status, logo, link)
update public.i365_item_types set fields = '[
  {"key":"url","type":"url","label_th":"ลิงก์ใช้งาน / ทดลอง","label_en":"Link","required":false},
  {"key":"category","type":"select","label_th":"ป้ายหมวด","label_en":"Badge","required":false,"options":[
    {"value":"ai","label":"AI Tool"},{"value":"business","label":"Business"},{"value":"live","label":"Live Commerce"},
    {"value":"system","label":"System Dev"},{"value":"creative","label":"Creative"}]},
  {"key":"status","type":"select","label_th":"สถานะ","label_en":"Status","required":false,"options":[
    {"value":"live","label":"เปิดใช้งาน (กดเข้าได้)"},{"value":"coming-soon","label":"Coming Soon"},{"value":"sold-out","label":"Sold Out"}]},
  {"key":"logo","type":"image","label_th":"โลโก้ (มุมซ้ายบนของรูป)","label_en":"Logo","required":false},
  {"key":"tool_kind","type":"select","label_th":"แบบ","label_en":"Kind","required":false,"options":[
    {"value":"free","label":"เล่นฟรี · ใช้ฟรี"},{"value":"pro","label":"ระบบใหญ่ (ทดลองได้ → ติดต่อ)"}]},
  {"key":"how_to_try_th","type":"textarea","label_th":"วิธีทดลอง","label_en":"How to try","required":false}
]'::jsonb, updated_at = now()
where slug = 'tool';

-- document = the FREE RESOURCES cards on learning_docs (same fields as the sheet: catagory, name, url, update)
update public.i365_item_types set fields = '[
  {"key":"file_url","type":"file","label_th":"ไฟล์ หรือลิงก์","label_en":"File or link","required":true},
  {"key":"badge","type":"select","label_th":"ป้าย","label_en":"Badge","required":false,"options":[
    {"value":"Template","label":"Template"},{"value":"Guidebook","label":"Guidebook"},{"value":"Framework","label":"Framework"},{"value":"Resource","label":"Resource"}]},
  {"key":"updated","type":"text","label_th":"อัปเดต (พิมพ์เอง เช่น มี.ค. 2026)","label_en":"Updated","required":false},
  {"key":"download_mode","type":"select","label_th":"การดาวน์โหลด","label_en":"Download","required":false,"options":[
    {"value":"email","label":"แลกอีเมลก่อน"},{"value":"direct","label":"ดาวน์โหลดได้เลย"}]},
  {"key":"pages","type":"number","label_th":"จำนวนหน้า","label_en":"Pages","required":false}
]'::jsonb, updated_at = now()
where slug = 'document';

-- ── 3. islands = the islands on the main map ──────────────────────────────
update public.i365_islands set slug = 'about'    where slug = 'profile';
update public.i365_islands set slug = 'works'    where slug = 'clips';
update public.i365_islands set slug = 'learning' where slug = 'tools';
update public.i365_islands set slug = 'service'  where slug = 'structure';

insert into public.i365_islands (slug, name_th, name_en, is_published, sort_order)
select 'community', 'COMMUNITY HARBOR', 'COMMUNITY HARBOR', true, 6
where not exists (select 1 from public.i365_islands where slug = 'community');

update public.i365_islands i set
  name_th = v.name, name_en = v.name, tooltip_th = v.tip, page_slug = v.page,
  sort_order = v.ord, is_published = true, deleted_at = null, updated_at = now()
from (values
  ('about',     'ABOUT ISLAND',            'เกี่ยวกับ-JYNE',                         'island_about',    1),
  ('works',     'PIC&CLIP WAREHOUSE',      'รวมรูปและคลิปการทำงาน',                  'island_works',    2),
  ('academy',   'ACADEMY BAY',             'ความสำเร็จอยู่ในหลักสูตร',                 'academy',         3),
  ('learning',  'AI&TECH CREATION BRIDGE', 'รวมโปรเจคที่ออกแบบและสร้างร่วมกับ AI',     'island_learning', 4),
  ('community', 'COMMUNITY HARBOR',        'ชุมชน บทความ ข่าวสาร',                    'community',       5),
  ('contact',   'CONTACT PIER',            'ติดต่อที่นี่',                             'contact_port',    6),
  ('service',   'A SERVICE MANIA',         'มีบริการอะไรบ้าง',                         'service',         7)
) as v(slug, name, tip, page, ord)
where i.slug = v.slug;

-- ── 4. sections = the topics on each page ─────────────────────────────────
-- move sections from the old islands (photos / docs / design) to the island that shows them now
update public.i365_sections s set island_id = (select id from public.i365_islands where slug = 'works')
where s.island_id = (select id from public.i365_islands where slug = 'photos')
  and s.slug in ('makeup-hair', 'food', 'booth-event', 'live-results');

update public.i365_sections s set island_id = (select id from public.i365_islands where slug = 'learning')
where s.island_id in (select id from public.i365_islands where slug in ('design', 'docs'))
  and s.slug in ('web-design', 'creative', 'marketing-plans', 'free-docs');

update public.i365_sections set slug = 'tools-ai'       where slug = 'free-tools'  and island_id = (select id from public.i365_islands where slug = 'learning');
update public.i365_sections set slug = 'tools-commerce' where slug = 'pro-systems' and island_id = (select id from public.i365_islands where slug = 'learning');
update public.i365_sections set slug = 'free-resources' where slug = 'free-docs'   and island_id = (select id from public.i365_islands where slug = 'learning');

-- new topics that are on the pages but had no section yet
insert into public.i365_sections (island_id, slug, name_th, item_type_id, source_type, display_style, filter_mode, is_published, sort_order)
select i.id, v.slug, v.name, t.id, 'items', v.disp, 'none', true, v.ord
from (values
  ('about',    'previous-work', 'PREVIOUS WORK EXPERIENCE · งานที่ผ่านมา', 'photo', 'gallery',      2),
  ('about',    'live-proof',    'RESULT · 2 HRS/LIVE',                    'photo', 'gallery_wide', 2),
  ('learning', 'tools-creative','CREATIVE TOOLS & ELEMENTS',              'tool',  'cards',        3)
) as v(island, slug, name, typ, disp, ord)
join public.i365_islands i on i.slug = v.island
join public.i365_item_types t on t.slug = v.typ
where not exists (select 1 from public.i365_sections s where s.island_id = i.id and s.slug = v.slug);

-- page + order + name of every section that is on a page
-- published = may show database items. A published section with no published items changes nothing on the page.
update public.i365_sections s set
  page_slug = v.page, sort_order = v.ord, name_th = v.name, description_th = v.descr,
  display_style = v.disp, is_published = v.pub, deleted_at = null, updated_at = now()
from (values
  -- island     section            page                ord  name                                             description                                                     display        published
  ('about',    'about-me',        'about_profile',     1, 'WHO IS JYNE · CORE SKILLS',                     'หน้าเว็บยังแสดงข้อความนี้จากโค้ดเดิม (ระบบยังไม่ดึงประเภทนี้)',   'text',         false),
  ('about',    'timeline',        'about_experience',  1, 'EXPERIENCE · ไทม์ไลน์',                         'หน้าเว็บยังแสดงไทม์ไลน์จากโค้ดเดิม (ระบบยังไม่ดึงประเภทนี้)',     'timeline',     false),
  ('about',    'previous-work',   'about_experience',  2, 'PREVIOUS WORK EXPERIENCE · งานที่ผ่านมา',       null,                                                           'gallery',      true),
  ('about',    'certificates',    'about_experience',  3, 'CERTIFICATES · ใบประกาศ · ทักษะอื่น',           null,                                                           'gallery',      true),
  ('about',    'resume',          'about_experience',  4, 'RESUME',                                         'ใช้ชิ้นแรกที่เผยแพร่ เป็นรูปเรซูเม่ + ปุ่มดาวน์โหลด',              'list',         true),
  ('about',    'freelance-live',  'about_live',        1, 'JENNY JYNE · CASE STUDY',                       'หน้าเว็บยังแสดงกรณีศึกษานี้จากโค้ดเดิม (ระบบยังไม่ดึงประเภทนี้)', 'detail',       false),
  ('about',    'live-proof',      'about_live',        2, 'RESULT · 2 HRS/LIVE',                            null,                                                           'gallery_wide', true),
  ('works',    'live-selling',    'works_clips',       1, 'PORTFOLIO MEDIA · คลิปและวีดีโอผลงาน',          null,                                                           'video_grid',   true),
  ('works',    'ai-voice',        'works_clips',       2, 'AI VOICE GENERATOR',                             null,                                                           'video_grid',   true),
  ('works',    'live-content',    'works_clips',       3, 'ไลฟ์คอนเทนต์',                                   null,                                                           'video_grid',   true),
  ('works',    'content-work',    'works_clips',       4, 'รับทำคอนเทนต์',                                  null,                                                           'video_grid',   true),
  ('works',    'ai-clips',        'works_clips',       5, 'คลิปสร้างจาก AI',                                null,                                                           'video_grid',   true),
  ('works',    'event-promo',     'works_clips',       6, 'อีเวนต์ · โปรโมท F&B',                           null,                                                           'video_grid',   true),
  ('works',    'makeup-hair',     'works_photos',      1, 'MAKEUP & HAIR · แต่งหน้า · ทำผม',                null,                                                           'gallery',      true),
  ('works',    'live-results',    'works_photos',      2, 'LIVE RESULTS · ผลไลฟ์ 6 หลัก',                   null,                                                           'gallery_wide', true),
  ('works',    'food',            'works_photos',      3, 'อาหาร',                                          null,                                                           'gallery',      true),
  ('works',    'booth-event',     'works_photos',      4, 'ออกบูธ · อีเวนต์',                               null,                                                           'gallery',      true),
  ('learning', 'tools-ai',        'learning_tools',    1, 'AI TOOLS & ASTROLOGY',                           'เครื่องมือ AI และระบบดาราศาสตร์ที่ใช้งานได้จริง',                  'cards',        true),
  ('learning', 'tools-commerce',  'learning_tools',    2, 'COMMERCE & BUSINESS SYSTEMS',                    'ระบบการขาย กลยุทธ์ และเครื่องมือธุรกิจ',                           'cards',        true),
  ('learning', 'tools-creative',  'learning_tools',    3, 'CREATIVE TOOLS & ELEMENTS',                      'เครื่องมือสร้างสรรค์ คอนเทนต์ และ Design Elements',                'cards',        true),
  ('learning', 'free-resources',  'learning_docs',     1, 'FREE RESOURCES · ดาวน์โหลดฟรี',                  'เทมเพลตและคู่มือที่ iDEAS365 ใช้งานจริง กรอกข้อมูลสั้นๆ แล้วดาวน์โหลดได้เลย', 'list',  true),
  ('learning', 'web-design',      'learning_design',   1, 'WEB DESIGN · หน้าเว็บ (Wix)',                    null,                                                           'cards',        true),
  ('learning', 'creative',        'learning_design',   2, 'Creative · กราฟิก',                              null,                                                           'cards',        true),
  ('learning', 'marketing-plans', 'learning_design',   3, 'แผนคอนเทนต์การตลาด',                             null,                                                           'cards',        true)
) as v(island, slug, page, ord, name, descr, disp, pub)
join public.i365_islands i on i.slug = v.island
where s.island_id = i.id and s.slug = v.slug;

-- the 5 tools imported earlier are copies of the Google Sheet rows: hide them so the sheet stays the source
-- for learning_tools until tools are entered in the back office (publish an item there = the DB takes over that grid)
update public.i365_items it set is_published = false, updated_at = now()
from public.i365_sections s
where it.section_id = s.id and s.slug = 'tools-ai' and it.is_published
  and s.island_id = (select id from public.i365_islands where slug = 'learning')
  and it.data->>'url' in ('https://soul-card-oracle.lovable.app/', 'https://the-soul-weaver.lovable.app/', 'https://kaisin-e3aeho.manus.space/',
                           'https://ideas365-caption-result.netlify.app/', 'https://event-simulator-roi.netlify.app/');

-- sections that are not on any page now (hidden, data kept)
update public.i365_sections set deleted_at = now(), is_published = false, updated_at = now()
where deleted_at is null and slug in ('templates', 'c365-toolbox', 'articles')
  and island_id = (select id from public.i365_islands where slug = 'docs');

-- old islands that are now empty (hidden, data kept)
update public.i365_islands i set deleted_at = now(), is_published = false, updated_at = now()
where i.slug in ('photos', 'docs', 'design') and i.deleted_at is null
  and not exists (select 1 from public.i365_sections s where s.island_id = i.id and s.deleted_at is null);

create index if not exists i365_sections_page_slug_idx on public.i365_sections (page_slug) where deleted_at is null;
