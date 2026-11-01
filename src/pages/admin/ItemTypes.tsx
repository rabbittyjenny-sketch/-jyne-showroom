import { useEffect, useState } from 'react';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { insert, list, update } from '@/lib/adminApi';
import { DISPLAY_LABELS, type DisplayStyle, type FieldDef, type FieldType, type ItemType } from '@/lib/types';

const FIELD_TYPES: Record<FieldType, string> = {
  text: 'ข้อความสั้น', textarea: 'ข้อความยาว', url: 'ลิงก์', video: 'ลิงก์คลิป', image: 'รูป', file: 'ไฟล์',
  month: 'ปี-เดือน', number: 'ตัวเลข', select: 'ตัวเลือก', boolean: 'ใช่ / ไม่ใช่',
};

/**
 * ประเภทผลงาน + ช่องข้อมูล. The fields live in the database (closing the EMS gap where
 * event_types.default_fields existed but forms read hard-coded lists), so a new kind of work
 * — with its own fields — needs no code change.
 * Field keys cannot be renamed after creation: saved work stores its values under them.
 */
export default function ItemTypes() {
  const [types, setTypes] = useState<ItemType[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [editing, setEditing] = useState<Partial<ItemType> | null>(null);
  const load = () => list<ItemType>('i365_item_types').then(setTypes).catch((e) => setMsg({ text: String(e.message ?? e), ok: false }));
  useEffect(() => { load(); }, []);

  return (
    <AdminLayout title="ประเภทผลงาน" actions={<Button onClick={() => setEditing({ fields: [], features: { has_cover: true, bulk_field: null }, default_display: 'cards', is_active: true, sort_order: types.length + 1 })}>+ ประเภทใหม่</Button>}>
      <Notice msg={msg} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 mt-2">
        {types.map((t) => (
          <button key={t.id} onClick={() => setEditing(t)} className="text-left rounded-lg border bg-background p-4 hover:bg-muted">
            <div className="font-medium">{t.name_th} <span className="text-xs text-muted-foreground">/{t.slug}</span></div>
            <div className="text-xs text-muted-foreground mt-1">{t.fields.map((f) => f.label_th).join(' · ')}</div>
            <div className="text-xs mt-1">แสดงแบบ {DISPLAY_LABELS[t.default_display]}{t.features?.bulk_field ? ' · อัปหลายชิ้นได้' : ''}</div>
          </button>
        ))}
      </div>
      {editing && <TypeDialog type={editing} onClose={() => setEditing(null)} onSaved={(t) => { setEditing(null); setMsg({ text: t, ok: true }); load(); }} />}
    </AdminLayout>
  );
}

function TypeDialog({ type, onClose, onSaved }: { type: Partial<ItemType>; onClose: () => void; onSaved: (t: string) => void }) {
  const [t, setT] = useState<Partial<ItemType>>({ ...type, fields: [...(type.fields ?? [])] });
  const [err, setErr] = useState<string | null>(null);
  const originalKeys = new Set((type.fields ?? []).map((f) => f.key));
  const isNew = !type.id;
  const fields = t.fields ?? [];
  const setField = (i: number, patch: Partial<FieldDef>) => setT({ ...t, fields: fields.map((f, k) => (k === i ? { ...f, ...patch } : f)) });
  const move = (i: number, d: number) => { const a = [...fields]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setT({ ...t, fields: a }); };

  const save = async () => {
    setErr(null);
    if (!t.name_th?.trim()) { setErr('ตั้งชื่อประเภท'); return; }
    if (isNew && !/^[a-z0-9_]+$/.test(t.slug ?? '')) { setErr('รหัสประเภทใช้ได้เฉพาะ a-z 0-9 และ _'); return; }
    const keys = fields.map((f) => f.key);
    if (keys.some((k) => !/^[a-z0-9_]+$/.test(k))) { setErr('รหัสช่องข้อมูลใช้ได้เฉพาะ a-z 0-9 และ _'); return; }
    if (new Set(keys).size !== keys.length) { setErr('รหัสช่องข้อมูลซ้ำกัน'); return; }
    if (fields.some((f) => !f.label_th.trim())) { setErr('ทุกช่องต้องมีชื่อ'); return; }
    if (fields.some((f) => f.type === 'select' && !(f.options?.length))) { setErr('ช่องแบบตัวเลือกต้องมีตัวเลือกอย่างน้อย 1'); return; }
    const bulk = t.features?.bulk_field;
    if (bulk && !fields.some((f) => f.key === bulk && ['image', 'file', 'video'].includes(f.type))) { setErr('ช่องสำหรับอัปหลายชิ้นต้องเป็นรูป ไฟล์ หรือคลิป'); return; }
    const row = { slug: t.slug, name_th: t.name_th.trim(), name_en: t.name_en ?? null, fields, features: t.features ?? {}, default_display: t.default_display, is_active: t.is_active !== false, sort_order: t.sort_order ?? 0 };
    try {
      if (isNew) await insert('i365_item_types', row); else await update('i365_item_types', { id: type.id }, row);
      onSaved(isNew ? 'สร้างประเภทแล้ว' : 'บันทึกประเภทแล้ว');
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? 'ประเภทผลงานใหม่' : `แก้ไข: ${type.name_th}`}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label>ชื่อ (ไทย)</Label><Input value={t.name_th ?? ''} onChange={(e) => setT({ ...t, name_th: e.target.value })} /></div>
            <div className="space-y-1"><Label>รหัส (อังกฤษ)</Label><Input value={t.slug ?? ''} disabled={!isNew} onChange={(e) => setT({ ...t, slug: e.target.value.toLowerCase() })} /></div>
            <div className="space-y-1"><Label>แสดงแบบเริ่มต้น</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={t.default_display} onChange={(e) => setT({ ...t, default_display: e.target.value as DisplayStyle })}>
                {(Object.keys(DISPLAY_LABELS) as DisplayStyle[]).filter((k) => k !== 'feed').map((k) => <option key={k} value={k}>{DISPLAY_LABELS[k]}</option>)}
              </select></div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!t.features?.has_cover} onChange={(e) => setT({ ...t, features: { ...t.features, has_cover: e.target.checked } })} /> มีรูปปก</label>
            <label className="flex items-center gap-2">อัปหลายชิ้นได้ผ่านช่อง
              <select className="h-8 rounded-md border bg-background px-2" value={t.features?.bulk_field ?? ''} onChange={(e) => setT({ ...t, features: { ...t.features, bulk_field: e.target.value || null } })}>
                <option value="">— ไม่เปิด —</option>
                {fields.filter((f) => ['image', 'file', 'video'].includes(f.type)).map((f) => <option key={f.key} value={f.key}>{f.label_th}</option>)}
              </select></label>
          </div>
          <div className="rounded-md border">
            <div className="px-3 py-2 text-sm font-medium border-b">ช่องข้อมูล</div>
            {fields.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_140px_auto] gap-2 p-2 border-b items-start">
                <Input placeholder="ชื่อช่อง" value={f.label_th} onChange={(e) => setField(i, { label_th: e.target.value })} />
                <Input placeholder="รหัส (อังกฤษ)" value={f.key} disabled={originalKeys.has(f.key)} onChange={(e) => setField(i, { key: e.target.value.toLowerCase() })} />
                <select className="h-10 rounded-md border bg-background px-2 text-sm" value={f.type} disabled={originalKeys.has(f.key)} onChange={(e) => setField(i, { type: e.target.value as FieldType })}>
                  {(Object.keys(FIELD_TYPES) as FieldType[]).map((k) => <option key={k} value={k}>{FIELD_TYPES[k]}</option>)}
                </select>
                <div className="flex gap-1 text-xs items-center h-10">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={f.required} onChange={(e) => setField(i, { required: e.target.checked })} />จำเป็น</label>
                  <button className="px-1" onClick={() => move(i, -1)} aria-label="ขึ้น">↑</button>
                  <button className="px-1" onClick={() => move(i, 1)} aria-label="ลง">↓</button>
                  {!originalKeys.has(f.key) && <button className="px-1 text-red-600" onClick={() => setT({ ...t, fields: fields.filter((_, k) => k !== i) })}>ลบ</button>}
                </div>
                {f.type === 'select' && (
                  <Input className="col-span-4" placeholder="ตัวเลือก คั่นด้วย , เช่น free:ฟรี, pro:ระบบใหญ่"
                    defaultValue={(f.options ?? []).map((o) => `${o.value}:${o.label}`).join(', ')}
                    onBlur={(e) => setField(i, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [v, ...l] = s.split(':'); return { value: v.trim(), label: (l.join(':') || v).trim() }; }) })} />
                )}
              </div>
            ))}
            <div className="p-2"><Button size="sm" variant="outline" onClick={() => setT({ ...t, fields: [...fields, { key: '', label_th: '', type: 'text', required: false }] })}>+ เพิ่มช่อง</Button></div>
          </div>
          <p className="text-xs text-muted-foreground">ช่องที่บันทึกแล้วเปลี่ยนรหัสหรือชนิดไม่ได้ และลบไม่ได้ เพราะผลงานที่มีอยู่เก็บค่าไว้ใต้รหัสนั้น เปลี่ยนชื่อที่แสดงได้</p>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex justify-end"><Button onClick={save}>บันทึก</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
