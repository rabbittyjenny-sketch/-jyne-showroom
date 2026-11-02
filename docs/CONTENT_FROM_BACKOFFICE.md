# เนื้อหาจากหลังบ้าน (Supabase) → หน้าเว็บเดิม

หน้าเว็บยังเป็นหน้าเดิมทุกอย่าง (ตัวอักษร การ์ด สี การจัดวาง) แต่ละหน้าเนื้อหาจะถามฐานข้อมูลก่อนว่ามีผลงานไหม

| ในหลังบ้าน | หน้าเว็บ |
|---|---|
| หัวข้อ (เมนูย่อย) เผยแพร่ + มีผลงานที่เผยแพร่ ≥ 1 ชิ้น | แสดงผลงานจากหลังบ้าน **แทน** เนื้อหาเดิมของหัวข้อนั้น ใช้การ์ด/คลาสเดิมของหน้า เรียงตาม "ลำดับ" |
| ยังไม่มีผลงานที่เผยแพร่ | แสดงเนื้อหาเดิมในโค้ด หรือ Google Sheet เหมือนเดิม |
| หัวข้อใหม่ที่ไม่มีที่วางในหน้า | ขึ้นเป็นการ์ดใหม่ต่อท้ายหน้า (ก่อน COMING SOON) ในแบบการ์ดของหน้านั้น |
| หัวข้อที่อยู่ใน COMING SOON มีผลงานแล้ว | บรรทัดนั้นใน COMING SOON หายไปเอง หมดทุกบรรทัด = การ์ด COMING SOON ซ่อน |
| ฐานข้อมูลช้าเกิน 4 วินาที / ล่ม | แสดงเนื้อหาเดิม |

## หน้า ↔ หัวข้อ (i365_sections.page_slug)

| หน้า | หัวข้อที่ดึงจากหลังบ้าน | ยังแสดงจากโค้ดเดิม |
|---|---|---|
| about_profile | – | WHO IS JYNE, CORE SKILLS (about-me) |
| about_experience | previous-work, certificates, resume | EXPERIENCE ไทม์ไลน์ (timeline) |
| about_live | live-proof | CASE STUDY (freelance-live) |
| works_clips | live-selling, ai-voice, live-content, content-work, ai-clips, event-promo | – |
| works_photos | makeup-hair, live-results, food, booth-event | – |
| learning_tools | tools-ai, tools-commerce, tools-creative (แทน Google Sheet ทีละตาราง) | – |
| learning_docs | free-resources (แทน Google Sheet; ปุ่มดาวน์โหลด + ฟอร์มอีเมลเดิม) | LIBRARY / COMING SOON |
| learning_design | web-design, creative, marketing-plans | – |

ประเภทผลงานที่หน้าเว็บดึงได้: clip, photo, certificate, tool, document, design_work, resume
(text_block, experience, case_study ยังแสดงจากโค้ดเดิม หัวข้อพวกนี้ตั้งเป็นฉบับร่างไว้)

## ไฟล์

- `public/i365-content.js` ตัวดึงข้อมูล (ใส่ใน `<head>` ของหน้าเนื้อหาทุกหน้า โดย `scripts/build-island-pages.py`)
- `scripts/build-island-pages.py` ใส่จุดวาง `data-i365="<หัวข้อ>"` ในหน้า (markup อื่นไม่เปลี่ยน)
- `supabase/migrations/20261102090000_i365_match_site_pages.sql` โครงสร้างเกาะ/หัวข้อตามหน้าเว็บ (รันแล้ว)
- `supabase/data/i365_current_page_content.sql` เนื้อหาที่หน้าเว็บแสดงวันนี้ → ผลงานในหลังบ้าน (รันใน SQL Editor; รันซ้ำได้)
  สร้างใหม่ได้ด้วย `python3 scripts/build-content-sql.py`

## เกาะที่พาไปเว็บอื่น / ยังไม่เปิด

- ACADEMY BAY → `academy.html` (แผ่นข้อมูลแบบ PDF เนื้อหาใส่ภายหลัง) ปุ่ม Go to Academy → ป๊อปอัปยืนยัน → c365.ideas365.space
- A SERVICE MANIA → `service.html` แบบเดียวกัน ปุ่ม ดูบริการทั้งหมด → ป๊อปอัปยืนยัน → iDEAS365-web /services
  ลิงก์ไหนใส่ `data-leave="ชื่อเว็บ"` จะถามก่อนออกเสมอ (สร้างโดย `scripts/build-island-pages.py`)
- COMMUNITY HARBOR → `community.html` ซึ่งยังไม่มี → Vercel แสดง `404.html` (หน้า 404 ของเว็บ ใช้กับลิงก์ที่ไม่มีทุกลิงก์)
  ทำหน้าชุมชนเสร็จเมื่อไหร่ แค่เพิ่มไฟล์ community.html
