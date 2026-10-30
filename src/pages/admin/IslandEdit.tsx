import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PositionInputs, UploadOrUrl } from '@/components/admin/FieldInputs';
import { insert, list, slugify, update } from '@/lib/adminApi';
import {
  DISPLAY_LABELS, FEATURE_LABELS, SOURCE_LABELS,
  type DisplayStyle, type Features, type Island, type ItemType, type Section, type SourceType,
} from '@/lib/types';

type Msg = { text: string; ok: boolean } | null;

export default function IslandEdit() {
  const { id = '' } = useParams();
  const [island, setIsland] = useState<Island | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [types, setTypes] = useState<ItemType[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [editing, setEditing] = useState<Partial<Section> | null>(null);

  const load = async () => {
    try {
      const [isl, secs, t] = await Promise.all([
        list<Island>('i365_islands', [['id', id]]), list<Section>('i365_sections', [['island_id', id]]), list<ItemType>('i365_item_types'),
      ]);
      setIsland(isl[0] ?? null); setSections(secs); setTypes(t);
    } catch (e) { setMsg({ text: e instanceof Error ? e.message : String(e), ok: false }); }
  };
  useEffect(() => { load(); }, [id]);

  if (!island) return <AdminLayout title="เกาะ"><Notice msg={msg ?? { text: 'กำลังโหลด…', ok: true }} /></AdminLayout>;
  const set = (patch: Partial<Island>) => setIsland({ ...island, ...patch });
  const features = island.features ?? {};

  const save = async () => {
    setMsg(null);
    if (!island.name_th.trim()) { setMsg({ text: 'ต้องมีชื่อเกาะ', ok: false }); return; }
    if (features.is_redirect && !island.redirect_url) { setMsg({ text: 'เกาะพาไปเว็บอื่นต้องมีลิงก์ปลายทาง', ok: false }); return; }
    try {
      const { id: _id, deleted_at: _d, ...patch } = island;
      await update('i365_islands', { id: island.id }, patch);
      setMsg({ text: 'บันทึกเกาะแล้ว', ok: true });
    } catch (e) { setMsg({ text: e instanceof Error ? e.message : String(e), ok: false }); }
  };

  const visibleSections = sections.filter((s) => !s.deleted_at);

  return (
    <AdminLayout title={`เกาะ: ${island.name_th}`} actions={<>
      <a className="inline-flex items-center rounded-md border px-3 text-sm" href={`/i/${island.slug}`} target="_blank" rel="noreferrer">ดูหน้าเกาะ ↗</a>
      <Button onClick={save}>บันทึกเกาะ</Button>
    </>}>
      <Notice msg={msg} />
      <div className="grid gap-6 lg:grid-cols-2 mt-4">
        <section className="rounded-lg border bg-background p-4 space-y-3">
          <h2 className="font-semibold">ข้อมูลเกาะ</h2>
          <div className="flex items-center justify-between"><Label>เผยแพร่บนหน้าเว็บ</Label><Switch checked={island.is_published} onCheckedChange={(c) => set({ is_published: c })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>ชื่อเกาะ (ไทย)</Label><Input value={island.name_th} onChange={(e) => set({ name_th: e.target.value })} /></div>
            <div className="space-y-1"><Label>ชื่อเกาะ (อังกฤษ)</Label><Input value={island.name_en ?? ''} onChange={(e) => set({ name_en: e.target.value })} /></div>
          </div>
          <div className="space-y-1"><Label>ป้ายลอยเมื่อชี้</Label><Input value={island.tooltip_th ?? ''} onChange={(e) => set({ tooltip_th: e.target.value })} /></div>
          <div className="space-y-1"><Label>คำแนะนำสั้นบนหน้าเกาะ</Label><Textarea rows={3} value={island.intro_th ?? ''} onChange={(e) => set({ intro_th: e.target.value })} /></div>
          <div className="space-y-1"><Label>ลำดับบนแผนที่</Label><Input type="number" value={island.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></div>
        </section>

        <section className="rounded-lg border bg-background p-4 space-y-3">
          <h2 className="font-semibold">ฟีเจอร์ของเกาะนี้</h2>
          <p className="text-xs text-muted-foreground">ได้มาจากแม่แบบตอนสร้าง เปิด/ปิดเฉพาะเกาะนี้ได้ (แบบ EMS)</p>
          {(Object.keys(FEATURE_LABELS) as (keyof Features)[]).map((k) => (
            <div key={k} className="flex items-center justify-between">
              <Label className="font-normal">{FEATURE_LABELS[k]}</Label>
              <Switch checked={!!features[k]} onCheckedChange={(c) => set({ features: { ...features, [k]: c } })} />
            </div>
          ))}
          {features.is_redirect && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="col-span-2 space-y-1"><Label>ลิงก์ปลายทาง</Label><Input value={island.redirect_url ?? ''} onChange={(e) => set({ redirect_url: e.target.value })} /></div>
              <div className="space-y-1"><Label>รอก่อนไป (มิลลิวินาที)</Label><Input type="number" value={island.redirect_delay_ms} onChange={(e) => set({ redirect_delay_ms: Number(e.target.value) })} /></div>
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-background p-4 space-y-3 lg:col-span-2">
          <h2 className="font-semibold">รูปและตำแหน่ง</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>รูปเกาะบนแผนที่หลัก (ปุ่ม) · ชื่อไฟล์แนะนำ <code>islands/{island.slug}/map-button.png</code></Label>
              <UploadOrUrl value={island.button_image ?? ''} onChange={(v) => set({ button_image: v || null })} accept="image/*" folder={`islands/${island.slug}`} preview />
              <Label className="text-xs">ตำแหน่งบนแผนที่หลัก</Label>
              <PositionInputs left={island.pos_left} top={island.pos_top} width={island.pos_width} onChange={(p) => set(p)} />
            </div>
            <div className="space-y-2">
              <Label>พื้นเกาะด้านใน (รูป หรือ .mp4) · ชื่อไฟล์แนะนำ <code>islands/{island.slug}/land.webp</code></Label>
              <UploadOrUrl value={island.land_image ?? ''} onChange={(v) => set({ land_image: v || null })} accept="image/*,video/mp4" folder={`islands/${island.slug}`} preview />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">สัดส่วนรูป (กว้าง/สูง)</Label><Input value={island.land_aspect} onChange={(e) => set({ land_aspect: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">จุดกึ่งกลางบนมือถือ (% แนวนอน)</Label><Input type="number" value={island.mobile_focus_x} onChange={(e) => set({ mobile_focus_x: Number(e.target.value) })} /></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-lg border bg-background p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">เมนูย่อย (ปุ่มบนเกาะ)</h2>
          <Button size="sm" onClick={() => setEditing({ island_id: island.id, source_type: 'items', display_style: 'cards', filter_mode: 'categories', is_published: false, sort_order: visibleSections.length + 1 })}>+ เพิ่มเมนูย่อย</Button>
        </div>
        {visibleSections.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีเมนูย่อย</p>}
        <table className="w-full text-sm">
          <tbody>
            {visibleSections.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-2 pr-2 w-8 text-muted-foreground">{s.sort_order}</td>
                <td className="py-2 pr-2"><div className="font-medium">{s.name_th}</div><div className="text-xs text-muted-foreground">/{s.slug} · {SOURCE_LABELS[s.source_type]}{s.item_type_id ? ` · ${types.find((t) => t.id === s.item_type_id)?.name_th}` : ''}</div></td>
                <td className="py-2 pr-2 text-xs">{s.pos_left === null ? <span className="text-amber-700">ยังไม่วางตำแหน่ง</span> : `${s.pos_left}% / ${s.pos_top}% · กว้าง ${s.pos_width}%`}</td>
                <td className="py-2 pr-2 text-xs">{s.is_published ? 'เผยแพร่' : 'ร่าง'}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  {s.source_type === 'items' && <Link className="underline mr-3" to={`/backoffice/sections/${s.id}`}>ผลงาน →</Link>}
                  <button className="underline" onClick={() => setEditing(s)}>แก้ไข</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editing && (
        <SectionDialog section={editing} islandSlug={island.slug} types={types} onClose={() => setEditing(null)}
          onSaved={async (text) => { setEditing(null); setMsg({ text, ok: true }); await load(); }} />
      )}
    </AdminLayout>
  );
}

function SectionDialog({ section, islandSlug, types, onClose, onSaved }: {
  section: Partial<Section>; islandSlug: string; types: ItemType[]; onClose: () => void; onSaved: (msg: string) => void;
}) {
  const [s, setS] = useState<Partial<Section>>(section);
  const [err, setErr] = useState<string | null>(null);
  const set = (p: Partial<Section>) => { setS({ ...s, ...p }); setErr(null); };
  const isNew = !section.id;

  const save = async () => {
    setErr(null);
    if (!s.name_th?.trim()) { setErr('ตั้งชื่อเมนูย่อย'); return; }
    const slug = s.slug || slugify(s.name_en || s.name_th);
    if (!/^[a-z0-9-]+$/.test(slug)) { setErr('ชื่อในลิงก์ใช้ได้เฉพาะ a-z 0-9 และ - (ตั้งชื่ออังกฤษหรือพิมพ์เอง)'); return; }
    if (s.source_type === 'items' && !s.item_type_id) { setErr('เมนูที่เก็บผลงานต้องเลือกประเภทผลงาน'); return; }
    if (s.source_type === 'external_link' && !s.external_url) { setErr('ใส่ลิงก์ปลายทาง'); return; }
    const row = {
      island_id: s.island_id, slug, name_th: s.name_th.trim(), name_en: s.name_en ?? null, description_th: s.description_th ?? null,
      item_type_id: s.source_type === 'items' ? s.item_type_id : null, source_type: s.source_type, external_url: s.external_url ?? null,
      display_style: s.display_style, filter_mode: s.filter_mode, button_image: s.button_image ?? `/islands/${islandSlug}/btn-${slug}.png`,
      pos_left: s.pos_left ?? null, pos_top: s.pos_top ?? null, pos_width: s.pos_width ?? null,
      is_published: !!s.is_published, sort_order: s.sort_order ?? 0,
    };
    try {
      if (isNew) await insert('i365_sections', row);
      else await update('i365_sections', { id: section.id }, row);
      onSaved(isNew ? 'เพิ่มเมนูย่อยแล้ว' : 'บันทึกเมนูย่อยแล้ว');
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  const hide = async () => {
    if (!confirm('ลบเมนูย่อยนี้? จะถูกซ่อนจากหน้าเว็บ ผลงานข้างในยังอยู่')) return;
    try { await update('i365_sections', { id: section.id }, { deleted_at: new Date().toISOString(), is_published: false }); onSaved('ซ่อนเมนูย่อยแล้ว'); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? 'เพิ่มเมนูย่อย' : `แก้ไข: ${section.name_th}`}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>ชื่อ (ไทย)</Label><Input value={s.name_th ?? ''} onChange={(e) => set({ name_th: e.target.value })} /></div>
            <div className="space-y-1"><Label>ชื่อ (อังกฤษ)</Label><Input value={s.name_en ?? ''} onChange={(e) => set({ name_en: e.target.value })} /></div>
          </div>
          <div className="space-y-1">
            <Label>ชื่อในลิงก์</Label>
            <Input value={s.slug ?? ''} disabled={!isNew} placeholder={slugify(s.name_en || s.name_th || '')} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} />
            {!isNew && <p className="text-xs text-muted-foreground">เปลี่ยนไม่ได้หลังสร้าง เพื่อไม่ให้ลิงก์ที่ส่งไปแล้วเสีย</p>}
          </div>
          <div className="space-y-1"><Label>คำอธิบายสั้น</Label><Input value={s.description_th ?? ''} onChange={(e) => set({ description_th: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>เนื้อหามาจาก</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={s.source_type} disabled={!isNew}
                onChange={(e) => set({ source_type: e.target.value as SourceType, display_style: e.target.value.startsWith('c365') ? 'feed' : s.display_style })}>
                {(Object.keys(SOURCE_LABELS) as SourceType[]).map((k) => <option key={k} value={k}>{SOURCE_LABELS[k]}</option>)}
              </select>
            </div>
            {s.source_type === 'items' && (
              <div className="space-y-1">
                <Label>ประเภทผลงาน</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={s.item_type_id ?? ''} disabled={!isNew}
                  onChange={(e) => { const t = types.find((x) => x.id === e.target.value); set({ item_type_id: e.target.value, display_style: t?.default_display ?? s.display_style }); }}>
                  <option value="">— เลือก —</option>
                  {types.filter((t) => t.is_active).map((t) => <option key={t.id} value={t.id}>{t.name_th}</option>)}
                </select>
                {!isNew && <p className="text-xs text-muted-foreground">ประเภทเปลี่ยนไม่ได้หลังสร้าง (ผลงานข้างในผูกกับประเภทนี้)</p>}
              </div>
            )}
            {s.source_type === 'external_link' && (
              <div className="space-y-1"><Label>ลิงก์ปลายทาง</Label><Input value={s.external_url ?? ''} onChange={(e) => set({ external_url: e.target.value })} /></div>
            )}
          </div>
          {s.source_type === 'items' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>รูปแบบการแสดง</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={s.display_style} onChange={(e) => set({ display_style: e.target.value as DisplayStyle })}>
                  {(Object.keys(DISPLAY_LABELS) as DisplayStyle[]).filter((k) => k !== 'feed').map((k) => <option key={k} value={k}>{DISPLAY_LABELS[k]}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>ตัวกรองด้านบน</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={s.filter_mode} onChange={(e) => set({ filter_mode: e.target.value as Section['filter_mode'] })}>
                  <option value="categories">ตามหมวด</option><option value="none">ไม่มี</option>
                </select>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>รูปปุ่มบนเกาะ · ชื่อไฟล์แนะนำ <code>islands/{islandSlug}/btn-{s.slug || slugify(s.name_en || s.name_th || '') || 'ชื่อ'}.png</code></Label>
            <UploadOrUrl value={s.button_image ?? ''} onChange={(v) => set({ button_image: v || null })} accept="image/*" folder={`islands/${islandSlug}`} preview />
            <Label className="text-xs">ตำแหน่งบนรูปเกาะ (ว่าง = แสดงเป็นปุ่มธรรมดาใต้แผนที่)</Label>
            <PositionInputs left={s.pos_left ?? null} top={s.pos_top ?? null} width={s.pos_width ?? null} onChange={(p) => set(p)} />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1"><Label>ลำดับ</Label><Input type="number" value={s.sort_order ?? 0} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></div>
            <div className="flex items-center justify-between h-10"><Label>เผยแพร่</Label><Switch checked={!!s.is_published} onCheckedChange={(c) => set({ is_published: c })} /></div>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex justify-between pt-2">
            {!isNew ? <Button variant="outline" className="text-red-600" onClick={hide}>ลบ (ซ่อน)</Button> : <span />}
            <Button onClick={save}>บันทึก</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
