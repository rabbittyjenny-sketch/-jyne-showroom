-- ตั้งผู้ดูแลคนแรกของ iDEAS365 (รันครั้งเดียว หลังรันไฟล์ใน supabase/migrations แล้ว)
-- ✅ รันแล้วบน Supabase ของ Creatr365 เมื่อ 30 ต.ค. 2026 (rabbitty.jenny@gmail.com = owner) — ไม่ต้องรันซ้ำ
-- เปลี่ยนอีเมลด้านล่างเป็นบัญชีที่คุณใช้เข้าระบบ Supabase (บัญชีเดียวกับที่เข้าหลังบ้าน Creatr365)
-- รายชื่อนี้แยกจากผู้ดูแล Creatr365: ผู้ดูแล Creatr365 คนอื่นจะไม่ได้สิทธิ์ iDEAS365 ไปด้วย
insert into public.i365_admins (user_id, role)
select id, 'owner' from auth.users where email = 'rabbitty.jenny@gmail.com'
on conflict (user_id) do nothing;

-- ตรวจผล: ต้องเห็น 1 แถว
select u.email, a.role from public.i365_admins a join auth.users u on u.id = a.user_id;
