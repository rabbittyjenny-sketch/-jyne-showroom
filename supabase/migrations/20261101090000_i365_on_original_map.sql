-- เกาะใหม่วางบนแผนที่เดิม (index.html เดิม) — หน้าเดิมทั้งหมดไม่ถูกแตะ
-- 1) เกาะที่มีหน้าเดิมอยู่แล้ว ใช้หน้าเดิม: ซ่อนชุดที่ซ้ำ (ข้อมูลยังอยู่ เปิดกลับได้ในหลังบ้าน)
--    โปรไฟล์ = About Island · เครื่องมือ = Works Town · เอกสาร = Learning Bridge · ติดต่อ = Contact Pier
update public.i365_islands set is_published = false
where slug in ('profile', 'tools', 'docs', 'contact') and is_published;

-- 2) Academy: ปุ่ม ACADEMY BAY เดิมบนแผนที่พามาที่หน้าแนะนำสั้น + โหลดไป Creatr365 (ไม่ต้องมีปุ่มซ้ำ)
update public.i365_islands set pos_left = null, pos_top = null, pos_width = null where slug = 'academy';

-- 3) เกาะใหม่ 4 เกาะ: ใช้รูปปุ่มของตัวเอง (ไม่ซ้ำรูปเกาะเดิม) และวางในช่องว่างของแผนที่เดิม (ชั่วคราว ปรับในหลังบ้านได้)
update public.i365_islands i set button_image = v.btn, pos_left = v.l, pos_top = v.t, pos_width = v.w
from (values
  ('clips',     '/islands/clips/map-button.png',     38::numeric, 44::numeric, 14::numeric),
  ('photos',    '/islands/photos/map-button.png',    70, 6, 13),
  ('design',    '/islands/design/map-button.png',    48, 3, 12),
  ('structure', '/islands/structure/map-button.png', 22, 4, 13)
) as v(slug, btn, l, t, w)
where i.slug = v.slug;
