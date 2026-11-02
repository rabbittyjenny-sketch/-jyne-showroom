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
| service | how-i-work, what-to-expect, work-with, dont-work-with, services | – (ข้อความตั้งต้นมาจาก `site-source/service-content.json`) |

ประเภทผลงานที่หน้าเว็บดึงได้: clip, photo, certificate, tool, document, design_work, resume, point, service
(point / service: ช่องข้อความเขียนแบบ `English | ไทย` บรรทัดละข้อ)
(text_block, experience, case_study ยังแสดงจากโค้ดเดิม หัวข้อพวกนี้ตั้งเป็นฉบับร่างไว้)

## ไฟล์

- `public/i365-content.js` ตัวดึงข้อมูล (ใส่ใน `<head>` ของหน้าเนื้อหาทุกหน้า โดย `scripts/build-island-pages.py`)
- `scripts/build-island-pages.py` ใส่จุดวาง `data-i365="<หัวข้อ>"` ในหน้า (markup อื่นไม่เปลี่ยน)
- `supabase/migrations/20261102090000_i365_match_site_pages.sql` โครงสร้างเกาะ/หัวข้อตามหน้าเว็บ
- `supabase/migrations/20261103090000_i365_articles_service.sql` ตาราง COMMUNITY (`i365_articles`, `i365_podcast_plays`) + หัวข้อหน้า SERVICE
- `supabase/data/i365_current_page_content.sql` เนื้อหาตั้งต้นจากหน้าเว็บเดิม → ผลงานในหลังบ้าน **รันไปแล้ว 3 พ.ย. 2026 ห้ามรันซ้ำ** (จะดึงของที่ลบแล้วกลับมาและซ่อนของที่เพิ่มใหม่ ไฟล์มีตัวกันไว้ให้หยุดเอง) ตั้งแต่นี้แก้เนื้อหาในหลังบ้านเท่านั้น

## หน้าที่ไม่ได้ใช้ i365-content.js

- COMMUNITY HARBOR → `/community` เป็นหน้า React (`src/community/`) อ่านตาราง `i365_articles` โดยตรง
  จัดการที่หลังบ้าน เมนู "COMMUNITY · บทความ" — ประเภท: บทความ/บล็อก/เครื่องมือ → กลุ่มบทความ, คลิป → คลิปกิจกรรม, ข่าว/อัปเดต/ชุมชน → ข่าวกิจกรรม
  ใส่ลิงก์ภายนอก = การ์ดพาออกไปลิงก์นั้น, ใส่ไฟล์เสียง = ปุ่มฟังเป็น Podcast ในหน้าบทความ
- ACADEMY BAY → `academy.html` เกาะเดียวที่พาไปเว็บอื่น (c365.ideas365.space) ผ่านป๊อปอัปยืนยัน
  ลิงก์ไหนใส่ `data-leave="ชื่อเว็บ"` จะถามก่อนออกเสมอ (สร้างโดย `scripts/build-island-pages.py`)
- `404.html` หน้าสำหรับลิงก์ที่ไม่มี

## ไฟล์ที่อัปโหลด (ที่เก็บไฟล์ i365-media)

แต่ละช่องรับไฟล์ตามกฎใน `src/lib/uploadRules.ts` (ช่องในประเภทผลงานเลือกกฎได้ที่หน้า "ประเภทผลงาน" → ไฟล์ที่ช่องนี้รับ)

| กฎ | รับ | สูงสุด | ใช้กับ |
|---|---|---|---|
| รูปภาพ | JPG / PNG / WEBP | 5MB | รูปผลงาน รูปปก โลโก้ ใบประกาศ เรซูเม่ (หน้าเว็บแสดงเรซูเม่เป็นรูป) รูปปก/สติกเกอร์บทความ |
| PDF | PDF | 20MB | ไฟล์ใบประกาศ |
| PDF หรือรูป | PDF / JPG / PNG / WEBP | 20MB | ไฟล์ประกอบงานออกแบบ |
| เอกสาร | PDF / DOCX / XLSX / PPTX / ZIP | 20MB | เอกสาร/เทมเพลต |
| ไฟล์เสียง | MP3 / M4A / WAV | 50MB | Podcast |

- วิดีโอไม่อัปโหลด ใส่เป็นลิงก์ YouTube / TikTok / Facebook เท่านั้น
- ทุกช่องวางลิงก์ไฟล์จากที่อื่นแทนการอัปโหลดได้ (เช่น ImageKit) ขนาดของลิงก์ภายนอกระบบตรวจไม่ได้
- ที่เก็บไฟล์บน Supabase ตั้งไว้ให้รับเฉพาะชนิดเหล่านี้และไม่เกิน 50MB อีกชั้น (migration `20261103120000_i365_upload_rules.sql`)

**ไฟล์ไปพร้อมข้อมูลเสมอ:** ลบผลงาน/บทความ เปลี่ยนไฟล์ใหม่แทนไฟล์เดิม หรือปิดฟอร์มโดยไม่บันทึก → ไฟล์ที่ไม่มีข้อมูลไหนใช้แล้วถูกลบออกจากที่เก็บไฟล์และรายการ `i365_media` ด้วย
ไฟล์ที่ยังมีผลงานอื่นใช้อยู่จะไม่ถูกลบ (ตรวจด้วย `i365_media_in_use` ทุกตาราง `i365_*`) ลิงก์ภายนอกไม่ถูกแตะ
