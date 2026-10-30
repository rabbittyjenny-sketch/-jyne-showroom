import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { insert, list, slugify, update } from '@/lib/adminApi';
import type { Island, IslandTemplate } from '@/lib/types';

/**
 * จัดการเกาะ: เลือก / สร้างใหม่ / ซ่อน-ลบ.
 * Creating follows EMS "create event": pick a template → its default features are copied →
 * switch them per island afterwards on the island page.
 */
export default function Islands() {
  const [islands, setIslands] = useState<Island[]>([]);
  const [templates, setTemplates] = useState<IslandTemplate[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [creating, setCreating] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const load = async () => {
    try {
      const [i, t] = await Promise.all([list<Island>('i365_islands'), list<IslandTemplate>('i365_island_templates')]);
      setIslands(i); setTemplates(t.filter((x) => x.is_active));
    } catch (e) { setMsg({ text: e instanceof Error ? e.message : String(e), ok: false }); }
  };
  useEffect(() => { load(); }, []);

  const act = async (fn: () => Promise<void>, ok: string) => {
    setMsg(null);
    try { await fn(); setMsg({ text: ok, ok: true }); await load(); } catch (e) { setMsg({ text: e instanceof Error ? e.message : String(e), ok: false }); }
  };

  const visible = islands.filter((i) => showDeleted || !i.deleted_at);

  return (
    <AdminLayout title="จัดการเกาะ" actions={<Button onClick={() => setCreating(true)}>+ สร้างเกาะใหม่</Button>}>
      <Notice msg={msg} />
      <label className="flex items-center gap-2 text-sm my-3"><input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} /> แสดงเกาะที่ลบ (ซ่อนไว้) ด้วย</label>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((i) => (
          <div key={i.id} className="rounded-lg border bg-background p-4 flex gap-3">
            <div className="w-20 h-20 shrink-0 rounded bg-muted flex items-center justify-center overflow-hidden">
              {i.button_image ? <img src={i.button_image} alt="" className="max-h-full" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <span className="text-xs text-muted-foreground">ยังไม่มีรูป</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{i.name_th}</div>
              <div className="text-xs text-muted-foreground">/{i.slug} · {templates.find((t) => t.id === i.template_id)?.name_th ?? 'ไม่มีแม่แบบ'}</div>
              <div className="text-xs mt-1">
                {i.deleted_at ? <span className="text-red-600">ลบแล้ว (ซ่อน)</span> : i.is_published ? <span className="text-emerald-700">เผยแพร่</span> : <span className="text-amber-700">ฉบับร่าง</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Link to={`/backoffice/islands/${i.id}`} className="text-sm underline">เปิดเกาะ</Link>
                {!i.deleted_at && (
                  <button className="text-sm text-red-600 underline" onClick={() => {
                    if (confirm(`ลบเกาะ "${i.name_th}"? เกาะจะถูกซ่อนจากหน้าเว็บ ผลงานข้างในยังอยู่ กู้คืนได้`)) {
                      act(() => update('i365_islands', { id: i.id }, { deleted_at: new Date().toISOString(), is_published: false }), 'ซ่อนเกาะแล้ว');
                    }
                  }}>ลบ</button>
                )}
                {i.deleted_at && (
                  <button className="text-sm underline" onClick={() => act(() => update('i365_islands', { id: i.id }, { deleted_at: null }), 'กู้คืนแล้ว (ยังเป็นฉบับร่าง)')}>กู้คืน</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <CreateIsland open={creating} onClose={() => setCreating(false)} templates={templates} nextOrder={islands.length + 1} />
    </AdminLayout>
  );
}

function CreateIsland({ open, onClose, templates, nextOrder }: { open: boolean; onClose: () => void; templates: IslandTemplate[]; nextOrder: number }) {
  const navigate = useNavigate();
  const [tplId, setTplId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const tpl = templates.find((t) => t.id === tplId);

  const create = async () => {
    setErr(null);
    if (!tpl) { setErr('เลือกแม่แบบเกาะก่อน'); return; }
    if (!name.trim()) { setErr('ตั้งชื่อเกาะ'); return; }
    const s = slug || slugify(name);
    if (!/^[a-z0-9-]+$/.test(s)) { setErr('ชื่อในลิงก์ใช้ได้เฉพาะ a-z 0-9 และ -'); return; }
    setBusy(true);
    try {
      const [row] = await insert<Island>('i365_islands', {
        slug: s, name_th: name.trim(), template_id: tpl.id, features: tpl.default_features,
        land_image: `/islands/${s}/land.webp`, is_published: false, sort_order: nextOrder,
      });
      navigate(`/backoffice/islands/${row.id}`);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>สร้างเกาะใหม่</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>1. เลือกแม่แบบเกาะ</Label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button key={t.id} type="button" onClick={() => { setTplId(t.id); setErr(null); }}
                  className={`rounded-md border p-3 text-left text-sm ${tplId === t.id ? 'border-foreground bg-muted' : ''}`}>
                  <div className="text-lg">{t.icon}</div><div className="font-medium">{t.name_th}</div>
                </button>
              ))}
            </div>
            {tpl && <p className="text-xs text-muted-foreground">ได้ฟีเจอร์ตั้งต้นของแม่แบบนี้ แล้วเปิด/ปิดเพิ่มได้ในหน้าเกาะ</p>}
          </div>
          <div className="space-y-1"><Label>2. ชื่อเกาะ</Label><Input value={name} onChange={(e) => { setName(e.target.value); setErr(null); }} /></div>
          <div className="space-y-1">
            <Label>3. ชื่อในลิงก์ (อังกฤษ)</Label>
            <Input value={slug} placeholder={slugify(name) || 'เช่น events'} onChange={(e) => { setSlug(e.target.value.toLowerCase()); setErr(null); }} />
            <p className="text-xs text-muted-foreground">ใช้เป็นลิงก์ /i/ชื่อนี้ ตั้งแล้วอย่าเปลี่ยน ลิงก์ที่ส่งไปแล้วจะเสีย</p>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button onClick={create} disabled={busy} className="w-full">{busy ? 'กำลังสร้าง…' : 'สร้างเกาะ (ฉบับร่าง)'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
