import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FieldInput, UploadOrUrl, missingRequired } from '@/components/admin/FieldInputs';
import { insert, list, remove, slugify, update, uploadMedia } from '@/lib/adminApi';
import { itemPicture } from '@/components/site/ItemViews';
import { SafeImg } from '@/components/site/SafeImg';
import type { Category, Island, Item, ItemType, Route, Section, Tag, TagGroup } from '@/lib/types';

type Msg = { text: string; ok: boolean } | null;
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));
const MAX_BATCH = 10;

export default function SectionItems() {
  const { id = '' } = useParams();
  const [section, setSection] = useState<Section | null>(null);
  const [island, setIsland] = useState<Island | null>(null);
  const [type, setType] = useState<ItemType | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [groups, setGroups] = useState<TagGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [bulk, setBulk] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');

  const load = async () => {
    try {
      const [sec] = await list<Section>('i365_sections', [['id', id]]);
      if (!sec) return;
      const [isl, t, it, c, g, tg, r] = await Promise.all([
        list<Island>('i365_islands', [['id', sec.island_id]]),
        sec.item_type_id ? list<ItemType>('i365_item_types', [['id', sec.item_type_id]]) : Promise.resolve([]),
        list<Item>('i365_items', [['section_id', sec.id]]),
        list<Category>('i365_categories', [['section_id', sec.id]]),
        list<TagGroup>('i365_tag_groups'), list<Tag>('i365_tags'), list<Route>('i365_routes'),
      ]);
      setSection(sec); setIsland(isl[0] ?? null); setType(t[0] ?? null); setItems(it); setCats(c); setGroups(g); setTags(tg); setRoutes(r);
    } catch (e) { setMsg({ text: errText(e), ok: false }); }
  };
  useEffect(() => { load(); }, [id]);

  const catName = (cid: string | null) => {
    const c = cats.find((x) => x.id === cid);
    if (!c) return 'ไม่มีหมวด';
    const p = cats.find((x) => x.id === c.parent_id);
    return p ? `${p.name_th} › ${c.name_th}` : c.name_th;
  };
  const shown = useMemo(() => items.filter((i) => filterCat === 'all' || (filterCat === 'none' ? !i.category_id : i.category_id === filterCat)), [items, filterCat]);

  if (!section || !type) return <AdminLayout title="ผลงาน"><Notice msg={msg ?? { text: 'กำลังโหลด…', ok: true }} /></AdminLayout>;
  const canBulk = !!type.features?.bulk_field;

  return (
    <AdminLayout
      title={`${island?.name_th ?? ''} › ${section.name_th}`}
      actions={<>
        {island && <Link to={`/backoffice/islands/${island.id}`} className="inline-flex items-center rounded-md border px-3 text-sm">← กลับเกาะ</Link>}
        {canBulk && <Button variant="outline" onClick={() => setBulk(true)}>+ เพิ่มหลายชิ้น (สูงสุด {MAX_BATCH})</Button>}
        <Button onClick={() => setEditing({ section_id: section.id, item_type_id: type.id, data: {}, is_published: true, sort_order: items.length + 1 })}>+ เพิ่มผลงาน</Button>
      </>}
    >
      <Notice msg={msg} />
      <p className="text-sm text-muted-foreground mb-4">ประเภทผลงาน: <b>{type.name_th}</b> · ทั้งหมด {items.length} ชิ้น</p>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <CategoryPanel section={section} cats={cats} items={items} onChanged={async (t) => { setMsg({ text: t, ok: true }); await load(); }} onError={(t) => setMsg({ text: t, ok: false })} />

        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span>แสดง:</span>
            <select className="h-9 rounded-md border bg-background px-2" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="all">ทุกหมวด</option><option value="none">ไม่มีหมวด</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{catName(c.id)}</option>)}
            </select>
          </div>
          {shown.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีผลงาน</p>}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((it) => {
              const pic = itemPicture(it, type);
              return (
                <button key={it.id} onClick={() => setEditing(it)} className="text-left rounded-md border p-2 hover:bg-muted flex gap-3">
                  <div className="w-16 h-16 rounded bg-muted shrink-0 overflow-hidden"><SafeImg src={pic} className="w-full h-full object-cover" /></div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{it.title_th}</div>
                    <div className="text-xs text-muted-foreground truncate">{catName(it.category_id)}</div>
                    <div className="text-xs">{it.is_published ? 'เผยแพร่' : <span className="text-amber-700">ซ่อน</span>}{it.batch_id && ' · อัปเป็นชุด'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {editing && (
        <ItemDialog item={editing} type={type} cats={cats} catName={catName} groups={groups} tags={tags} routes={routes}
          onClose={() => setEditing(null)} onSaved={async (t) => { setEditing(null); setMsg({ text: t, ok: true }); await load(); }} />
      )}
      {bulk && (
        <BulkDialog section={section} type={type} cats={cats} catName={catName}
          onClose={() => setBulk(false)} onSaved={async (t) => { setBulk(false); setMsg({ text: t, ok: true }); await load(); }} />
      )}
    </AdminLayout>
  );
}

/** Categories of this section: max 2 levels; deleting one that is in use asks where its work goes. */
function CategoryPanel({ section, cats, items, onChanged, onError }: {
  section: Section; cats: Category[]; items: Item[]; onChanged: (t: string) => void; onError: (t: string) => void;
}) {
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const tops = cats.filter((c) => !c.parent_id);

  const add = async () => {
    if (!name.trim()) return;
    try {
      const slug = slugify(name) || `cat-${Date.now().toString(36)}`;
      await insert('i365_categories', { section_id: section.id, parent_id: parent || null, slug, name_th: name.trim(), sort_order: cats.length + 1 });
      setName(''); setParent(''); onChanged('เพิ่มหมวดแล้ว');
    } catch (e) { onError(errText(e)); }
  };

  const del = async (c: Category) => {
    if (cats.some((x) => x.parent_id === c.id)) { onError('ลบหมวดย่อยข้างในก่อน'); return; }
    const used = items.filter((i) => i.category_id === c.id);
    try {
      if (used.length) {
        const options = cats.filter((x) => x.id !== c.id).map((x, i) => `${i + 1}. ${x.name_th}`).join('\n');
        const pick = prompt(`หมวดนี้มีผลงาน ${used.length} ชิ้น ย้ายไปหมวดไหน? พิมพ์หมายเลข (เว้นว่าง = ไม่มีหมวด)\n${options}`);
        if (pick === null) return;
        const target = pick.trim() ? cats.filter((x) => x.id !== c.id)[Number(pick) - 1] : null;
        if (pick.trim() && !target) { onError('หมายเลขไม่ถูกต้อง ยังไม่ได้ลบ'); return; }
        for (const it of used) await update('i365_items', { id: it.id }, { category_id: target?.id ?? null });
      } else if (!confirm(`ลบหมวด "${c.name_th}"?`)) return;
      await remove('i365_categories', { id: c.id });
      onChanged('ลบหมวดแล้ว');
    } catch (e) { onError(errText(e)); }
  };

  const rename = async (c: Category) => {
    const n = prompt('ชื่อหมวดใหม่', c.name_th);
    if (!n?.trim()) return;
    try { await update('i365_categories', { id: c.id }, { name_th: n.trim() }); onChanged('เปลี่ยนชื่อหมวดแล้ว (ลิงก์เดิมไม่เสีย)'); } catch (e) { onError(errText(e)); }
  };

  return (
    <div className="rounded-lg border bg-background p-4 space-y-3 h-fit">
      <h2 className="font-semibold">หมวดในเมนูนี้</h2>
      <p className="text-xs text-muted-foreground">ผลงาน 1 ชิ้นอยู่ได้ 1 หมวด ซ้อนได้ 2 ชั้น</p>
      <ul className="space-y-1 text-sm">
        {tops.map((t) => (
          <li key={t.id}>
            <CatRow c={t} onRename={rename} onDelete={del} count={items.filter((i) => i.category_id === t.id).length} />
            <ul className="ml-4">
              {cats.filter((c) => c.parent_id === t.id).map((c) => (
                <li key={c.id}><CatRow c={c} onRename={rename} onDelete={del} count={items.filter((i) => i.category_id === c.id).length} /></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="space-y-2 pt-2 border-t">
        <Input placeholder="ชื่อหมวดใหม่" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="w-full h-9 rounded-md border bg-background px-2 text-sm" value={parent} onChange={(e) => setParent(e.target.value)}>
          <option value="">เป็นหมวดหลัก</option>
          {tops.map((t) => <option key={t.id} value={t.id}>หมวดย่อยของ {t.name_th}</option>)}
        </select>
        <Button size="sm" className="w-full" onClick={add}>+ เพิ่มหมวด</Button>
      </div>
    </div>
  );
}

function CatRow({ c, count, onRename, onDelete }: { c: Category; count: number; onRename: (c: Category) => void; onDelete: (c: Category) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span>{c.name_th} <span className="text-muted-foreground">({count})</span></span>
      <span className="text-xs whitespace-nowrap"><button className="underline mr-2" onClick={() => onRename(c)}>แก้ชื่อ</button><button className="underline text-red-600" onClick={() => onDelete(c)}>ลบ</button></span>
    </div>
  );
}

function CategorySelect({ cats, catName, value, onChange }: { cats: Category[]; catName: (id: string) => string; value: string; onChange: (v: string) => void }) {
  return (
    <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">ไม่มีหมวด</option>
      {cats.map((c) => <option key={c.id} value={c.id}>{catName(c.id)}</option>)}
    </select>
  );
}

function ItemDialog({ item, type, cats, catName, groups, tags, routes, onClose, onSaved }: {
  item: Partial<Item>; type: ItemType; cats: Category[]; catName: (id: string) => string;
  groups: TagGroup[]; tags: Tag[]; routes: Route[]; onClose: () => void; onSaved: (t: string) => void;
}) {
  const [it, setIt] = useState<Partial<Item>>({ ...item, data: { ...(item.data ?? {}) } });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const isNew = !item.id;

  useEffect(() => {
    if (isNew) return;
    Promise.all([list<{ tag_id: string }>('i365_item_tags', [['item_id', item.id!]], null), list<{ route_id: string }>('i365_route_items', [['item_id', item.id!]], null)])
      .then(([t, r]) => { setTagIds(t.map((x) => x.tag_id)); setRouteIds(r.map((x) => x.route_id)); })
      .catch(() => undefined);
  }, [isNew, item.id]);

  const setData = (k: string, v: unknown) => { setIt((p) => ({ ...p, data: { ...(p.data ?? {}), [k]: v } })); setErrors((e) => ({ ...e, [k]: '' })); };

  const toggleTag = (g: TagGroup, id: string) => setTagIds((cur) => {
    if (cur.includes(id)) return cur.filter((x) => x !== id);
    if (!g.allow_multiple) return [...cur.filter((x) => tags.find((t) => t.id === x)?.group_id !== g.id), id];
    return [...cur, id];
  });

  const save = async () => {
    setErr(null);
    const errs = missingRequired(type.fields, it.data ?? {});
    if (!it.title_th?.trim()) errs.__title = 'ต้องมีชื่อผลงาน';
    setErrors(errs);
    if (Object.keys(errs).length) { setErr('กรอกช่องที่จำเป็นให้ครบ'); return; }
    setBusy(true);
    try {
      const row = {
        section_id: it.section_id, item_type_id: it.item_type_id, category_id: it.category_id || null,
        title_th: it.title_th!.trim(), title_en: it.title_en || null, summary_th: it.summary_th || null, summary_en: it.summary_en || null,
        cover_image: it.cover_image || null, data: it.data, is_featured: !!it.is_featured, is_published: it.is_published !== false, sort_order: it.sort_order ?? 0,
      };
      let itemId = item.id;
      if (isNew) itemId = (await insert<Item>('i365_items', row))[0].id;
      else await update('i365_items', { id: item.id }, row);
      // tags and routes: replace the set for this item
      await remove('i365_item_tags', { item_id: itemId });
      if (tagIds.length) await insert('i365_item_tags', tagIds.map((tag_id) => ({ item_id: itemId, tag_id })));
      const before = isNew ? [] : (await list<{ route_id: string }>('i365_route_items', [['item_id', itemId!]], null)).map((x) => x.route_id);
      for (const r of before.filter((x) => !routeIds.includes(x))) await remove('i365_route_items', { route_id: r, item_id: itemId });
      for (const r of routeIds.filter((x) => !before.includes(x))) await insert('i365_route_items', { route_id: r, item_id: itemId, sort_order: 999 });
      onSaved(isNew ? 'เพิ่มผลงานแล้ว' : 'บันทึกผลงานแล้ว');
    } catch (e) { setErr(errText(e)); } finally { setBusy(false); }
  };

  const del = async () => {
    if (!confirm(`ลบผลงาน "${item.title_th}" ถาวร?`)) return;
    try { await remove('i365_items', { id: item.id }); onSaved('ลบผลงานแล้ว'); } catch (e) { setErr(errText(e)); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? `เพิ่ม${type.name_th}` : 'แก้ไขผลงาน'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>ชื่อผลงาน *</Label><Input value={it.title_th ?? ''} onChange={(e) => { setIt({ ...it, title_th: e.target.value }); setErrors((x) => ({ ...x, __title: '' })); }} />
            {errors.__title && <p className="text-xs text-red-600">{errors.__title}</p>}</div>
          <div className="space-y-1"><Label>ชื่อ (อังกฤษ)</Label><Input value={it.title_en ?? ''} onChange={(e) => setIt({ ...it, title_en: e.target.value })} /></div>
          <div className="space-y-1"><Label>สรุปสั้น</Label><Textarea rows={2} value={it.summary_th ?? ''} onChange={(e) => setIt({ ...it, summary_th: e.target.value })} /></div>
          <div className="space-y-1"><Label>หมวด</Label><CategorySelect cats={cats} catName={catName} value={it.category_id ?? ''} onChange={(v) => setIt({ ...it, category_id: v || null })} /></div>
          {type.features?.has_cover && <div className="space-y-1"><Label>รูปปก</Label><UploadOrUrl value={it.cover_image ?? ''} onChange={(v) => setIt({ ...it, cover_image: v })} accept="image/*" folder="covers" preview /></div>}
          <div className="rounded-md border p-3 space-y-3">
            <div className="text-sm font-medium">ข้อมูลของ{type.name_th}</div>
            {type.fields.map((f) => <FieldInput key={f.key} field={f} value={it.data?.[f.key]} onChange={(v) => setData(f.key, v)} error={errors[f.key]} />)}
          </div>
          {groups.map((g) => (
            <div key={g.id} className="space-y-1">
              <Label>{g.name_th}{!g.allow_multiple && ' (เลือกได้ 1)'}</Label>
              <div className="flex flex-wrap gap-2">
                {tags.filter((t) => t.group_id === g.id).map((t) => (
                  <button key={t.id} type="button" onClick={() => toggleTag(g, t.id)}
                    className={`rounded-full border px-3 py-1 text-xs ${tagIds.includes(t.id) ? 'bg-foreground text-background' : ''}`}>{t.name_th}</button>
                ))}
              </div>
            </div>
          ))}
          {routes.length > 0 && (
            <div className="space-y-1">
              <Label>โชว์ในเส้นทางสมัครงาน</Label>
              <div className="flex flex-wrap gap-3 text-sm">
                {routes.map((r) => (
                  <label key={r.id} className="flex items-center gap-1">
                    <input type="checkbox" checked={routeIds.includes(r.id)} onChange={(e) => setRouteIds((cur) => (e.target.checked ? [...cur, r.id] : cur.filter((x) => x !== r.id)))} />{r.title_th}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="space-y-1"><Label>ลำดับ</Label><Input type="number" value={it.sort_order ?? 0} onChange={(e) => setIt({ ...it, sort_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2 h-10"><Switch checked={it.is_published !== false} onCheckedChange={(c) => setIt({ ...it, is_published: c })} /><Label>เผยแพร่</Label></div>
            <div className="flex items-center gap-2 h-10"><Switch checked={!!it.is_featured} onCheckedChange={(c) => setIt({ ...it, is_featured: c })} /><Label>ผลงานเด่น</Label></div>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex justify-between pt-2">
            {!isNew ? <Button variant="outline" className="text-red-600" onClick={del}>ลบ</Button> : <span />}
            <Button onClick={save} disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Multi-add: up to 10 at a time, ONE category for the whole batch.
 * Files/links of another category have to go in a separate batch — the database
 * also refuses a mixed batch (i365_check_batch), so this cannot be bypassed.
 */
function BulkDialog({ section, type, cats, catName, onClose, onSaved }: {
  section: Section; type: ItemType; cats: Category[]; catName: (id: string) => string; onClose: () => void; onSaved: (t: string) => void;
}) {
  const field = type.fields.find((f) => f.key === type.features?.bulk_field)!;
  const isFile = field.type === 'image' || field.type === 'file';
  const [category, setCategory] = useState('');
  const [chosen, setChosen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const linkList = links.split('\n').map((s) => s.trim()).filter(Boolean);
  const count = isFile ? files.length : linkList.length;

  const run = async () => {
    setErr(null);
    if (cats.length > 0 && !chosen) { setErr('เลือกหมวดของชุดนี้ก่อน'); return; }
    if (count === 0) { setErr(isFile ? 'เลือกไฟล์ก่อน' : 'วางลิงก์อย่างน้อย 1 ลิงก์'); return; }
    if (count > MAX_BATCH) { setErr(`ครั้งละไม่เกิน ${MAX_BATCH} ชิ้น (ตอนนี้ ${count})`); return; }
    const batch_id = crypto.randomUUID();
    try {
      const values: { value: string; title: string }[] = [];
      if (isFile) {
        for (let i = 0; i < files.length; i++) {
          setProgress(`กำลังอัป ${i + 1}/${files.length}…`);
          values.push({ value: await uploadMedia(files[i], `sections/${section.slug}`), title: files[i].name.replace(/\.[^.]+$/, '') });
        }
      } else {
        linkList.forEach((l, i) => values.push({ value: l, title: `${section.name_th} #${i + 1}` }));
      }
      setProgress('กำลังบันทึก…');
      await insert('i365_items', values.map((v, i) => ({
        section_id: section.id, item_type_id: type.id, category_id: category || null, batch_id,
        title_th: v.title, data: { [field.key]: v.value }, is_published: true, sort_order: i + 1,
      })));
      onSaved(`เพิ่ม ${values.length} ชิ้นในหมวด "${category ? catName(category) : 'ไม่มีหมวด'}" แล้ว แก้ชื่อทีละชิ้นได้ภายหลัง`);
    } catch (e) { setErr(errText(e)); setProgress(null); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>เพิ่มหลายชิ้น · {section.name_th}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>1. หมวดของทั้งชุด (ชุดละ 1 หมวด)</Label>
            <CategorySelect cats={cats} catName={catName} value={category} onChange={(v) => { setCategory(v); setChosen(true); setErr(null); }} />
            <p className="text-xs text-muted-foreground">ทุกชิ้นในชุดนี้จะอยู่หมวดเดียวกัน ถ้ามีของหมวดอื่น ให้เพิ่มเป็นอีกชุด</p>
          </div>
          <div className="space-y-1">
            <Label>2. {isFile ? `เลือกไฟล์ (สูงสุด ${MAX_BATCH})` : `วางลิงก์ บรรทัดละ 1 ลิงก์ (สูงสุด ${MAX_BATCH})`}</Label>
            {isFile ? (
              <Input type="file" multiple accept={field.type === 'image' ? 'image/*' : undefined}
                onChange={(e) => { setFiles(Array.from(e.target.files ?? [])); setErr(null); }} />
            ) : (
              <Textarea rows={6} value={links} onChange={(e) => { setLinks(e.target.value); setErr(null); }} placeholder={'https://www.youtube.com/watch?v=...\nhttps://youtu.be/...'} />
            )}
            <p className={`text-xs ${count > MAX_BATCH ? 'text-red-600' : 'text-muted-foreground'}`}>{count} / {MAX_BATCH} ชิ้น</p>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          {progress && <p className="text-sm">{progress}</p>}
          <Button className="w-full" onClick={run} disabled={!!progress}>เพิ่มทั้งชุด</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
