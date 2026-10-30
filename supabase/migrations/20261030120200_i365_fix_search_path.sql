-- ล็อก search_path ของฟังก์ชัน trigger ฝั่ง iDEAS365 (ตามคำเตือน Supabase Security Advisor)
-- แตะเฉพาะฟังก์ชันที่ขึ้นต้น i365_ เท่านั้น
alter function public.i365_touch_updated_at() set search_path = public;
alter function public.i365_check_category() set search_path = public;
alter function public.i365_check_item() set search_path = public;
alter function public.i365_check_batch() set search_path = public;
