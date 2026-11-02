-- iDEAS365 · once a menu (section) is shown from the back office, it stays that way.
-- Before: a menu with no published items fell back to the original content in the page code,
-- so deleting every clip of a menu brought the old hard-coded clips back.
-- Now: i365_sections.from_backoffice turns true the first time one of its items is published, and never
-- turns back on its own. Such a menu with nothing published shows its card with "COMING SOON · เร็วๆ นี้".
-- Menus that never had a published item (certificates, the 3 tools tables, free resources …) keep showing
-- the page's own content / Google Sheet exactly as before. i365_ objects only. Safe to run more than once.

alter table public.i365_sections add column if not exists from_backoffice boolean not null default false;
comment on column public.i365_sections.from_backoffice is
  'true once an item of this menu was published; the page then shows only back-office items (COMING SOON when none).';

-- menus the live pages already show from the back office (at least one published item today)
update public.i365_sections s set from_backoffice = true
 where not s.from_backoffice
   and exists (select 1 from public.i365_items i where i.section_id = s.id and i.is_published);

create or replace function public.i365_mark_section_from_backoffice()
returns trigger language plpgsql set search_path = public as $$
begin
  update public.i365_sections set from_backoffice = true
   where id = new.section_id and not from_backoffice;
  return null;
end $$;

drop trigger if exists i365_items_mark_section on public.i365_items;
create trigger i365_items_mark_section
  after insert or update of is_published, section_id on public.i365_items
  for each row when (new.is_published) execute function public.i365_mark_section_from_backoffice();
