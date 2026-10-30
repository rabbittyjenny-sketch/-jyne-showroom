import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { uploadMedia } from '@/lib/adminApi';
import { parseYouTubeId, youTubeThumb } from '@/lib/youtube';
import type { FieldDef } from '@/lib/types';

/** Paste a link, or upload a file (stored in i365-media). */
export function UploadOrUrl({ value, onChange, accept, folder, preview }: { value: string; onChange: (v: string) => void; accept?: string; folder: string; preview?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setErr(null);
    try { onChange(await uploadMedia(file, folder)); } catch (x) { setErr(x instanceof Error ? x.message : 'อัปโหลดไม่สำเร็จ'); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="วางลิงก์ หรือกดอัปโหลด" />
        <label className="shrink-0 inline-flex items-center rounded-md border px-3 text-sm cursor-pointer hover:bg-muted">
          {busy ? 'กำลังอัป…' : 'อัปโหลด'}
          <input type="file" className="hidden" accept={accept} onChange={pick} disabled={busy} />
        </label>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      {preview && value && <img src={value} alt="" className="h-24 rounded border object-contain bg-muted" onError={(e) => (e.currentTarget.style.display = 'none')} />}
    </div>
  );
}

export function FieldInput({ field, value, onChange, error }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; error?: string }) {
  const v = value == null ? '' : String(value);
  let input: React.ReactNode;
  switch (field.type) {
    case 'textarea':
      input = <Textarea rows={4} value={v} onChange={(e) => onChange(e.target.value)} />; break;
    case 'number':
      input = <Input type="number" value={v} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />; break;
    case 'month':
      input = <Input type="month" value={v} onChange={(e) => onChange(e.target.value)} />; break;
    case 'boolean':
      input = <Switch checked={value === true} onCheckedChange={(c) => onChange(c)} />; break;
    case 'select':
      input = (
        <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={v} onChange={(e) => onChange(e.target.value)}>
          <option value="">— เลือก —</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ); break;
    case 'image':
      input = <UploadOrUrl value={v} onChange={onChange} accept="image/*" folder="images" preview />; break;
    case 'file':
      input = <UploadOrUrl value={v} onChange={onChange} folder="files" />; break;
    case 'video': {
      const id = parseYouTubeId(v);
      input = (
        <div className="space-y-2">
          <Input value={v} onChange={(e) => onChange(e.target.value)} placeholder="ลิงก์ YouTube / TikTok / Facebook" />
          {id && <img src={youTubeThumb(id)} alt="" className="h-24 rounded border" />}
        </div>
      ); break;
    }
    default:
      input = <Input type={field.type === 'url' ? 'url' : 'text'} value={v} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className="space-y-1">
      <Label>{field.label_th}{field.required && <span className="text-red-600"> *</span>}</Label>
      {input}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Required-field check shared by single and multi add. */
export function missingRequired(fields: FieldDef[], data: Record<string, unknown>): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    const v = data[f.key];
    if (f.required && (v === undefined || v === null || String(v).trim() === '')) errs[f.key] = 'ต้องกรอกช่องนี้';
  }
  return errs;
}

/** Left / top / width in % of the picture (Explore pattern). Empty = not placed yet. */
export function PositionInputs({ left, top, width, onChange }: {
  left: number | null; top: number | null; width: number | null;
  onChange: (p: { pos_left: number | null; pos_top: number | null; pos_width: number | null }) => void;
}) {
  const num = (s: string) => (s === '' ? null : Math.max(0, Math.min(100, Number(s))));
  const cur = { pos_left: left, pos_top: top, pos_width: width };
  return (
    <div className="grid grid-cols-3 gap-2">
      {([['pos_left', 'ซ้าย %'], ['pos_top', 'บน %'], ['pos_width', 'กว้าง %']] as const).map(([k, label]) => (
        <div key={k} className="space-y-1">
          <Label className="text-xs">{label}</Label>
          <Input type="number" step="0.1" value={cur[k] ?? ''} onChange={(e) => onChange({ ...cur, [k]: num(e.target.value) })} />
        </div>
      ))}
    </div>
  );
}
