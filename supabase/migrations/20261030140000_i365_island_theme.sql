-- สีประจำเกาะ (ยกมาจาก CSS ของหน้าเกาะเดิมใน jyne-showroom) — เก็บเป็น { preset, ...สีที่ปรับเอง }
-- ชุดสี (preset) อยู่ใน src/lib/themes.ts · เปลี่ยน/ปรับสีได้ในหลังบ้าน หน้าแก้เกาะ
alter table public.i365_islands
  add column if not exists theme jsonb not null default '{}'::jsonb;
do $$ begin
  alter table public.i365_islands add constraint i365_islands_theme_object check (jsonb_typeof(theme) = 'object');
exception when duplicate_object then null; end $$;

-- ตั้งสีเริ่มต้นให้เกาะที่ยังไม่เคยตั้ง (ไม่ทับที่ปรับไว้แล้ว)
update public.i365_islands i set theme = v.theme
from (values
  ('profile', '{"preset": "about"}'::jsonb),
  ('clips', '{"preset": "marina"}'::jsonb),
  ('photos', '{"preset": "district"}'::jsonb),
  ('design', '{"preset": "blog"}'::jsonb),
  ('tools', '{"preset": "works"}'::jsonb),
  ('docs', '{"preset": "learning"}'::jsonb),
  ('contact', '{"preset": "contact"}'::jsonb),
  ('academy', '{"preset": "district"}'::jsonb),
  ('structure', '{"preset": "works"}'::jsonb)
) as v(slug, theme)
where i.slug = v.slug and i.theme = '{}'::jsonb;

-- ปุ่มย้อนกลับมุมขวาล่าง (รูป BACK จากเว็บเดิม)
insert into public.i365_site_settings (key, value)
values ('back_button', '"https://ik.imagekit.io/ideas365logo/BACK%20(1)%20(1).png?updatedAt=1773177420277"'::jsonb)
on conflict (key) do nothing;

-- รูปแบบแสดงผลใหม่ "detail": แสดงทุกช่องเต็มหน้า (กรณีศึกษา) ไม่ต้องกดเปิด
alter table public.i365_sections drop constraint if exists i365_sections_display_style_check;
alter table public.i365_sections add constraint i365_sections_display_style_check
  check (display_style in ('cards', 'video_grid', 'gallery', 'timeline', 'list', 'text', 'feed', 'detail'));
update public.i365_sections s set display_style = 'detail'
from public.i365_islands i
where i.id = s.island_id and i.slug = 'profile' and s.slug = 'freelance-live' and s.display_style = 'cards';
