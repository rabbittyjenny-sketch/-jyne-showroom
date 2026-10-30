import { useEffect, useState } from 'react';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { UploadOrUrl } from '@/components/admin/FieldInputs';
import { insert, list, slugify, update, upsertSetting } from '@/lib/adminApi';
import { FEATURE_LABELS, type Features, type IslandTemplate, type SiteSettings } from '@/lib/types';

type Msg = { text: string; ok: boolean } | null;
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));

interface Inquiry { id: string; name: string; email: string; phone: string | null; company: string | null; interest: string | null; source_island: string | null; source_route: string | null; message: string | null; status: string; created_at: string }

export function Inquiries() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const load = () => list<Inquiry>('i365_inquiries', [], null).then((r) => setRows([...r].sort((a, b) => b.created_at.localeCompare(a.created_at)))).catch((e) => setMsg({ text: errText(e), ok: false }));
  useEffect(() => { load(); }, []);
  return (
    <AdminLayout title="ข้อความติดต่อ">
      <Notice msg={msg} />
      {rows.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีข้อความ</p>}
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border bg-background p-4 text-sm">
            <div className="flex justify-between gap-4">
              <div><b>{r.name}</b> · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone && ` · ${r.phone}`}{r.company && ` · ${r.company}`}</div>
              <select className="h-8 rounded-md border bg-background px-2" value={r.status}
                onChange={(e) => update('i365_inquiries', { id: r.id }, { status: e.target.value }).then(load).catch((x) => setMsg({ text: errText(x), ok: false }))}>
                <option value="new">ใหม่</option><option value="replied">ตอบแล้ว</option><option value="closed">ปิด</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString('th-TH')} · สนใจ: {r.interest ?? '-'} · มาจาก: {r.source_route ? `เส้นทาง ${r.source_route}` : r.source_island ? `เกาะ ${r.source_island}` : '-'}</div>
            {r.message && <p className="mt-2 whitespace-pre-wrap">{r.message}</p>}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

/** แม่แบบเกาะ (EMS event_types): name + default features copied into a new island. */
export function Templates() {
  const [rows, setRows] = useState<IslandTemplate[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const load = () => list<IslandTemplate>('i365_island_templates').then(setRows).catch((e) => setMsg({ text: errText(e), ok: false }));
  useEffect(() => { load(); }, []);
  const save = (t: IslandTemplate) => update('i365_island_templates', { id: t.id }, { name_th: t.name_th, icon: t.icon, default_features: t.default_features, is_active: t.is_active })
    .then(() => setMsg({ text: 'บันทึกแม่แบบแล้ว (เกาะที่สร้างไปแล้วไม่เปลี่ยนตาม)', ok: true })).catch((e) => setMsg({ text: errText(e), ok: false }));
  const setRow = (id: string, patch: Partial<IslandTemplate>) => setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  return (
    <AdminLayout title="แม่แบบเกาะ" actions={<Button onClick={() => {
      const n = prompt('ชื่อแม่แบบใหม่'); if (!n?.trim()) return;
      insert('i365_island_templates', { slug: slugify(n) || `tpl-${Date.now().toString(36)}`, name_th: n.trim(), icon: '🏝️', default_features: {}, sort_order: rows.length + 1 })
        .then(load).catch((e) => setMsg({ text: errText(e), ok: false }));
    }}>+ แม่แบบใหม่</Button>}>
      <Notice msg={msg} />
      <div className="grid gap-4 md:grid-cols-2 mt-2">
        {rows.map((t) => (
          <section key={t.id} className="rounded-lg border bg-background p-4 space-y-2">
            <div className="flex gap-2"><Input className="w-16" value={t.icon ?? ''} onChange={(e) => setRow(t.id, { icon: e.target.value })} /><Input value={t.name_th} onChange={(e) => setRow(t.id, { name_th: e.target.value })} /></div>
            {(Object.keys(FEATURE_LABELS) as (keyof Features)[]).map((k) => (
              <div key={k} className="flex items-center justify-between text-sm"><span>{FEATURE_LABELS[k]}</span>
                <Switch checked={!!t.default_features?.[k]} onCheckedChange={(c) => setRow(t.id, { default_features: { ...t.default_features, [k]: c } })} /></div>
            ))}
            <div className="flex items-center justify-between pt-2"><label className="text-sm flex items-center gap-2"><Switch checked={t.is_active} onCheckedChange={(c) => setRow(t.id, { is_active: c })} />ใช้งาน</label><Button size="sm" onClick={() => save(t)}>บันทึก</Button></div>
          </section>
        ))}
      </div>
    </AdminLayout>
  );
}

export function Settings() {
  const [s, setS] = useState<SiteSettings>({});
  const [msg, setMsg] = useState<Msg>(null);
  useEffect(() => {
    list<{ key: string; value: unknown }>('i365_site_settings', [], null)
      .then((r) => setS(Object.fromEntries(r.map((x) => [x.key, x.value])) as SiteSettings)).catch((e) => setMsg({ text: errText(e), ok: false }));
  }, []);
  const save = async () => {
    setMsg(null);
    try { for (const [k, v] of Object.entries(s)) await upsertSetting(k, v); setMsg({ text: 'บันทึกแล้ว', ok: true }); } catch (e) { setMsg({ text: errText(e), ok: false }); }
  };
  return (
    <AdminLayout title="ตั้งค่าเว็บ" actions={<Button onClick={save}>บันทึก</Button>}>
      <Notice msg={msg} />
      <section className="rounded-lg border bg-background p-4 space-y-4 max-w-2xl mt-2">
        <div className="space-y-1"><Label>รูปแผนที่หลัก (หมู่เกาะ) · ชื่อไฟล์แนะนำ <code>maps/main-archipelago.webp</code></Label><UploadOrUrl value={s.main_map_image ?? ''} onChange={(v) => setS({ ...s, main_map_image: v })} accept="image/*,video/mp4" folder="maps" preview /></div>
        <div className="space-y-1"><Label>สัดส่วนแผนที่หลัก (กว้าง/สูง)</Label><Input value={s.main_map_aspect ?? '16/9'} onChange={(e) => setS({ ...s, main_map_aspect: e.target.value })} /></div>
        <div className="space-y-1"><Label>โลโก้</Label><UploadOrUrl value={s.logo ?? ''} onChange={(v) => setS({ ...s, logo: v })} accept="image/*" folder="brand" preview /></div>
        <div className="space-y-1"><Label>อีเมลติดต่อ</Label><Input value={s.contact_email ?? ''} onChange={(e) => setS({ ...s, contact_email: e.target.value })} /></div>
        <div className="space-y-2">
          <Label>โซเชียล</Label>
          {(s.socials ?? []).map((x, i) => (
            <div key={i} className="grid grid-cols-[120px_1fr_2fr_auto] gap-2">
              {(['label', 'handle', 'url'] as const).map((k) => (
                <Input key={k} value={x[k]} onChange={(e) => setS({ ...s, socials: s.socials!.map((y, j) => (j === i ? { ...y, [k]: e.target.value } : y)) })} />
              ))}
              <button className="text-xs text-red-600 underline" onClick={() => setS({ ...s, socials: s.socials!.filter((_, j) => j !== i) })}>ลบ</button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setS({ ...s, socials: [...(s.socials ?? []), { label: '', handle: '', url: '' }] })}>+ เพิ่ม</Button>
        </div>
        <div className="space-y-1"><Label>รูปปุ่มย้อนกลับ (มุมขวาล่างทุกหน้า)</Label><UploadOrUrl value={s.back_button ?? ''} onChange={(v) => setS({ ...s, back_button: v })} accept="image/*" folder="brand" preview /></div>
        <div className="space-y-1"><Label>รูป QR LINE (เกาะติดต่อ)</Label><UploadOrUrl value={s.line_qr ?? ''} onChange={(v) => setS({ ...s, line_qr: v })} accept="image/*" folder="brand" preview /></div>
        <div className="space-y-1"><Label>ข้อความใต้ QR</Label><Input value={s.line_qr_caption ?? ''} onChange={(e) => setS({ ...s, line_qr_caption: e.target.value })} /></div>
        <div className="space-y-1"><Label>คำสัญญาข้างฟอร์มติดต่อ (บรรทัดละข้อ)</Label><Textarea rows={4} value={s.contact_promise_th ?? ''} onChange={(e) => setS({ ...s, contact_promise_th: e.target.value })} /></div>
      </section>
    </AdminLayout>
  );
}
