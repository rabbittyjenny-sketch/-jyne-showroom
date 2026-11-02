# iDEAS365 — เว็บแผนที่เกาะ (www.ideas365.space)

ระบบนี้เป็นของ iDEAS365 ทั้งหมด: หน้าเว็บ หลังบ้าน และตารางในฐานข้อมูล (ขึ้นต้นด้วย `i365_` เท่านั้น)
ไม่ได้ใช้หลังบ้านหรือตารางของ Creatr365 — โค้ดที่นำแบบมาจาก Creatr365 เป็นสำเนาที่ปรับแล้วใน repo นี้ ไม่ได้ลิงก์ข้าม repo

## ชื่อบนหน้าเว็บ ↔ ไฟล์

| ชื่อบนแผนที่ | ไฟล์หน้าเว็บ | หน้าย่อย / หมายเหตุ |
|---|---|---|
| ABOUT ISLAND | `public/island_about.html` (แผนที่ย่อย + หมุด) | about_profile, about_experience, about_live |
| PIC&CLIP WAREHOUSE | `public/island_works.html` (แผนที่ย่อย + หมุด) | works_clips, works_photos |
| AI&TECH CREATION BRIDGE | `public/island_learning.html` (แผนที่ย่อย + หมุด) | learning_tools, learning_docs, learning_design |
| A SERVICE MANIA | `public/service.html` | เนื้อหาจาก iDEAS365-web (/work + /services) |
| COMMUNITY HARBOR | `/community` (React: `src/community/`) | บทความ / คลิปกิจกรรม / ข่าวกิจกรรม จาก `i365_articles` |
| ACADEMY BAY | `public/academy.html` | เกาะเดียวที่พาออกไปเว็บอื่น (ป๊อปอัปถามก่อนออก) |
| CONTACT PIER | `public/contact_port.html` | ไฟล์ต้นฉบับ ไม่ผ่านตัวสร้างหน้า |
| (แผนที่หลัก) | `public/index.html` | ไฟล์ต้นฉบับ |

id ใน index.html ยังเป็นชื่อเก่า (`island-system` = ACADEMY BAY, `island-library` = AI&TECH CREATION BRIDGE, `island-marina` = A SERVICE MANIA, `island-blog` = COMMUNITY HARBOR) — อย่าเปลี่ยน เพราะ CSS ตำแหน่งเกาะผูกกับ id เหล่านี้

## โครงสร้างโฟลเดอร์

```
public/                  หน้าเว็บที่ deploy จริง (สร้างจาก scripts/build-island-pages.py ยกเว้น index.html, contact_port.html)
  i365-content.js        ตัวดึงเนื้อหาจากหลังบ้านใส่หน้า static (ดู docs/CONTENT_FROM_BACKOFFICE.md)
  islands/               รูปหมุดบนแผนที่ย่อย (A1–A3, P1–P2, ai1–ai3) — ดู islands/README.txt
site-source/
  originals/             หน้าต้นฉบับที่ออกแบบด้วยมือ (ใช้เป็นแม่แบบ ไม่ deploy ตรง)
  service-content.json   ข้อความหน้า SERVICE (ตรงกับ iDEAS365-web คำต่อคำ)
  apps-script/           Google Apps Script เดิม (ฟอร์มติดต่อ / ตารางเครื่องมือ / เอกสาร)
scripts/
  build-island-pages.py  สร้างหน้าใน public/ จาก originals  → npm run pages
  build-content-sql.py   สร้าง supabase/data/i365_current_page_content.sql (เนื้อหาตั้งต้น — รันไปแล้ว ห้ามรันซ้ำ)
src/
  community/             หน้า COMMUNITY HARBOR (app.html)
  pages/admin/           หลังบ้าน /backoffice (admin.html)
  components/admin/      ส่วนประกอบหลังบ้าน
  lib/                   supabase client, adminApi, articleTemplate, youtube, upload
supabase/migrations/     โครงสร้างฐานข้อมูล i365_* (รันตามลำดับ)
supabase/data/           เนื้อหาตั้งต้นของหน้า (รันไปแล้ว 3 พ.ย. 2026 — ห้ามรันซ้ำ)
docs/                    คู่มือ + first-admin.sql
```

แผนที่ย่อยทั้ง 3 ใช้รูปจาก ImageKit (`ik.imagekit.io/ideas365logo/iDEAS365 MAP pic/`) ไม่มีไฟล์รูปแผนที่ใน repo

## คำสั่ง

- `npm run pages` — สร้างหน้าใน `public/` ใหม่หลังแก้ originals / service-content.json / ตัวสร้าง
- `npm run build` — build สำหรับ Vercel (หน้า static + app.html + admin.html)

Vercel rewrites (`vercel.json`): `/community*` → app.html, `/backoffice*` → admin.html
ค่าที่ต้องตั้งใน Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

## หลังบ้าน (/backoffice)

- เกาะ · เนื้อหาในหน้า — เมนูย่อย/ผลงานของทุกหน้า static (รวมหน้า SERVICE)
- COMMUNITY · บทความ — บทความ คลิป ข่าว ของ /community (ตาราง `i365_articles`, สถิติฟัง podcast `i365_podcast_plays`)
- ประเภทผลงาน, แม่แบบเกาะ
- กลุ่ม "ยังไม่ได้ใช้กับหน้าเว็บตอนนี้" (แท็ก เส้นทางสมัครงาน ข้อความติดต่อ ตั้งค่าเว็บ) — มีตารางแล้วแต่หน้าเว็บยังไม่ได้ใช้

ผู้ดูแลระบบกำหนดในตาราง `i365_admins` (ดู `docs/first-admin.sql`)
