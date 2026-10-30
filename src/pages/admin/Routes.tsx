import { useEffect, useState } from 'react';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UploadOrUrl } from '@/components/admin/FieldInputs';
import { insert, list, remove, slugify, update } from '@/lib/adminApi';
import type { Item, Route, RouteItem, RouteVariant } from '@/lib/types';

/** เส้นทางสมัครงาน: the link you attach to an application. Work is ticked in from each item; ordered here. */
export default function Routes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [sel, setSel] = useState<Route | null>(null);
  const [variants, setVariants] = useState<RouteVariant[]>([]);
  const [links, setLinks] = useState<RouteItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [newVar, setNewVar] = useState({ slug: '', title_th: '' });

  const loadRoutes = () => list<Route>('i365_routes').then((r) => { setRoutes(r); setSel((s) => r.find((x) => x.id === s?.id) ?? r[0] ?? null); });
  useEffect(() => { loadRoutes().catch((e) => setMsg({ text: String(e.message ?? e), ok: false })); }, []);
  const loadDetail = async (r: Route) => {
    const [v, l, it] = await Promise.all([list<RouteVariant>('i365_route_variants', [['route_id', r.id]], null), list<RouteItem>('i365_route_items', [['route_id', r.id]]), list<Item>('i365_items')]);
    setVariants(v); setLinks(l); setItems(it);
  };
  useEffect(() => { if (sel?.id) loadDetail(sel).catch(() => undefined); }, [sel?.id]);
  const act = async (fn: () => Promise<void>, ok: string) => { setMsg(null); try { await fn(); setMsg({ text: ok, ok: true }); if (sel) await loadDetail(sel); } catch (e) { setMsg({ text: e instanceof Error ? e.message : String(e), ok: false }); } };

  const moveItem = (i: number, d: number) => act(async () => {
    const a = [...links]; const j = i + d; if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    for (let k = 0; k < a.length; k++) await update('i365_route_items', { route_id: a[k].route_id, item_id: a[k].item_id }, { sort_order: k + 1 });
  }, 'เรียงใหม่แล้ว');

  return (
    <AdminLayout title="เส้นทางสมัครงาน" actions={<Button onClick={() => {
      const t = prompt('ชื่อเส้นทาง เช่น Event Coordinator'); if (!t?.trim()) return;
      act(async () => { await insert('i365_routes', { slug: slugify(t) || `route-${Date.now().toString(36)}`, title_th: t.trim(), is_published: false, sort_order: routes.length + 1 }); await loadRoutes(); }, 'สร้างเส้นทางแล้ว (ฉบับร่าง)');
    }}>+ เส้นทางใหม่</Button>}>
      <Notice msg={msg} />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] mt-2">
        <nav className="rounded-lg border bg-background p-2 h-fit">
          {routes.map((r) => <button key={r.id} onClick={() => setSel(r)} className={`block w-full text-left rounded-md px-3 py-2 text-sm ${sel?.id === r.id ? 'bg-muted font-medium' : ''}`}>{r.title_th}</button>)}
        </nav>
        {sel && (
          <div className="space-y-4">
            <section className="rounded-lg border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">ลิงก์: <code>/r/{sel.slug}</code></div>
                <div className="flex items-center gap-2"><Label>เผยแพร่</Label><Switch checked={sel.is_published} onCheckedChange={(c) => setSel({ ...sel, is_published: c })} /></div>
              </div>
              <div className="space-y-1"><Label>ชื่อตำแหน่ง</Label><Input value={sel.title_th} onChange={(e) => setSel({ ...sel, title_th: e.target.value })} /></div>
              <div className="space-y-1"><Label>ประโยคเปิด</Label><Input value={sel.headline_th ?? ''} onChange={(e) => setSel({ ...sel, headline_th: e.target.value })} /></div>
              <div className="space-y-1"><Label>สรุปสำหรับตำแหน่งนี้</Label><Textarea rows={3} value={sel.summary_th ?? ''} onChange={(e) => setSel({ ...sel, summary_th: e.target.value })} /></div>
              <div className="space-y-1"><Label>ไฟล์เรซูเม่ของเส้นทางนี้</Label><UploadOrUrl value={sel.resume_url ?? ''} onChange={(v) => setSel({ ...sel, resume_url: v })} folder="resumes" /></div>
              <Button onClick={() => act(async () => {
                const { id, ...patch } = sel; await update('i365_routes', { id }, patch); await loadRoutes();
              }, 'บันทึกเส้นทางแล้ว')}>บันทึก</Button>
            </section>

            <section className="rounded-lg border bg-background p-4 space-y-2">
              <h2 className="font-semibold">ลิงก์ย่อย (หัวเรื่องต่างกัน เนื้อหาเดียวกัน)</h2>
              {variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm"><span><code>/r/{v.slug}</code> → {v.title_th}</span>
                  <button className="underline text-red-600 text-xs" onClick={() => act(() => remove('i365_route_variants', { id: v.id }), 'ลบลิงก์ย่อยแล้ว')}>ลบ</button></div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="ลิงก์ เช่น assistant" value={newVar.slug} onChange={(e) => setNewVar({ ...newVar, slug: e.target.value.toLowerCase() })} />
                <Input placeholder="หัวเรื่อง เช่น ผู้ช่วยผู้บริหาร" value={newVar.title_th} onChange={(e) => setNewVar({ ...newVar, title_th: e.target.value })} />
                <Button size="sm" onClick={() => {
                  if (!/^[a-z0-9-]+$/.test(newVar.slug) || !newVar.title_th.trim()) { setMsg({ text: 'ลิงก์ใช้ a-z 0-9 - และต้องมีหัวเรื่อง', ok: false }); return; }
                  act(async () => { await insert('i365_route_variants', { route_id: sel.id, ...newVar }); setNewVar({ slug: '', title_th: '' }); }, 'เพิ่มลิงก์ย่อยแล้ว');
                }}>เพิ่ม</Button>
              </div>
            </section>

            <section className="rounded-lg border bg-background p-4 space-y-2">
              <h2 className="font-semibold">ผลงานในเส้นทางนี้ ({links.length})</h2>
              <p className="text-xs text-muted-foreground">เลือกผลงานเข้าเส้นทางได้จากหน้าแก้ไขผลงานแต่ละชิ้น แล้วมาเรียงลำดับที่นี่</p>
              {links.map((l, i) => {
                const it = items.find((x) => x.id === l.item_id);
                return (
                  <div key={l.item_id} className="flex items-center gap-2 text-sm border-t pt-2">
                    <span className="w-6 text-muted-foreground">{i + 1}</span>
                    <span className="flex-1 truncate">{it?.title_th ?? '(ผลงานถูกลบ)'}</span>
                    <Input className="w-64 h-8" placeholder="หมายเหตุเฉพาะตำแหน่ง" defaultValue={l.note_th ?? ''}
                      onBlur={(e) => e.target.value !== (l.note_th ?? '') && act(() => update('i365_route_items', { route_id: l.route_id, item_id: l.item_id }, { note_th: e.target.value || null }), 'บันทึกหมายเหตุแล้ว')} />
                    <button onClick={() => moveItem(i, -1)} aria-label="ขึ้น">↑</button>
                    <button onClick={() => moveItem(i, 1)} aria-label="ลง">↓</button>
                    <button className="text-red-600 text-xs underline" onClick={() => act(() => remove('i365_route_items', { route_id: l.route_id, item_id: l.item_id }), 'เอาออกแล้ว')}>เอาออก</button>
                  </div>
                );
              })}
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
