-- iDEAS365 · let a menu's on-page heading follow its back-office name, when you explicitly turn that on.
-- Before: i365_sections.name_th / name_en have always been editable in the back office, but for a menu whose
-- card already exists in a page's own HTML (true of almost every menu today), the page only ever swapped in
-- the published items — the <h2> heading stayed exactly as written in that page's code, no matter what the
-- back office said. A menu created from scratch in the back office (no existing card on the page) was the
-- only case where name_th already drove the heading.
-- Now: i365_sections.title_synced (default false, so nothing on any existing page changes by itself) lets
-- you say "yes, show name_th/name_en here" for one menu at a time, from the "แก้ไขเมนูย่อย" dialog. Once on,
-- i365-content.js replaces that menu's heading (English · Thai, matching how every other heading on the site
-- is written) and its short description with name_en/name_th/description_th — and the matching entry in the
-- page's left-hand section nav follows along too, since that nav reads its label off the heading itself.
-- i365_ objects only. Safe to run more than once.

alter table public.i365_sections add column if not exists title_synced boolean not null default false;
comment on column public.i365_sections.title_synced is
  'true -> this menu''s on-page heading/description is replaced by name_en/name_th/description_th; '
  'false (default) -> the page keeps its own written heading, exactly as before this column existed.';

-- the one menu this was reported against: its card is titled "MAKEUP & HAIR" in works_photos.html, but every
-- item published under it today is a live-selling photo, not a makeup/hair one — turn syncing on for it so
-- renaming it in the back office (ชื่อ (ไทย) / ชื่อ (อังกฤษ)) is all that's needed to fix the heading.
update public.i365_sections set title_synced = true where slug = 'makeup-hair';
