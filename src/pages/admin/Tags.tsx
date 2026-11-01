import { useEffect, useState } from 'react';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { insert, list, remove, slugify, update } from '@/lib/adminApi';
import type { Tag, TagGroup } from '@/lib/types';

/**
 * Tags are created only here (a controlled list), then picked on each item —
 * so "TikTok" and "tiktok" can never both exist. Merging moves every item from
 * one tag to another, then deletes the old one.
 */
export default function Tags() {
  const [groups, setGroups] = useState<TagGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [newGroup, setNewGroup] = useState('');
  const [newTag, setNewTag] = useState<Record<string, string>>({});

  const load = () => Promise.all([list<TagGroup>('i365_tag_groups'), list<Tag>('i365_tags')]).then(([g, t]) => { setGroups(g); setTags(t); })
    .catch((e) => setMsg({ text: String(e.message ?? e), ok: false }));
  useEffect(() => { load(); }, []);
  const act = async (fn: () => Promise<void>, ok: string) => { setMsg(null); try { await fn(); setMsg({ text: ok, ok: true }); await load(); } catch (e) { setMsg({ text: e instanceof Error ? e.message : String(e), ok: false }); } };

  const addTag = (g: TagGroup) => {
    const name = (newTag[g.id] ?? '').trim();
    if (!name) return;
    const dup = tags.find((t) => t.group_id === g.id && t.name_th.toLowerCase() === name.toLowerCase());
    if (dup) { setMsg({ text: `มีแท็ก "${dup.name_th}" อยู่แล้ว`, ok: false }); return; }
    act(async () => { await insert('i365_tags', { group_id: g.id, slug: slugify(name) || `tag-${Date.now().toString(36)}`, name_th: name, sort_order: tags.length + 1 }); setNewTag({ ...newTag, [g.id]: '' }); }, 'เพิ่มแท็กแล้ว');
  };

  const merge = (t: Tag) => {
    const others = tags.filter((x) => x.group_id === t.group_id && x.id !== t.id);
    const pick = prompt(`รวม "${t.name_th}" เข้ากับแท็กไหน? พิมพ์หมายเลข\n${others.map((o, i) => `${i + 1}. ${o.name_th}`).join('\n')}`);
    const target = pick ? others[Number(pick) - 1] : undefined;
    if (!target) return;
    act(async () => {
      const links = await list<{ item_id: string }>('i365_item_tags', [['tag_id', t.id]], null);
      const existing = new Set((await list<{ item_id: string }>('i365_item_tags', [['tag_id', target.id]], null)).map((x) => x.item_id));
      const toAdd = links.filter((l) => !existing.has(l.item_id)).map((l) => ({ item_id: l.item_id, tag_id: target.id }));
      if (toAdd.length) await insert('i365_item_tags', toAdd);
      await remove('i365_item_tags', { tag_id: t.id });
      await remove('i365_tags', { id: t.id });
    }, `รวมเข้ากับ "${target.name_th}" แล้ว`);
  };

  return (
    <AdminLayout title="แท็ก">
      <Notice msg={msg} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-2">
        {groups.map((g) => (
          <section key={g.id} className="rounded-lg border bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{g.name_th}</h2>
              <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={g.allow_multiple} onChange={(e) => act(() => update('i365_tag_groups', { id: g.id }, { allow_multiple: e.target.checked }), 'บันทึกแล้ว')} />เลือกได้หลายอัน</label>
            </div>
            <ul className="space-y-1 text-sm">
              {tags.filter((t) => t.group_id === g.id).map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span>{t.name_th}</span>
                  <span className="text-xs">
                    <button className="underline mr-2" onClick={() => { const n = prompt('ชื่อใหม่', t.name_th); if (n?.trim()) act(() => update('i365_tags', { id: t.id }, { name_th: n.trim() }), 'เปลี่ยนชื่อแล้ว'); }}>แก้ชื่อ</button>
                    <button className="underline mr-2" onClick={() => merge(t)}>รวม</button>
                    <button className="underline text-red-600" onClick={() => { if (confirm(`ลบแท็ก "${t.name_th}"? ผลงานที่ติดแท็กนี้จะถูกเอาแท็กออก`)) act(async () => { await remove('i365_item_tags', { tag_id: t.id }); await remove('i365_tags', { id: t.id }); }, 'ลบแท็กแล้ว'); }}>ลบ</button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2"><Input placeholder="แท็กใหม่" value={newTag[g.id] ?? ''} onChange={(e) => setNewTag({ ...newTag, [g.id]: e.target.value })} /><Button size="sm" onClick={() => addTag(g)}>เพิ่ม</Button></div>
          </section>
        ))}
        <section className="rounded-lg border border-dashed bg-background p-4 space-y-2">
          <h2 className="font-semibold">กลุ่มแท็กใหม่</h2>
          <Input placeholder="เช่น ภาษา, ขนาดงาน" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
          <Button size="sm" onClick={() => newGroup.trim() && act(async () => { await insert('i365_tag_groups', { slug: slugify(newGroup) || `group-${Date.now().toString(36)}`, name_th: newGroup.trim(), sort_order: groups.length + 1 }); setNewGroup(''); }, 'เพิ่มกลุ่มแล้ว')}>เพิ่มกลุ่ม</Button>
        </section>
      </div>
    </AdminLayout>
  );
}
